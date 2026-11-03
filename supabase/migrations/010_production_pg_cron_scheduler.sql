-- ============================================================================
-- STARX-FLOW MIGRATION 010: PRODUCTION PG_CRON + PG_NET SCHEDULER SETUP
-- Description: Configures Supabase pg_cron as the SOLE production scheduler
--              for StarX-Flow. pg_cron triggers /api/cron/process-jobs every
--              minute via asynchronous pg_net HTTP POST, authenticating
--              via Bearer token stored encrypted in Supabase Vault.
--
-- DEPLOYMENT PRE-REQUISITE (ENFORCE ORDER):
-- 1. Deploy Next.js to Vercel with updated vercel.json (crons removed).
-- 2. Configure CRON_SECRET in Vercel Project Environment Variables.
-- 3. Populate Vault secrets in Supabase (starx_cron_url, starx_cron_secret).
-- 4. Execute this migration to activate pg_cron as the sole active trigger.
-- ============================================================================

-- ============================================================================
-- 1. ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- ============================================================================
-- 2. PG_NET QUEUE & SCHEMA SECURITY HARDENING (CRON_SECRET LEAK PREVENTION)
-- ============================================================================
-- Supabase pg_net temporarily writes outgoing HTTP request headers (including
-- Authorization Bearer tokens) into net.http_request_queue, and retains HTTP
-- response bodies in net._http_response for 6 hours.
-- Untrusted roles (anon, authenticated, PUBLIC) MUST NOT be able to read or query
-- these tables, sequences, or functions under any circumstances.
REVOKE USAGE ON SCHEMA net FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA net FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA net FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA net FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA net REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA net REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA net REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

-- Ensure privileged system roles retain access
GRANT USAGE ON SCHEMA net TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA net TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA net TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA net TO postgres, service_role;

-- ============================================================================
-- 3. SECURE VAULT UPSERT HELPER (SECRET ROTATION & DEDUPLICATION)
-- ============================================================================
-- Idempotently upserts secrets in Supabase Vault. If a secret already exists
-- with the specified name, it is rotated via vault.update_secret and any
-- duplicate legacy records are cleaned up. Secrets are never exposed.
CREATE OR REPLACE FUNCTION public.upsert_vault_secret(
    p_name TEXT,
    p_secret TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id 
    FROM vault.secrets 
    WHERE name = p_name 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        -- Rotate existing secret
        PERFORM vault.update_secret(v_id, p_secret, p_name, p_description);
        -- Clean up duplicate legacy entries with the same name if any exist
        DELETE FROM vault.secrets WHERE name = p_name AND id <> v_id;
        RETURN v_id;
    ELSE
        -- Insert new secret
        RETURN vault.create_secret(p_secret, p_name, p_description);
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_vault_secret(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_vault_secret(TEXT, TEXT, TEXT) TO postgres, service_role;

-- ============================================================================
-- 4. WORKER HTTP INVOCATION FUNCTION (SOLE PRODUCTION TRIGGER)
-- ============================================================================
-- Invoked every minute exclusively by pg_cron. Dynamically decrypts the target
-- endpoint URL and CRON_SECRET from Supabase Vault and dispatches an
-- asynchronous HTTP POST via pg_net.
-- Timeout is set to 30000ms (30s) to safely enclose Vercel route's 25s budget ceiling.
-- Never logs secrets or sensitive PII.
CREATE OR REPLACE FUNCTION public.invoke_starx_receptionist_worker()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, net, extensions, pg_temp
AS $$
DECLARE
    v_url TEXT;
    v_secret TEXT;
    v_request_id BIGINT;
BEGIN
    -- 1. Retrieve configured secrets from Supabase Vault
    SELECT decrypted_secret INTO v_url 
    FROM vault.decrypted_secrets 
    WHERE name = 'starx_cron_url' 
    ORDER BY created_at DESC 
    LIMIT 1;

    SELECT decrypted_secret INTO v_secret 
    FROM vault.decrypted_secrets 
    WHERE name = 'starx_cron_secret' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 2. Fail-safe validation: Skip execution if Vault is not yet configured
    IF v_url IS NULL OR length(trim(v_url)) = 0 THEN
        RAISE WARNING 'StarX pg_cron: starx_cron_url is missing from Supabase Vault. Worker invocation skipped.';
        RETURN NULL;
    END IF;

    IF v_secret IS NULL OR length(trim(v_secret)) = 0 THEN
        RAISE WARNING 'StarX pg_cron: starx_cron_secret is missing from Supabase Vault. Worker invocation skipped.';
        RETURN NULL;
    END IF;

    -- 3. Dispatch asynchronous HTTP POST request via pg_net
    -- Non-blocking: returns request ID immediately (~1ms) without blocking PostgreSQL.
    -- Timeout set to 30000ms to allow Vercel 25s execution ceiling + 5s latency headroom.
    SELECT net.http_post(
        url := v_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || v_secret
        ),
        body := jsonb_build_object(
            'source', 'supabase_pg_cron',
            'triggered_at', clock_timestamp()
        ),
        timeout_milliseconds := 30000
    ) INTO v_request_id;

    RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.invoke_starx_receptionist_worker() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invoke_starx_receptionist_worker() TO postgres, service_role;

-- ============================================================================
-- 5. REGISTER IDEMPOTENT PRODUCTION CRON JOB
-- ============================================================================
-- Ensures exactly ONE active cron job named 'starx-receptionist-worker'
-- scheduled to run every minute ('* * * * *').
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Unschedule all existing instances of starx-receptionist-worker to prevent duplicates
    FOR r IN (SELECT jobid FROM cron.job WHERE jobname = 'starx-receptionist-worker') LOOP
        PERFORM cron.unschedule(r.jobid);
    END LOOP;

    -- Register single 1-minute production cron job
    PERFORM cron.schedule(
        'starx-receptionist-worker',
        '* * * * *',
        'SELECT public.invoke_starx_receptionist_worker();'
    );
END;
$$;

-- ============================================================================
-- 6. OBSERVABILITY & DIAGNOSTICS FUNCTION
-- ============================================================================
-- Provides structured, safe diagnostic monitoring without exposing secret values.
-- Restricted strictly to backend administrators and service_role.
CREATE OR REPLACE FUNCTION public.get_starx_cron_diagnostics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, cron, net, extensions, pg_temp
AS $$
DECLARE
    v_result JSONB;
    v_url_exists BOOLEAN;
    v_secret_exists BOOLEAN;
    v_cron_job JSONB;
    v_recent_runs JSONB;
    v_recent_http JSONB;
    v_queue_summary JSONB;
BEGIN
    -- 1. Check Vault secret existence without exposing values
    SELECT EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name = 'starx_cron_url' AND length(trim(decrypted_secret)) > 0) INTO v_url_exists;
    SELECT EXISTS(SELECT 1 FROM vault.decrypted_secrets WHERE name = 'starx_cron_secret' AND length(trim(decrypted_secret)) > 0) INTO v_secret_exists;

    -- 2. Check cron job registration
    SELECT to_jsonb(j) INTO v_cron_job
    FROM (
        SELECT jobid, jobname, schedule, active, username, database
        FROM cron.job
        WHERE jobname = 'starx-receptionist-worker'
        ORDER BY jobid DESC
        LIMIT 1
    ) j;

    -- 3. Get recent 5 cron job run details
    SELECT coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) INTO v_recent_runs
    FROM (
        SELECT runid, job_pid, status, return_message, start_time, end_time
        FROM cron.job_run_details
        WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'starx-receptionist-worker' ORDER BY jobid DESC LIMIT 1)
        ORDER BY start_time DESC
        LIMIT 5
    ) r;

    -- 4. Get recent 5 pg_net HTTP responses
    SELECT coalesce(jsonb_agg(to_jsonb(h)), '[]'::jsonb) INTO v_recent_http
    FROM (
        SELECT id, status_code, error_msg, timed_out, created
        FROM net._http_response
        ORDER BY created DESC
        LIMIT 5
    ) h;

    -- 5. Summarize receptionist job queue
    SELECT jsonb_build_object(
        'pending', count(*) FILTER (WHERE status = 'pending'),
        'processing', count(*) FILTER (WHERE status = 'processing'),
        'completed', count(*) FILTER (WHERE status = 'completed'),
        'failed', count(*) FILTER (WHERE status = 'failed')
    ) INTO v_queue_summary
    FROM public.receptionist_jobs;

    -- Assemble diagnostic result
    v_result := jsonb_build_object(
        'scheduler_mode', 'supabase_pg_cron_sole_trigger',
        'http_timeout_ms', 30000,
        'extensions', jsonb_build_object(
            'pg_cron', EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'),
            'pg_net', EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_net'),
            'vault', EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'supabase_vault')
        ),
        'vault_configuration', jsonb_build_object(
            'starx_cron_url_configured', v_url_exists,
            'starx_cron_secret_configured', v_secret_exists
        ),
        'cron_job', v_cron_job,
        'recent_cron_runs', v_recent_runs,
        'recent_http_responses', v_recent_http,
        'job_queue_summary', v_queue_summary,
        'checked_at', clock_timestamp()
    );

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_starx_cron_diagnostics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_starx_cron_diagnostics() TO postgres, service_role;

-- ============================================================================
-- 7. POSTGREST SCHEMA CACHE REFRESH
-- ============================================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SAFE ROLLBACK PROCEDURE (Documentation & Disaster Recovery)
-- ============================================================================
-- To remove the pg_cron scheduler and functions cleanly without affecting application data:
--
-- 1. Unschedule the cron job:
--    SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'starx-receptionist-worker';
--
-- 2. Drop worker functions:
--    DROP FUNCTION IF EXISTS public.invoke_starx_receptionist_worker();
--    DROP FUNCTION IF EXISTS public.get_starx_cron_diagnostics();
--    DROP FUNCTION IF EXISTS public.upsert_vault_secret(TEXT, TEXT, TEXT);
--
-- 3. Optionally clean up secrets from Vault:
--    DELETE FROM vault.secrets WHERE name IN ('starx_cron_url', 'starx_cron_secret');
-- ============================================================================
