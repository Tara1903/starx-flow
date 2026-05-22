require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Checking for RPC functions...");
    // We can check if we can fetch from pg_proc via a query or if there's any RPC we can inspect.
    // Let's try calling some system views or pg_catalog.
    const { data, error } = await supabase.from('pg_catalog.pg_proc').select('proname').limit(10);
    console.log("pg_proc select result:", { data, error });
}

main().catch(console.error);
