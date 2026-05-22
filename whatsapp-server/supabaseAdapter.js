const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');

/**
 * Creates an auth state adapter that stores Baileys session keys in Supabase.
 * Uses an in-memory cache to prevent race conditions during encryption/decryption.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} sessionId A unique identifier for the session (e.g., user ID)
 */
async function useSupabaseAuthState(supabase, sessionId = 'default') {
    console.log("[WA-Auth] Loading existing session from Supabase...");
    
    // 1. Load everything into memory upfront
    const { data: allData, error } = await supabase
        .from('baileys_auth')
        .select('*')
        .like('key_id', `${sessionId}-%`);
        
    const cache = new Map();
    if (allData) {
        for (const row of allData) {
            // BufferJSON.reviver is required to properly parse Baileys buffers
            cache.set(row.key_id, JSON.parse(JSON.stringify(row.data), BufferJSON.reviver));
        }
    }

    const writeData = async (data, key) => {
        const keyId = `${sessionId}-${key}`;
        cache.set(keyId, data); // update cache instantly
        const jsonStr = JSON.stringify(data, BufferJSON.replacer);
        
        // Fire and forget to database
        supabase
            .from('baileys_auth')
            .upsert({ 
                key_id: keyId, 
                data: JSON.parse(jsonStr),
                updated_at: new Date().toISOString()
            }).then(({error}) => {
                if(error) console.error("[WA-Auth] Failed to save key:", keyId, error);
            });
    };

    const removeData = async (key) => {
        const keyId = `${sessionId}-${key}`;
        cache.delete(keyId);
        
        supabase
            .from('baileys_auth')
            .delete()
            .eq('key_id', keyId).then();
    };

    let creds = cache.get(`${sessionId}-creds`);
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        let value = cache.get(`${sessionId}-${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            const b = require('@whiskeysockets/baileys');
                            value = b.proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }
                    return data; // synchronous return prevents race condition!
                },
                set: (data) => {
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                writeData(value, key);
                            } else {
                                removeData(key);
                            }
                        }
                    }
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
}

module.exports = { useSupabaseAuthState };
