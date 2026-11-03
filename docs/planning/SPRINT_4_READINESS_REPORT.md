# STARX-FLOW — SPRINT 4 READINESS REPORT
## Pre-Implementation Governance Gate & Architectural Blueprint

**Date:** 2026-11-03  
**Role:** Principal SaaS Architect, Staff Backend Engineer, Distributed Systems Engineer, Voice Infrastructure Engineer & Technical Lead  
**Active Git Branch:** `remediation/phase-4b54-final-sprint3-security`  
**Current HEAD Commit SHA:** `bdea7bbe23c0cd267c8f9f9390883e6fc9917eb1`  
**Reference Independent Audit:** [`docs/audits/SPRINT_3_FINAL_INDEPENDENT_ACCEPTANCE_AUDIT.md`](file:///c:/Web%20Apps/starx-flow/docs/audits/SPRINT_3_FINAL_INDEPENDENT_ACCEPTANCE_AUDIT.md)  
**Target Migration to Design:** `supabase/migrations/009_background_jobs_and_workflow_runtime.sql`  

---

## 1. PRE-IMPLEMENTATION GOVERNANCE GATE VERDICT

### **GATE STATUS: PREREQUISITES VERIFIED — AWAITING EXPLICIT PROJECT-OWNER AUTHORIZATION**

In strict adherence to **Section 2 (Governance Gate)** of the Sprint 4 Directive:
- **Git Repository & Branch Verified:** The active branch is `remediation/phase-4b54-final-sprint3-security` at commit `bdea7bbe23c0cd267c8f9f9390883e6fc9917eb1`.
- **Sprint 3 Independent Acceptance Verified:** Phase 4B.5.6 Final Independent Acceptance Audit awarded **`SPRINT 3 ACCEPTED`** (Decision A engineering acceptance equivalent). All 185 test cases passed with 0 failures, 0 TypeScript errors, and zero critical/high/medium security defects.
- **Production Staging Gate Respected:** The hosted Supabase staging gate is documented and recognized as a pending environment verification step. No unreviewed migrations or production deployments have been executed.
- **Strict Code Freeze Maintained:** **0 application source files modified.** No application code changes, Git merges, or hosted database mutations have been made.
- **Governance Gate Adherence:** As explicitly stipulated (*"A request to prepare this prompt is not authorization to bypass the acceptance gate. If explicit project-owner authorization to begin Sprint 4 is absent: Produce a Sprint 4 readiness report and wait"*), this report establishes full architectural readiness and pauses execution awaiting project-owner authorization.

---

## 2. PRODUCTION ARCHITECTURE & INTEGRATION INVENTORY

### 2.1 Database Migrations Inventory (Migrations 001–008)
| Migration | Filename | Key Schemas & Functional Responsibilities |
| :---: | :--- | :--- |
| **001** | `001_initial_schema.sql` | Users, leads, appointments, workflows, messages, channels. |
| **002** | `002_production_core_schema.sql` | Organizations, profiles, memberships, role checks, RLS policies. |
| **003** | `003_commercial_capabilities.sql` | `channel_identities`, `lead_scoring_rules`, `analytics_daily_rollups`, `phone_numbers`, `workflow_executions`, `audit_logs`. |
| **004** | `004_security_integrity_and_remediation.sql` | Audit log immutability triggers, presence table, double-booking prevention. |
| **005** | `005_external_integrations_and_sync.sql` | `connected_accounts`, `external_calendars`, `external_calendar_events`, `email_threads`, `provider_webhook_events`. |
| **006** | `006_oauth_states_and_channel_window_persistence.sql` | `oauth_states`, `customer_channel_windows` (persistent 24h Meta window). |
| **007** | `007_phase_4b54_security_hardening.sql` | Unique connected account index, atomic webhook claiming RPCs. |
| **008** | `008_workflow_stats_hardening_and_idempotency.sql` | Hardened `increment_workflow_stats`, `verify_provider_webhook_lease`, outbound idempotency tracking. |

### 2.2 Core Application Systems Inventory
- **Ingestion Gateway:** [`src/lib/ingestion/`](file:///c:/Web%20Apps/starx-flow/src/lib/ingestion/) — Shared multi-channel webhook ingestion, payload normalization, HMAC signature verification, SHA-256 payload deduplication.
- **Customer CRM & Identity Resolution:** [`src/lib/crm/identityResolver.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/crm/identityResolver.ts) — Phone/email normalization, cross-channel identity mapping, safe customer merging with audit logging.
- **Unified Omnichannel Inbox:** [`src/lib/inbox/`](file:///c:/Web%20Apps/starx-flow/src/lib/inbox/) — Organization-partitioned conversations, real-time presence collision detection, strict internal staff note isolation (`is_internal = true`).
- **AI Orchestrator & Tool Workforce:** [`src/lib/ai/orchestrator.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/orchestrator.ts), [`src/lib/ai/tools/toolExecutor.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/tools/toolExecutor.ts) — LLM reasoning, RAG context filtering, tool-calling engine (calendar availability, booking, rescheduling, orders) with caller ownership validation.
- **Integration Adapters:** [`src/lib/integrations/`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/) — WhatsApp (Baileys & Meta Cloud), Email (Resend), Instagram (Meta Graph API), Calendars (Google & Microsoft Graph) with AES-256-GCM token encryption.
- **Usage & Billing Engine:** [`src/lib/usage/usageService.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/usage/usageService.ts) — Idempotent metric tracking, plan entitlement limits (`ai_requests`, `whatsapp_messages`, `email_messages`, `instagram_messages`, `voice_minutes`, `workflow_executions`).

---

## 3. SPRINT 4 COMPONENT REUSE MATRIX

To eliminate redundant infrastructure and adhere to the strict directive (*"Do not introduce Redis, Kafka, RabbitMQ or another infrastructure dependency without demonstrating why existing infrastructure is insufficient"*), Sprint 4 directly reuses proven StarX-Flow primitives:

| Sprint 4 Workstream | New Capability Required | Reused StarX-Flow Component | Rationale & Reuse Architecture |
| :--- | :--- | :--- | :--- |
| **WS-09 Durable Job Engine** | Distributed job persistence & atomic claiming | `provider_webhook_events` & Migration 008 lease fencing | Stored procedure pattern with `FOR UPDATE SKIP LOCKED` and database-backed lease verification (`verify_provider_webhook_lease`) provides zero-dependency durable queuing in PostgreSQL. |
| **WS-09 Durable Job Engine** | Job execution tracking & metering | `usageService.ts` & `workflow_executions` | Pre-existing `workflow_executions` metric in `usageService.ts` tracks background worker cycles. |
| **WS-10 Workflow Automation** | Trigger Ingestion | Shared Ingestion Gateway & CRM Event Emitters | Inbound messages, lead creation, booking lifecycle events, and order status transitions already pass through standard gateways. |
| **WS-10 Workflow Automation** | Action Execution Library (12 actions) | `resendEmailAdapter`, `whatsappService`, `ToolExecutor`, `IdentityResolver` | Outbound messaging, appointment scheduling, customer updates, and internal notes reuse existing tested integration adapters without duplicating logic. |
| **WS-10 Workflow Automation** | Visual Workflow Designer | `WorkflowEditor.tsx`, `CreateWorkflowWizard.tsx`, `WorkflowsSection.tsx` | Extends existing React flow node components with conditional branching, delay nodes, and execution history drawers. |
| **WS-11 AI Voice Telephony** | Voice UI & Call Records | `VoiceSection.tsx`, `voiceStore.ts`, `calls` table | Existing call logs, audio player, sentiment tagging, and call memory structures are upgraded from mock state to live provider abstraction. |
| **WS-11 AI Voice Telephony** | Dialogue Orchestration & Tools | `AIOrchestrator`, `ToolExecutor` | Voice engine reuses the LLM orchestrator and calendar tool executor for real-time speech intent classification and appointment booking. |
| **WS-11 AI Voice Telephony** | Telephony Usage Tracking | `usageService.ts` (`voice_minutes` metric) | Existing `voice_minutes` quota limit in `types.ts` enforces per-tenant call limits. |
| **WS-12 Lead Scoring & Analytics** | Rule-Based & Behavioral Scoring | `lead_scoring_rules` (Migration 003) & `crmStore.ts` | Extends existing scoring schema with explainable signal breakdown (velocity, booking intent, engagement). |
| **WS-12 Lead Scoring & Analytics** | Operational Dashboards | `analytics_daily_rollups` (Migration 003), `KPIGrid.tsx`, `AnalyticsSection.tsx` | Replaces static counters with tenant-scoped SQL aggregations across Leads, Conversations, Bookings, Automations, and Voice. |

---

## 4. ARCHITECTURAL SPECIFICATION FOR SPRINT 4 WORKSTREAMS

```mermaid
flowchart TD
    subgraph Triggers["Event Triggers & External Signals"]
        T_Lead["New Lead Created (CRM)"]
        T_Msg["Customer Message (WhatsApp/Email/IG)"]
        T_Booking["Booking Created / Updated (Calendar)"]
        T_Voice["Inbound Phone Call (Telephony Provider)"]
        T_Cron["Scheduled Time / Delay Expired"]
    end

    subgraph JobEngine["WS-09: Durable Background Job Engine (PostgreSQL)"]
        BJ_Table[("background_jobs (DB)")<br/>pending | scheduled | running | retrying | completed | dead_letter]
        ClaimRPC["claim_background_job() (FOR UPDATE SKIP LOCKED)"]
        LeaseFence["Heartbeat & Lease Verification"]
        DeadLetter["Dead-Letter & Exponential Backoff"]
    end

    subgraph WorkflowRuntime["WS-10: Workflow Automation Runtime"]
        W_Engine["Workflow State Machine & Step Evaluator"]
        W_Condition{"Conditional Branching"}
        W_Actions["Action Executor (12 Built-in Actions)"]
        W_Version["Workflow Version Snapshot"]
    end

    subgraph VoiceEngine["WS-11: AI Voice Telephony Engine"]
        V_Provider["IVoiceProvider Abstraction (Twilio / Webhook)"]
        V_Consent["GDPR Consent & Calling Hours (08:00-20:00)"]
        V_Dialogue["Voice Dialogue State Machine (Speech-to-Text -> LLM -> TTS)"]
        V_ToolCall["ToolExecutor (Calendar Availability & Booking)"]
    end

    subgraph AnalyticsEngine["WS-12: Lead Scoring & Business Analytics"]
        LS_Engine["Deterministic Lead Scoring (0-100) + Explainability"]
        Analytics_Rollup["Tenant-Scoped Aggregations (Daily Rollups)"]
        Dashboards["Operations Dashboards (Leads / Convos / Voice / Jobs)"]
    end

    T_Lead --> BJ_Table
    T_Msg --> BJ_Table
    T_Booking --> BJ_Table
    T_Cron --> BJ_Table

    BJ_Table --> ClaimRPC --> LeaseFence --> W_Engine
    W_Engine --> W_Version --> W_Condition
    W_Condition -->|True| W_Actions
    W_Actions -->|Send Email| BJ_Table
    W_Actions -->|Schedule Delay| BJ_Table

    T_Voice --> V_Consent --> V_Provider --> V_Dialogue
    V_Dialogue --> V_ToolCall
    V_Dialogue --> BJ_Table

    W_Actions --> LS_Engine
    T_Msg --> LS_Engine
    LS_Engine --> Analytics_Rollup --> Dashboards
```

---

### 4.1 WS-09: Durable Background Job Engine

#### Design Decisions
- **Storage:** Stored in new table `public.background_jobs`.
- **States:** `pending`, `scheduled`, `running`, `retrying`, `completed`, `failed`, `cancelled`, `dead_letter`.
- **Concurrency & Lease:** Concurrency coordination via PostgreSQL stored procedure `claim_background_job(worker_id, batch_size, lease_seconds)`. Uses `SELECT ... FOR UPDATE SKIP LOCKED` to allow horizontally scalable serverless workers without collisions.
- **Heartbeats & Lease Fencing:** Workers execute `heartbeat_background_job(job_id, worker_id, extend_seconds)`. If a worker stalls past the lease window, the job reverts to `pending` or `retrying` and can be claimed by an active worker.
- **Exponential Backoff:** Calculated via `run_at = clock_timestamp() + (base_delay * power(2, attempts))`.
- **Idempotency:** Unique partial index on `(organization_id, idempotency_key)` where `idempotency_key IS NOT NULL` prevents duplicate background task scheduling.

---

### 4.2 WS-10: Workflow Automation Runtime

#### Design Decisions
- **Workflow Versioning:** When a workflow is published, an immutable version snapshot is stored in `workflow_versions`. Running executions bind to the version snapshot active at their trigger timestamp, ensuring workflow edits do not corrupt active executions.
- **Trigger Catalog:**
  1. `lead.created`
  2. `message.received`
  3. `booking.created` / `booking.updated` / `booking.cancelled`
  4. `order.created` / `payment.updated`
  5. `scheduled.cron` / `delay.expired`
  6. `customer.inactivity`
  7. `workflow.manual`
- **12 Standard Actions:**
  1. Send WhatsApp Message
  2. Send Email
  3. Create Booking
  4. Update Customer Profile
  5. Assign Conversation to Staff Member
  6. Update Lead Status
  7. Add Internal Staff Note
  8. Wait / Delay Duration (schedules durable background job)
  9. Evaluate Condition (branching)
  10. Invoke AI Action (LLM reasoning)
  11. Call External Webhook (with SSRF protection against private IP ranges)
  12. Create Follow-Up Task
- **Loop & Quota Defense:** Max step execution depth (limit 25 steps per run) and tenant monthly execution quotas via `usageService.ts`.

---

### 4.3 WS-11: AI Voice Telephony Engine

#### Design Decisions
- **Provider Abstraction:** Defined via interface `IVoiceProvider` with pluggable adapters (e.g. Twilio, LiveKit/SIP, and Sandbox Provider).
- **Inbound Call Lifecycle:**
  1. Telephony webhook verifies provider signature.
  2. Resolves tenant organization via dialed virtual phone number (`phone_numbers` table).
  3. Greets caller with mandatory AI disclosure ("You are speaking with the automated AI assistant for [Business Name]").
  4. Collects GDPR recording consent before streaming audio.
  5. Feeds customer transcript to `AIOrchestrator` with calendar tools enabled.
  6. Supports human transfer if caller requests a manager or if sentiment degrades.
- **Outbound Voice Safety:**
  1. Strict calling hours enforcement: 08:00 to 20:00 in tenant local time zone.
  2. Do-Not-Call (DNC) list check against customer opt-out preferences.
  3. Lawful basis & consent verification: outbound calls restricted to appointment confirmations and explicit customer callback requests. Zero bulk telemarketing campaigns.
- **Usage Metering:** Call durations recorded in seconds and attributed to `voice_minutes` monthly tenant quota.

---

### 4.4 WS-12: Lead Scoring & Business Analytics

#### Design Decisions
- **Deterministic & Explainable Scoring (0–100):**
  - **Engagement (0–25 pts):** Channel diversity, response velocity, message count.
  - **Intent (0–35 pts):** Keyword intent detection (pricing inquiry, booking request, consultation interest).
  - **Booking & Commercial History (0–30 pts):** Completed appointments, paid orders, repeat client status.
  - **Negative Signals (-10 to -30 pts):** Cancellations, no-shows, prolonged dormancy (>60 days).
  - **Qualification Tiers:** `Hot` (>=80), `Warm` (50–79), `Cold` (25–49), `Unqualified` (<25).
  - **Explainability:** Each score update generates a breakdown record in `lead_scoring_logs` detailing the exact signals and point contributions.
- **Tenant-Scoped Analytics:**
  - Aggregations grouped by `organization_id` with date-range filters (`day`, `week`, `month`, `custom`).
  - Pre-aggregated rollups in `analytics_daily_rollups` for fast dashboard rendering.
  - Excludes internal staff notes and restricted customer PII.

---

## 5. DATABASE MIGRATION SPECIFICATION (MIGRATION 009)

The forward migration [`supabase/migrations/009_background_jobs_and_workflow_runtime.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/009_background_jobs_and_workflow_runtime.sql) will introduce:

1. **`background_jobs` Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.background_jobs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
       job_type TEXT NOT NULL,
       payload JSONB NOT NULL DEFAULT '{}'::jsonb,
       status TEXT NOT NULL DEFAULT 'pending' 
           CHECK (status IN ('pending', 'scheduled', 'running', 'retrying', 'completed', 'failed', 'cancelled', 'dead_letter')),
       priority INTEGER NOT NULL DEFAULT 0,
       attempts INTEGER NOT NULL DEFAULT 0,
       max_attempts INTEGER NOT NULL DEFAULT 5,
       run_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
       claim_expires_at TIMESTAMPTZ,
       worker_id TEXT,
       idempotency_key TEXT,
       last_error TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
       completed_at TIMESTAMPTZ
   );
   ```
2. **Atomic Job Claiming Stored Procedure:**
   ```sql
   CREATE OR REPLACE FUNCTION public.claim_background_job(
       p_worker_id TEXT,
       p_batch_size INTEGER DEFAULT 1,
       p_lease_seconds INTEGER DEFAULT 60
   )
   RETURNS SETOF public.background_jobs
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public, pg_temp
   AS $$ ... $$;
   ```
3. **`workflow_versions` & `workflow_definitions` Upgrades:**
   Supporting multi-node directed acyclic graph (DAG) execution with JSONB step configurations.
4. **`calls` & `voice_sessions` Hardening:**
   Linking calls to organizations and enforcing RLS policies.
5. **`lead_scoring_logs` Table:**
   Tracking scoring signal breakdowns and explainable audit trails.

---

## 6. SPRINT 4 EXECUTION ROADMAP & ESTIMATED SPs

| Workstream | Identifier | Story Points | Dependencies | Core Deliverables |
| :--- | :---: | :---: | :--- | :--- |
| **Durable Background Job Engine** | WS-09 | 8 SP | Migration 009, PostgreSQL RPCs | `JobQueueService`, `JobWorker`, `claim_background_job`, 7 failure mode tests. |
| **Workflow Automation Runtime** | WS-10 | 8 SP | WS-09, Ingestion Gateway, Adapters | `WorkflowRuntime`, 12 Actions, trigger dispatchers, UI designer integration. |
| **Lead Scoring & Business Analytics** | WS-12 | 5 SP | WS-10, CRM Store, Migration 003 | `LeadScoringEngine`, explainability log, tenant analytics rollups & dashboard. |
| **AI Voice Telephony Engine** | WS-11 | 7 SP | WS-09, WS-10, `AIOrchestrator`, ToolExecutor | `VoiceEngine`, `IVoiceProvider`, Twilio/Webhook adapter, calling hours & GDPR consent. |
| **Total Sprint 4 Effort** | — | **28 SP** | — | **Complete Autonomous Operations Platform** |

---

## 7. AWAITING PROJECT-OWNER AUTHORIZATION

In accordance with strict governance directives:
1. **No production code has been modified in this step.**
2. **No migrations have been applied.**
3. **Branch `remediation/phase-4b54-final-sprint3-security` remains clean and ready for workstream execution.**

**The architectural baseline, component reuse mapping, and migration plan are complete. Awaiting explicit project-owner authorization to proceed with Sprint 4 implementation.**
