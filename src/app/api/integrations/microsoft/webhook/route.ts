import { NextRequest, NextResponse } from 'next/server';
import { CalendarSyncService } from '@/lib/integrations/calendar/calendarSyncService';

/**
 * Microsoft Outlook / Graph Push Notification Webhook (WS-06 / H4 Remediation)
 * Responds to validation token handshake, validates clientState secret, and initiates delta synchronization.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const validationToken = url.searchParams.get('validationToken');

  // 1. Microsoft Graph subscription validation challenge
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Handle resource notification events
  try {
    const body = await req.json();
    const notifications = body.value || [];

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return NextResponse.json({ status: 'ignored', message: 'No notification records' }, { status: 200 });
    }

    let processedCount = 0;

    for (const notification of notifications) {
      const subscriptionId = notification.subscriptionId;
      const clientState = notification.clientState;

      // Validate clientState (H4)
      const validation = await CalendarSyncService.validateMicrosoftSubscription(subscriptionId, clientState);
      if (!validation.valid) {
        console.warn(`[MicrosoftWebhook] Unauthorized notification for subscription ${subscriptionId}:`, validation.error);
        return NextResponse.json({ error: validation.error || 'Unauthorized clientState' }, { status: 401 });
      }

      const organizationId = validation.organizationId!;

      // Initiate delta synchronization task for the tenant (H4)
      await CalendarSyncService.syncFromExternal(organizationId, 'microsoft_calendar');
      processedCount++;
    }

    return NextResponse.json({
      status: 'processed',
      count: processedCount,
      timestamp: new Date().toISOString(),
    }, { status: 202 });
  } catch (err: any) {
    console.error('[MicrosoftWebhook] Error processing notification:', err);
    return NextResponse.json({ error: 'Malformed request payload' }, { status: 400 });
  }
}
