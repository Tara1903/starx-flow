-- =========================================================================
-- STARX FLOW PHASE 1 — SEED DATA
-- Run this in your Supabase SQL Editor to populate mock inbox data.
-- =========================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_lead1 UUID;
  v_lead2 UUID;
  v_lead3 UUID;
  v_conv1 UUID;
  v_conv2 UUID;
  v_conv3 UUID;
BEGIN
  -- Get the first user profile to attach the data to
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user profile found. Please complete signup first.';
  END IF;

  -- 1. Create Leads
  INSERT INTO leads (user_id, name, phone, source, status) VALUES
    (v_user_id, 'Sarah Jenkins', '+15551234567', 'whatsapp', 'new') RETURNING id INTO v_lead1;
  INSERT INTO leads (user_id, name, phone, source, status) VALUES
    (v_user_id, 'Alex Rodriguez', '+15559876543', 'instagram', 'contacted') RETURNING id INTO v_lead2;
  INSERT INTO leads (user_id, name, phone, source, status) VALUES
    (v_user_id, '+1 (555) 389-2910', '+15553892910', 'sms', 'converted') RETURNING id INTO v_lead3;

  -- 2. Create Conversations
  INSERT INTO conversations (user_id, lead_id, channel, status, unread_count) VALUES
    (v_user_id, v_lead1, 'WhatsApp', 'active', 1) RETURNING id INTO v_conv1;
  INSERT INTO conversations (user_id, lead_id, channel, status, unread_count) VALUES
    (v_user_id, v_lead2, 'Instagram', 'needs_attention', 1) RETURNING id INTO v_conv2;
  INSERT INTO conversations (user_id, lead_id, channel, status, unread_count) VALUES
    (v_user_id, v_lead3, 'SMS', 'resolved', 0) RETURNING id INTO v_conv3;

  -- 3. Create Messages
  -- Sarah (WhatsApp)
  INSERT INTO messages (conversation_id, direction, role, content) VALUES
    (v_conv1, 'inbound', 'user', 'Hey, I wanted to book a haircut appointment for tomorrow afternoon.'),
    (v_conv1, 'outbound', 'ai', 'Hi Sarah! I would be happy to help. We have openings tomorrow at 1:30 PM, 3:00 PM, and 4:30 PM. Which works best?'),
    (v_conv1, 'inbound', 'user', 'Let’s do 1:30 PM please.'),
    (v_conv1, 'outbound', 'ai', 'Great choice! I have booked you for tomorrow at 1:30 PM. See you then! ✨'),
    (v_conv1, 'inbound', 'user', 'Can I change my slot to 3 PM tomorrow instead?');

  -- Alex (Instagram)
  INSERT INTO messages (conversation_id, direction, role, content) VALUES
    (v_conv2, 'inbound', 'user', 'Hey guys, looking to check out your pricing catalog.'),
    (v_conv2, 'outbound', 'ai', 'Hello! Our haircut starts at $45, styling at $60, and color treatments at $90. You can see the full list on our website.'),
    (v_conv2, 'inbound', 'user', 'Wait, so do you have any promo discounts for new customers?');

  -- Unknown (SMS)
  INSERT INTO messages (conversation_id, direction, role, content) VALUES
    (v_conv3, 'inbound', 'user', 'Missed call recovery: Hey, tried calling you guys, wanted to check if you do walk-ins.'),
    (v_conv3, 'outbound', 'ai', 'Hi! Apologies for missing your call. We do accept walk-ins, but we highly recommend booking in advance to avoid waiting. Would you like me to find an open slot for today?'),
    (v_conv3, 'inbound', 'user', 'No worries, I booked a slot online already.'),
    (v_conv3, 'outbound', 'ai', 'Fantastic! We look forward to seeing you. Let me know if you need anything else.'),
    (v_conv3, 'inbound', 'user', 'Thanks, all set!');

END $$;
