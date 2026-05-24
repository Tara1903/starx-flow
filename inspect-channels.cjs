const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './whatsapp-server/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: channels, error } = await supabase
    .from('connected_channels')
    .select('*')
    .eq('channel_key', 'WhatsApp');
    
  if (error) {
    console.error('Error fetching channels:', error);
    return;
  }
  
  console.log('Channels found:', channels.length);
  channels.forEach(c => {
    console.log(`User: ${c.user_id} | Connected: ${c.is_connected} | QR: ${c.credentials?.qr ? 'Present' : 'None'} | Phone: ${c.credentials?.phone || 'None'}`);
    if (c.credentials?.qr) console.log(`  -> QR URL: ${c.credentials.qr}`);
  });
}

main();
