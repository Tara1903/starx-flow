import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iotuxpcqewdzvqzncpad.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHV4cGNxZXdkenZxem5jcGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyOTg2MywiZXhwIjoyMDkzOTA1ODYzfQ.1o34N5GL9EYFVnD9y4QovhFln1XBfUstVzqZSGs1bXo';

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
