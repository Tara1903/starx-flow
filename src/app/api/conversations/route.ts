import { NextRequest, NextResponse } from 'next/server';
import { InboxService } from '@/lib/inbox/inboxService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;

    const result = await InboxService.fetchConversations({
      userId: auth.session.user.id,
      organizationId: auth.session.organizationId,
      channel,
      status,
      search,
      assignedTo,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /api/conversations GET error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { customerName, customerPhone, customerEmail, channel, leadId } = body;

    if (!customerName || !channel) {
      return NextResponse.json(
        { error: 'Missing required parameters: customerName, channel' },
        { status: 400 }
      );
    }

    const { data: convo, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: auth.session.user.id,
        organization_id: auth.session.organizationId,
        lead_id: leadId || null,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        channel,
        status: 'active',
        unread_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, conversation: convo });
  } catch (err: any) {
    console.error('[API /api/conversations POST error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
