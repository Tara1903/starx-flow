import { NextRequest, NextResponse } from 'next/server';
import { BusinessProfileService } from '@/lib/ai/businessProfileService';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orgId = auth.session.organizationId || auth.session.user.id;
    const profile = await BusinessProfileService.getProfile(orgId);
    const hoursStatus = BusinessProfileService.isWithinBusinessHours(profile);

    return NextResponse.json({
      profile,
      status: {
        isOpen: hoursStatus.isOpen,
        currentDay: hoursStatus.currentDay,
        hoursToday: hoursStatus.hoursToday,
      },
    });
  } catch (err: any) {
    console.error('[API /api/receptionist/settings GET error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orgId = auth.session.organizationId || auth.session.user.id;
    const updates = await req.json();

    const updated = await BusinessProfileService.updateProfile(orgId, updates);
    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err: any) {
    console.error('[API /api/receptionist/settings PUT error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
