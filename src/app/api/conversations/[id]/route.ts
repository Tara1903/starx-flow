import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/inbox/inboxService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*, leads(*), messages(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify tenant ownership / organization authorization
    const isOwner = conversation.user_id === auth.session.user.id;
    const isOrgMember = conversation.organization_id && conversation.organization_id === auth.session.organizationId;

    if (!isOwner && !isOrgMember) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this conversation' }, { status: 403 });
    }

    return NextResponse.json({ conversation });
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
    const body = await req.json();
    const { status, assignedTo, priority, tags, controlMode, handoffReason } = body;

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
