require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
    console.log("Fetching OpenAPI spec from Supabase REST API...");
    const url = `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch: HTTP ${response.status}`);
        return;
    }
    const data = await response.json();
    
    console.log("--- EXPOSED PATHS & FUNCTIONS ---");
    const paths = Object.keys(data.paths || {});
    console.log("Exposed paths count:", paths.length);
    console.log("Paths list:", paths.filter(p => p.startsWith('/rpc/')));
    
    console.log("--- TABLE SCHEMAS ---");
    if (data.definitions) {
        for (const tableName of Object.keys(data.definitions)) {
            console.log(`Table: ${tableName}`);
            console.log(`Columns:`, Object.keys(data.definitions[tableName].properties || {}));
        }
    }
}

main().catch(console.error);
