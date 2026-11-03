import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CalendarSyncService } from '@/lib/integrations/calendar/calendarSyncService';

export async function GET(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const connections = await CalendarSyncService.getActiveConnections(organizationId);

  return NextResponse.json({
    connected: connections.length > 0,
    calendars: connections.map((c) => ({
      provider: c.provider,
      accountIdentifier: c.accountIdentifier,
      accountName: c.accountName,
      calendarName: c.calendarName,
      syncEnabled: c.syncEnabled,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const body = await req.json().catch(() => ({}));
  const date = body.date || new Date().toISOString().slice(0, 10);

  const availability = await CalendarSyncService.checkAvailability({
    organizationId,
    date,
  });

  return NextResponse.json({
    success: true,
    availability,
  });
}
