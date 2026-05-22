const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

/**
 * Uses the built-in local file auth state (proven stable) instead of a custom Supabase adapter.
 * This eliminates the race condition that was causing 515 errors during the initial handshake.
 * Once paired, the session folder can be backed up to Supabase if needed.
 */

require('dotenv').config();
const express = require('express');
const pino = require('pino');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const { useSupabaseAuthState } = require('./supabaseAdapter');

// Validate ENV
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_USER_ID = process.env.TARGET_USER_ID;

if (!SUPABASE_URL || !SUPABASE_KEY || !TARGET_USER_ID) {
    console.error("FATAL: Missing environment variables. Check your .env file.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Express setup (for Render/UptimeRobot keep-alive)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ping', (req, res) => {
    res.json({ status: 'alive', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`[HTTP] Keep-alive server running on port ${PORT}`);
});

async function connectToWhatsApp() {
    console.log("[WA] Initializing auth state from Supabase DB...");

    const { state, saveCreds } = await useSupabaseAuthState(supabase, TARGET_USER_ID);

    let version;
    try {
        const versionInfo = await fetchLatestBaileysVersion();
        version = versionInfo.version;
        console.log(`[WA] Using WA version: ${version.join('.')}`);
    } catch (e) {
        console.warn("[WA] Could not fetch latest version, using default.");
        version = [2, 3000, 1015901307];
    }

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,  // Disabled: doesn't work on Windows PowerShell
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    // Save credentials whenever they update (critical for session persistence)
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Terminal QR codes often get scrambled in PowerShell due to font/line-height issues.
            // So we generate a secure, clickable link to view the QR code in your web browser instead!
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qr)}`;
            console.log('========================================================================');
            console.log('  POWER-SHELL IS MESSING UP THE QR CODE? NO PROBLEM!');
            console.log('  Hold CTRL and CLICK the link below to open your QR Code in Chrome:');
            console.log(`  ${qrUrl}`);
            console.log('========================================================================\n');
            qrcode.generate(qr, { small: true }); // We still print it just in case
        }

        if (connection === 'open') {
            console.log('\n[WA] ✅ Successfully connected to WhatsApp!');
            console.log('[WA] Bot is now listening for incoming messages...\n');
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`[WA] Connection closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`);

            if (shouldReconnect) {
                // Wait 3 seconds before reconnecting to avoid rapid-fire loops
                await delay(3000);
                connectToWhatsApp();
            } else {
                console.log('[WA] Logged out permanently. Delete the "session" folder and restart to re-pair.');
            }
        }
    });

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!messageText) return;

        const senderPhone = msg.key.remoteJid;
        console.log(`[WA] 📩 New message from ${senderPhone}: ${messageText}`);

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
                    messageText: messageText,
                    customerPhone: senderPhone,
                    credentials: {}
                })
            });

            const result = await response.json();

            if (result.success && result.reply) {
                await sock.sendMessage(senderPhone, { text: result.reply });
                console.log(`[WA] 🤖 AI Reply sent to ${senderPhone}`);
            } else {
                console.log(`[WA] ⚠️ No AI reply. Response:`, result);
            }
        } catch (err) {
            console.error(`[WA] ❌ Error:`, err.message);
        }
    });
}

// Start
connectToWhatsApp();
