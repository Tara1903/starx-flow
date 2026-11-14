import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/inbox/inboxService';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const access = await InboxService.verifyConversationAccess(id, auth.session);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status || 403 });
    }

    return NextResponse.json({ conversation: access.conversation });
  } catch (err: any) {
    console.error('[API /api/conversations/[id] GET error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const access = await InboxService.verifyConversationAccess(id, auth.session);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status || 403 });
    }

    const body = await req.json();
    const status = body.status;
    const assignedTo = body.assignedTo ?? body.assigned_to;
    const priority = body.priority;
    const tags = body.tags;
    const controlMode = body.controlMode ?? body.control_mode;
    const handoffReason = body.handoffReason ?? body.handoff_reason;

    const success = await InboxService.updateConversation({
      conversationId: id,
      userId: auth.session.user.id,
      organizationId: auth.session.organizationId,
      status,
      controlMode,
      handoffReason,
      assignedTo,
      priority,
      tags,
      actorId: auth.session.user.id,
    });

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API /api/conversations/[id] PATCH error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
