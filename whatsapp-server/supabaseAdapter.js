const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');

/**
 * Creates an auth state adapter that stores Baileys session keys in Supabase.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} sessionId A unique identifier for the session (e.g., user ID)
 */
async function useSupabaseAuthState(supabase, sessionId = 'default') {
    const writeData = async (data, key) => {
        const keyId = `${sessionId}-${key}`;
        const jsonStr = JSON.stringify(data, BufferJSON.replacer);
        
        await supabase
            .from('baileys_auth')
            .upsert({ 
                key_id: keyId, 
                data: JSON.parse(jsonStr),
                updated_at: new Date().toISOString()
            });
    };

    const readData = async (key) => {
        const keyId = `${sessionId}-${key}`;
        const { data, error } = await supabase
            .from('baileys_auth')
            .select('data')
            .eq('key_id', keyId)
            .single();

        if (error || !data) return null;

        // Convert the JSON object back to a string, then parse with BufferJSON reviver
        return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    };

    const removeData = async (key) => {
        const keyId = `${sessionId}-${key}`;
        await supabase
            .from('baileys_auth')
            .delete()
            .eq('key_id', keyId);
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = import('@whiskeysockets/baileys').then(b => b.proto.Message.AppStateSyncKeyData.fromObject(value));
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
}

module.exports = { useSupabaseAuthState };
