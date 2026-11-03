# STARX-FLOW — SPRINT 3 INDEPENDENT ACCEPTANCE AUDIT
## Calendar, Email & Instagram Integrations Verification

**Audit Date:** November 2, 2026  
**Auditor:** Principal Software Architect, Application Security Auditor & SaaS Integration Reliability Engineer  
**Audit Target:** StarX-Flow Phase 4B.5 — Sprint 3 Implementation  
**Git Branch Inspected:** `remediation/phase-4b42-security` (Commit HEAD)  
**Database Migrations Inspected:** `001_initial_schema.sql` through `005_external_integrations_and_sync.sql`  
**Test Suites Inspected:** `tests/sprint3-verification.ts`, `tests/real-postgres-verification.ts`, `tests/sprint1-verification.ts`, `tests/sprint2-verification.ts`, `tests/verify-journeys.ts`  

---

## 1. EXECUTIVE VERDICT

### **AUDIT DECISION: NOT APPROVED (CRITICAL FIXES REQUIRED)**

While Sprint 3 demonstrates substantial architectural progress—including AES-256-GCM token encryption, clean provider adapter abstractions, Migration 005 schema creation with `FORCE ROW LEVEL SECURITY`, and zero TypeScript compilation errors—an exhaustive code and security inspection has revealed **three Critical Vulnerabilities (Severity: Critical)**, **four High-Priority Reliability Deficiencies (Severity: High)**, and **two Architectural Multi-Tenant Flaws** that must be remediated before this release can be safely deployed to live European business customers.

### Summary of Audit Findings
1. **Critical Vulnerability (CSRF / Account Takeover):** The OAuth `state` parameter in Google and Microsoft authorization flows is an unsigned base64 JSON string lacking HMAC cryptographic signature or session-cookie binding. An attacker can forge the `organizationId` payload to hijack victim calendar integrations.
2. **Critical Vulnerability (Cross-Tenant Contamination):** Both the Resend Email webhook (`/api/integrations/email/webhook`) and the Meta Instagram webhook (`/api/integrations/instagram/webhook`) lack destination-tenant routing logic and silently fall back to `organizationId = 'org-default'`. Real customer inquiries will be assigned to a shared dummy tenant, leaking customer CRM records across organizational boundaries.
3. **Critical Defect (Serverless Ephemeral State Loss):** The Meta 24-hour messaging window tracker (`customerLastInboundMap`) is held in an in-memory JavaScript `Map`. Across Vercel serverless functions, state is not shared between lambda instances; subsequent outbound replies will fail or be blocked incorrectly.
4. **High-Priority Defect (Broken External Calendar Cancellation):** When appointments are cancelled, `CalendarSyncService` hardcodes `` `gcal-evt-${appointmentId}` `` instead of querying the `external_calendar_events` table for the provider's real event ID, leaving ghost bookings permanently blocking customer and staff schedules.
5. **High-Priority Defect (Missing Email Webhook Idempotency):** `ResendEmailAdapter.processInboundWebhook` does not query or insert into `provider_webhook_events`, allowing duplicate webhook retries to trigger multiple AI workflows and duplicate CRM interactions.
6. **Integration Fidelity Reality Check:** 100% of external API calls in `tests/sprint3-verification.ts` were executed against internal sandbox mocks/stubs. Zero packets were transmitted to Google, Microsoft, Resend, or Meta APIs, and database tests ran against PGlite WASM rather than a live Supabase cloud environment.

---

## 2. WORKSTREAM-BY-WORKSTREAM ASSESSMENT

| Workstream ID | Epic Name | Story Points | Implementation Status | Integration Test Status | Audit Assessment |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **WS-06** | Google & Outlook Calendar | 8 SP | Implemented (Adapter + Sync Engine) | 100% Simulated / Stubbed | **FAILED** (Unsigned OAuth state, Broken Cancellation, Inactive Webhooks) |
| **WS-07** | Resend Email (Inbound / Outbound) | 6 SP | Implemented (Adapter + Svix HMAC) | 100% Simulated / Stubbed | **FAILED** (Unrouted Webhook defaults to `org-default`, Missing Idempotency) |
| **WS-08** | Meta Instagram Messaging | 6 SP | Implemented (Adapter + Meta HMAC) | 100% Simulated / Stubbed | **FAILED** (Unrouted Webhook defaults to `org-default`, Ephemeral RAM Window) |

---

## 3. VERIFIED IMPLEMENTATION CLAIMS

The following architectural claims from the Sprint 3 Implementation Report have been verified against actual source code:

1. **AES-256-GCM Authenticated Encryption at Rest:**
   - [`src/lib/security/encryption.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/security/encryption.ts) correctly implements `aes-256-gcm` using a 96-bit random IV (`crypto.randomBytes(12)`), 128-bit authentication tag, and SHA-256 key derivation.
   - Versioned ciphertext format `enc:v1:<iv>:<tag>:<ciphertext>` prevents plaintext secret exposure.
2. **Internal Note Privacy Gate:**
   - Programmatically enforced at both adapter dispatch points ([`resendEmailAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/email/resendEmailAdapter.ts#L61) and [`instagramAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/instagram/instagramAdapter.ts#L109)) and API endpoints. Messages with `is_internal: true` immediately throw a security violation.
3. **Database Migration 005 DDL & Engine Verification:**
   - [`supabase/migrations/005_external_integrations_and_sync.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/005_external_integrations_and_sync.sql) successfully created with all 6 tables, cascade delete constraints, and `FORCE ROW LEVEL SECURITY`.
   - Verified on real PostgreSQL engine (PGlite WASM) with 22/22 passing assertions.
4. **Svix & Meta Cryptographic Signature Verification:**
   - `ResendEmailAdapter.verifyWebhookSignature` implements Svix HMAC-SHA256 signature verification with a 5-minute replay attack tolerance window.
   - `InstagramAdapter.verifySignature` implements Meta `x-hub-signature-256` HMAC validation with `crypto.timingSafeEqual`.
5. **Zod Validation & AI Tool Availability Cross-Checking:**
   - [`src/lib/ai/tools/toolExecutor.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/tools/toolExecutor.ts) `checkCalendarAvailability` successfully aggregates external busy windows to prevent double-booking.
6. **Zero TypeScript Regressions:**
   - `npx tsc --noEmit` exited code 0 across the entire repository.

---

## 4. UNVERIFIED & SIMULATED CLAIMS

The following claims were stated in the implementation report or planning specifications, but inspection reveals they are either purely simulated or incomplete:

1. **"Bi-directional Calendar Sync via Push Webhooks":**
   - **Inspection Reality:** [`src/app/api/integrations/google/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/google/webhook/route.ts) and [`src/app/api/integrations/microsoft/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/microsoft/webhook/route.ts) merely return `{ status: 'received' }`. They do NOT query delta/sync tokens, do NOT fetch modified events, and do NOT update the database.
   - Furthermore, there is no code to register or renew Google channel notifications or Microsoft Graph subscriptions (which expire in 3 to 30 days).
2. **"Real Provider Delivery & Interoperability":**
   - **Inspection Reality:** In `tests/sprint3-verification.ts`, all adapter calls used simulated codes (`simulated_gcal_code_123`, `simulated_ms_code_456`, `re_simulated`, `ig_simulated`). Zero HTTP requests were made to Google APIs, Microsoft Graph, Resend, or Meta.
3. **"Supabase Cloud Database Verification":**
   - **Inspection Reality:** Verification was executed against local PGlite (in-process WASM). Supabase Cloud environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) were not set, and migrations 001–005 have not been applied to a hosted Supabase PostgreSQL instance.

---

## 5. CRITICAL VULNERABILITIES (SEVERITY: CRITICAL)

### C1. Unsigned OAuth State Parameter (CSRF & Cross-Tenant Account Hijacking)
- **Source Location:**
  - [`src/app/api/integrations/google/oauth/authorize/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/google/oauth/authorize/route.ts#L18-L24)
  - [`src/app/api/integrations/google/oauth/callback/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/google/oauth/callback/route.ts#L18-L22)
  - Same pattern in `microsoft/oauth/authorize` and `microsoft/oauth/callback`.
- **Vulnerability Mechanism:**
  ```ts
  // Authorize endpoint:
  const state = Buffer.from(
    JSON.stringify({ organizationId, timestamp: Date.now(), nonce: Math.random().toString(36).slice(2, 8) })
  ).toString('base64');

  // Callback endpoint:
  const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
  if (decoded.organizationId) organizationId = decoded.organizationId;
  ```
  The state is simply unkeyed base64-encoded JSON. It is not signed with an HMAC secret and not bound to a cryptographically secure HttpOnly session cookie.
- **Exploitation Impact:** An attacker can initiate an OAuth authorization, intercept or craft the callback URL, and replace `organizationId` with a target victim's organization UUID. When the callback is completed, the attacker's calendar is bound to the victim tenant (or vice-versa), granting unauthorized access to the victim organization's appointments, customer schedule data, and slot booking rules.
- **Required Remediation:** Sign the `state` parameter using HMAC-SHA256 with `ENCRYPTION_SECRET_KEY` (e.g. `state = payload + '.' + hmac(payload)`), or store a random state nonce in an encrypted, short-lived HttpOnly session cookie and verify it in the callback.

---

### C2. Webhook Tenant Confusion (Silent Defaulting to `'org-default'`)
- **Source Location:**
  - [`src/app/api/integrations/email/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/email/webhook/route.ts#L21)
  - [`src/lib/integrations/email/resendEmailAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/email/resendEmailAdapter.ts#L267)
  - [`src/app/api/integrations/instagram/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/instagram/webhook/route.ts#L42)
  - [`src/lib/integrations/instagram/instagramAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/instagram/instagramAdapter.ts#L195)
- **Vulnerability Mechanism:**
  The public webhook endpoints do not pass an `organizationId` parameter to the adapter processors:
  ```ts
  // In email webhook route:
  const result = await adapter.processInboundWebhook(payload); // No organizationId!

  // In resendEmailAdapter.ts:
  const orgId = options?.organizationId || 'org-default';

  // In instagramAdapter.ts:
  const orgId = options?.organizationId || 'org-default';
  ```
- **Exploitation Impact:** When real emails or Instagram direct messages arrive from external customers, neither adapter resolves the destination tenant from the payload (e.g. recipient email address, domain, or Meta Page ID). Every inbound customer inquiry is assigned to `'org-default'`. As a result:
  - Customer records for different local businesses are merged into the same dummy tenant.
  - Staff from one tenant cannot see inbound inquiries meant for their business.
  - Multi-tenant data isolation is completely broken on public webhooks.
- **Required Remediation:**
  - For Email: Extract `payload.data.to` (or custom inbound address `inbox+{orgId}@starx-flow.com`) and query `organizations` or `connected_accounts` to resolve the true `organizationId`. If `in_reply_to` matches an existing record in `email_threads`, retrieve `organization_id` directly from `email_threads`.
  - For Instagram: Extract `entry[].id` (Meta Page/IGBA ID) and query `connected_accounts` (`WHERE provider = 'instagram' AND account_identifier = entry.id`) to resolve the destination `organizationId`. Reject unmapped payloads with 404/400.

---

### C3. Ephemeral Serverless In-Memory State for Meta 24-Hour Window
- **Source Location:** [`src/lib/integrations/instagram/instagramAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/instagram/instagramAdapter.ts#L28)
- **Vulnerability Mechanism:**
  ```ts
  private static customerLastInboundMap = new Map<string, number>(); // igsid -> timestamp
  ```
  The Meta 24-hour customer service window timestamp is stored in an in-memory `Map`.
- **Exploitation Impact:** In Vercel or any serverless deployment, memory is isolated between lambda instances and purged upon container recycle. When an inbound DM arrives at lambda container A, container A records the timestamp. When an agent or automated reply is triggered from lambda container B, container B has an empty `customerLastInboundMap` and erroneously throws:
  `Meta Messaging Policy Violation: 24-hour messaging window has elapsed.`
  This breaks outbound customer replies in production.
- **Required Remediation:** Persist the interaction timestamp in PostgreSQL (e.g. `channel_identities.last_interaction_at` or `conversations.last_message_at`) rather than an in-memory Map.

---

## 6. HIGH-PRIORITY ISSUES (SEVERITY: HIGH)

### H1. Broken External Calendar Cancellation (`gcal-evt-${appointmentId}` Mismatch)
- **Source Location:** [`src/lib/integrations/calendar/calendarSyncService.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/calendar/calendarSyncService.ts#L356)
- **Defect:** `cancelExternalAppointment` invokes:
  ```ts
  await adapter.deleteEvent(conn.accessToken, conn.externalCalendarId, `gcal-evt-${appointmentId}`);
  ```
  However, real Google and Microsoft APIs generate opaque IDs (e.g. `c0abc123...` or `AAMkADk...`), which `syncAppointmentToExternal` saves in `external_calendar_events.external_event_id`. Because `cancelExternalAppointment` does not query the `external_calendar_events` table for the real `external_event_id`, all cancellation requests to external calendars will fail with 404 Not Found, leaving canceled appointments as active busy blocks in external calendars.
- **Remediation:** Query `external_calendar_events` by `appointment_id` and `organization_id` to retrieve the actual `external_event_id` before calling `deleteEvent`.

---

### H2. Missing Inbound Email Webhook Idempotency Check
- **Source Location:** [`src/lib/integrations/email/resendEmailAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/email/resendEmailAdapter.ts#L257-L290)
- **Defect:** Line 257 states `1. Idempotency verification`, but the code never queries or inserts into `provider_webhook_events`. While `instagramAdapter.ts` implemented this check, `resendEmailAdapter.ts` omitted it entirely. Duplicate webhook deliveries from Resend will cause duplicate message creation, redundant CRM identity queries, and multiple AI auto-replies.
- **Remediation:** Compute `payload_hash`, query `provider_webhook_events` for `(provider = 'resend', event_id = payload.data.message_id || payload.data.email_id)`, and return early if already processed.

---

### H3. Global Single-Tenant Environment Variable for Outbound Instagram DMs
- **Source Location:** [`src/lib/integrations/instagram/instagramAdapter.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/integrations/instagram/instagramAdapter.ts#L31-L35)
- **Defect:** `this.pageAccessToken` reads directly from `process.env.INSTAGRAM_PAGE_ACCESS_TOKEN`. In a multi-tenant platform with hundreds of European local businesses, each business connects their own Instagram Business Page. A single global environment variable cannot support multi-tenant outbound Instagram messaging.
- **Remediation:** Outbound Instagram dispatching must retrieve the decrypted Page Access Token from `connected_accounts` using the caller's `organizationId`:
  `SELECT encrypted_credentials FROM connected_accounts WHERE organization_id = $1 AND provider = 'instagram'`.

---

### H4. Calendar Webhooks Lack Secret Validation and Action Logic
- **Source Location:**
  - [`src/app/api/integrations/google/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/google/webhook/route.ts)
  - [`src/app/api/integrations/microsoft/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/integrations/microsoft/webhook/route.ts)
- **Defect:** Google push webhook does not validate `x-goog-channel-token`, and Microsoft webhook does not validate `clientState`. Furthermore, neither webhook initiates any synchronization task or delta query; they return status 200/202 without performing any work.
- **Remediation:** Implement channel token validation, look up the `connected_accounts` row for the channel ID, and trigger a background synchronization task using `sync_token`.

---

## 7. MEDIUM-PRIORITY ISSUES (SEVERITY: MEDIUM)

### M1. Insecure Fallback Master Encryption Key
- **Source Location:** [`src/lib/security/encryption.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/security/encryption.ts#L29)
- **Defect:** `CredentialEncryption.getKey()` includes `'starx-flow-dev-master-encryption-secret-key-32'` as a hardcoded fallback if `ENCRYPTION_KEY` and other secrets are undefined. In a production build, if environment variables are missing, credentials would be encrypted with a publicly exposed key.
- **Remediation:** Enforce that in `NODE_ENV === 'production'`, missing master encryption keys throw an unrecoverable startup exception.

### M2. Static UI Without Instagram Account Onboarding Flow
- **Source Location:** [`src/screens/dashboard/SettingsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/SettingsSection.tsx#L367-L380)
- **Defect:** While Google and Microsoft calendar cards feature dynamic "Connect" and "Disconnect" actions, the Instagram card displays a static "Active" pill without an OAuth or Page access token onboarding mechanism.

### M3. Missing Foreign Key Constraints on `email_threads`
- **Source Location:** [`supabase/migrations/005_external_integrations_and_sync.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/005_external_integrations_and_sync.sql#L73-L74)
- **Defect:** `conversation_id VARCHAR(255)` and `lead_id VARCHAR(255)` lack foreign key references to `conversations(id)` and `leads(id)`.

---

## 8. TEST QUALITY ASSESSMENT

| Test Suite | Total Assertions | Mocking Level | Genuine Coverage | Weaknesses Identified |
| :--- | :---: | :---: | :---: | :--- |
| `tests/sprint3-verification.ts` | 24 | High (100% stubs) | Good internal unit coverage | Uses fake tokens (`simulated_...`), tests in-memory maps instead of real network or database. |
| `tests/real-postgres-verification.ts` | 22 | None (Real PGlite) | Excellent DDL & RLS validation | Tests against PGlite WASM rather than hosted Supabase Cloud. |
| `tests/sprint1-verification.ts` | 5 | Moderate | Good regression check | Ingestion and RAG run with local embeddings. |
| `tests/sprint2-verification.ts` | 6 | Moderate | Good regression check | Relies on in-memory mocks when Supabase env vars are missing. |
| `tests/verify-journeys.ts` | 6 | Moderate | Good end-to-end journey check | End-to-end flows pass with mock external services. |

---

## 9. ACTUAL PROVIDER INTEGRATION STATUS

To ensure complete commercial transparency, the table below distinguishes real external API execution from simulated sandbox execution:

| Provider | Workstream | Live Credentials Configured | Live API Network Calls Tested | Sandbox Mode Working | Status Label |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Google Calendar** | WS-06 | No | No (0 calls) | Yes | `IMPLEMENTED, SANDBOX ONLY` |
| **Microsoft Outlook** | WS-06 | No | No (0 calls) | Yes | `IMPLEMENTED, SANDBOX ONLY` |
| **Resend Email** | WS-07 | No | No (0 calls) | Yes | `IMPLEMENTED, SANDBOX ONLY` |
| **Meta Instagram DM**| WS-08 | No | No (0 calls) | Yes | `IMPLEMENTED, SANDBOX ONLY` |

---

## 10. SUPABASE CLOUD VERIFICATION STATUS

- **Hosted Supabase Project:** Not connected in current dev environment (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not set).
- **PostgreSQL DDL & RLS Verification:** Successfully verified using `@electric-sql/pglite` (WASM Postgres engine v16).
- **Status:** **PENDING CLOUD MIGRATION RUNNER**. Migration 005 is syntactically sound and passes RLS on PGlite, but must be applied to the remote Supabase project during production provisioning.

---

## 11. REQUIRED REMEDIATION ROADMAP

Before Sprint 4 or any commercial production deployment, the following 6 remediation items must be completed:

1. **Fix OAuth State CSRF Protection:** Cryptographically sign the OAuth `state` parameter with HMAC-SHA256 and bind it to a secure session cookie.
2. **Implement Destination Tenant Routing on Webhooks:**
   - In `resendEmailAdapter.ts`: Route inbound emails by resolving recipient email address or `email_threads.organization_id`.
   - In `instagramAdapter.ts`: Route inbound DMs by matching Meta Page/IGBA ID against `connected_accounts`.
3. **Persist Meta 24-Hour Messaging Window:** Migrate `customerLastInboundMap` from in-memory RAM to PostgreSQL (`channel_identities.last_interaction_at` or `conversations`).
4. **Fix Calendar Cancellation Event ID Lookup:** Update `CalendarSyncService.cancelExternalAppointment` to query `external_calendar_events` for the true external provider event ID.
5. **Implement Webhook Idempotency in Resend Adapter:** Query and insert `provider_webhook_events` for inbound email events.
6. **Per-Tenant Instagram Credentials:** Update `InstagramAdapter.sendMessage` to fetch the tenant's encrypted Page Access Token from `connected_accounts`.

---

## 12. SPRINT 4 READINESS

- **Decision:** **BLOCKED PENDING SECURITY REMEDIATION GATE (PHASE 4B.5.2).**
- Sprint 4 (Voice Calling, Automation Engine, Analytics) must NOT begin until the critical security vulnerabilities and multi-tenant routing flaws identified above are remediated.
