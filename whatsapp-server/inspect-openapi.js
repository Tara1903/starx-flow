const fs = require('fs');
require('dotenv').config();

async function main() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("=== rpc/rls_auto_enable ===");
    console.log(JSON.stringify(data.paths['/rpc/rls_auto_enable'], null, 2));

    console.log("=== rpc/admin_update_profile ===");
    console.log(JSON.stringify(data.paths['/rpc/admin_update_profile'], null, 2));
}

main().catch(console.error);
