import { NextRequest, NextResponse } from 'next/server';
import { CalendarSyncService } from '@/lib/integrations/calendar/calendarSyncService';

/**
 * Google Calendar Push Notification Webhook (WS-06 / H4 Remediation)
 * Validates Google channel token secret and initiates delta synchronization.
 */
export async function POST(req: NextRequest) {
  const channelId = req.headers.get('x-goog-channel-id');
  const channelToken = req.headers.get('x-goog-channel-token');
  const resourceState = req.headers.get('x-goog-resource-state');

  // 1. Google sends 'sync' on initial watch creation handshake
  if (resourceState === 'sync') {
    return NextResponse.json({ status: 'sync_acknowledged', channelId }, { status: 200 });
  }

  if (!channelId) {
    return NextResponse.json({ error: 'Missing x-goog-channel-id header' }, { status: 400 });
  }

  // 2. Validate channel token (H4)
  const validation = await CalendarSyncService.validateGoogleWebhookChannel(channelId, channelToken);
  if (!validation.valid) {
    console.warn(`[GoogleWebhook] Unauthorized channel push attempt for channel ${channelId}:`, validation.error);
    return NextResponse.json({ error: validation.error || 'Unauthorized channel token' }, { status: 401 });
  }

  const organizationId = validation.organizationId!;

  // 3. Initiate delta synchronization task for the tenant (H4)
  const syncResult = await CalendarSyncService.syncFromExternal(organizationId, 'google_calendar');

  return NextResponse.json({
    status: 'processed',
    organizationId,
    channelId,
    resourceState,
    syncedCount: syncResult.syncedEventsCount,
    timestamp: new Date().toISOString(),
  }, { status: 200 });
}
