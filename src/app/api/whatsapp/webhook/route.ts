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

    if (!adapter) {
      console.error('[WhatsApp Webhook] Critical: WhatsApp adapter unavailable in IngestionGateway');
      return new NextResponse('Service Unavailable', { status: 503, headers: corsHeaders });
    }

    // Authenticate HMAC signature with strict fail-closed enforcement
    const auth = await adapter.authenticate(request, rawBody);
    if (!auth.authorized) {
      console.warn('[WhatsApp Webhook Security] Authentication rejected:', auth.reason);
      return new NextResponse('Forbidden: Invalid signature or missing configuration', {
        status: 403,
        headers: corsHeaders,
      });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.warn('[WhatsApp Webhook] Malformed non-JSON payload received');
      return new NextResponse('Bad Request: Malformed JSON', { status: 400, headers: corsHeaders });
    }

    const canonicalEvent = await adapter.normalize(body);

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
        .select('user_id, credentials')
        .eq('channel_key', 'WhatsApp')
        .eq('is_connected', true);

      let matchedChannelToken: string | undefined;
      let matchedUserId: string | undefined;
      if (channelData) {
        for (const row of channelData) {
          if (row.credentials?.phone_number_id === phoneNumberId) {
            matchedUserId = row.user_id;
            if (row.credentials.access_token) {
              matchedChannelToken = row.credentials.access_token;
            }
            break;
          }
        }
      }

      const candidateTokens = Array.from(
        new Set([matchedChannelToken, process.env.META_ACCESS_TOKEN].filter((t): t is string => Boolean(t && !t.includes('your_'))))
      );

      let delivered = false;
      let lastGraphError: string | null = null;

      for (const token of candidateTokens) {
        try {
          const sendRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: replyText },
            }),
          });

          if (sendRes.ok) {
            delivered = true;
            break;
          }

          const errBody = await sendRes.text().catch(() => '');
          lastGraphError = `HTTP ${sendRes.status}: ${errBody.slice(0, 300)}`;
          console.error('[WhatsApp Webhook] Graph API send rejected:', lastGraphError);

          // Only retry with fallback token on auth/session expiry errors (HTTP 401 / OAuth code 190)
          if (sendRes.status !== 401 && !errBody.includes('"code":190')) {
            break;
          }
        } catch (sendErr: any) {
          lastGraphError = sendErr?.message || 'Network exception';
          console.error('[WhatsApp Webhook] Graph API send error:', sendErr);
        }
      }

      if (!delivered && lastGraphError && matchedUserId) {
        await supabaseAdmin.from('execution_logs').insert({
          user_id: matchedUserId,
          type: 'system',
          channel: 'WhatsApp',
          message: `[Outbound Delivery Failed] ${lastGraphError}`,
        });
      }
    }

    return new NextResponse('ok', { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('[WhatsApp Webhook error]:', err);
    return new NextResponse('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}
