import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/inbox/inboxService';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const agentName = body.agentName || auth.session.user.email || 'Staff Agent';

    // Register active viewer heartbeat backed by distributed persistence
    await InboxService.registerViewer(id, auth.session.user.id, agentName, auth.session.organizationId);

    // Check collision state
    const collision = await InboxService.getCollisionState(id, auth.session.user.id);

    return NextResponse.json({
      success: true,
      hasCollision: collision.hasCollision,
      activeViewers: collision.activeViewers,
    });
  } catch (err: any) {
    console.error('[API /api/conversations/[id]/presence POST error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
