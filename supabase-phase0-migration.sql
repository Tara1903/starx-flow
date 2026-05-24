-- =========================================================================
-- STARX FLOW PHASE 0 — FOUNDATION MIGRATION
-- Additive migration for CRM, Health, and Billing entities
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, converted, lost
  source TEXT DEFAULT 'manual', -- whatsapp, instagram, sms, manual
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_contact_at TIMESTAMPTZ
);

-- 2. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  channel TEXT NOT NULL, -- whatsapp, instagram, sms
  status TEXT NOT NULL DEFAULT 'open', -- open, resolved, snoozed, needs_attention
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- inbound, outbound
  role TEXT NOT NULL DEFAULT 'user', -- user, ai, human
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, read, failed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INTEGRATION HEALTH
CREATE TABLE IF NOT EXISTS integration_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, offline
  last_error TEXT,
  last_check_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, channel)
);

-- 5. USAGE METRICS
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- messages_sent, ai_responses, workflows_triggered
  value INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BILLING SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Leads
CREATE POLICY "Users select own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own leads" ON leads FOR DELETE USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users select own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages
-- To query messages, user must own the parent conversation
CREATE POLICY "Users select own messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);
CREATE POLICY "Users insert own messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);
CREATE POLICY "Users update own messages" ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Integration Health
CREATE POLICY "Users select own health" ON integration_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own health" ON integration_health FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own health" ON integration_health FOR UPDATE USING (auth.uid() = user_id);

-- Usage Metrics
CREATE POLICY "Users select own metrics" ON usage_metrics FOR SELECT USING (auth.uid() = user_id);

-- Billing Subscriptions
CREATE POLICY "Users select own billing" ON billing_subscriptions FOR SELECT USING (auth.uid() = user_id);
-- (Insert/Update on billing should primarily be done by a secure backend webhook, but leaving basic RLS for initial parity)
