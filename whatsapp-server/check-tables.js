require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("Checking tables in database...");
  const tables = ['profiles', 'workflows', 'connected_channels', 'onboarding_progress'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR ->`, error.message);
    } else {
      console.log(`Table '${table}': EXISTS! Found rows:`, data.length);
    }
  }
}

main().catch(console.error);
