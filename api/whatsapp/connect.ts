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

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.split(' ')[1];

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: corsHeaders });
    }

    const userId = user.id;
    
    // Check if channel already exists
    const { data: existingChannel } = await supabase
        .from('connected_channels')
        .select('is_connected, credentials')
        .eq('user_id', userId)
        .eq('channel_key', 'WhatsApp')
        .maybeSingle();

    if (!existingChannel) {
        await supabase
            .from('connected_channels')
            .insert({
                user_id: userId,
                channel_key: 'WhatsApp',
                is_connected: false,
                credentials: {
                    server_url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                    updated_at: new Date().toISOString()
                },
            });
    }

    return new Response(JSON.stringify({ success: true, message: 'WhatsApp session connection initiated' }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
