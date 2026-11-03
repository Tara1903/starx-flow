-- ==============================================================================
-- STARX-FLOW — MIGRATION 007: SECURITY HARDENING & ATOMIC WEBHOOK CLAIMING
-- Phase 4B.5.4 Remediation:
--   1. Enforce Cross-Tenant Uniqueness on Connected Account Identifiers
--   2. Search Path & Privilege Hardening for all SECURITY DEFINER Functions
--   3. Database-Backed Atomic Webhook Idempotency State Machine (Leases & Retries)
-- ==============================================================================

-- ==============================================================================
-- 1. ROLE PRE-CHECK FOR HERMETIC & LOCAL COMPATIBILITY
-- ==============================================================================
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
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin;
    END IF;
END $$;

-- ==============================================================================
-- 2. CONNECTED ACCOUNT IDENTIFIER UNIQUENESS & DEDUPLICATION SAFETY
-- ==============================================================================

-- 1.1 Safe Duplicate Detection Pre-Check
DO $$
DECLARE
    v_dup_count INT;
BEGIN
    SELECT COUNT(*) INTO v_dup_count
    FROM (
        SELECT provider, account_identifier, COUNT(*)
        FROM connected_accounts
        WHERE account_identifier IS NOT NULL AND status IN ('connected', 'expired', 'error')
        GROUP BY provider, account_identifier
        HAVING COUNT(*) > 1
    ) dups;

    IF v_dup_count > 0 THEN
        RAISE EXCEPTION 'CRITICAL INTEGRATION INTEGRITY ERROR: Detected % duplicate connected account identifier(s) across organizations. Manual deduplication required before applying unique constraint.', v_dup_count;
    END IF;
END $$;

-- 1.2 Enforce Uniqueness across Tenants for Active Accounts
-- Ensures no two active organizations can register or route messages for the same external account
CREATE UNIQUE INDEX IF NOT EXISTS uq_connected_accounts_provider_identifier
ON connected_accounts(provider, account_identifier)
WHERE account_identifier IS NOT NULL AND status IN ('connected', 'expired', 'error');

-- ==============================================================================
-- 2. SECURITY DEFINER SEARCH PATH HARDENING & PRIVILEGE RESTRICTION
-- Remediates PostgreSQL Schema Hijacking Vulnerabilities (CVE-style pattern)
-- ==============================================================================

-- 2.1 Hardening consume_oauth_state
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'consume_oauth_state') THEN
        ALTER FUNCTION consume_oauth_state(TEXT, UUID, TEXT) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) FROM anon;
        GRANT EXECUTE ON FUNCTION consume_oauth_state(TEXT, UUID, TEXT) TO authenticated, service_role;
    END IF;
END $$;

-- 2.2 Hardening record_customer_channel_interaction
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'record_customer_channel_interaction') THEN
        ALTER FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM anon;
        GRANT EXECUTE ON FUNCTION record_customer_channel_interaction(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated, service_role;
    END IF;
END $$;

-- 2.3 Hardening auth_user_org_ids
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auth_user_org_ids') THEN
        ALTER FUNCTION auth_user_org_ids() SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION auth_user_org_ids() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION auth_user_org_ids() FROM anon;
        GRANT EXECUTE ON FUNCTION auth_user_org_ids() TO authenticated, service_role;
    END IF;
END $$;

-- 2.4 Hardening handle_new_user (if present from migration 001)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION handle_new_user() SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
        GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, supabase_auth_admin, service_role;
    END IF;
END $$;

-- 2.5 Hardening increment_workflow_runs (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_workflow_runs') THEN
        ALTER FUNCTION increment_workflow_runs(uuid) SET search_path = public, pg_temp;
        REVOKE EXECUTE ON FUNCTION increment_workflow_runs(uuid) FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION increment_workflow_runs(uuid) FROM anon;
        GRANT EXECUTE ON FUNCTION increment_workflow_runs(uuid) TO authenticated, service_role;
    END IF;
END $$;

-- ==============================================================================
-- 3. DATABASE-BACKED ATOMIC WEBHOOK CLAIMING ENGINE (Fix H2)
-- Provides zero-race-condition event claiming, lease expiration & safe retries
-- ==============================================================================

-- 3.1 Extend provider_webhook_events schema with lease and retry tracking
ALTER TABLE provider_webhook_events
ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attempt_count INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS worker_id TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_lease
ON provider_webhook_events(provider, event_id, status, claim_expires_at);

-- 3.2 Atomic Webhook Claim Function
CREATE OR REPLACE FUNCTION claim_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_payload_hash TEXT,
    p_org_id UUID DEFAULT NULL,
    p_event_type TEXT DEFAULT NULL,
    p_lease_seconds INT DEFAULT 60,
    p_worker_id TEXT DEFAULT 'worker-default'
)
RETURNS TABLE (
    claimed BOOLEAN,
    claim_status TEXT,
    organization_id UUID,
    attempt_count INT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing RECORD;
    v_now TIMESTAMPTZ := clock_timestamp();
    v_lease_expiry TIMESTAMPTZ := v_now + (p_lease_seconds || ' seconds')::interval;
BEGIN
    -- 1. Attempt atomic initial insertion via ON CONFLICT DO NOTHING
    INSERT INTO provider_webhook_events (
        organization_id,
        provider,
        event_id,
        event_type,
        payload_hash,
        status,
        claim_expires_at,
        attempt_count,
        worker_id,
        created_at
    ) VALUES (
        p_org_id,
        p_provider,
        p_event_id,
        p_event_type,
        p_payload_hash,
        'claimed',
        v_lease_expiry,
        1,
        p_worker_id,
        v_now
    )
    ON CONFLICT (provider, event_id) DO NOTHING;

    -- If successfully inserted, this worker holds the initial claim
    IF FOUND THEN
        RETURN QUERY SELECT true, 'claimed'::TEXT, p_org_id, 1, 'Event successfully claimed'::TEXT;
        RETURN;
    END IF;

    -- 2. Row exists: Inspect status with row lock FOR UPDATE
    SELECT * INTO v_existing
    FROM provider_webhook_events
    WHERE provider = p_provider AND event_id = p_event_id
    FOR UPDATE;

    -- Case A: Completed / Processed -> Idempotent skip (Do NOT process)
    IF v_existing.status IN ('completed', 'processed') THEN
        RETURN QUERY SELECT false, 'completed'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event already completed (idempotent duplicate)'::TEXT;
        RETURN;
    END IF;

    -- Case B: Currently Claimed or Processing
    IF v_existing.status IN ('claimed', 'processing') THEN
        IF v_existing.claim_expires_at IS NOT NULL AND v_existing.claim_expires_at > v_now THEN
            -- Active lease owned by another concurrent worker
            RETURN QUERY SELECT false, 'in_flight'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event currently locked by active worker'::TEXT;
            RETURN;
        ELSE
            -- Lease expired (worker crashed or timed out) -> Reclaim safely
            UPDATE provider_webhook_events
            SET status = 'claimed',
                claim_expires_at = v_lease_expiry,
                attempt_count = COALESCE(v_existing.attempt_count, 1) + 1,
                worker_id = p_worker_id,
                organization_id = COALESCE(p_org_id, v_existing.organization_id),
                error_message = 'Reclaimed after previous claim lease expired'
            WHERE provider = p_provider AND event_id = p_event_id;

            RETURN QUERY SELECT true, 'claimed_expired_lease'::TEXT, v_existing.organization_id, COALESCE(v_existing.attempt_count, 1) + 1, 'Reclaimed expired worker lease'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Case C: Failed previously -> Allow retry up to 5 attempts
    IF v_existing.status = 'failed' THEN
        IF COALESCE(v_existing.attempt_count, 1) < 5 THEN
            UPDATE provider_webhook_events
            SET status = 'claimed',
                claim_expires_at = v_lease_expiry,
                attempt_count = COALESCE(v_existing.attempt_count, 1) + 1,
                worker_id = p_worker_id,
                organization_id = COALESCE(p_org_id, v_existing.organization_id)
            WHERE provider = p_provider AND event_id = p_event_id;

            RETURN QUERY SELECT true, 'claimed_retry'::TEXT, v_existing.organization_id, COALESCE(v_existing.attempt_count, 1) + 1, 'Claimed retry for failed event'::TEXT;
            RETURN;
        ELSE
            RETURN QUERY SELECT false, 'failed_exhausted'::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Maximum retry limit exhausted'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Default fallback
    RETURN QUERY SELECT false, v_existing.status::TEXT, v_existing.organization_id, v_existing.attempt_count, 'Event cannot be claimed'::TEXT;
END;
$$;

-- 3.3 Atomic Complete Function
CREATE OR REPLACE FUNCTION complete_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_org_id UUID DEFAULT NULL,
    p_raw_payload JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE provider_webhook_events
    SET status = 'completed',
        claim_expires_at = NULL,
        processed_at = clock_timestamp(),
        organization_id = COALESCE(p_org_id, organization_id),
        raw_payload = COALESCE(p_raw_payload, raw_payload)
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

-- 3.4 Atomic Fail Function
CREATE OR REPLACE FUNCTION fail_provider_webhook_event(
    p_provider TEXT,
    p_event_id TEXT,
    p_error_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE provider_webhook_events
    SET status = 'failed',
        claim_expires_at = NULL,
        error_message = p_error_message
    WHERE provider = p_provider AND event_id = p_event_id;
END;
$$;

-- 3.5 Permissions for Webhook Engine Functions
REVOKE EXECUTE ON FUNCTION claim_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_provider_webhook_event TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION complete_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION complete_provider_webhook_event TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION fail_provider_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION fail_provider_webhook_event TO authenticated, service_role;
