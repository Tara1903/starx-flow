require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Checking onboarding_progress...");
    const { data: progress, error: pErr } = await supabase.from('onboarding_progress').select('*');
    if (pErr) console.error("Error fetching progress:", pErr);
    else console.log("Onboarding progress in DB:", progress);
}

main().catch(console.error);
