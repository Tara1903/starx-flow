import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/inbox/inboxService';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { extractIdempotencyKey, runWithIdempotency } from '@/lib/idempotency';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const messages = await InboxService.fetchMessages(id, limit, true);
    return NextResponse.json({ messages });
  } catch (err: unknown) {
    console.error('[API /api/conversations/[id]/messages GET error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to fetch conversation messages') },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { role, content, isInternal = false, attachments, agentName } = body;

    if (!content || !String(content).trim()) {
      return NextResponse.json({ error: 'Missing required parameter: content' }, { status: 400 });
    }

    const rawIdempotencyKey = extractIdempotencyKey(req, body);
    const scopedKey = rawIdempotencyKey
      ? `msg:${auth.session.organizationId || auth.session.user.id}:${id}:${rawIdempotencyKey}`
      : null;

    const { result, deduplicated } = await runWithIdempotency(scopedKey, async () =>
      InboxService.postMessage({
        conversationId: id,
        userId: auth.session.user.id,
        organizationId: auth.session.organizationId,
        role: role || 'human',
        content: String(content).trim(),
        isInternal: Boolean(isInternal),
        attachments,
        agentName: agentName || auth.session.user.email || 'Staff Agent',
      })
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      isInternal: result.isInternal,
      deliveredToCustomer: !result.isInternal,
      deduplicated,
    });
  } catch (err: unknown) {
    console.error('[API /api/conversations/[id]/messages POST error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to send message') },
      { status: 500 }
    );
  }
}
