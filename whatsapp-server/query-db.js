require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("=== Querying Supabase ===");
    
    // 1. Fetch profiles
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (pErr) console.error("Error fetching profiles:", pErr);
    else console.log("Profiles in DB:", profiles);
    
    // 2. Fetch connected_channels
    const { data: channels, error: cErr } = await supabase.from('connected_channels').select('*');
    if (cErr) console.error("Error fetching connected_channels:", cErr);
    else console.log("Connected channels in DB:", JSON.stringify(channels, null, 2));
    
    // 3. Count baileys_auth keys
    const { count, error: aErr } = await supabase.from('baileys_auth').select('*', { count: 'exact', head: true });
    if (aErr) console.error("Error counting baileys_auth:", aErr);
    else console.log("Total rows in baileys_auth:", count);
}

main().catch(console.error);
