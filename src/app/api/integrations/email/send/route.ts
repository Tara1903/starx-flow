import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { ResendEmailAdapter } from '@/lib/integrations/email/resendEmailAdapter';

export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const body = await req.json().catch(() => ({}));

  const { to, subject, html, text, inReplyTo, conversationId, leadId, isInternal } = body;

  if (isInternal === true) {
    return NextResponse.json(
      { error: 'Security Violation: Internal notes must never be dispatched to external email recipients.' },
      { status: 400 }
    );
  }

  if (!to || !subject || (!html && !text)) {
    return NextResponse.json(
      { error: 'Missing required email fields (to, subject, and html or text)' },
      { status: 400 }
    );
  }

  try {
    const adapter = new ResendEmailAdapter();
    const result = await adapter.sendEmail({
      organizationId,
      to,
      subject,
      html,
      text,
      inReplyTo,
      conversationId,
      leadId,
      isInternal: false,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
