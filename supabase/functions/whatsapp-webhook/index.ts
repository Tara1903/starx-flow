import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // 1. Meta Webhook Verification (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN');

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

      // Extract message details (simplified for WhatsApp Cloud API)
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === 'text') {
          const phoneNumberId = value.metadata.phone_number_id;
          const from = message.from; // Customer's phone number
          const text = message.text.body; // The actual message
          
          // Connect to Supabase
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Find the user who owns this WhatsApp phone_number_id
          const { data: channelData, error: channelError } = await supabase
            .from('connected_channels')
            .select('user_id, credentials')
            .eq('channel_key', 'WhatsApp')
            .is('is_connected', true);

          if (channelError || !channelData) {
            console.error('Error finding connected channel or no active channel found:', channelError);
            return new Response('ok', { status: 200 }); // Always return 200 to Meta
          }

          // Search for the specific user matching the phone_number_id
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

          // Log the incoming message in our database
          await supabase.from('execution_logs').insert({
            user_id: targetUserId,
            type: 'trigger',
            channel: 'WhatsApp',
            message: `Customer (${from}): '${text}'`
          });

          // Forward to our AI Processor Edge Function
          // Note: In production, you might want to call the AI function directly here 
          // or push to a queue to prevent timeout since Edge functions have a 2-second limit on free tier occasionally.
          // For this architecture, we will invoke the other function via Supabase Client.
          
          supabase.functions.invoke('ai-processor', {
            body: { 
              userId: targetUserId, 
              channel: 'WhatsApp', 
              messageText: text, 
              customerPhone: from,
              credentials: targetCredentials
            }
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
});
