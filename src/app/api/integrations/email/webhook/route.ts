import { NextRequest, NextResponse } from 'next/server';
import { ResendEmailAdapter } from '@/lib/integrations/email/resendEmailAdapter';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const adapter = new ResendEmailAdapter();

  const isValidSignature = adapter.verifyWebhookSignature(rawBody, req.headers);
  if (!isValidSignature) {
    return NextResponse.json({ error: 'Invalid Svix webhook signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }

  try {
    const result = await adapter.processInboundWebhook(payload);
    if (result.status === 'quarantined') {
      return NextResponse.json(result, { status: 202 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Resend Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
