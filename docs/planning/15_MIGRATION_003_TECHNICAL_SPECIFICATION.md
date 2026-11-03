# STARX-FLOW — MIGRATION 003 TECHNICAL SPECIFICATION
**Document Reference:** `docs/planning/15_MIGRATION_003_TECHNICAL_SPECIFICATION.md`  
**Phase:** Phase 4B.2 — Final Execution Plan Refinement & Engineering Baseline  
**Date:** 2026-11-01  
**Status:** Canonical Baseline — Design & Specification Only (DO NOT APPLY YET)  

---

## 1. Migration Overview & Strategic Objectives

Migration 003 completes the database architecture required for StarX-Flow's commercial SaaS platform. It introduces 6 new production tables while preserving full backward compatibility with Migrations 001 and 002.

### Architectural Principles:
1. **Zero Downtime:** All modifications are additive. No columns or tables are deleted or renamed.
2. **Strict Multi-Tenancy:** Every new table includes an indexed `organization_id` column protected by PostgreSQL Row Level Security (RLS) policies.
3. **Referential Integrity:** Foreign keys use `ON DELETE CASCADE` for tenant isolation or `ON DELETE SET NULL` for non-critical relationships.
4. **Audit Immutability:** Sensitive tables (e.g. `audit_logs`) enforce append-only policies where `UPDATE` and `DELETE` operations are strictly blocked.
5. **Deterministic Rollback:** An exact, ordered rollback script is specified to revert changes cleanly without data corruption.

---

## 2. Existing Table Extension & Reuse Analysis

Migration 003 reuses and minimally extends existing tables without breaking existing queries:

| Existing Table | Extension / Reuse Strategy | Backward Compatibility Impact |
|---|---|---|
| `organizations` | Add usage counter columns: `monthly_ai_messages_used` (INTEGER DEFAULT 0), `monthly_voice_minutes_used` (INTEGER DEFAULT 0). | **Zero break.** Defaults allow existing queries to succeed unchanged. |
| `customers` | Reused as primary root identity. Referenced by `channel_identities.customer_id`. | **Zero break.** Reused as-is. |
| `conversations` | Reused as the communication container. Channels are now multi-origin. | **Zero break.** Reused as-is. |
| `messages` | Add `is_internal` (BOOLEAN DEFAULT false), `email_message_id` (TEXT), `in_reply_to` (TEXT). | **Zero break.** Default `false` preserves existing behavior. |
| `appointments` | Reused for calendar slots. External calendar event IDs mapped via metadata. | **Zero break.** Reused as-is. |
| `orders` | Reused for customer purchases. Payment links mapped via existing columns. | **Zero break.** Reused as-is. |
| `integrations` | Reused for credential storage with AES-256 encrypted payloads. | **Zero break.** Reused as-is. |

---

## 3. Exact Proposed Table Definitions (DDL)

```sql
-- ============================================================================
-- STARX-FLOW MIGRATION 003: COMMERCIAL CAPABILITIES & ENTERPRISE INFRASTRUCTURE
-- SPECIFICATION ONLY - DO NOT RUN DIRECTLY UNTIL AUTHORIZED
-- ============================================================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLE: channel_identities
-- Purpose: Maps external channel identifiers (WhatsApp phone, Email, Instagram ID)
-- to a unified customer profile.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.channel_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL CHECK (channel IN ('whatsapp', 'web', 'email', 'instagram', 'phone')),
    external_user_id VARCHAR(255) NOT NULL,
    profile_data JSONB DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_channel_identities_org_channel_external UNIQUE (organization_id, channel, external_user_id)
);

-- Indexes for channel_identities
CREATE INDEX IF NOT EXISTS idx_channel_identities_lookup 
    ON public.channel_identities (organization_id, channel, external_user_id);
CREATE INDEX IF NOT EXISTS idx_channel_identities_customer 
    ON public.channel_identities (organization_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_channel_identities_profile_gin 
    ON public.channel_identities USING GIN (profile_data);

-- ----------------------------------------------------------------------------
-- 2. TABLE: lead_scoring_rules
-- Purpose: Configurable rules that dynamically calculate lead qualification scores.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    score_delta INTEGER NOT NULL CHECK (score_delta BETWEEN -100 AND 100),
    conditions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lead_scoring_rules
CREATE INDEX IF NOT EXISTS idx_lead_scoring_rules_org_event 
    ON public.lead_scoring_rules (organization_id, event_type) WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 3. TABLE: analytics_daily_rollups
-- Purpose: Pre-aggregated daily metrics providing sub-300ms dashboard queries.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_daily_rollups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_name VARCHAR(64) NOT NULL,
    metric_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    dimensions JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_analytics_daily_rollups_org_date_metric UNIQUE (organization_id, date, metric_name)
);

-- Indexes for analytics_daily_rollups
CREATE INDEX IF NOT EXISTS idx_analytics_daily_rollups_query 
    ON public.analytics_daily_rollups (organization_id, metric_name, date DESC);

-- ----------------------------------------------------------------------------
-- 4. TABLE: phone_numbers
-- Purpose: Manages virtual and provisioned phone numbers for voice and telephony.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    phone_number VARCHAR(32) NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'twilio' CHECK (provider IN ('twilio', 'telnyx', 'sip')),
    provider_sid VARCHAR(128),
    friendly_name VARCHAR(128),
    capabilities JSONB DEFAULT '{"voice": true, "sms": true}'::jsonb,
    assigned_agent VARCHAR(64) DEFAULT 'receptionist',
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'released')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_phone_numbers_org_number UNIQUE (organization_id, phone_number)
);

-- Indexes for phone_numbers
CREATE INDEX IF NOT EXISTS idx_phone_numbers_lookup 
    ON public.phone_numbers (phone_number) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_phone_numbers_org 
    ON public.phone_numbers (organization_id);

-- ----------------------------------------------------------------------------
-- 5. TABLE: workflow_executions
-- Purpose: Persistent audit and state execution logs for visual workflows.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    trigger_event VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    context JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- Indexes for workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_wf 
    ON public.workflow_executions (organization_id, workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status 
    ON public.workflow_executions (status) WHERE status IN ('pending', 'running');

-- ----------------------------------------------------------------------------
-- 6. TABLE: audit_logs
-- Purpose: Immutable, tamper-evident audit trail for security and GDPR compliance.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID,
    actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('user', 'system', 'api_key', 'cron')),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128),
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created 
    ON public.audit_logs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor 
    ON public.audit_logs (organization_id, actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target 
    ON public.audit_logs (organization_id, target_type, target_id);

-- ----------------------------------------------------------------------------
-- 7. EXTENSIONS TO EXISTING TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.organizations 
    ADD COLUMN IF NOT EXISTS monthly_ai_messages_used INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS monthly_voice_minutes_used INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.messages 
    ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_message_id TEXT,
    ADD COLUMN IF NOT EXISTS in_reply_to TEXT;
```

---

## 4. PostgreSQL Row Level Security (RLS) Policies

All tables are locked down with PostgreSQL RLS. Unauthenticated users or users belonging to other organizations are physically blocked from reading, modifying, or creating records.

```sql
-- Enable Row Level Security on all 6 new tables
ALTER TABLE public.channel_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Extract organization_id from authenticated user session
-- (Assuming standard StarX-Flow users table lookup)
CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Policies for channel_identities
CREATE POLICY "Tenants can manage their own channel identities"
    ON public.channel_identities
    FOR ALL
    USING (organization_id = public.get_auth_organization_id())
    WITH CHECK (organization_id = public.get_auth_organization_id());

-- 2. Policies for lead_scoring_rules
CREATE POLICY "Tenants can manage their own lead scoring rules"
    ON public.lead_scoring_rules
    FOR ALL
    USING (organization_id = public.get_auth_organization_id())
    WITH CHECK (organization_id = public.get_auth_organization_id());

-- 3. Policies for analytics_daily_rollups
CREATE POLICY "Tenants can view their own analytics rollups"
    ON public.analytics_daily_rollups
    FOR SELECT
    USING (organization_id = public.get_auth_organization_id());

-- 4. Policies for phone_numbers
CREATE POLICY "Tenants can view and manage their phone numbers"
    ON public.phone_numbers
    FOR ALL
    USING (organization_id = public.get_auth_organization_id())
    WITH CHECK (organization_id = public.get_auth_organization_id());

-- 5. Policies for workflow_executions
CREATE POLICY "Tenants can view and manage workflow executions"
    ON public.workflow_executions
    FOR ALL
    USING (organization_id = public.get_auth_organization_id())
    WITH CHECK (organization_id = public.get_auth_organization_id());

-- 6. Policies for audit_logs (Strict Append-Only / Immutable Security)
CREATE POLICY "Tenants can view their own audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Tenants can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (organization_id = public.get_auth_organization_id());

-- NO UPDATE OR DELETE POLICIES CREATED FOR audit_logs.
-- By omission, UPDATE and DELETE are completely blocked for all users,
-- guaranteeing immutability.
```

---

## 5. Migration Execution Order & Safety Checklist

When authorized to apply Migration 003, the execution sequence must be:

1. **Pre-Migration Backup Verification:** Verify Supabase automated point-in-time recovery is active on project `iotuxpcqewdzvqzncpad`.
2. **Schema Dry-Run:** Execute DDL in a local or staging PostgreSQL container using `psql --single-transaction`.
3. **Additive Column Application:** Apply `ALTER TABLE organizations ...` and `ALTER TABLE messages ...` first.
4. **Table Creation:** Create new tables in topological order:
   - `channel_identities` (depends on `organizations`, `customers`)
   - `lead_scoring_rules` (depends on `organizations`)
   - `analytics_daily_rollups` (depends on `organizations`)
   - `phone_numbers` (depends on `organizations`)
   - `workflow_executions` (depends on `organizations`, `workflows`)
   - `audit_logs` (depends on `organizations`)
5. **Index Creation:** Build indexes concurrently (`CREATE INDEX CONCURRENTLY ...`).
6. **RLS Enablement & Policies:** Enable RLS and attach security policies.
7. **Post-Migration Verification:** Run automated probe queries to confirm zero regressions on existing endpoints.

---

## 6. Deterministic Rollback Strategy

If a critical issue occurs during execution, the rollback script drops all newly created objects in reverse dependency order without affecting pre-existing data:

```sql
-- ============================================================================
-- STARX-FLOW MIGRATION 003 ROLLBACK SCRIPT
-- WARNING: EXECUTE ONLY TO FULLY REVERT MIGRATION 003
-- ============================================================================

BEGIN;

-- 1. Drop RLS Policies
DROP POLICY IF EXISTS "Tenants can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Tenants can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Tenants can view and manage workflow executions" ON public.workflow_executions;
DROP POLICY IF EXISTS "Tenants can view and manage their phone numbers" ON public.phone_numbers;
DROP POLICY IF EXISTS "Tenants can view their own analytics rollups" ON public.analytics_daily_rollups;
DROP POLICY IF EXISTS "Tenants can manage their own lead scoring rules" ON public.lead_scoring_rules;
DROP POLICY IF EXISTS "Tenants can manage their own channel identities" ON public.channel_identities;

-- 2. Drop Tables (in reverse dependency order)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.workflow_executions CASCADE;
DROP TABLE IF EXISTS public.phone_numbers CASCADE;
DROP TABLE IF EXISTS public.analytics_daily_rollups CASCADE;
DROP TABLE IF EXISTS public.lead_scoring_rules CASCADE;
DROP TABLE IF EXISTS public.channel_identities CASCADE;

-- 3. Drop Helper Function
DROP FUNCTION IF EXISTS public.get_auth_organization_id() CASCADE;

-- 4. Revert Column Additions on Existing Tables
ALTER TABLE public.messages 
    DROP COLUMN IF EXISTS is_internal,
    DROP COLUMN IF EXISTS email_message_id,
    DROP COLUMN IF EXISTS in_reply_to;

ALTER TABLE public.organizations 
    DROP COLUMN IF EXISTS monthly_ai_messages_used,
    DROP COLUMN IF EXISTS monthly_voice_minutes_used;

COMMIT;
```

---

## 7. Backward Compatibility Guarantee

1. **Existing API Routes:** Existing routes (`/api/chat`, `/api/integrations/whatsapp`, `/api/stripe/*`, `/api/gdpr/*`) do not reference the new tables until their respective workstream tasks are deployed.
2. **Nullable Columns & Safe Defaults:** All column additions to existing tables include explicit `DEFAULT` values (`DEFAULT false`, `DEFAULT 0`), preventing `NULL` reference errors in existing ORM and SQL queries.
3. **Database Performance:** New indexes are scoped strictly to the new tables, guaranteeing zero degradation to existing read/write transaction speeds on `customers`, `conversations`, and `messages`.
