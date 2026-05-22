/**
 * StarX WhatsApp AI Bot
 * 
 * Connects to WhatsApp via Baileys, stores session in Supabase,
 * and forwards incoming messages to the ai-processor Edge Function.
 */

require('dotenv').config();
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
//  EXPRESS KEEP-ALIVE SERVER
//  Render free tier sleeps after 15 min of no traffic.
//  UptimeRobot pings /ping every 5 min to prevent sleep.
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 10000; // Render assigns PORT automatically

// Parse JSON request body
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
    res.send('pong');
});

// Secure endpoint to reset the WhatsApp session
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

        if (user.id !== TARGET_USER_ID) {
            return res.status(403).json({ error: 'Forbidden: Session owner mismatch' });
        }

        console.log("[WA] Manual session reset requested via API endpoint.");
        await resetSession();
        res.json({ success: true, message: 'WhatsApp session reset initiated successfully' });
    } catch (err) {
        console.error('[HTTP] Reset error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Keep-alive server listening on port ${PORT}`);
    // Sync external URL registry on startup
    syncStartupRegistry().catch(err => console.error('[HTTP] Startup registry sync error:', err.message));
});

// ─────────────────────────────────────────────
//  WHATSAPP CONNECTION
// ─────────────────────────────────────────────
let retryCount = 0;
const MAX_RETRIES = 10;
let sock = null;

async function syncStartupRegistry() {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:10000';
    const { data: existingChannel } = await supabase
        .from('connected_channels')
        .select('is_connected, credentials')
        .eq('user_id', TARGET_USER_ID)
        .eq('channel_key', 'WhatsApp')
        .maybeSingle();

    const currentCreds = existingChannel?.credentials || {};
    await supabase
        .from('connected_channels')
        .upsert({
            user_id: TARGET_USER_ID,
            channel_key: 'WhatsApp',
            is_connected: existingChannel?.is_connected || false,
            credentials: {
                ...currentCreds,
                server_url: serverUrl,
                updated_at: new Date().toISOString()
            },
            last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });
    console.log(`[HTTP] Synced server URL: ${serverUrl}`);
}

async function resetSession() {
    console.log("[WA] Executing session reset...");
    if (sock) {
        try {
            sock.ev.removeAllListeners('connection.update');
            sock.ev.removeAllListeners('creds.update');
            sock.ev.removeAllListeners('messages.upsert');
            sock.logout();
        } catch (e) {
            console.warn("[WA] Error during socket logout:", e.message);
        }
        try {
            sock.end();
        } catch (e) {
            // ignore
        }
        sock = null;
    }

    // Delete all auth keys for this session
    console.log(`[WA] Deleting auth keys for session: ${TARGET_USER_ID}`);
    const { error: deleteErr } = await supabase
        .from('baileys_auth')
        .delete()
        .like('key_id', `${TARGET_USER_ID}-%`);
    
    if (deleteErr) {
        console.error("[WA] Error clearing auth keys from DB:", deleteErr.message);
    }

    // Clear status in connected_channels table
    const serverUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:10000';
    await supabase
        .from('connected_channels')
        .upsert({
            user_id: TARGET_USER_ID,
            channel_key: 'WhatsApp',
            is_connected: false,
            credentials: { server_url: serverUrl, updated_at: new Date().toISOString() },
            last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });

    retryCount = 0;
    setTimeout(() => {
        connectToWhatsApp();
    }, 2000);
}

async function connectToWhatsApp() {
    try {
        console.log("\n[WA] Starting WhatsApp connection...");

        // 1. Load auth state from Supabase
        const { state, saveCreds } = await useSupabaseAuthState(supabase, TARGET_USER_ID);

        // 2. Fetch latest WhatsApp Web version (with fallback)
        let version;
        try {
            const info = await fetchLatestBaileysVersion();
            version = info.version;
            console.log(`[WA] WhatsApp Web version: ${version.join('.')}`);
        } catch (e) {
            version = [2, 3000, 1015901307];
            console.warn("[WA] Could not fetch WA version, using fallback.");
        }

        // 3. Create the socket
        sock = makeWASocket({
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

        // 4. Persist credentials on every update
        sock.ev.on('creds.update', saveCreds);

        // 5. Handle connection lifecycle
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            const serverUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:10000';

            // ── QR CODE ──
            if (qr) {
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
                console.log('\n╔══════════════════════════════════════════════════════════╗');
                console.log('║  📱 WHATSAPP QR CODE - SCAN TO LINK YOUR DEVICE         ║');
                console.log('║                                                          ║');
                console.log('║  Can\'t see the QR below? Open this link in your browser: ║');
                console.log('╠══════════════════════════════════════════════════════════╣');
                console.log(`║  ${qrImageUrl}`);
                console.log('╚══════════════════════════════════════════════════════════╝\n');

                qrcode.generate(qr, { small: true });

                // Write QR details to connected_channels so frontend can render it
                await supabase
                    .from('connected_channels')
                    .upsert({
                        user_id: TARGET_USER_ID,
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
                retryCount = 0; // Reset on successful connection
                console.log('\n[WA] ====================================');
                console.log('[WA]   CONNECTED TO WHATSAPP SUCCESSFULLY');
                console.log('[WA]   Listening for incoming messages...');
                console.log('[WA] ====================================\n');

                const phone = sock.user.id.split(':')[0];
                const name = sock.user.name || '';
                await supabase
                    .from('connected_channels')
                    .upsert({
                        user_id: TARGET_USER_ID,
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

                console.log(`[WA] Disconnected. Code: ${statusCode}, Reason: ${reason}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('[WA] LOGGED OUT. Clearing session and preparing for re-pair.');
                    
                    await supabase
                        .from('connected_channels')
                        .upsert({
                            user_id: TARGET_USER_ID,
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
                    await supabase.from('baileys_auth').delete().like('key_id', `${TARGET_USER_ID}-%`);
                    
                    retryCount = 0;
                    setTimeout(() => {
                        connectToWhatsApp();
                    }, 2000);
                    return;
                }

                retryCount++;
                if (retryCount > MAX_RETRIES) {
                    console.error(`[WA] Max retries (${MAX_RETRIES}) exceeded. Stopping.`);
                    
                    await supabase
                        .from('connected_channels')
                        .upsert({
                            user_id: TARGET_USER_ID,
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
                        user_id: TARGET_USER_ID,
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

                const waitSec = Math.min(retryCount * 3, 30); // 3s, 6s, 9s ... max 30s
                console.log(`[WA] Reconnecting in ${waitSec}s... (attempt ${retryCount}/${MAX_RETRIES})`);
                await delay(waitSec * 1000);
                connectToWhatsApp();
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
            console.log(`[WA] Message from ${senderPhone}: "${messageText}"`);

            try {
                const edgeUrl = `${SUPABASE_URL}/functions/v1/ai-processor`;
                const response = await fetch(edgeUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: TARGET_USER_ID,
                        channel: 'WhatsApp',
                        messageText,
                        customerPhone: senderPhone,
                        credentials: {}
                    })
                });

                if (!response.ok) {
                    console.error(`[WA] Edge function returned HTTP ${response.status}`);
                    return;
                }

                const result = await response.json();

                if (result.success && result.reply) {
                    await sock.sendMessage(senderPhone, { text: result.reply });
                    console.log(`[WA] AI reply sent to ${senderPhone}`);
                } else {
                    console.log('[WA] No reply generated:', JSON.stringify(result));
                }
            } catch (err) {
                console.error(`[WA] Error processing message:`, err.message);
            }
        });

    } catch (err) {
        console.error("[WA] Fatal error in connectToWhatsApp:", err.message);
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
            const waitSec = Math.min(retryCount * 5, 30);
            console.log(`[WA] Will retry in ${waitSec}s...`);
            await delay(waitSec * 1000);
            connectToWhatsApp();
        }
    }
}

// ── START ──
connectToWhatsApp();
