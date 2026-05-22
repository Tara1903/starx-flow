require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Checking if 'credentials' column exists...");
    const { error } = await supabase.from('connected_channels').select('credentials').limit(1);
    console.log("Select credentials column error:", error);
}

main().catch(console.error);
