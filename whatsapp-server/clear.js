/**
 * Clears all WhatsApp session data from Supabase.
 * Run this when you need to re-pair (scan QR code again).
 * Usage: npm run clear
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function clear() {
    console.log("Clearing all WhatsApp session data from Supabase...");
    const { error } = await supabase.from('baileys_auth').delete().neq('key_id', '---never-matches---');
    if (error) {
        console.error("Failed to clear:", error.message);
    } else {
        console.log("Done! All session data cleared.");
        console.log("Restart the bot to get a fresh QR code.");
    }
}

clear();
