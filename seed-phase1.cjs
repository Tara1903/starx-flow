const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envData = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(envData.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=').map(str => str.trim())));

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Phase 1 data...");

  // 1. Get the admin/test user ID (first profile)
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id').limit(1);
  if (profileErr || !profiles || profiles.length === 0) {
    console.error("No profiles found to attach data to.");
    process.exit(1);
  }
  const userId = profiles[0].id;
  console.log(`Using Profile ID: ${userId}`);

  // 2. Clear existing leads/conversations for a clean slate
  await supabase.from('messages').delete().eq('direction', 'inbound'); // Delete trick to clear
  await supabase.from('conversations').delete().eq('user_id', userId);
  await supabase.from('leads').delete().eq('user_id', userId);

  // 3. Create Leads
  const { data: leads, error: leadsErr } = await supabase.from('leads').insert([
    { user_id: userId, name: 'Sarah Jenkins', phone: '+15551234567', source: 'whatsapp', status: 'new' },
    { user_id: userId, name: 'Alex Rodriguez', phone: '+15559876543', source: 'instagram', status: 'contacted' },
    { user_id: userId, name: '+1 (555) 389-2910', phone: '+15553892910', source: 'sms', status: 'converted' }
  ]).select();

  if (leadsErr) {
    console.error("Error creating leads:", leadsErr);
    process.exit(1);
  }
  console.log("Created leads.");

  // 4. Create Conversations
  const { data: convos, error: convosErr } = await supabase.from('conversations').insert([
    { user_id: userId, lead_id: leads[0].id, channel: 'WhatsApp', status: 'active', unread_count: 1 },
    { user_id: userId, lead_id: leads[1].id, channel: 'Instagram', status: 'needs_attention', unread_count: 1 },
    { user_id: userId, lead_id: leads[2].id, channel: 'SMS', status: 'resolved', unread_count: 0 }
  ]).select();

  if (convosErr) {
    console.error("Error creating conversations:", convosErr);
    process.exit(1);
  }
  console.log("Created conversations.");

  // 5. Create Messages
  const messages = [
    // Sarah - WhatsApp
    { conversation_id: convos[0].id, direction: 'inbound', role: 'user', content: 'Hey, I wanted to book a haircut appointment for tomorrow afternoon.' },
    { conversation_id: convos[0].id, direction: 'outbound', role: 'ai', content: 'Hi Sarah! I would be happy to help. We have openings tomorrow at 1:30 PM, 3:00 PM, and 4:30 PM. Which works best?' },
    { conversation_id: convos[0].id, direction: 'inbound', role: 'user', content: 'Let’s do 1:30 PM please.' },
    { conversation_id: convos[0].id, direction: 'outbound', role: 'ai', content: 'Great choice! I have booked you for tomorrow at 1:30 PM. See you then! ✨' },
    { conversation_id: convos[0].id, direction: 'inbound', role: 'user', content: 'Can I change my slot to 3 PM tomorrow instead?' },

    // Alex - Instagram
    { conversation_id: convos[1].id, direction: 'inbound', role: 'user', content: 'Hey guys, looking to check out your pricing catalog.' },
    { conversation_id: convos[1].id, direction: 'outbound', role: 'ai', content: 'Hello! Our haircut starts at $45, styling at $60, and color treatments at $90. You can see the full list on our website.' },
    { conversation_id: convos[1].id, direction: 'inbound', role: 'user', content: 'Wait, so do you have any promo discounts for new customers?' },

    // Unknown - SMS
    { conversation_id: convos[2].id, direction: 'inbound', role: 'user', content: 'Missed call recovery: Hey, tried calling you guys, wanted to check if you do walk-ins.' },
    { conversation_id: convos[2].id, direction: 'outbound', role: 'ai', content: 'Hi! Apologies for missing your call. We do accept walk-ins, but we highly recommend booking in advance to avoid waiting. Would you like me to find an open slot for today?' },
    { conversation_id: convos[2].id, direction: 'inbound', role: 'user', content: 'No worries, I booked a slot online already.' },
    { conversation_id: convos[2].id, direction: 'outbound', role: 'ai', content: 'Fantastic! We look forward to seeing you. Let me know if you need anything else.' },
    { conversation_id: convos[2].id, direction: 'inbound', role: 'user', content: 'Thanks, all set!' }
  ];

  const { error: msgErr } = await supabase.from('messages').insert(messages);
  if (msgErr) {
    console.error("Error creating messages:", msgErr);
    process.exit(1);
  }

  console.log("Successfully seeded database with Phase 1 mock data!");
}

seed().catch(console.error);
