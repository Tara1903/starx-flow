-- ==============================================================================
-- STARX-FLOW — MIGRATION 20261126110000: DATABASE & BACKEND HARDENING
-- Follows supabase-postgres-best-practices:
--   1. Fix increment_workflow_stats SECURITY DEFINER current_user auth bypass
--   2. Lock down provider_webhook_events RLS & drop leftover 4-arg RPC overload
--   3. Eliminate infinite recursion (42P17) & self-join escalation on organization_members
--   4. Harden book_appointment_atomic, merge_customers, and trigger search_path/grants
--   5. Add atomic Polar webhook claiming (claim_polar_webhook_event) & unique constraints
--   6. Add durable orders.idempotency_key + missing profiles columns (plan, phone, updated_at)
--   7. Add indexes for all 31 unindexed foreign keys
--   8. Wrap unwrapped auth.uid()/auth.role() in (SELECT ...) across RLS policies
--
-- ZERO-DOWNTIME PRODUCTION NOTE:
-- On large live tables, pre-create the CREATE INDEX statements below outside a
-- transaction using CREATE INDEX CONCURRENTLY IF NOT EXISTS before running this
-- migration so index builds do not block writes.
-- ==============================================================================

SET lock_timeout = '5s';

-- ------------------------------------------------------------------------------
-- 1. ROLE PRE-CHECK (hermetic / local WASM compatibility)
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
-- 2. FIX CRITICAL SECURITY DEFINER BYPASS IN increment_workflow_stats
-- Inside a SECURITY DEFINER function, current_user is always the function owner
-- (e.g. postgres), which previously skipped the auth.uid() check for all callers.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_workflow_stats(wf_id uuid, hours numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF coalesce(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
    IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.workflows
      WHERE id = wf_id AND user_id = (SELECT auth.uid())
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

REVOKE ALL ON FUNCTION public.increment_workflow_stats(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_workflow_stats(uuid, numeric) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. LOCK DOWN provider_webhook_events & DROP LEFTOVER 4-ARG RPC OVERLOAD
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB);

DROP POLICY IF EXISTS provider_webhooks_service_policy ON public.provider_webhook_events;
DROP POLICY IF EXISTS "Service role manages provider webhook events" ON public.provider_webhook_events;

REVOKE ALL ON public.provider_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.provider_webhook_events TO postgres, service_role;

ALTER TABLE public.provider_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages provider webhook events"
  ON public.provider_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. FIX organization_members INFINITE RECURSION (42P17) & JOIN ESCALATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_user_org_ids()
RETURNS setof uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = (SELECT auth.uid());
$$;

REVOKE ALL ON FUNCTION public.auth_user_org_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_user_org_ids() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = (SELECT auth.uid())
      AND role IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_org_empty(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_org_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_empty(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_empty(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Org admins can invite/add members" ON public.organization_members;
CREATE POLICY "Org admins can invite/add members"
  ON public.organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_org_admin(organization_id))
    OR (
      user_id = (SELECT auth.uid())
      AND (SELECT public.is_org_empty(organization_id))
    )
  );

DROP POLICY IF EXISTS "Org admins can remove members" ON public.organization_members;
CREATE POLICY "Org admins can remove members"
  ON public.organization_members
  FOR DELETE
  TO authenticated
  USING (
    (SELECT public.is_org_admin(organization_id))
    OR user_id = (SELECT auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 5. HARDEN book_appointment_atomic, merge_customers & TRIGGER search_path
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'book_appointment_atomic'
  ) THEN
    ALTER FUNCTION public.book_appointment_atomic(uuid, uuid, uuid, text, text, text, text, timestamptz, timestamptz, text, text)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.book_appointment_atomic(uuid, uuid, uuid, text, text, text, text, timestamptz, timestamptz, text, text)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.book_appointment_atomic(uuid, uuid, uuid, text, text, text, text, timestamptz, timestamptz, text, text)
      TO postgres, service_role;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'merge_customers'
  ) THEN
    ALTER FUNCTION public.merge_customers(uuid, uuid, uuid, uuid)
      SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.merge_customers(uuid, uuid, uuid, uuid)
      FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.merge_customers(uuid, uuid, uuid, uuid)
      TO postgres, service_role;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'tr_prevent_audit_log_mutation'
  ) THEN
    ALTER FUNCTION public.tr_prevent_audit_log_mutation()
      SET search_path = public, pg_temp;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. MISSING COLUMNS & ATOMIC IDEMPOTENCY (profiles, orders, invoices, polar)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_user_idempotency
  ON public.orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_polar_order_id
  ON public.invoices(polar_order_id)
  WHERE polar_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.claim_polar_webhook_event(
  p_event_id TEXT,
  p_event_type TEXT,
  p_lease_seconds INT DEFAULT 300
)
RETURNS TABLE (
  claimed BOOLEAN,
  claim_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing public.polar_webhook_events%ROWTYPE;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  INSERT INTO public.polar_webhook_events (
    event_id,
    event_type,
    status,
    received_at
  ) VALUES (
    p_event_id,
    p_event_type,
    'processing',
    v_now
  )
  ON CONFLICT (event_id) DO NOTHING;

  IF FOUND THEN
    RETURN QUERY SELECT true, 'claimed'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO v_existing
  FROM public.polar_webhook_events
  WHERE event_id = p_event_id
  FOR UPDATE;

  IF v_existing.status = 'processed' THEN
    RETURN QUERY SELECT false, 'processed'::TEXT;
    RETURN;
  END IF;

  IF v_existing.status = 'processing'
     AND v_existing.received_at IS NOT NULL
     AND v_existing.received_at + (p_lease_seconds || ' seconds')::interval > v_now THEN
    RETURN QUERY SELECT false, 'in_flight'::TEXT;
    RETURN;
  END IF;

  -- Failed previously or stale processing lease -> reclaim atomically
  UPDATE public.polar_webhook_events
  SET status = 'processing',
      event_type = COALESCE(p_event_type, event_type),
      received_at = v_now,
      error_message = NULL
  WHERE event_id = p_event_id;

  RETURN QUERY SELECT true, 'claimed_retry'::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_polar_webhook_event(TEXT, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_polar_webhook_event(TEXT, TEXT, INT) TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 7. INDEX ALL 31 UNINDEXED FOREIGN KEYS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON public.appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON public.business_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_business_memories_user_id ON public.business_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_lead_id ON public.campaign_recipients(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_identities_lead_id ON public.channel_identities(lead_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_lead_id ON public.consent_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_presence_organization_id ON public.conversation_presence(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON public.conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_organization_id ON public.conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_lead_id ON public.email_threads(lead_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id ON public.execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_workflow_id ON public.execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_external_calendars_connected_account_id ON public.external_calendars(connected_account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_organization_id ON public.knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_user_id ON public.knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_lead_id ON public.orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_orders_organization_id ON public.orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);

-- ------------------------------------------------------------------------------
-- 8. RLS PERFORMANCE: WRAP auth.uid() / auth.role() IN (SELECT ...)
-- ------------------------------------------------------------------------------
-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- workflows
DROP POLICY IF EXISTS "Users can view own workflows" ON public.workflows;
CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own workflows" ON public.workflows;
CREATE POLICY "Users can insert own workflows" ON public.workflows
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own workflows" ON public.workflows;
CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own workflows" ON public.workflows;
CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- connected_channels
DROP POLICY IF EXISTS "Users can view own channels" ON public.connected_channels;
CREATE POLICY "Users can view own channels" ON public.connected_channels
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own channels" ON public.connected_channels;
CREATE POLICY "Users can insert own channels" ON public.connected_channels
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own channels" ON public.connected_channels;
CREATE POLICY "Users can update own channels" ON public.connected_channels
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- execution_logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.execution_logs;
CREATE POLICY "Users can view own logs" ON public.execution_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own logs" ON public.execution_logs;
CREATE POLICY "Users can insert own logs" ON public.execution_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

-- agents
DROP POLICY IF EXISTS "Users can view own agents" ON public.agents;
CREATE POLICY "Users can view own agents" ON public.agents
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own agents" ON public.agents;
CREATE POLICY "Users can insert own agents" ON public.agents
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
CREATE POLICY "Users can update own agents" ON public.agents
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- agent_memories
DROP POLICY IF EXISTS "Users can view own agent memories" ON public.agent_memories;
CREATE POLICY "Users can view own agent memories" ON public.agent_memories
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own agent memories" ON public.agent_memories;
CREATE POLICY "Users can insert own agent memories" ON public.agent_memories
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own agent memories" ON public.agent_memories;
CREATE POLICY "Users can update own agent memories" ON public.agent_memories
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own agent memories" ON public.agent_memories;
CREATE POLICY "Users can delete own agent memories" ON public.agent_memories
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- business_goals
DROP POLICY IF EXISTS "Users can view own business goals" ON public.business_goals;
CREATE POLICY "Users can view own business goals" ON public.business_goals
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own business goals" ON public.business_goals;
CREATE POLICY "Users can insert own business goals" ON public.business_goals
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own business goals" ON public.business_goals;
CREATE POLICY "Users can update own business goals" ON public.business_goals
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own business goals" ON public.business_goals;
CREATE POLICY "Users can delete own business goals" ON public.business_goals
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- business_memories
DROP POLICY IF EXISTS "Users can view own business memories" ON public.business_memories;
CREATE POLICY "Users can view own business memories" ON public.business_memories
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own business memories" ON public.business_memories;
CREATE POLICY "Users can insert own business memories" ON public.business_memories
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own business memories" ON public.business_memories;
CREATE POLICY "Users can update own business memories" ON public.business_memories
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own business memories" ON public.business_memories;
CREATE POLICY "Users can delete own business memories" ON public.business_memories
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- calls
DROP POLICY IF EXISTS "Users can view own calls" ON public.calls;
CREATE POLICY "Users can view own calls" ON public.calls
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own calls" ON public.calls;
CREATE POLICY "Users can insert own calls" ON public.calls
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own calls" ON public.calls;
CREATE POLICY "Users can update own calls" ON public.calls
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- subscriptions & invoices
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- organizations & org-scoped tables (use SECURITY DEFINER helpers so auth.uid() is cached)
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
  FOR SELECT TO authenticated USING (id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Org admins can update organization" ON public.organizations;
CREATE POLICY "Org admins can update organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_admin(id)))
  WITH CHECK ((SELECT public.is_org_admin(id)));

DROP POLICY IF EXISTS "Users can view channel identities of their organizations" ON public.channel_identities;
CREATE POLICY "Users can view channel identities of their organizations" ON public.channel_identities
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Users can insert channel identities for their organizations" ON public.channel_identities;
CREATE POLICY "Users can insert channel identities for their organizations" ON public.channel_identities
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Users can update channel identities for their organizations" ON public.channel_identities;
CREATE POLICY "Users can update channel identities for their organizations" ON public.channel_identities
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT public.auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Users can delete channel identities of their organizations" ON public.channel_identities;
CREATE POLICY "Users can delete channel identities of their organizations" ON public.channel_identities
  FOR DELETE TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can view lead scoring rules of their organizations" ON public.lead_scoring_rules;
CREATE POLICY "Users can view lead scoring rules of their organizations" ON public.lead_scoring_rules
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Org admins can manage lead scoring rules" ON public.lead_scoring_rules;
CREATE POLICY "Org admins can manage lead scoring rules" ON public.lead_scoring_rules
  FOR ALL TO authenticated
  USING ((SELECT public.is_org_admin(organization_id)))
  WITH CHECK ((SELECT public.is_org_admin(organization_id)));

DROP POLICY IF EXISTS "Users can view analytics rollups of their organizations" ON public.analytics_daily_rollups;
CREATE POLICY "Users can view analytics rollups of their organizations" ON public.analytics_daily_rollups
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Users can view phone numbers of their organizations" ON public.phone_numbers;
CREATE POLICY "Users can view phone numbers of their organizations" ON public.phone_numbers
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Org admins can manage phone numbers" ON public.phone_numbers;
CREATE POLICY "Org admins can manage phone numbers" ON public.phone_numbers
  FOR ALL TO authenticated
  USING ((SELECT public.is_org_admin(organization_id)))
  WITH CHECK ((SELECT public.is_org_admin(organization_id)));

DROP POLICY IF EXISTS "Users can view workflow executions of their organizations" ON public.workflow_executions;
CREATE POLICY "Users can view workflow executions of their organizations" ON public.workflow_executions
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Org members can create workflow executions" ON public.workflow_executions;
CREATE POLICY "Org members can create workflow executions" ON public.workflow_executions
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT public.auth_user_org_ids()));

DROP POLICY IF EXISTS "Org members can view audit logs of their organizations" ON public.audit_logs;
CREATE POLICY "Org members can view audit logs of their organizations" ON public.audit_logs
  FOR SELECT TO authenticated USING (organization_id IN (SELECT public.auth_user_org_ids()));
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT public.auth_user_org_ids()));

-- business_receptionist_profiles & receptionist_jobs (wrap auth.uid()/auth.role())
DROP POLICY IF EXISTS business_profiles_org_policy ON public.business_receptionist_profiles;
CREATE POLICY business_profiles_org_policy ON public.business_receptionist_profiles
  FOR ALL TO authenticated, service_role
  USING (
    organization_id = (SELECT auth.uid())
    OR (SELECT auth.role()) = 'service_role'
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    organization_id = (SELECT auth.uid())
    OR (SELECT auth.role()) = 'service_role'
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

DROP POLICY IF EXISTS receptionist_jobs_org_policy ON public.receptionist_jobs;
CREATE POLICY receptionist_jobs_org_policy ON public.receptionist_jobs
  FOR ALL TO authenticated, service_role
  USING (
    organization_id = (SELECT auth.uid())
    OR (SELECT auth.role()) = 'service_role'
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    organization_id = (SELECT auth.uid())
    OR (SELECT auth.role()) = 'service_role'
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

-- polar_webhook_events
DROP POLICY IF EXISTS "Platform admins can view polar webhook events" ON public.polar_webhook_events;
CREATE POLICY "Platform admins can view polar webhook events"
  ON public.polar_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
