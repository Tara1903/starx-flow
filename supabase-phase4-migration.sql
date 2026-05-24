-- =========================================================================
-- STARX FLOW PHASE 4 — AI AGENT SYSTEM MIGRATION
-- Additive migration for specialized AI workers & shared memory
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. AI AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- receptionist, booking, review, sales
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  system_prompt TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 2. COGNITIVE SHARED MEMORY TABLE
CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lead_id, key)
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR AGENTS
DROP POLICY IF EXISTS "Users select own agents" ON agents;
CREATE POLICY "Users select own agents" ON agents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own agents" ON agents;
CREATE POLICY "Users insert own agents" ON agents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own agents" ON agents;
CREATE POLICY "Users update own agents" ON agents FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all agents" ON agents;
CREATE POLICY "Admins read all agents" ON agents FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. RLS POLICIES FOR AGENT MEMORIES
DROP POLICY IF EXISTS "Users select own agent memories" ON agent_memories;
CREATE POLICY "Users select own agent memories" ON agent_memories FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own agent memories" ON agent_memories;
CREATE POLICY "Users insert own agent memories" ON agent_memories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own agent memories" ON agent_memories;
CREATE POLICY "Users update own agent memories" ON agent_memories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own agent memories" ON agent_memories;
CREATE POLICY "Users delete own agent memories" ON agent_memories FOR DELETE USING (auth.uid() = user_id);

-- 6. TRIGGER FUNCTION TO INIT AGENTS ON SIGNUP
CREATE OR REPLACE FUNCTION public.create_default_agents()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agents (user_id, name, role, description, system_prompt, permissions) VALUES
    (NEW.id, 'Receptionist Agent', 'receptionist', 'Greets customers, handles general FAQs, and delegates tasks.', 'You are the primary receptionist. Greet customers warmly. Answer general queries about the business, services, and location.', ARRAY['read_crm', 'send_messages']),
    (NEW.id, 'Booking Agent', 'booking', 'Checks appointment slots, handles bookings, and calendars.', 'You are the booking coordinator. Assist with scheduling appointments. Check availability and confirm slots.', ARRAY['read_crm', 'write_calendar', 'send_messages']),
    (NEW.id, 'Review Agent', 'review', 'Monitors public feedback, responds to reviews, and manages ratings.', 'You are the reputation manager. Answer reviews left by clients. Respond politely and offer help for issues.', ARRAY['read_crm', 'send_messages']),
    (NEW.id, 'Sales Agent', 'sales', 'Answers product pricing questions, follows up on leads, and drives conversions.', 'You are the sales development representative. Handle pricing queries and pitches. Offer discounts to close deals.', ARRAY['read_crm', 'write_tasks', 'send_messages'])
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Bind trigger
DROP TRIGGER IF EXISTS on_profile_created_agents ON profiles;
CREATE TRIGGER on_profile_created_agents
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_agents();

-- 7. SEED AGENTS FOR EXISTING PROFILES
INSERT INTO public.agents (user_id, name, role, description, system_prompt, permissions)
SELECT 
  p.id as user_id,
  a.name,
  a.role,
  a.description,
  a.system_prompt,
  a.permissions
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Receptionist Agent', 'receptionist', 'Greets customers, handles general FAQs, and delegates tasks.', 'You are the primary receptionist. Greet customers warmly. Answer general queries about the business, services, and location.', ARRAY['read_crm', 'send_messages']),
    ('Booking Agent', 'booking', 'Checks appointment slots, handles bookings, and calendars.', 'You are the booking coordinator. Assist with scheduling appointments. Check availability and confirm slots.', ARRAY['read_crm', 'write_calendar', 'send_messages']),
    ('Review Agent', 'review', 'Monitors public feedback, responds to reviews, and manages ratings.', 'You are the reputation manager. Answer reviews left by clients. Respond politely and offer help for issues.', ARRAY['read_crm', 'send_messages']),
    ('Sales Agent', 'sales', 'Answers product pricing questions, follows up on leads, and drives conversions.', 'You are the sales development representative. Handle pricing queries and pitches. Offer discounts to close deals.', ARRAY['read_crm', 'write_tasks', 'send_messages'])
) as a(name, role, description, system_prompt, permissions)
ON CONFLICT (user_id, role) DO NOTHING;

-- Revoke public execution rights on function
REVOKE EXECUTE ON FUNCTION public.create_default_agents() FROM PUBLIC;
