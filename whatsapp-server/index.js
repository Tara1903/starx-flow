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

app.get('/', (req, res) => {
    res.json({ service: 'starx-whatsapp-bot', status: 'running', uptime: Math.floor(process.uptime()) + 's' });
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Keep-alive server listening on port ${PORT}`);
});

// ─────────────────────────────────────────────
//  WHATSAPP CONNECTION
// ─────────────────────────────────────────────
let retryCount = 0;
const MAX_RETRIES = 10;

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

        // 4. Persist credentials on every update
        sock.ev.on('creds.update', saveCreds);

        // 5. Handle connection lifecycle
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            // ── QR CODE ──
            if (qr) {
                // Method 1: Clickable URL (works everywhere — Render logs, PowerShell, etc.)
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
                console.log('\n╔══════════════════════════════════════════════════════════╗');
                console.log('║  📱 WHATSAPP QR CODE - SCAN TO LINK YOUR DEVICE         ║');
                console.log('║                                                          ║');
                console.log('║  Can\'t see the QR below? Open this link in your browser: ║');
                console.log('╠══════════════════════════════════════════════════════════╣');
                console.log(`║  ${qrImageUrl}`);
                console.log('╚══════════════════════════════════════════════════════════╝\n');

                // Method 2: Terminal QR (works in proper terminals, may be garbled on Render/PowerShell)
                qrcode.generate(qr, { small: true });
            }

            // ── CONNECTED ──
            if (connection === 'open') {
                retryCount = 0; // Reset on successful connection
                console.log('\n[WA] ====================================');
                console.log('[WA]   CONNECTED TO WHATSAPP SUCCESSFULLY');
                console.log('[WA]   Listening for incoming messages...');
                console.log('[WA] ====================================\n');
            }

            // ── DISCONNECTED ──
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || 'Unknown';

                console.log(`[WA] Disconnected. Code: ${statusCode}, Reason: ${reason}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('[WA] LOGGED OUT. Run "npm run clear" and restart to re-pair.');
                    return; // Don't reconnect
                }

                retryCount++;
                if (retryCount > MAX_RETRIES) {
                    console.error(`[WA] Max retries (${MAX_RETRIES}) exceeded. Stopping.`);
                    console.error('[WA] Run "npm run clear" to reset session, then restart.');
                    return;
                }

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

            // Extract text from various message types
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
