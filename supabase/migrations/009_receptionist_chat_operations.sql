-- ==============================================================================
-- STARX-FLOW — MIGRATION 009: 24/7 AI RECEPTIONIST CHAT OPERATIONS & DURABLE JOBS
-- Implements:
--   1. Structured business receptionist profiles (services, prices, hours, FAQs, policies)
--   2. Durable receptionist jobs table (appointment reminders, follow-ups, delivery retries)
--   3. Atomic job claim function with FOR UPDATE SKIP LOCKED & lease fencing
--   4. Human handoff conversation control mode tracking
-- ==============================================================================

-- 1. ROLE PRE-CHECK FOR LOCAL WASM & CONTAINER TESTING
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

-- ==============================================================================
-- 2. BUSINESS RECEPTIONIST PROFILES
-- Stores verified business facts for zero-hallucination AI responses
-- ==============================================================================

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
        "refunds": "Subject to review by management",
        "booking_rules": "Appointments must be scheduled at least 2 hours in advance"
    }'::jsonb,
    supported_languages TEXT[] NOT NULL DEFAULT ARRAY['en', 'de', 'fr', 'it'],
    custom_instructions TEXT,
    handoff_rules TEXT DEFAULT 'Transfer when customer is upset, requests a manager, or asks complex custom questions',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.business_receptionist_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_profiles_org_policy ON public.business_receptionist_profiles;
CREATE POLICY business_profiles_org_policy ON public.business_receptionist_profiles
FOR ALL TO authenticated, service_role
USING (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

GRANT ALL ON public.business_receptionist_profiles TO authenticated, service_role;
REVOKE ALL ON public.business_receptionist_profiles FROM PUBLIC, anon;

-- ==============================================================================
-- 3. CONVERSATIONS CONTROL MODE (HUMAN HANDOFF ENFORCEMENT)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'conversations' 
          AND column_name = 'control_mode'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN control_mode TEXT NOT NULL DEFAULT 'ai' 
            CHECK (control_mode IN ('ai', 'human'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'conversations' 
          AND column_name = 'handoff_reason'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN handoff_reason TEXT;
    END IF;
END $$;

-- ==============================================================================
-- 4. DURABLE RECEPTIONIST JOBS (BACKGROUND SCHEDULING)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.receptionist_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('appointment_reminder', 'lead_followup', 'delivery_retry', 'delayed_notification')),
    target_id TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'messenger', 'email', 'web')),
    recipient TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    claim_expires_at TIMESTAMPTZ,
    worker_id TEXT,
    idempotency_key TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.receptionist_jobs ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_receptionist_jobs_idempotency
ON public.receptionist_jobs(organization_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_receptionist_jobs_polling
ON public.receptionist_jobs(status, scheduled_for)
WHERE status IN ('pending', 'failed');

DROP POLICY IF EXISTS receptionist_jobs_org_policy ON public.receptionist_jobs;
CREATE POLICY receptionist_jobs_org_policy ON public.receptionist_jobs
FOR ALL TO authenticated, service_role
USING (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    organization_id = auth.uid()
    OR auth.role() = 'service_role'
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

GRANT ALL ON public.receptionist_jobs TO authenticated, service_role;
REVOKE ALL ON public.receptionist_jobs FROM PUBLIC, anon;

-- ==============================================================================
-- 5. ATOMIC JOB CLAIM FUNCTION (FOR UPDATE SKIP LOCKED)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.claim_receptionist_jobs(
    p_worker_id TEXT,
    p_batch_size INTEGER DEFAULT 1,
    p_lease_seconds INTEGER DEFAULT 60
)
RETURNS SETOF public.receptionist_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH available_jobs AS (
        SELECT id
        FROM public.receptionist_jobs
        WHERE (status = 'pending' AND scheduled_for <= clock_timestamp())
           OR (status = 'processing' AND claim_expires_at < clock_timestamp() AND attempts < max_attempts)
        ORDER BY scheduled_for ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.receptionist_jobs rj
    SET status = 'processing',
        worker_id = p_worker_id,
        attempts = rj.attempts + 1,
        claim_expires_at = clock_timestamp() + (p_lease_seconds || ' seconds')::interval,
        updated_at = clock_timestamp()
    FROM available_jobs aj
    WHERE rj.id = aj.id
    RETURNING rj.*;
END;
$$;

ALTER FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_receptionist_jobs(TEXT, INTEGER, INTEGER) TO authenticated, service_role;

-- ==============================================================================
-- 6. ATOMIC JOB COMPLETION & FAILURE FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.complete_receptionist_job(
    p_job_id UUID,
    p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rows_affected INTEGER;
BEGIN
    UPDATE public.receptionist_jobs
    SET status = 'completed',
        completed_at = clock_timestamp(),
        claim_expires_at = NULL,
        updated_at = clock_timestamp()
    WHERE id = p_job_id AND worker_id = p_worker_id AND status = 'processing';

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    RETURN v_rows_affected > 0;
END;
$$;

ALTER FUNCTION public.complete_receptionist_job(UUID, TEXT) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.complete_receptionist_job(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_receptionist_job(UUID, TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.fail_receptionist_job(
    p_job_id UUID,
    p_worker_id TEXT,
    p_error TEXT,
    p_retry_delay_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_attempts INTEGER;
    v_max_attempts INTEGER;
BEGIN
    SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
    FROM public.receptionist_jobs
    WHERE id = p_job_id;

    IF v_attempts >= v_max_attempts THEN
        -- Permanent failure
        UPDATE public.receptionist_jobs
        SET status = 'failed',
            last_error = p_error,
            claim_expires_at = NULL,
            updated_at = clock_timestamp()
        WHERE id = p_job_id AND worker_id = p_worker_id;
    ELSE
        -- Reschedule with exponential backoff
        UPDATE public.receptionist_jobs
        SET status = 'pending',
            last_error = p_error,
            claim_expires_at = NULL,
            scheduled_for = clock_timestamp() + (p_retry_delay_seconds || ' seconds')::interval,
            updated_at = clock_timestamp()
        WHERE id = p_job_id AND worker_id = p_worker_id;
    END IF;

    RETURN true;
END;
$$;

ALTER FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fail_receptionist_job(UUID, TEXT, TEXT, INTEGER) TO authenticated, service_role;
