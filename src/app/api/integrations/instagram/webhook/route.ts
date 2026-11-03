import { NextRequest, NextResponse } from 'next/server';
import { InstagramAdapter } from '@/lib/integrations/instagram/instagramAdapter';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const adapter = new InstagramAdapter();
  const challengeRes = adapter.verifyWebhookChallenge({ mode, token, challenge });

  if (challengeRes.isValid && challengeRes.challenge) {
    return new NextResponse(challengeRes.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Forbidden: Verification token mismatch' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  const adapter = new InstagramAdapter();
  const isValidSignature = adapter.verifySignature(rawBody, signature);

  if (!isValidSignature) {
    return NextResponse.json({ error: 'Unauthorized: Invalid HMAC signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  try {
    const result = await adapter.processWebhookEvent(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Instagram Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
