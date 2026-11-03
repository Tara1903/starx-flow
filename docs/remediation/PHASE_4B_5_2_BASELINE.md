# STARX-FLOW — PHASE 4B.5.2 REMEDIATION BASELINE
## Baseline State Prior to Sprint 3 Security Remediation

**Date:** November 2, 2026  
**Auditor / Engineer:** Principal SaaS Security Architect, PostgreSQL Engineer & Integration Reliability Engineer  
**Baseline Branch:** `remediation/phase-4b52-sprint3-security` (branched from `remediation/phase-4b42-security`)  
**Audit Reference:** [`docs/audits/SPRINT_3_INDEPENDENT_ACCEPTANCE_AUDIT.md`](file:///c:/Web%20Apps/starx-flow/docs/audits/SPRINT_3_INDEPENDENT_ACCEPTANCE_AUDIT.md)  
**Baseline Status:** VERIFIED NOT APPROVED (6 Critical/High Findings to Remediate)  

---

## 1. REPOSITORY AND GIT BASELINE

- **Active Branch:** `remediation/phase-4b52-sprint3-security`
- **TypeScript Status:** `npx tsc --noEmit` exits code 0 (Zero errors baseline).
- **Existing Migrations:**
  - `001_initial_schema.sql` (Initial tables: users, leads, appointments, messages)
  - `002_production_core_schema.sql` (Production schema: organizations, memberships, role checks)
  - `003_commercial_capabilities.sql` (RAG, channel identities, usage metering, daily rollups)
  - `004_security_integrity_and_remediation.sql` (Audit log immutability triggers, presence table, slot conflict prevention)
  - `005_external_integrations_and_sync.sql` (Connected accounts, external calendars, email threads, webhook idempotency)
- **Forward Migration to Add:**
  - `006_oauth_states_and_channel_window_persistence.sql` (Durable serverless OAuth state management, durable customer channel window tracking, and foreign key integrity)

---

## 2. AUDIT FINDINGS TO REMEDIATE

| Finding ID | Severity | Target Module | Problem Statement | Required Remediation |
| :--- | :---: | :--- | :--- | :--- |
| **C1** | Critical | Google & MS OAuth | Unsigned base64 JSON `state` parameter vulnerable to CSRF and tenant account hijacking | Database-backed `oauth_states` table + cryptographically random state nonce + session binding |
| **C2** | Critical | Resend & Instagram Webhooks | Unrouted webhooks defaulting to `'org-default'`, contaminating customer CRM data across tenants | Strict tenant resolution via recipient address/thread (`resend`) and Meta Page ID lookup (`instagram`) |
| **C3** | Critical | Instagram 24h Window | Ephemeral in-memory Map (`customerLastInboundMap`) lost across serverless lambda instances | Database-backed persistence in `channel_identities` / dedicated table with atomic updates |
| **H1** | High | Calendar Sync Service | Hardcoded `` `gcal-evt-${appointmentId}` `` fails cancellation on real opaque external event IDs | Query `external_calendar_events` for real `external_event_id` and handle 404 idempotently |
| **H2** | High | Resend Email Adapter | Inbound webhook pipeline omits idempotency check against `provider_webhook_events` | Check & record `provider_webhook_events` before executing AI auto-replies or thread updates |
| **H3** | High | Instagram Messaging | Relies on global `INSTAGRAM_PAGE_ACCESS_TOKEN` in `process.env` rather than tenant tokens | Query and decrypt tenant-specific Page Access Token from `connected_accounts` |
| **H4** | High | Calendar Push Webhooks | Google & MS webhooks return static status without secret validation or synchronization | Validate `x-goog-channel-token` and `clientState`, resolve channel/subscription, trigger sync |
| **M1** | Medium | Encryption Service | Hardcoded development key fallback silently used if environment variables are missing | Throw fatal error in production (`NODE_ENV === 'production'`) if master key is missing |
| **M2** | Medium | Dashboard Settings UI | Static "Active" pill for Instagram without onboarding, connection status, or disconnect controls | Implement interactive Instagram account onboarding card with honest connection states |
| **M3** | Medium | Database Schema | `email_threads.conversation_id` and `lead_id` are untyped text without foreign key constraints | Add database integrity validation and compatibility constraints |

---

## 3. SAFETY AND NON-REGRESSION CONSTRAINTS

1. No working functionality from Sprints 1, 2, or 3 will be deleted or broken.
2. All regression test suites (`sprint1-verification.ts`, `sprint2-verification.ts`, `verify-journeys.ts`) must pass 100%.
3. Both simulated sandbox mode (for environments without live third-party API credentials) and live cloud paths must be supported cleanly.
4. No secrets or plaintext tokens will ever be exposed to client-side code.
5. All migrations will be verified on real PostgreSQL via PGlite WASM before any cloud readiness review.
