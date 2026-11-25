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

  if (body.action === 'sync_appointment') {
    const apt = body.appointment;
    if (!apt?.id || !apt?.start_time || !apt?.end_time) {
      return NextResponse.json({ error: 'appointment.id, start_time, and end_time are required' }, { status: 400 });
    }
    const syncRes = await CalendarSyncService.syncAppointmentToExternal(apt, organizationId);
    return NextResponse.json({
      success: true,
      syncedProviders: syncRes.syncedProviders,
      externalEventIds: syncRes.externalEventIds,
    });
  }

  if (body.action === 'cancel_appointment') {
    const appointmentId = body.appointmentId;
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }
    const cancelled = await CalendarSyncService.cancelExternalAppointment(appointmentId, organizationId);
    return NextResponse.json({ success: true, cancelled });
  }

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
