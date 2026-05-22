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
    console.log("=== Querying Auth Users ===");
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error("Error listing users:", error.message);
    } else {
        console.log(`Found ${users.length} users in auth.users:`);
        users.forEach(u => {
            console.log(`- ID: ${u.id}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Created At: ${u.created_at}`);
            console.log(`  Metadata:`, JSON.stringify(u.user_metadata, null, 2));
            console.log("------------------------");
        });
    }
}

main().catch(console.error);
