require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Listing tables in Supabase public schema...");
    
    // We can list tables by querying pg_catalog via postgrest if we have a table exposed,
    // or by trying to select from standard tables.
    // Let's see what tables we can query. We know workflows, profiles, connected_channels, baileys_auth, execution_logs.
    // Let's test a few table names to see if they exist.
    const tables = ['profiles', 'workflows', 'connected_channels', 'baileys_auth', 'execution_logs', 'logs', 'channels', 'settings'];
    for (const t of tables) {
        const { error } = await supabase.from(t).select('id').limit(1);
        if (error) {
            console.log(`Table ${t} does not exist or has error:`, error.message);
        } else {
            console.log(`Table ${t} EXISTS!`);
        }
    }
}

main().catch(console.error);
