require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clear() {
    console.log("Clearing old WhatsApp session data...");
    await supabase.from('baileys_auth').delete().neq('key_id', '0');
    console.log("Cleared! You can now run `node index.js` again to get a fresh QR code.");
}

clear();
