require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = '85b006dc-00d3-44e6-af37-1e52dfea3b00'; // User Tara Singh

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log(`=== Resetting WhatsApp Session for User: ${USER_ID} ===`);
    
    // 1. Delete baileys_auth keys for this user
    console.log(`Clearing baileys_auth keys starting with ${USER_ID}-...`);
    const { data: delData, error: delErr } = await supabase
        .from('baileys_auth')
        .delete()
        .like('key_id', `${USER_ID}-%`);
    
    if (delErr) {
        console.error("Error deleting baileys_auth keys:", delErr.message);
    } else {
        console.log("Successfully cleared baileys_auth keys.");
    }
    
    // 2. Reset connected_channels table for WhatsApp
    console.log("Resetting connected_channels WhatsApp record...");
    const { data: upData, error: upErr } = await supabase
        .from('connected_channels')
        .upsert({
            user_id: USER_ID,
            channel_key: 'WhatsApp',
            is_connected: false,
            api_key_set: false,
            credentials: {
                server_url: "https://starx-whatsapp-bot.onrender.com",
                updated_at: new Date().toISOString()
            },
            last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });
        
    if (upErr) {
        console.error("Error updating connected_channels:", upErr.message);
    } else {
        console.log("Successfully updated connected_channels WhatsApp record to disconnected state!");
    }
    
    // 3. Verify
    const { data: verify, error: vErr } = await supabase
        .from('connected_channels')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('channel_key', 'WhatsApp')
        .maybeSingle();
        
    if (vErr) {
        console.error("Error verifying status:", vErr.message);
    } else {
        console.log("Verified Status in DB:", JSON.stringify(verify, null, 2));
    }
}

main().catch(console.error);
