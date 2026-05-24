require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
    console.log("Wiping all old WhatsApp connections...");
    
    // Nuke all credentials
    const { error: credErr } = await supabase.from('baileys_auth').delete().neq('key_id', 'dummy');
    if (credErr) console.error("Error wiping credentials:", credErr);
    else console.log("✅ Credentials wiped.");

    // Nuke all channels
    const { error: chanErr } = await supabase.from('connected_channels').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    if (chanErr) console.error("Error wiping channels:", chanErr);
    else console.log("✅ Channels wiped.");

    console.log("Done!");
}

wipe();
