require('dotenv').config();
const express = require('express');
const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const { useSupabaseAuthState } = require('./supabaseAdapter');

// Validate ENV
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_USER_ID = process.env.TARGET_USER_ID; // The StarX user ID this bot belongs to

if (!SUPABASE_URL || !SUPABASE_KEY || !TARGET_USER_ID) {
    console.error("FATAL: Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Express setup (for Render/UptimeRobot keep-alive)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(PORT, () => {
    console.log(`[HTTP] Keep-alive server running on port ${PORT}`);
});

// Baileys WhatsApp Connection
async function connectToWhatsApp() {
    console.log("[WA] Connecting to Supabase Auth State...");
    const { state, saveCreds } = await useSupabaseAuthState(supabase, TARGET_USER_ID);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['StarX Microservice', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\n[WA] Please scan the QR code above to link WhatsApp!');
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[WA] Connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('[WA] You are logged out. Please clear auth data from Supabase and restart to scan QR.');
            }
        } else if (connection === 'open') {
            console.log('[WA] Successfully connected to WhatsApp!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return; // Ignore our own messages

        // Extract message text (handles standard text and extended text from quotes/replies)
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!messageText) return;

        const senderPhone = msg.key.remoteJid;
        console.log(`[WA] New message from ${senderPhone}: ${messageText}`);

        try {
            // Forward message to the Supabase Edge Function
            const edgeUrl = `${SUPABASE_URL}/functions/v1/ai-processor`;
            const response = await fetch(edgeUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_KEY}`, // Using service role key for internal call
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: TARGET_USER_ID,
                    channel: 'WhatsApp',
                    messageText: messageText,
                    customerPhone: senderPhone,
                    credentials: {} // Empty credentials because Baileys handles the sending
                })
            });

            const result = await response.json();
            
            if (result.success && result.reply) {
                // Send the AI response back via WhatsApp
                await sock.sendMessage(senderPhone, { text: result.reply });
                console.log(`[WA] AI Reply sent to ${senderPhone}`);
            } else {
                console.log(`[WA] No AI reply generated. Edge function response:`, result);
            }
        } catch (err) {
            console.error(`[WA] Error processing message through AI Engine:`, err.message);
        }
    });
}

// Start bot
connectToWhatsApp();
