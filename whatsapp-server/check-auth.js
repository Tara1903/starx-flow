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
  const { data: authKeys, error } = await supabase
    .from('baileys_auth')
    .select('key_id')
    .like('key_id', '%-creds');
    
  if (error) {
    console.error('Error fetching auth keys:', error);
    return;
  }
  
  console.log('Baileys auth creds found:', authKeys.length);
  authKeys.forEach(k => console.log(k.key_id));
}

main().catch(console.error);
