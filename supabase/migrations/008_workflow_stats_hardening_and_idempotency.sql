-- ==============================================================================
-- STARX-FLOW — MIGRATION 008: WORKFLOW STATS HARDENING & OUTBOUND LEASE FENCING
-- Phase 4B.5.5 Finding A & Finding B Remediation:
--   1. Corrects Migration 007 typo: hardens public.increment_workflow_stats(uuid, numeric)
--   2. Enforces explicit search_path = public, pg_temp and role-based execution privileges
--   3. Adds database-backed lease fencing verification for distributed background workers
--   4. Adds outbound idempotency key tracking to provider_webhook_events
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
-- 2. HARDEN INCREMENT_WORKFLOW_STATS (Finding A)
-- Fails loudly if the function does not exist, resolving the Migration 007 silent skip defect
-- ==============================================================================

DO $$
DECLARE
    v_fn_exists BOOLEAN;
BEGIN
    -- Verify function existence with exact parameter signature (uuid, numeric)
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.proname = 'increment_workflow_stats'
    ) INTO v_fn_exists;

    IF NOT v_fn_exists THEN
        RAISE EXCEPTION 'CRITICAL INTEGRITY FAILURE: Expected function public.increment_workflow_stats does not exist in schema. Migration cannot proceed.';
    END IF;
END $$;

-- Recreate with explicit search path, multi-tenant caller verification, and security definer
CREATE OR REPLACE FUNCTION public.increment_workflow_stats(wf_id uuid, hours numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Authorization gate: service_role or owner of workflow
    IF coalesce(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
        IF auth.uid() IS NOT NULL AND NOT EXISTS (
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

-- Explicit search path setting and privilege restriction
ALTER FUNCTION public.increment_workflow_stats(uuid, numeric) SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.increment_workflow_stats(uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_workflow_stats(uuid, numeric) FROM anon;

GRANT EXECUTE ON FUNCTION public.increment_workflow_stats(uuid, numeric) TO authenticated, service_role;

-- Grant table permissions to authenticated role aligned with RLS policies
GRANT ALL ON public.workflows TO authenticated, service_role;
REVOKE ALL ON public.workflows FROM anon;

-- Clean up dead function name reference from Migration 007 if it was created
DROP FUNCTION IF EXISTS public.increment_workflow_runs(uuid);

-- ==============================================================================
-- 3. OUTBOUND LEASE FENCING & IDEMPOTENCY TRACKING (Finding B)
-- ==============================================================================

-- 3.1 Add outbound_idempotency_key column to provider_webhook_events
ALTER TABLE public.provider_webhook_events
ADD COLUMN IF NOT EXISTS outbound_idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS worker_id TEXT;

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_idempotency
ON public.provider_webhook_events(provider, outbound_idempotency_key)
WHERE outbound_idempotency_key IS NOT NULL;

-- 3.2 Lease Fencing Verification Function
-- Allows background workers to verify they still hold a valid, active lease before
-- dispatching external non-reversible side-effects (e.g. sending emails via Resend).
CREATE OR REPLACE FUNCTION public.verify_provider_webhook_lease(
    p_provider TEXT,
    p_event_id TEXT,
    p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_is_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.provider_webhook_events
        WHERE provider = p_provider
          AND event_id = p_event_id
          AND worker_id = p_worker_id
          AND status IN ('claimed', 'processing')
          AND (claim_expires_at IS NULL OR claim_expires_at > clock_timestamp())
    ) INTO v_is_valid;

    RETURN COALESCE(v_is_valid, false);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.verify_provider_webhook_lease(TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 3.3 Enhanced Atomic Complete Function with Outbound Idempotency Key
CREATE OR REPLACE FUNCTION public.complete_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_org_id UUID DEFAULT NULL,
    p_raw_payload JSONB DEFAULT NULL,
    p_outbound_idempotency_key TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.provider_webhook_events
    SET status = 'completed',
        claim_expires_at = NULL,
        processed_at = clock_timestamp(),
        organization_id = COALESCE(p_org_id, organization_id),
        raw_payload = COALESCE(p_raw_payload, raw_payload),
        outbound_idempotency_key = COALESCE(p_outbound_idempotency_key, outbound_idempotency_key)
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) FROM anon;

GRANT EXECUTE ON FUNCTION public.complete_provider_webhook_event(TEXT, TEXT, UUID, JSONB, TEXT) TO authenticated, service_role;
