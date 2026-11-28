-- ==============================================================================
-- STARX-FLOW — MIGRATION 20261128000000: FLAGSHIP FULL-STACK CRM ARCHITECTURE
-- Implements:
--   1. Org-wide & enriched leads schema (pipeline/stage/owner/value/enrichment)
--   2. Custom Multi-Stage Pipelines (crm_pipelines, crm_stages)
--   3. Deals & Weighted Revenue Forecasting (crm_deals)
--   4. Unified Cross-App Activity Timeline (crm_activities)
--   5. Automated Multi-Channel Drip Sequences (crm_sequences, crm_sequence_enrollments)
--   6. Open Lead Finder Saved Lists (crm_lead_lists)
--   7. Linked CRM Tasks foreign keys (tasks.lead_id, tasks.deal_id)
-- ==============================================================================

SET lock_timeout = '5s';

-- 1. Role & Helper Pre-Check (hermetic / WASM Postgres compatibility)
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

-- Ensure auth_user_org_ids exists cleanly with hardened search_path
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

-- ------------------------------------------------------------------------------
-- 2. CRM PIPELINES & STAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pipeline_type TEXT NOT NULL DEFAULT 'dual' CHECK (pipeline_type IN ('sales', 'service', 'dual')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_pipelines_org_id ON public.crm_pipelines(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_pipelines_default_per_org
  ON public.crm_pipelines(organization_id)
  WHERE is_default = true;

ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_pipelines_org_policy ON public.crm_pipelines;
CREATE POLICY crm_pipelines_org_policy ON public.crm_pipelines
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_pipelines TO authenticated, service_role;
REVOKE ALL ON public.crm_pipelines FROM PUBLIC, anon;

CREATE TABLE IF NOT EXISTS public.crm_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 20 CHECK (probability >= 0 AND probability <= 100),
  color_token TEXT NOT NULL DEFAULT 'info',
  is_won BOOLEAN NOT NULL DEFAULT false,
  is_lost BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (pipeline_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_crm_stages_pipeline_pos ON public.crm_stages(pipeline_id, position);
CREATE INDEX IF NOT EXISTS idx_crm_stages_org_id ON public.crm_stages(organization_id);

ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_stages_org_policy ON public.crm_stages;
CREATE POLICY crm_stages_org_policy ON public.crm_stages
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_stages TO authenticated, service_role;
REVOKE ALL ON public.crm_stages FROM PUBLIC, anon;

-- ------------------------------------------------------------------------------
-- 3. UPGRADE LEADS FOR FULL-STACK B2B + SERVICE LIFECYCLE CRM
-- ------------------------------------------------------------------------------
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deal_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.crm_stages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Expand source check constraint safely without hardcoded legacy constraint name assumptions
DO $$
DECLARE
  v_con TEXT;
BEGIN
  FOR v_con IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'public.leads'::regclass
      AND c.contype = 'c'
      AND a.attname = 'source'
  LOOP
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS %I', v_con);
  END LOOP;
END $$;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_source_check
  CHECK (source IN (
    'whatsapp',
    'instagram',
    'sms',
    'web_chat',
    'manual',
    'csv_import',
    'outbound_finder',
    'email',
    'demo_request'
  ));

-- Backfill organization_id for legacy rows where missing
UPDATE public.leads l
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE l.organization_id IS NULL
  AND om.user_id = l.user_id;

CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON public.leads(pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON public.leads(lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_org_idempotency
  ON public.leads(organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Org-scoped RLS on leads so shared team members collaborate across org leads
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view team leads" ON public.leads;
CREATE POLICY "Users can view team leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert team leads" ON public.leads;
CREATE POLICY "Users can insert team leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update team leads" ON public.leads;
CREATE POLICY "Users can update team leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete team leads" ON public.leads;
CREATE POLICY "Users can delete team leads" ON public.leads
  FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

-- ------------------------------------------------------------------------------
-- 4. CRM DEALS & WEIGHTED FORECASTING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.crm_stages(id) ON DELETE RESTRICT,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  probability INTEGER NOT NULL DEFAULT 25 CHECK (probability >= 0 AND probability <= 100),
  expected_close_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  lost_reason TEXT,
  idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_org_status ON public.crm_deals(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline_stage ON public.crm_deals(pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_lead_id ON public.crm_deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner_id ON public.crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_user_id ON public.crm_deals(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_deals_org_idempotency
  ON public.crm_deals(organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_deals_org_policy ON public.crm_deals;
CREATE POLICY crm_deals_org_policy ON public.crm_deals
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR user_id = (SELECT auth.uid())
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_deals TO authenticated, service_role;
REVOKE ALL ON public.crm_deals FROM PUBLIC, anon;

-- ------------------------------------------------------------------------------
-- 5. CRM UNIFIED ACTIVITY TIMELINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'note',
    'stage_change',
    'call',
    'email',
    'whatsapp',
    'instagram',
    'booking',
    'order',
    'task',
    'enrichment',
    'sequence'
  )),
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_created
  ON public.crm_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_org_created
  ON public.crm_activities(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id
  ON public.crm_activities(deal_id)
  WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_activities_actor_id
  ON public.crm_activities(actor_id)
  WHERE actor_id IS NOT NULL;

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_activities_org_policy ON public.crm_activities;
CREATE POLICY crm_activities_org_policy ON public.crm_activities
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_activities TO authenticated, service_role;
REVOKE ALL ON public.crm_activities FROM PUBLIC, anon;

-- ------------------------------------------------------------------------------
-- 6. AUTOMATED MULTI-CHANNEL OUTREACH SEQUENCES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN (
    'manual',
    'new_lead',
    'stage_qualified',
    'finder_import'
  )),
  channel TEXT NOT NULL DEFAULT 'multi' CHECK (channel IN ('whatsapp', 'email', 'instagram', 'multi')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_sequences_org_id ON public.crm_sequences(organization_id);

ALTER TABLE public.crm_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_sequences_org_policy ON public.crm_sequences;
CREATE POLICY crm_sequences_org_policy ON public.crm_sequences
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_sequences TO authenticated, service_role;
REVOKE ALL ON public.crm_sequences FROM PUBLIC, anon;

CREATE TABLE IF NOT EXISTS public.crm_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.crm_sequences(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'stopped', 'replied')),
  next_run_at TIMESTAMPTZ,
  idempotency_key TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_seq_enrollments_org_status
  ON public.crm_sequence_enrollments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_seq_enrollments_lead_id
  ON public.crm_sequence_enrollments(lead_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_seq_active_enrollment
  ON public.crm_sequence_enrollments(sequence_id, lead_id)
  WHERE status IN ('active', 'paused');
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_seq_enrollment_idempotency
  ON public.crm_sequence_enrollments(organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.crm_sequence_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_sequence_enrollments_org_policy ON public.crm_sequence_enrollments;
CREATE POLICY crm_sequence_enrollments_org_policy ON public.crm_sequence_enrollments
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_sequence_enrollments TO authenticated, service_role;
REVOKE ALL ON public.crm_sequence_enrollments FROM PUBLIC, anon;

-- ------------------------------------------------------------------------------
-- 7. LEAD FINDER SAVED LISTS & LINKED APP TASKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  lead_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_lists_org_id ON public.crm_lead_lists(organization_id);

ALTER TABLE public.crm_lead_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_lead_lists_org_policy ON public.crm_lead_lists;
CREATE POLICY crm_lead_lists_org_policy ON public.crm_lead_lists
  FOR ALL TO authenticated, service_role
  USING (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR organization_id = (SELECT auth.uid())
    OR organization_id IN (SELECT public.auth_user_org_ids())
  );

GRANT ALL ON public.crm_lead_lists TO authenticated, service_role;
REVOKE ALL ON public.crm_lead_lists FROM PUBLIC, anon;

-- Link tasks cleanly to CRM leads and deals
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id) WHERE deal_id IS NOT NULL;
