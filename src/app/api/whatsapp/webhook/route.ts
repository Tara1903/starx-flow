import { NextResponse } from 'next/server';
import { IngestionGateway } from '@/lib/ingestion';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

/**
 * 1. Meta Webhook Verification (GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'starx-secure-webhook-token-2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verification successful');
    return new NextResponse(challenge || '', { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * 2. Inbound WhatsApp Message Handler (POST)
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const adapter = IngestionGateway.getAdapter('whatsapp');

    // Authenticate HMAC signature
    if (adapter) {
      const auth = await adapter.authenticate(request, rawBody);
      if (!auth.authorized) {
        console.error('[WhatsApp Webhook] Authentication failed:', auth.reason);
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);
    const canonicalEvent = await adapter?.normalize(body);

    if (!canonicalEvent) {
      // Event may be a delivery receipt or status update, acknowledge with 200 OK
      return new NextResponse('ok', { status: 200, headers: corsHeaders });
    }

    // Process through central Ingestion Gateway (handles idempotency, CRM resolution, and AI)
    const result = await IngestionGateway.process(canonicalEvent);

    if (!result.success && result.status !== 'duplicate') {
      console.error('[WhatsApp Webhook] Ingestion failed:', result.error);
    }

    // Outbound reply back to customer via Meta Graph API if active credentials available
    const phoneNumberId = canonicalEvent.metadata?.phoneNumberId;
    const from = canonicalEvent.sender.phone?.replace('+', '') || canonicalEvent.sender.identifier.replace('+', '');
    const replyText = result.replyText;

    if (replyText && phoneNumberId && from) {
      const { data: channelData } = await supabaseAdmin
        .from('connected_channels')
        .select('credentials')
        .eq('channel_key', 'WhatsApp')
        .eq('is_connected', true);

      let targetAccessToken = process.env.META_ACCESS_TOKEN;
      if (channelData) {
        for (const row of channelData) {
          if (row.credentials?.phone_number_id === phoneNumberId && row.credentials.access_token) {
            targetAccessToken = row.credentials.access_token;
            break;
          }
        }
      }

      if (targetAccessToken) {
        try {
          await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${targetAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: replyText },
            }),
          });
        } catch (sendErr) {
          console.error('[WhatsApp Webhook] Graph API send error:', sendErr);
        }
      }
    }

    return new NextResponse('ok', { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('[WhatsApp Webhook error]:', err);
    return new NextResponse('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}
