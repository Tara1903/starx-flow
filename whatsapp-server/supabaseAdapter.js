const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');

/**
 * Supabase-backed auth state for Baileys.
 * 
 * KEY DESIGN:
 * 1. Startup Pagination: Loads ALL keys in batches of 1000 from Supabase to prevent the PostgREST limit truncation.
 * 2. Targeted Fallback: Explicitly checks for credentials key if missed.
 * 3. On-Demand Fetch: Fetches missing keys from Supabase asynchronously if there's a cache miss.
 * 4. Write-Through Cache: Writes to cache instantly, then updates Supabase to prevent handshake race conditions.
 */
async function useSupabaseAuthState(supabase, sessionId = 'default') {
    console.log("[AUTH] Loading session from Supabase DB...");

    const cache = new Map();
    let page = 0;
    const pageSize = 1000;
    let totalLoaded = 0;

    // ── Step 1: Bulk-load all existing keys into RAM (paginated) ──
    while (true) {
        const fromRange = page * pageSize;
        const toRange = (page + 1) * pageSize - 1;

        console.log(`[AUTH] Fetching keys range ${fromRange} to ${toRange} from Supabase...`);
        const { data: rows, error } = await supabase
            .from('baileys_auth')
            .select('key_id, data')
            .like('key_id', `${sessionId}-%`)
            .range(fromRange, toRange);

        if (error) {
            console.error("[AUTH] Error loading session page from DB:", error.message);
            break;
        }

        if (!rows || rows.length === 0) {
            break;
        }

        for (const row of rows) {
            try {
                cache.set(
                    row.key_id,
                    JSON.parse(JSON.stringify(row.data), BufferJSON.reviver)
                );
            } catch (e) {
                console.warn(`[AUTH] Skipped corrupt key on startup: ${row.key_id}`);
            }
        }

        totalLoaded += rows.length;
        console.log(`[AUTH] Loaded page ${page + 1} with ${rows.length} keys (Total loaded: ${totalLoaded}).`);

        if (rows.length < pageSize) {
            break; // Last page reached
        }
        page++;
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

    // ── Step 2: Load or create credentials with targeted fallback ──
    let creds = cache.get(`${sessionId}-creds`);
    if (!creds) {
        console.log("[AUTH] Credentials not found in initial load. Checking database specifically for creds...");
        const { data: credsRow, error: credsErr } = await supabase
            .from('baileys_auth')
            .select('data')
            .eq('key_id', `${sessionId}-creds`)
            .maybeSingle();

        if (credsErr) {
            console.error("[AUTH] Error checking credentials fallback:", credsErr.message);
        } else if (credsRow && credsRow.data) {
            try {
                creds = JSON.parse(JSON.stringify(credsRow.data), BufferJSON.reviver);
                cache.set(`${sessionId}-creds`, creds);
                console.log("[AUTH] Restored credentials via targeted DB fetch fallback.");
            } catch (e) {
                console.error("[AUTH] Failed to parse targeted creds:", e.message);
            }
        }
    }

    if (!creds) {
        creds = initAuthCreds();
        writeData(creds, 'creds');
        console.log("[AUTH] No credentials found in DB. Generated fresh credentials.");
    } else {
        console.log("[AUTH] Restored existing credentials successfully.");
    }

    // ── Step 3: Return Baileys-compatible auth state ──
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const result = {};
                    const missingIds = [];

                    for (const id of ids) {
                        const keyId = `${sessionId}-${type}-${id}`;
                        if (cache.has(keyId)) {
                            let value = cache.get(keyId) || null;
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            result[id] = value;
                        } else {
                            missingIds.push(id);
                        }
                    }

                    if (missingIds.length > 0) {
                        const keyIdsToFetch = missingIds.map(id => `${sessionId}-${type}-${id}`);
                        console.log(`[AUTH] Cache miss. Fetching ${keyIdsToFetch.length} keys from Supabase...`);

                        try {
                            const { data: rows, error } = await supabase
                                .from('baileys_auth')
                                .select('key_id, data')
                                .in('key_id', keyIdsToFetch);

                            if (error) {
                                console.error("[AUTH] DB query failed for missing keys:", error.message);
                            } else if (rows) {
                                for (const row of rows) {
                                    try {
                                        const parsed = JSON.parse(JSON.stringify(row.data), BufferJSON.reviver);
                                        cache.set(row.key_id, parsed);
                                    } catch (e) {
                                        console.warn(`[AUTH] Skipped corrupt key on-demand: ${row.key_id}`);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("[AUTH] Exception during missing keys fetch:", err.message);
                        }

                        for (const id of missingIds) {
                            const keyId = `${sessionId}-${type}-${id}`;
                            let value = cache.get(keyId) || null;
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            result[id] = value;
                        }
                    }

                    return result;
                },
                set: async (data) => {
                    const promises = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            const keyId = `${sessionId}-${key}`;
                            
                            if (value) {
                                cache.set(keyId, value);
                                const jsonStr = JSON.stringify(value, BufferJSON.replacer);
                                const p = supabase
                                    .from('baileys_auth')
                                    .upsert({
                                        key_id: keyId,
                                        data: JSON.parse(jsonStr),
                                        updated_at: new Date().toISOString()
                                    })
                                    .then(({ error: err }) => {
                                        if (err) console.error("[AUTH] DB write failed for", keyId, err.message);
                                    });
                                promises.push(p);
                            } else {
                                cache.delete(keyId);
                                const p = supabase
                                    .from('baileys_auth')
                                    .delete()
                                    .eq('key_id', keyId)
                                    .then(({ error: err }) => {
                                        if (err) console.error("[AUTH] DB delete failed for", keyId, err.message);
                                    });
                                promises.push(p);
                            }
                        }
                    }
                    await Promise.all(promises);
                }
            }
        },
        saveCreds: () => {
            writeData(creds, 'creds');
        }
    };
}

module.exports = { useSupabaseAuthState };
