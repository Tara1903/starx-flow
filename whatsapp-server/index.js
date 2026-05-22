/**
 * StarX WhatsApp AI Bot
 * 
 * Connects to WhatsApp via Baileys, stores session in Supabase,
 * and forwards incoming messages to the ai-processor Edge Function.
 */

require('dotenv').config();
// Force crash on Render to prevent conflicts with local development
if (process.env.RENDER || process.env.RENDER_EXTERNAL_URL) {
    console.error("===============================================================");
    console.error("FATAL: Running on Render detected! Shutting down immediately.");
    console.error("This instance is fighting with the local laptop instance over");
    console.error("the Supabase database and corrupting the WhatsApp encryption keys.");
    console.error("===============================================================");
    process.exit(1);
}

const express = require('express');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const {
    makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys');
const { useSupabaseAuthState } = require('./supabaseAdapter');

// ─────────────────────────────────────────────
//  ENV VALIDATION
// ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_USER_ID = process.env.TARGET_USER_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !TARGET_USER_ID) {
    console.error("===== FATAL =====");
    console.error("Missing one or more required environment variables:");
    console.error("  SUPABASE_URL:", SUPABASE_URL ? "OK" : "MISSING");
    console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_KEY ? "OK" : "MISSING");
    console.error("  TARGET_USER_ID:", TARGET_USER_ID ? "OK" : "MISSING");
    console.error("=================");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────────
//  MULTI-SESSION WHATSAPP CONNECTION MANAGEMENT
// ─────────────────────────────────────────────
const activeSockets = new Map();
const retryCounts = new Map();
const MAX_RETRIES = 10;

// ─────────────────────────────────────────────
//  EXPRESS KEEP-ALIVE SERVER & API
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Custom CORS middleware to allow the Vite dashboard to connect
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/', (req, res) => {
    res.json({ service: 'starx-whatsapp-bot', status: 'running', uptime: Math.floor(process.uptime()) + 's' });
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'ready', message: 'WhatsApp engine initialized' });
});

// Secure endpoint to reset the WhatsApp session for a user
app.post('/api/whatsapp/reset', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        const token = authHeader.split(' ')[1];

        // Verify user JWT against Supabase auth
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const userId = user.id;
        console.log(`[WA] Manual session reset requested via API endpoint for user: ${userId}`);
        await resetSession(userId);
        res.json({ success: true, message: 'WhatsApp session reset initiated successfully' });
    } catch (err) {
        console.error('[HTTP] Reset error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Secure endpoint to connect/initialize the WhatsApp session for a user
app.post('/api/whatsapp/connect', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        const token = authHeader.split(' ')[1];

        // Verify user JWT against Supabase auth
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const userId = user.id;
        console.log(`[WA] Manual session connection requested via API endpoint for user: ${userId}`);
        
        // Ensure a row exists in connected_channels for this user
        const { data: existingChannel } = await supabase
            .from('connected_channels')
            .select('is_connected, credentials')
            .eq('user_id', userId)
            .eq('channel_key', 'WhatsApp')
            .maybeSingle();

        const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        if (!existingChannel) {
            await supabase
                .from('connected_channels')
                .insert({
                    user_id: userId,
                    channel_key: 'WhatsApp',
                    is_connected: false,
                    credentials: {
                        server_url: serverUrl,
                        updated_at: new Date().toISOString()
                    },
                    last_synced: new Date().toISOString()
                });
        }

        if (!activeSockets.has(userId)) {
            retryCounts.set(userId, 0);
            connectToWhatsApp(userId).catch(err => console.error(`[WA] Connection error for ${userId}:`, err.message));
        }
        
        let attempts = 0;
        while (!activeSockets.has(userId) && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        
        const sock = activeSockets.get(userId);
        if (!sock) {
            return res.status(500).json({ error: 'Failed to initialize WhatsApp socket' });
        }

        if (sock.authState?.creds?.me) {
            return res.json({ success: true, connected: true });
        }

        let responded = false;
        
        const onConnectionUpdate = async (update) => {
            const { connection, qr } = update;
            
            if (qr && !responded) {
                responded = true;
                sock.ev.off('connection.update', onConnectionUpdate);
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
                return res.json({ success: true, qr: qrImageUrl });
            }
            
            if (connection === 'open' && !responded) {
                responded = true;
                sock.ev.off('connection.update', onConnectionUpdate);
                return res.json({ success: true, connected: true });
            }
            
            if (connection === 'close' && !responded) {
                responded = true;
                sock.ev.off('connection.update', onConnectionUpdate);
                return res.status(500).json({ error: 'Connection closed before QR' });
            }
        };

        sock.ev.on('connection.update', onConnectionUpdate);

        setTimeout(() => {
            if (!responded) {
                responded = true;
                sock.ev.off('connection.update', onConnectionUpdate);
                res.status(408).json({ error: 'Timeout waiting for QR code' });
            }
        }, 15000);
    } catch (err) {
        console.error('[HTTP] Connect error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Keep-alive server listening on port ${PORT}`);
    startAllConnectedSessions().catch(err => console.error('[HTTP] Startup session restore error:', err.message));
});

async function syncUserRegistry(userId) {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const { data: existingChannel } = await supabase
        .from('connected_channels')
        .select('is_connected, credentials')
        .eq('user_id', userId)
        .eq('channel_key', 'WhatsApp')
        .maybeSingle();

    const currentCreds = existingChannel?.credentials || {};
    await supabase
        .from('connected_channels')
        .upsert({
            user_id: userId,
            channel_key: 'WhatsApp',
            is_connected: existingChannel?.is_connected || false,
            credentials: {
                ...currentCreds,
                server_url: serverUrl,
                updated_at: new Date().toISOString()
            },
            last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });
    console.log(`[HTTP] Synced user ${userId} server URL: ${serverUrl}`);
}

async function startAllConnectedSessions() {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log("[WA] Checking for previously connected WhatsApp channels to restore...");
    
    // Fetch channels
    const { data: channels, error } = await supabase
        .from('connected_channels')
        .select('user_id, credentials, is_connected')
        .eq('channel_key', 'WhatsApp');
        
    if (error) {
        console.error("[WA] Error loading connected channels:", error.message);
        // Fallback to TARGET_USER_ID
        connectToWhatsApp(TARGET_USER_ID).catch(err => console.error(`[WA] Target user connection error:`, err.message));
        return;
    }

    const channelList = channels || [];

    const { data: usersData } = await supabase.auth.admin.listUsers();
    const allUsers = usersData?.users || [];

    // Ensure all users are synced
    for (const u of allUsers) {
        const hasUser = channelList.some(c => c.user_id === u.id);
        if (!hasUser) {
            console.log(`[WA] User ${u.email} not found in connected_channels. Syncing now...`);
            await syncUserRegistry(u.id);
            channelList.push({
                user_id: u.id,
                credentials: {},
                is_connected: false
            });
        }
    }

    // Now process all known channels
    for (const channel of channelList) {
        const currentCreds = channel.credentials || {};
        await supabase
            .from('connected_channels')
            .upsert({
                user_id: channel.user_id,
                channel_key: 'WhatsApp',
                is_connected: channel.is_connected,
                credentials: {
                    ...currentCreds,
                    server_url: serverUrl,
                    updated_at: new Date().toISOString()
                },
                last_synced: new Date().toISOString()
            }, { onConflict: 'user_id, channel_key' });

        if (channel.is_connected) {
            console.log(`[WA] Restoring connection for user: ${channel.user_id}`);
            connectToWhatsApp(channel.user_id).catch(err => console.error(`[WA] Failed to connect user ${channel.user_id}:`, err.message));
        } else {
            // Start connection for ALL users on startup
            console.log(`[WA] Starting default connection for user: ${channel.user_id}`);
            connectToWhatsApp(channel.user_id).catch(err => console.error(`[WA] Failed to connect user:`, err.message));
        }
    }
}

async function resetSession(userId) {
    console.log(`[WA] Executing session reset for user: ${userId}...`);
    const sock = activeSockets.get(userId);
    if (sock) {
        try {
            sock.ev.removeAllListeners('connection.update');
            sock.ev.removeAllListeners('creds.update');
            sock.ev.removeAllListeners('messages.upsert');
            sock.logout();
        } catch (e) {
            console.warn(`[WA] Error during socket logout for ${userId}:`, e.message);
        }
        try {
            sock.end();
        } catch (e) {
            // ignore
        }
        activeSockets.delete(userId);
    }

    // Delete all auth keys for this session
    console.log(`[WA] Deleting auth keys for session: ${userId}`);
    const { error: deleteErr } = await supabase
        .from('baileys_auth')
        .delete()
        .like('key_id', `${userId}-%`);
    
    if (deleteErr) {
        console.error(`[WA] Error clearing auth keys from DB for ${userId}:`, deleteErr.message);
    }

    // Clear status in connected_channels table
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    await supabase
        .from('connected_channels')
        .upsert({
            user_id: userId,
            channel_key: 'WhatsApp',
            is_connected: false,
            credentials: { server_url: serverUrl, updated_at: new Date().toISOString() },
            last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });

    retryCounts.set(userId, 0);
    setTimeout(() => {
        connectToWhatsApp(userId);
    }, 2000);
}

async function connectToWhatsApp(userId) {
    try {
        console.log(`\n[WA] Starting WhatsApp connection for user: ${userId}...`);

        // Close any existing socket for this user
        const existingSock = activeSockets.get(userId);
        if (existingSock) {
            try {
                existingSock.ev.removeAllListeners('connection.update');
                existingSock.ev.removeAllListeners('creds.update');
                existingSock.ev.removeAllListeners('messages.upsert');
                existingSock.end();
            } catch (e) {
                // ignore
            }
            activeSockets.delete(userId);
        }

        // 1. Load auth state from Supabase
        const { state, saveCreds } = await useSupabaseAuthState(supabase, userId);

        // 2. Fetch latest WhatsApp Web version (with fallback)
        let version;
        try {
            const info = await fetchLatestBaileysVersion();
            version = info.version;
            console.log(`[WA] [${userId}] WhatsApp Web version: ${version.join('.')}`);
        } catch (e) {
            version = [2, 3000, 1015901307];
            console.warn(`[WA] [${userId}] Could not fetch WA version, using fallback.`);
        }

        // 3. Create the socket
        const sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            connectTimeoutMs: 60000,
            retryRequestDelayMs: 250
        });

        activeSockets.set(userId, sock);

        // 4. Persist credentials on every update
        sock.ev.on('creds.update', saveCreds);

        // 5. Handle connection lifecycle
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

            // ── QR CODE ──
            if (qr) {
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
                console.log(`\n╔══════════════════════════════════════════════════════════╗`);
                console.log(`║  📱 USER ${userId} QR CODE - SCAN TO LINK DEVICE          ║`);
                console.log(`║                                                          ║`);
                console.log(`║  Can't see the QR below? Open this link in your browser: ║`);
                console.log(`╠══════════════════════════════════════════════════════════╣`);
                console.log(`║  ${qrImageUrl}`);
                console.log(`╚══════════════════════════════════════════════════════════╝\n`);

                // Write QR details to connected_channels so frontend can render it
                await supabase
                    .from('connected_channels')
                    .upsert({
                        user_id: userId,
                        channel_key: 'WhatsApp',
                        is_connected: false,
                        credentials: {
                            qr: qrImageUrl,
                            qr_raw: qr,
                            server_url: serverUrl,
                            updated_at: new Date().toISOString()
                        },
                        last_synced: new Date().toISOString()
                    }, { onConflict: 'user_id, channel_key' });
            }

            // ── CONNECTED ──
            if (connection === 'open') {
                retryCounts.set(userId, 0); // Reset on successful connection
                console.log(`\n[WA] ====================================`);
                console.log(`[WA]   CONNECTED USER ${userId} TO WHATSAPP`);
                console.log(`[WA]   Listening for incoming messages...`);
                console.log(`[WA] ====================================\n`);

                const phone = sock.user.id.split(':')[0];
                const name = sock.user.name || '';
                await supabase
                    .from('connected_channels')
                    .upsert({
                        user_id: userId,
                        channel_key: 'WhatsApp',
                        is_connected: true,
                        credentials: {
                            phone,
                            name,
                            server_url: serverUrl,
                            updated_at: new Date().toISOString()
                        },
                        last_synced: new Date().toISOString()
                    }, { onConflict: 'user_id, channel_key' });
            }

            // ── DISCONNECTED ──
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || 'Unknown';

                console.log(`[WA] [${userId}] Disconnected. Code: ${statusCode}, Reason: ${reason}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    console.log(`[WA] [${userId}] LOGGED OUT. Clearing session and preparing for re-pair.`);
                    
                    await supabase
                        .from('connected_channels')
                        .upsert({
                            user_id: userId,
                            channel_key: 'WhatsApp',
                            is_connected: false,
                            credentials: { 
                                error: 'Logged out from device', 
                                server_url: serverUrl,
                                updated_at: new Date().toISOString() 
                            },
                            last_synced: new Date().toISOString()
                        }, { onConflict: 'user_id, channel_key' });

                    // Clear keys
                    await supabase.from('baileys_auth').delete().like('key_id', `${userId}-%`);
                    
                    retryCounts.set(userId, 0);
                    setTimeout(() => {
                        connectToWhatsApp(userId);
                    }, 2000);
                    return;
                }

                let uRetryCount = retryCounts.get(userId) || 0;
                uRetryCount++;
                retryCounts.set(userId, uRetryCount);

                if (uRetryCount > MAX_RETRIES) {
                    console.error(`[WA] [${userId}] Max retries (${MAX_RETRIES}) exceeded. Stopping.`);
                    
                    await supabase
                        .from('connected_channels')
                        .upsert({
                            user_id: userId,
                            channel_key: 'WhatsApp',
                            is_connected: false,
                            credentials: { 
                                error: 'Max reconnection retries exceeded', 
                                server_url: serverUrl,
                                updated_at: new Date().toISOString() 
                            },
                            last_synced: new Date().toISOString()
                        }, { onConflict: 'user_id, channel_key' });
                    
                    return;
                }

                // Update channel status to reflect reconnecting state
                await supabase
                    .from('connected_channels')
                    .upsert({
                        user_id: userId,
                        channel_key: 'WhatsApp',
                        is_connected: false,
                        credentials: {
                            status: 'reconnecting',
                            error: reason,
                            server_url: serverUrl,
                            updated_at: new Date().toISOString()
                        },
                        last_synced: new Date().toISOString()
                    }, { onConflict: 'user_id, channel_key' });

                const waitSec = Math.min(uRetryCount * 3, 30); // 3s, 6s, 9s ... max 30s
                console.log(`[WA] [${userId}] Reconnecting in ${waitSec}s... (attempt ${uRetryCount}/${MAX_RETRIES})`);
                await delay(waitSec * 1000);
                connectToWhatsApp(userId);
            }
        });

        // 6. Handle incoming messages
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg?.message || msg.key.fromMe) return;

            const messageText =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption;

            if (!messageText) return;

            const senderPhone = msg.key.remoteJid;
            console.log(`[WA] [${userId}] Message from ${senderPhone}: "${messageText}"`);

            try {
                const edgeUrl = `${SUPABASE_URL}/functions/v1/ai-processor`;
                const response = await fetch(edgeUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        channel: 'WhatsApp',
                        messageText,
                        customerPhone: senderPhone,
                        credentials: {}
                    })
                });

                if (!response.ok) {
                    console.error(`[WA] [${userId}] Edge function returned HTTP ${response.status}`);
                    return;
                }

                const result = await response.json();

                if (result.success && result.reply) {
                    await sock.sendMessage(senderPhone, { text: result.reply });
                    console.log(`[WA] [${userId}] AI reply sent to ${senderPhone}`);
                } else {
                    console.log(`[WA] [${userId}] No reply generated:`, JSON.stringify(result));
                }
            } catch (err) {
                console.error(`[WA] [${userId}] Error processing message:`, err.message);
            }
        });

    } catch (err) {
        console.error(`[WA] [${userId}] Fatal error in connectToWhatsApp:`, err.message);
        let uRetryCount = retryCounts.get(userId) || 0;
        uRetryCount++;
        retryCounts.set(userId, uRetryCount);
        if (uRetryCount <= MAX_RETRIES) {
            const waitSec = Math.min(uRetryCount * 5, 30);
            console.log(`[WA] [${userId}] Will retry in ${waitSec}s...`);
            await delay(waitSec * 1000);
            connectToWhatsApp(userId);
        }
    }
}
