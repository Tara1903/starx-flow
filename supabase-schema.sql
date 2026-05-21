-- =========================================================================
-- StarX Flow — Supabase Database Schema
-- =========================================================================
-- Run this ENTIRE file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → Paste → Run
-- =========================================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT 'My Business',
  business_type TEXT NOT NULL DEFAULT 'Other',
  owner_name TEXT NOT NULL DEFAULT 'Owner',
  email TEXT,
  phone TEXT,
  plan TEXT NOT NULL DEFAULT 'Free Trial',
  status TEXT NOT NULL DEFAULT 'Trial',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now()
);

-- 2. WORKFLOWS
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  trigger TEXT NOT NULL DEFAULT 'WhatsApp Message Received',
  action TEXT NOT NULL DEFAULT 'Generate AI Response',
  is_active BOOLEAN DEFAULT true,
  channel TEXT NOT NULL DEFAULT 'WhatsApp',
  ai_tone TEXT NOT NULL DEFAULT 'Friendly',
  custom_prompt TEXT DEFAULT 'Reply helpfully and book appointments when possible.',
  executions_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 100.0,
  saved_hours NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EXECUTION LOGS
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'system',
  channel TEXT NOT NULL DEFAULT 'System',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CONNECTED CHANNELS
CREATE TABLE IF NOT EXISTS connected_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_key TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  credentials JSONB DEFAULT '{}'::jsonb,
  last_synced TIMESTAMPTZ,
  UNIQUE(user_id, channel_key)
);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_channels ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS
CREATE POLICY "Admins can do everything"
  ON connected_channels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =========================================================================
-- STORED PROCEDURES (RPC)
-- =========================================================================

CREATE OR REPLACE FUNCTION increment_workflow_stats(wf_id UUID, hours NUMERIC)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE workflows
  SET executions_count = executions_count + 1,
      saved_hours = saved_hours + hours
  WHERE id = wf_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- PROFILES
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;
CREATE POLICY "Admins update all profiles"
  ON profiles FOR UPDATE
  USING (
    public.is_admin()
  ) WITH CHECK (
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins delete profiles" ON profiles;
CREATE POLICY "Admins delete profiles"
  ON profiles FOR DELETE
  USING (
    public.is_admin()
  );

-- WORKFLOWS
DROP POLICY IF EXISTS "Users select own workflows" ON workflows;
CREATE POLICY "Users select own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own workflows" ON workflows;
CREATE POLICY "Users insert own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own workflows" ON workflows;
CREATE POLICY "Users update own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own workflows" ON workflows;
CREATE POLICY "Users delete own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all workflows" ON workflows;
CREATE POLICY "Admins read all workflows"
  ON workflows FOR SELECT
  USING (
    public.is_admin()
  );

-- LOGS
DROP POLICY IF EXISTS "Users select own logs" ON execution_logs;
CREATE POLICY "Users select own logs" ON execution_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own logs" ON execution_logs;
CREATE POLICY "Users insert own logs" ON execution_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHANNELS
DROP POLICY IF EXISTS "Users select own channels" ON connected_channels;
CREATE POLICY "Users select own channels" ON connected_channels
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own channels" ON connected_channels;
CREATE POLICY "Users insert own channels" ON connected_channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own channels" ON connected_channels;
CREATE POLICY "Users update own channels" ON connected_channels
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own channels" ON connected_channels;
CREATE POLICY "Users delete own channels" ON connected_channels
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, owner_name, business_type, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Owner'),
    COALESCE(NEW.raw_user_meta_data->>'business_type', 'Other'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- DEFAULT WORKFLOWS ON SIGNUP (trigger)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.create_default_workflows()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workflows (user_id, name, description, trigger, action, channel, ai_tone, custom_prompt) VALUES
  (NEW.id, 'WhatsApp Booking Agent', 'Automatically responds to WhatsApp messages, captures intent, and books appointments into your calendar.', 'WhatsApp Message Received', 'Generate AI Response', 'WhatsApp', 'Friendly', 'You are a warm, friendly receptionist. Greet customers, answer FAQs about services and pricing, and help them book appointments. Always confirm the date, time, and service.'),
  (NEW.id, 'Missed Call SMS Recovery', 'Sends an instant SMS follow-up when a call is missed, recovering potential lost bookings.', 'Missed Phone Call', 'Dispatch SMS Message', 'SMS', 'Professional', 'You are a professional assistant. A customer just called but the call was missed. Send a polite SMS apologizing and offering to help via text or schedule a callback.'),
  (NEW.id, 'Google Reviews Booster', 'Sends automated review requests via SMS after appointments to grow your online reputation.', 'Invoice Marked Paid', 'Send Review Invitation', 'Reviews', 'Casual', 'Send a friendly message thanking the customer for their visit and asking them to leave a quick Google review. Include the review link.'),
  (NEW.id, 'Instagram Lead Magnet', 'Detects engagement keywords in Instagram DMs and auto-replies with booking links and promotions.', 'Instagram Keyword Detected', 'Generate AI Response', 'Instagram', 'Casual', 'You are a social media assistant. When someone DMs with interest keywords like "book", "price", "available", respond enthusiastically with info and a booking link.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_workflows();

-- =========================================================================
-- DEFAULT CHANNELS ON SIGNUP (trigger)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.create_default_channels()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.connected_channels (user_id, channel_key, is_connected) VALUES
  (NEW.id, 'WhatsApp', false),
  (NEW.id, 'SMS', false),
  (NEW.id, 'Reviews', false),
  (NEW.id, 'Instagram', false),
  (NEW.id, 'Web', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created_channels ON profiles;

CREATE TRIGGER on_profile_created_channels
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_channels();

-- =========================================================================
-- ADMIN SETUP — Claim admin role with a secret (RPC)
-- ENFORCED: Only 1 Admin account can exist.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.claim_admin_role(setup_secret TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_count INT;
BEGIN
  -- Check if an admin already exists
  SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
  IF admin_count > 0 THEN
    -- Admin role already claimed by someone else. Lock it down.
    RETURN FALSE;
  END IF;

  IF setup_secret = 'SX_S3cur3_@dm1n_2026!' THEN
    -- Set bypass flag so the trigger allows this update
    PERFORM set_config('app.bypass_profile_guard', 'true', true);
    UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================================================================
-- ADMIN — Update Profile (RPC)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_id UUID,
  new_plan TEXT DEFAULT NULL,
  new_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN FALSE;
  END IF;

  PERFORM set_config('app.bypass_profile_guard', 'true', true);

  UPDATE public.profiles SET
    plan = COALESCE(new_plan, plan),
    status = COALESCE(new_status, status)
  WHERE id = target_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================================================================
-- ADMIN — Count workflows per user (for admin dashboard)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_all_clients()
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  business_type TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  plan TEXT,
  status TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ,
  total_workflows BIGINT,
  total_executions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.business_name,
    p.business_type,
    p.owner_name,
    p.email,
    p.phone,
    p.plan,
    p.status,
    p.role,
    p.created_at,
    p.last_active,
    COALESCE((SELECT COUNT(*) FROM workflows w WHERE w.user_id = p.id), 0) AS total_workflows,
    COALESCE((SELECT SUM(w.executions_count) FROM workflows w WHERE w.user_id = p.id), 0) AS total_executions
  FROM profiles p
  WHERE public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================================================================
-- PREVENT PROFILE ESCALATION (trigger)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.guard_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if bypass flag is set (by our own SECURITY DEFINER functions)
  IF current_setting('app.bypass_profile_guard', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Block changes to protected columns
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_prevent_profile_escalation ON public.profiles;

CREATE TRIGGER tr_prevent_profile_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_columns();

-- =========================================================================
-- SECURITY LOCKDOWN
-- =========================================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_default_workflows() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_default_channels() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.guard_profile_columns() FROM PUBLIC;

-- =========================================================================
-- REALTIME SUBSCRIPTIONS
-- =========================================================================

-- Enable realtime for execution_logs so the dashboard updates live
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'execution_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE execution_logs;
  END IF;
END $$;

-- =========================================================================
-- DONE! Your database is ready.
-- Next step: Go to Authentication → URL Configuration and set:
--   Site URL: http://localhost:3000
--   Redirect URLs: http://localhost:3000, https://starx-flow.vercel.app
-- =========================================================================
