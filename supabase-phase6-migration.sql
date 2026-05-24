-- =========================================================================
-- STARX FLOW PHASE 6 — BUSINESS OPERATING SYSTEM MIGRATION
-- Additive migration for global business memory and business performance goals
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. BUSINESS COGNITIVE MEMORIES TABLE
CREATE TABLE IF NOT EXISTS business_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'faq', 'policy', 'hours')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, key)
);

-- 2. BUSINESS PERFORMANCE GOALS TABLE
CREATE TABLE IF NOT EXISTS business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'count' CHECK (unit IN ('bookings', 'hours', 'percent', 'usd', 'count')),
  target_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE business_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_goals ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR BUSINESS MEMORIES
DROP POLICY IF EXISTS "Users select own business memories" ON business_memories;
CREATE POLICY "Users select own business memories" ON business_memories FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own business memories" ON business_memories;
CREATE POLICY "Users insert own business memories" ON business_memories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own business memories" ON business_memories;
CREATE POLICY "Users update own business memories" ON business_memories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own business memories" ON business_memories;
CREATE POLICY "Users delete own business memories" ON business_memories FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS POLICIES FOR BUSINESS GOALS
DROP POLICY IF EXISTS "Users select own business goals" ON business_goals;
CREATE POLICY "Users select own business goals" ON business_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own business goals" ON business_goals;
CREATE POLICY "Users insert own business goals" ON business_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own business goals" ON business_goals;
CREATE POLICY "Users update own business goals" ON business_goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own business goals" ON business_goals;
CREATE POLICY "Users delete own business goals" ON business_goals FOR DELETE USING (auth.uid() = user_id);

-- 6. SEED MOCK RECORDS FOR EXISTING PROFILES
-- Global Memories
INSERT INTO public.business_memories (user_id, key, value, category)
SELECT 
  p.id as user_id,
  m.key,
  m.value,
  m.category
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('business_hours', 'Monday - Friday: 9:00 AM - 7:00 PM, Saturday: 9:00 AM - 5:00 PM, Sunday: Closed', 'hours'),
    ('cancellation_policy', 'Clients can cancel or reschedule up to 24 hours in advance without fee. Cancellations under 24 hours incur a 50% charge.', 'policy'),
    ('first_visit_discount', 'New clients receive a 15% discount code (WELCOME15) automatically applied to their first scheduled slot.', 'general'),
    ('address_faq', 'We are located at 120 Brand Ave, Suite 300, near the downtown city park. Free customer parking is available in the back.', 'faq')
) as m(key, value, category)
ON CONFLICT (user_id, key) DO NOTHING;

-- Goals
INSERT INTO public.business_goals (user_id, title, description, target_value, current_value, unit, target_date, status)
SELECT 
  p.id as user_id,
  g.title,
  g.description,
  g.target_value,
  g.current_value,
  g.unit,
  g.target_date,
  g.status
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Triage Inbound Leads', 'Triage WhatsApp/SMS leads automatically with AI and schedule booking slots.', 50, 32, 'bookings', now() + INTERVAL '7 days', 'active'),
    ('Save Staff Support Hours', 'Reduce manual phone/text customer support time via automated agents.', 30, 18, 'hours', now() + INTERVAL '14 days', 'active'),
    ('AI Assistant Match Rate', 'Maintain high AI auto-resolution rate without human support agent takeover.', 95, 92, 'percent', now() + INTERVAL '30 days', 'active'),
    ('Collect Reviews Boost', 'Automate checkout text reminders to collect public Google reviews.', 20, 15, 'count', now() + INTERVAL '10 days', 'active')
) as g(title, description, target_value, current_value, unit, target_date, status)
ON CONFLICT DO NOTHING;
