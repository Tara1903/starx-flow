const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');

/**
 * Supabase-backed auth state for Baileys.
 * 
 * KEY DESIGN: All reads come from an in-memory cache (Map), so they are
 * synchronous and instant. Writes update the cache first, then flush to
 * Supabase in the background. This eliminates the race condition that
 * caused 515 "Stream Errored" during the WhatsApp handshake.
 */
async function useSupabaseAuthState(supabase, sessionId = 'default') {
    console.log("[AUTH] Loading session from Supabase DB...");

    // ── Step 1: Bulk-load all existing keys into RAM ──
    const { data: rows, error } = await supabase
        .from('baileys_auth')
        .select('key_id, data')
        .like('key_id', `${sessionId}-%`);

    if (error) {
        console.error("[AUTH] WARNING: Could not load session from DB:", error.message);
    }

    const cache = new Map();
    if (rows && rows.length > 0) {
        console.log(`[AUTH] Loaded ${rows.length} keys from Supabase.`);
        for (const row of rows) {
            try {
                cache.set(
                    row.key_id,
                    JSON.parse(JSON.stringify(row.data), BufferJSON.reviver)
                );
            } catch (e) {
                console.warn(`[AUTH] Skipped corrupt key: ${row.key_id}`);
            }
        }
    } else {
        console.log("[AUTH] No existing session found. Will generate fresh credentials.");
    }

    // ── Helpers ──
    const writeData = (data, key) => {
        const keyId = `${sessionId}-${key}`;
        cache.set(keyId, data);

        // Background flush to Supabase (fire-and-forget)
        const jsonStr = JSON.stringify(data, BufferJSON.replacer);
        supabase
            .from('baileys_auth')
            .upsert({
                key_id: keyId,
                data: JSON.parse(jsonStr),
                updated_at: new Date().toISOString()
            })
            .then(({ error: err }) => {
                if (err) console.error("[AUTH] DB write failed for", keyId, err.message);
            });
    };

    const removeData = (key) => {
        const keyId = `${sessionId}-${key}`;
        cache.delete(keyId);

        supabase
            .from('baileys_auth')
            .delete()
            .eq('key_id', keyId)
            .then(({ error: err }) => {
                if (err) console.error("[AUTH] DB delete failed for", keyId, err.message);
            });
    };

    // ── Step 2: Load or create credentials ──
    let creds = cache.get(`${sessionId}-creds`);
    if (!creds) {
        creds = initAuthCreds();
        writeData(creds, 'creds');
        console.log("[AUTH] Generated fresh credentials.");
    } else {
        console.log("[AUTH] Restored existing credentials.");
    }

    // ── Step 3: Return Baileys-compatible auth state ──
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const result = {};
                    for (const id of ids) {
                        let value = cache.get(`${sessionId}-${type}-${id}`) || null;
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        result[id] = value;
                    }
                    return result;
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
        saveCreds: () => {
            writeData(creds, 'creds');
        }
    };
}

module.exports = { useSupabaseAuthState };
