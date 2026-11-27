-- ==============================================================================
-- STARX-FLOW — SECURITY HARDENING MIGRATION: RLS, PROFILE ROLE LOCK & RPCs
-- Remediates:
--   1. Prevent self-escalation of profiles.role / profiles.plan by authenticated users
--   2. Drop overly permissive anonymous SELECT policy on public.messages
--   3. Restrict server-only SECURITY DEFINER RPCs to service_role (and postgres)
--   4. Harden increment_workflow_stats against null-uid non-service callers
-- ==============================================================================

-- 1. Role pre-check for local / hermetic test compatibility
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

-- 2. Protect privileged columns (role, plan) on public.profiles from self-promotion
CREATE OR REPLACE FUNCTION public.tr_protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
BEGIN
  -- Allow trusted backend / migration execution (service_role, postgres, supabase_admin)
  IF v_jwt_role = 'service_role' OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'FORBIDDEN: Profile role cannot be modified by non-privileged callers';
  END IF;

  IF to_jsonb(NEW) ? 'plan' AND (to_jsonb(NEW) ->> 'plan') IS DISTINCT FROM (to_jsonb(OLD) ->> 'plan') THEN
    RAISE EXCEPTION 'FORBIDDEN: Subscription plan cannot be modified directly on profiles';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.tr_protect_profile_privileged_columns();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Drop overly permissive anonymous read policy on public.messages
-- Public web chat uses /api/chat (service_role) and never queries messages directly as anon.
DROP POLICY IF EXISTS "Public can only read non-internal messages" ON public.messages;

-- 4. Lock down server-only SECURITY DEFINER RPCs to service_role only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'claim_receptionist_jobs') THEN
    REVOKE ALL ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'complete_receptionist_job') THEN
    REVOKE ALL ON FUNCTION public.complete_receptionist_job(UUID, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.complete_receptionist_job(UUID, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'fail_receptionist_job') THEN
    REVOKE ALL ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'claim_provider_webhook_event') THEN
    REVOKE ALL ON FUNCTION public.claim_provider_webhook_event(TEXT, TEXT, TEXT, UUID, TEXT, INT, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.claim_provider_webhook_event(TEXT, TEXT, TEXT, UUID, TEXT, INT, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'verify_provider_webhook_lease') THEN
    REVOKE ALL ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'complete_provider_webhook_event') THEN
    REVOKE ALL ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'fail_provider_webhook_event') THEN
    REVOKE ALL ON FUNCTION public.fail_provider_webhook_event(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.fail_provider_webhook_event(TEXT, TEXT, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'consume_oauth_state') THEN
    REVOKE ALL ON FUNCTION public.consume_oauth_state(TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.consume_oauth_state(TEXT, UUID, TEXT) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'record_customer_channel_interaction') THEN
    REVOKE ALL ON FUNCTION public.record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'invoke_starx_receptionist_worker') THEN
    REVOKE ALL ON FUNCTION public.invoke_starx_receptionist_worker() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.invoke_starx_receptionist_worker() TO postgres, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'get_starx_cron_diagnostics') THEN
    REVOKE ALL ON FUNCTION public.get_starx_cron_diagnostics() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.get_starx_cron_diagnostics() TO postgres, service_role;
  END IF;
END $$;

-- 5. Harden increment_workflow_stats so NULL auth.uid() without service_role cannot mutate arbitrary workflows
CREATE OR REPLACE FUNCTION public.increment_workflow_stats(wf_id uuid, hours numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') != 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF auth.uid() IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.workflows
      WHERE id = wf_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'UNAUTHORIZED: You do not have permission to increment stats for this workflow.';
    END IF;
  END IF;

  UPDATE public.workflows
  SET executions_count = coalesce(executions_count, 0) + 1,
      saved_hours = coalesce(saved_hours, 0) + hours
  WHERE id = wf_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
