import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iotuxpcqewdzvqzncpad.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHV4cGNxZXdkenZxem5jcGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyOTg2MywiZXhwIjoyMDkzOTA1ODYzfQ.1o34N5GL9EYFVnD9y4QovhFln1XBfUstVzqZSGs1bXo';

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

main().catch(console.error);
