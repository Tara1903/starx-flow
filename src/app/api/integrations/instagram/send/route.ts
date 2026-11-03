import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { InstagramAdapter } from '@/lib/integrations/instagram/instagramAdapter';

export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const body = await req.json().catch(() => ({}));

  const { recipientIgsid, text, messageTag, isInternal } = body;

  if (isInternal === true) {
    return NextResponse.json(
      { error: 'Security Violation: Internal notes must never be dispatched to external Instagram customers.' },
      { status: 400 }
    );
  }

  if (!recipientIgsid || !text) {
    return NextResponse.json(
      { error: 'Recipient IGSID and message text are required.' },
      { status: 400 }
    );
  }

  try {
    const adapter = new InstagramAdapter();
    const result = await adapter.sendMessage({
      organizationId,
      recipientIgsid,
      text,
      messageTag,
      isInternal: false,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
