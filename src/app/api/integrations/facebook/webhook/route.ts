import { NextRequest, NextResponse } from 'next/server';
import { FacebookMessengerAdapter } from '@/lib/ingestion/adapters/facebookMessengerAdapter';
import { IngestionGateway } from '@/lib/ingestion';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const adapter = new FacebookMessengerAdapter();
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
  const adapter = new FacebookMessengerAdapter();

  const auth = await adapter.authenticate(req as any, rawBody);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized: Invalid HMAC signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  try {
    const canonicalEvent = await adapter.normalize(payload);
    if (!canonicalEvent) {
      return new NextResponse('ok', { status: 200 });
    }

    // Record interaction to open 24h Meta window
    if (canonicalEvent.organizationId && canonicalEvent.sender.externalUserId) {
      await FacebookMessengerAdapter.recordCustomerInteraction(
        canonicalEvent.organizationId,
        canonicalEvent.sender.externalUserId
      );
    }

    const result = await IngestionGateway.process(canonicalEvent);

    // If an AI reply was generated and external delivery is needed:
    if (result.success && result.replyText && canonicalEvent.organizationId && canonicalEvent.sender.externalUserId) {
      try {
        await adapter.sendMessage({
          organizationId: canonicalEvent.organizationId,
          recipientPsid: canonicalEvent.sender.externalUserId,
          text: result.replyText,
        });
      } catch (err: any) {
        console.warn('[Facebook Messenger Outbound Send Warning]:', err.message);
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Facebook Messenger Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
