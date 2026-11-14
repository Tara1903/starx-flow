-- ==============================================================================
-- STARX FLOW — PRODUCTION MASTER SUPABASE POSTGRES SCHEMA
-- Generated for Supabase SQL Editor
-- Completely idempotent: safe to execute on fresh databases or existing instances.
-- Enforces: Multi-tenancy, RLS, 8-digit OTP auth, CRM, Omnichannel Messaging,
--           Appointments, AI Agents, Workflows, Billing (Polar/Stripe), & Integrations.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- pgvector is optional for RAG vector embeddings
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not installed or unavailable in this environment; skipping.';
END $$;

-- ------------------------------------------------------------------------------
-- 2. ROLES PRE-CHECK (Safe on hosted Supabase and local dev)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. USER PROFILES (Extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'My Business',
  business_type TEXT,
  owner_name TEXT NOT NULL DEFAULT 'Owner',
  email TEXT,
  role TEXT DEFAULT 'user',
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role manages all profiles" ON public.profiles;
CREATE POLICY "Service role manages all profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, owner_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'business_name', 'My Business'), COALESCE(new.raw_user_meta_data->>'owner_name', 'Owner'), new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. 8-CHARACTER SECURE OTP LEDGER (Auth Verification for Web & Mobile)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auth_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_otps_email_active
  ON public.auth_otps(email, expires_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.auth_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages all auth otps" ON public.auth_otps;
CREATE POLICY "Service role manages all auth otps"
  ON public.auth_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. MULTI-TENANCY: ORGANIZATIONS & MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter',
  settings JSONB DEFAULT '{"currency": "EUR", "timezone": "Europe/Berlin", "locale": "en"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Helper function to return user organization IDs
CREATE OR REPLACE FUNCTION public.auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
$$;

DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Org admins can update organization" ON public.organizations;
CREATE POLICY "Org admins can update organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Service role manages organizations" ON public.organizations;
CREATE POLICY "Service role manages organizations"
  ON public.organizations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages organization members" ON public.organization_members;
CREATE POLICY "Service role manages organization members"
  ON public.organization_members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. CRM & CONTACT MANAGEMENT (Leads & Contacts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('whatsapp', 'instagram', 'sms', 'web_chat', 'manual', 'csv_import')),
  score INTEGER DEFAULT 50,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  last_contact_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" 
  ON public.leads FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
CREATE POLICY "Users can insert own leads" 
  ON public.leads FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
CREATE POLICY "Users can update own leads" 
  ON public.leads FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
CREATE POLICY "Users can delete own leads" 
  ON public.leads FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages leads" ON public.leads;
CREATE POLICY "Service role manages leads"
  ON public.leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. UNIFIED COMMUNICATIONS: CONVERSATIONS & MESSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('WhatsApp', 'Instagram', 'SMS', 'Web', 'Email')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'needs_attention', 'resolved', 'snoozed')),
  control_mode TEXT DEFAULT 'ai' CHECK (control_mode IN ('ai', 'human')),
  unread_count INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure control_mode column exists if upgrading
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS control_mode TEXT DEFAULT 'ai';

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON public.conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" 
  ON public.conversations FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.conversations;
CREATE POLICY "Users can insert own conversations" 
  ON public.conversations FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" 
  ON public.conversations FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages conversations" ON public.conversations;
CREATE POLICY "Service role manages conversations"
  ON public.conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'human', 'system')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

DROP POLICY IF EXISTS "Users can view messages of their conversations" ON public.messages;
CREATE POLICY "Users can view messages of their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.organization_id IN (SELECT public.auth_user_org_ids()))
    )
  );

DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON public.messages;
CREATE POLICY "Users can insert messages into their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.organization_id IN (SELECT public.auth_user_org_ids()))
    )
  );

DROP POLICY IF EXISTS "Service role manages messages" ON public.messages;
CREATE POLICY "Service role manages messages"
  ON public.messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. APPOINTMENTS & CALENDAR SCHEDULING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  service_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Europe/Berlin',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

DROP POLICY IF EXISTS "Users can manage own appointments" ON public.appointments;
CREATE POLICY "Users can manage own appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()))
  WITH CHECK (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages appointments" ON public.appointments;
CREATE POLICY "Service role manages appointments"
  ON public.appointments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  is_active BOOLEAN DEFAULT true,
  UNIQUE (user_id, day_of_week)
);

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own working hours" ON public.working_hours;
CREATE POLICY "Users can manage own working hours"
  ON public.working_hours FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. ORDERS & COMMERCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  total_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  items JSONB DEFAULT '[]'::jsonb,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

DROP POLICY IF EXISTS "Users can manage own orders" ON public.orders;
CREATE POLICY "Users can manage own orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()))
  WITH CHECK (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages orders" ON public.orders;
CREATE POLICY "Service role manages orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. AI WORKFORCE: AGENTS & MEMORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  system_prompt TEXT,
  model TEXT DEFAULT 'gemini-1.5-flash',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'training')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own agents" ON public.agents;
CREATE POLICY "Users can manage own agents"
  ON public.agents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages agents" ON public.agents;
CREATE POLICY "Service role manages agents"
  ON public.agents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view agent memories" ON public.agent_memories;
CREATE POLICY "Users can view agent memories"
  ON public.agent_memories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memories.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 11. WORKFLOWS & AUTOMATION ENGINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT,
  action TEXT,
  is_active BOOLEAN DEFAULT false,
  channel TEXT NOT NULL,
  ai_tone TEXT,
  custom_prompt TEXT,
  executions_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 100,
  saved_hours NUMERIC DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own workflows" ON public.workflows;
CREATE POLICY "Users can manage own workflows"
  ON public.workflows FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages workflows" ON public.workflows;
CREATE POLICY "Service role manages workflows"
  ON public.workflows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.execution_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  channel TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  details TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own execution logs" ON public.execution_logs;
CREATE POLICY "Users can view own execution logs"
  ON public.execution_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment workflow stats
CREATE OR REPLACE FUNCTION public.increment_workflow_stats(wf_id UUID, hours NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE public.workflows
  SET executions_count = executions_count + 1,
      saved_hours = saved_hours + hours
  WHERE id = wf_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 12. CONNECTED CHANNELS & ACCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connected_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_key TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  credentials JSONB DEFAULT '{}'::jsonb,
  last_synced TIMESTAMPTZ,
  UNIQUE (user_id, channel_key)
);

ALTER TABLE public.connected_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own channels" ON public.connected_channels;
CREATE POLICY "Users can manage own channels"
  ON public.connected_channels FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. BILLING: SUBSCRIPTIONS & INVOICES (Stripe & Polar Support)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  billing_provider TEXT DEFAULT 'polar',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  polar_customer_id TEXT,
  polar_subscription_id TEXT,
  polar_product_id TEXT,
  polar_price_id TEXT,
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT,
  plan_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  billing_provider TEXT DEFAULT 'polar',
  stripe_invoice_id TEXT,
  polar_invoice_id TEXT,
  polar_order_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'usd',
  status TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.polar_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.polar_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages polar webhook events" ON public.polar_webhook_events;
CREATE POLICY "Service role manages polar webhook events"
  ON public.polar_webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 14. TASKS & KNOWLEDGE BASE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('pdf', 'docx', 'url', 'text', 'faq')),
  source_url TEXT,
  content TEXT NOT NULL,
  chunks_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'indexed' CHECK (status IN ('processing', 'indexed', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage knowledge documents" ON public.knowledge_documents;
CREATE POLICY "Users can manage knowledge documents"
  ON public.knowledge_documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()))
  WITH CHECK (auth.uid() = user_id OR organization_id IN (SELECT public.auth_user_org_ids()));

-- ------------------------------------------------------------------------------
-- 15. MOBILE NOTIFICATIONS & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  device_info JSONB DEFAULT '{}'::jsonb,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages device tokens" ON public.device_tokens;
CREATE POLICY "Service role manages device tokens"
  ON public.device_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'api_key', 'cron', 'ai_agent')),
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view audit logs of their orgs" ON public.audit_logs;
CREATE POLICY "Users can view audit logs of their orgs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()));

-- ------------------------------------------------------------------------------
-- 16. BUSINESS RECEPTIONIST 24/7 PROFILE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_receptionist_profiles (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"closed": true}
  }'::jsonb,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  policies JSONB NOT NULL DEFAULT '{
    "cancellation": "24 hours advance notice required",
    "deposit": "None",
    "payment_methods": ["Cash", "Card", "Online"]
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_receptionist_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage receptionist profiles of their orgs" ON public.business_receptionist_profiles;
CREATE POLICY "Users can manage receptionist profiles of their orgs"
  ON public.business_receptionist_profiles FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Service role manages receptionist profiles" ON public.business_receptionist_profiles;
CREATE POLICY "Service role manages receptionist profiles"
  ON public.business_receptionist_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- END OF STARX FLOW COMPLETE POSTGRES SCHEMA
-- ==============================================================================
