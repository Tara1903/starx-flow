import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // 1. Meta Webhook Verification (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new Response(challenge, { status: 200, headers: corsHeaders });
    } else {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }
  }

  // 2. Handle Incoming Messages (POST request)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Incoming Meta Webhook:', JSON.stringify(body));

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === 'text') {
          const phoneNumberId = value.metadata.phone_number_id;
          const from = message.from;
          const text = message.text.body;
          
          const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: channelData, error: channelError } = await supabase
            .from('connected_channels')
            .select('user_id, credentials')
            .eq('channel_key', 'WhatsApp')
            .is('is_connected', true);

          if (channelError || !channelData) {
            console.error('Error finding connected channel or no active channel found:', channelError);
            return new Response('ok', { status: 200 });
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
            console.log(`No matching user found for phone_number_id: ${phoneNumberId}`);
            return new Response('ok', { status: 200 });
          }

          await supabase.from('execution_logs').insert({
            user_id: targetUserId,
            type: 'trigger',
            channel: 'WhatsApp',
            message: `Customer (${from}): '${text}'`
          });
          
          // Fallback to REST API for Supabase Edge Functions since `invoke` isn't fully native in `@supabase/supabase-js` without auth
          await fetch(`${supabaseUrl}/functions/v1/ai-processor`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ 
              userId: targetUserId, 
              channel: 'WhatsApp', 
              messageText: text, 
              customerPhone: from,
              credentials: targetCredentials
            })
          }).catch(err => console.error("Error triggering AI processor:", err));
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
