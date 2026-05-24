-- =========================================================================
-- STARX FLOW PHASE 5 — VOICE LAYER MIGRATION
-- Additive migration for call logs, transcriptions, and call analytics
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. CALLS TABLE
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'ongoing', 'failed')),
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT DEFAULT '',
  transcription JSONB DEFAULT '[]'::jsonb, -- Array of { role: 'agent'|'customer', text: string, timestamp: string }
  summary TEXT DEFAULT '',
  sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
  call_memory JSONB DEFAULT '[]'::jsonb, -- Array of { key: string, value: string }
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR CALLS
DROP POLICY IF EXISTS "Users select own calls" ON calls;
CREATE POLICY "Users select own calls" ON calls FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own calls" ON calls;
CREATE POLICY "Users insert own calls" ON calls FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all calls" ON calls;
CREATE POLICY "Admins read all calls" ON calls FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users update own calls" ON calls;
CREATE POLICY "Users update own calls" ON calls FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own calls" ON calls;
CREATE POLICY "Users delete own calls" ON calls FOR DELETE USING (auth.uid() = user_id);

-- 4. SEED CALLS FOR EXISTING PROFILES
INSERT INTO public.calls (user_id, customer_name, customer_phone, direction, status, duration_seconds, recording_url, transcription, summary, sentiment, call_memory)
SELECT 
  p.id as user_id,
  c.customer_name,
  c.customer_phone,
  c.direction,
  c.status,
  c.duration_seconds,
  c.recording_url,
  c.transcription,
  c.summary,
  c.sentiment,
  c.call_memory
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('John Doe', '+1 (555) 123-4567', 'inbound', 'completed', 145, 'https://example.com/audio/call1.mp3', 
     '[{"role": "customer", "text": "Hi, I would like to book a hair coloring and cut for tomorrow afternoon if possible.", "timestamp": "0:02"}, {"role": "agent", "text": "Hello John! I can certainly check that for you. We have an opening with Sarah at 2:30 PM tomorrow, or with Michael at 4:00 PM. Would either of those work?", "timestamp": "0:14"}, {"role": "customer", "text": "2:30 PM with Sarah works perfectly. How long will it take?", "timestamp": "0:25"}, {"role": "agent", "text": "Excellent! That session will take about 2 hours. I have confirmed your appointment for tomorrow, May 24th at 2:30 PM with Sarah. You will receive a confirmation text shortly.", "timestamp": "0:32"}, {"role": "customer", "text": "Awesome, thank you so much! See you then.", "timestamp": "0:41"}, {"role": "agent", "text": "You are very welcome! Have a great day!", "timestamp": "0:45"}]'::jsonb,
     'Customer booked a hair coloring and cut appointment with Sarah for tomorrow at 2:30 PM.', 'positive',
     '[{"key": "appointment_booked", "value": "true"}, {"key": "stylist_preference", "value": "Sarah"}, {"key": "booking_date", "value": "May 24th at 2:30 PM"}]'::jsonb),
    ('Alice Smith', '+1 (555) 987-6543', 'inbound', 'missed', 0, '', 
     '[]'::jsonb,
     'Missed call from Alice Smith. SMS recovery workflow was triggered automatically.', 'neutral',
     '[]'::jsonb),
    ('Robert Johnson', '+1 (555) 555-0199', 'outbound', 'completed', 210, 'https://example.com/audio/call3.mp3',
     '[{"role": "agent", "text": "Hi Robert, this is StarX receptionist calling regarding your feedback on your recent service.", "timestamp": "0:03"}, {"role": "customer", "text": "Oh hello. Yes, I was a bit unhappy because the waiting time was almost 30 minutes past my scheduled slot.", "timestamp": "0:12"}, {"role": "agent", "text": "I completely understand and apologize for the delay. We had an unexpected double-booking. To make up for this, I would like to offer you a 20% discount on your next visit.", "timestamp": "0:24"}, {"role": "customer", "text": "Well, that is very nice of you. I appreciate you calling to resolve it. I will give you another try.", "timestamp": "0:36"}, {"role": "agent", "text": "Thank you for your understanding, Robert. We look forward to providing a much better experience next time.", "timestamp": "0:42"}]'::jsonb,
     'Outbound resolution call regarding a service delay. Customer accepted a 20% discount coupon and agreed to visit again.', 'positive',
     '[{"key": "customer_issue", "value": "Long wait time (30 mins)"}, {"key": "compensation_offered", "value": "20% discount"}, {"key": "resolution_status", "value": "Resolved"}]'::jsonb)
) as c(customer_name, customer_phone, direction, status, duration_seconds, recording_url, transcription, summary, sentiment, call_memory)
ON CONFLICT DO NOTHING;
