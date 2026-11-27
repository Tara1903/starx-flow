import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // 1. Meta Webhook Verification (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token') || '';
    const challenge = url.searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
    if (!VERIFY_TOKEN || VERIFY_TOKEN.trim() === '') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    if (mode === 'subscribe' && timingSafeEqualStr(token, VERIFY_TOKEN)) {
      return new Response(challenge || '', { status: 200, headers: corsHeaders });
    }
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // 2. Handle Incoming Messages (POST request) — strictly fail-closed HMAC verification
  if (req.method === 'POST') {
    try {
      const rawBody = await req.text();
      const signature = req.headers.get('x-hub-signature-256');
      const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

      if (!appSecret || appSecret.trim() === '' || !signature || !signature.startsWith('sha256=')) {
        return new Response('Forbidden', { status: 403, headers: corsHeaders });
      }

      const sigHex = signature.slice(7).trim();
      if (sigHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(sigHex)) {
        return new Response('Forbidden', { status: 403, headers: corsHeaders });
      }

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(appSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
      const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
      if (!isValid) {
        return new Response('Forbidden', { status: 403, headers: corsHeaders });
      }

      const body = JSON.parse(rawBody);

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === 'text') {
          const phoneNumberId = value.metadata.phone_number_id;
          const from = message.from;
          const text = message.text.body;

          const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
          if (!supabaseUrl || !supabaseKey) {
            return new Response('Service Unavailable', { status: 503, headers: corsHeaders });
          }

          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: channelData, error: channelError } = await supabase
            .from('connected_channels')
            .select('user_id, credentials')
            .eq('channel_key', 'WhatsApp')
            .is('is_connected', true);

          if (channelError || !channelData) {
            return new Response('ok', { status: 200, headers: corsHeaders });
          }

          let targetUserId = null;
          let targetCredentials = null;

          for (const row of channelData) {
            if (row.credentials && row.credentials.phone_number_id === phoneNumberId) {
              targetUserId = row.user_id;
              targetCredentials = row.credentials;
              break;
            }
          }

          if (!targetUserId) {
            return new Response('ok', { status: 200, headers: corsHeaders });
          }

          await supabase.from('execution_logs').insert({
            user_id: targetUserId,
            type: 'trigger',
            channel: 'WhatsApp',
            message: `Customer (${from}): '${text}'`,
          });

          await fetch(`${supabaseUrl}/functions/v1/ai-processor`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              userId: targetUserId,
              channel: 'WhatsApp',
              messageText: text,
              customerPhone: from,
              credentials: targetCredentials,
            }),
          }).catch((err) => console.error('Error triggering AI processor:', err));
        }
      }

      return new Response('ok', { status: 200, headers: corsHeaders });
    } catch (e) {
      console.error(e);
      return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
}
