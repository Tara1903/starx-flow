# STARX-FLOW — RELEASE CANDIDATE BUG HUNT & SELF-REMEDIATION LOG

This document tracks all discovered defects, reproduction steps, technical root causes, implemented fixes, regression tests, and verification evidence across the continuous testing loop.

## Defect Summary

| Severity | Total Found | Fixed & Verified | Open | Blocked |
| :--- | :---: | :---: | :---: | :---: |
| **P0 — Critical** | 3 | 3 | 0 | 0 |
| **P1 — High** | 10 | 10 | 0 | 0 |
| **P2 — Medium** | 4 | 4 | 0 | 0 |
| **P3 — Low** | 0 | 0 | 0 | 0 |
| **Total** | 17 | 17 | 0 | 0 |

---

## Detailed Defect Records

### BUG-AUTH-001: Unauthenticated Access and IDOR in Knowledge Endpoints
- **Domain:** Domain A: Authentication and Accounts / Domain B: Multi-Tenant Isolation
- **Severity:** P0 — Critical
- **Affected Components / Files:** `src/app/api/knowledge/route.ts`, `src/app/api/knowledge/ingest/route.ts`, `src/store/knowledgeStore.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-a-auth.ts`).

---

### BUG-AUTH-002: Unauthenticated Access and State Mutation in Orders Endpoints
- **Domain:** Domain A: Authentication and Accounts / Domain B: Multi-Tenant Isolation
- **Severity:** P0 — Critical
- **Affected Components / Files:** `src/app/api/orders/route.ts`, `src/store/orderStore.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-a-auth.ts`).

---

### BUG-AUTH-003: Missing Role Enforcement on Business Receptionist Settings Mutation
- **Domain:** Domain A: Authentication and Accounts / Domain C: AI Receptionist Core
- **Severity:** P1 — High
- **Affected Components / Files:** `src/app/api/receptionist/settings/route.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-a-auth.ts`).

---

### BUG-AUTH-004: Case-Sensitive Bearer Prefix and Cookie Token Extraction Failures
- **Domain:** Domain A: Authentication and Accounts
- **Severity:** P2 — Medium
- **Affected Components / Files:** `src/lib/auth/serverAuth.ts`, `src/app/api/gdpr/delete/route.ts`, `src/app/api/gdpr/export/route.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-a-auth.ts`).

---

### BUG-SEC-001: Missing Tenant Ownership Verification in Conversation Message, Presence, and Update Routes (IDOR)
- **Domain:** Domain B: Multi-Tenant Isolation
- **Severity:** P0 — Critical
- **Affected Components / Files:** `src/app/api/conversations/[id]/route.ts`, `src/app/api/conversations/[id]/messages/route.ts`, `src/app/api/conversations/[id]/presence/route.ts`, `src/lib/inbox/inboxService.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-b-multitenant.ts`).

---

### BUG-AI-001: False FAQ Triggering via Unfiltered Single-Word Substring Matching
- **Domain:** Domain C: AI Receptionist Core Workflows
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/ai/provider.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-c-receptionist.ts`).

---

### BUG-AI-002: Fallback Message Promises Staff Review but Leaves Handoff Flag False
- **Domain:** Domain C: AI Receptionist Core Workflows
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/ai/provider.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-c-receptionist.ts`).

---

### BUG-AI-003: Unsanitized Delimiter Tags Enable Prompt Breakout
- **Domain:** Domain C: AI Receptionist Core Workflows / Domain N: Security
- **Severity:** P2 — Medium
- **Affected Components / Files:** `src/lib/ai/provider.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-c-receptionist.ts`).

---

### BUG-AI-004: Memory-Only Conflict Check Permits Database Double-Booking
- **Domain:** Domain C: AI Receptionist Core Workflows / Domain J: Appointments
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/ai/tools/toolExecutor.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-c-receptionist.ts`).

---

### BUG-WIDGET-001: Missing CORS Preflight OPTIONS and Origin Headers in `/api/chat`
- **Domain:** Domain F: Website Chat Widget
- **Severity:** P1 — High
- **Affected Components / Files:** `src/app/api/chat/route.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-f-widget.ts`).

---

### BUG-WIDGET-002: Host Origin Resolution in `widget.js` Uses Embedding Page Origin
- **Domain:** Domain F: Website Chat Widget
- **Severity:** P1 — High
- **Affected Components / Files:** `src/app/widget.js/route.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-f-widget.ts`).

---

### BUG-INGEST-001: IngestionGateway Target Resolution Ignores `organizationId`
- **Domain:** Domain F: Website Chat Widget / Domain D: Webhooks
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/ingestion/gateway.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-f-widget.ts`).

---

### BUG-AI-005: Inbound Email Thread Conversation Linking Overridden in AI Orchestrator
- **Domain:** Domain G & H: Email Integration & Human Handoff
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/ai/orchestrator.ts`
- **Final Status:** FIXED & VERIFIED (Regression: `tests/qa-domain-gh-email-handoff.ts`).

---

### BUG-SEC-002: Server-Side Request Forgery (SSRF) Vulnerability in Document Parser
- **Domain:** Domain N: Application Security / Domain C: Knowledge Base Ingest
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/rag/documentParser.ts`
- **Exact Reproduction Steps:**
  1. Authenticated user sends `POST /api/knowledge/ingest` with `sourceUrl: "http://169.254.169.254/latest/meta-data/"` or `"http://localhost:3000"`.
  2. `DocumentParser.parseUrl` previously only checked `http:` / `https:` protocol and attempted fetching directly.
  3. Cloud instance metadata or internal services were exposed to the parser and ingested into user-accessible vector embeddings.
- **Expected Behavior:** Ingestion of private IPs, loopback addresses, VPC subnets, and cloud metadata endpoints must be strictly blocked.
- **Actual Behavior:** No validation against private/reserved hostnames or IP ranges was present.
- **Technical Root Cause:** Missing SSRF validation filter before dispatching `fetch()`.
- **Implemented Fix:** Added `DocumentParser.isPrivateOrReservedHost` checking IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), loopback (127.0.0.0/8, ::1), cloud metadata (169.254.0.0/16), carrier-grade NAT (100.64.0.0/10), and internal TLDs (.localhost, .local, .internal).
- **Regression Test:** `tests/qa-domain-n-security.ts` (Test 1).
- **Verification Evidence:** `tests/qa-domain-n-security.ts` verified 12 distinct SSRF attack vectors blocked.
- **Final Status:** FIXED & VERIFIED.

---

### BUG-SEC-003: XSS Sanitization Bypass via Nested Quotes and Unstripped Style Tags in Email Adapter
- **Domain:** Domain N: Application Security / Domain G: Email (Resend)
- **Severity:** P1 — High
- **Affected Components / Files:** `src/lib/integrations/email/resendEmailAdapter.ts`
- **Exact Reproduction Steps:**
  1. Untrusted inbound email contains `<img src="x" onerror="alert('xss')" />` or `<a href="javascript:alert(1)">`.
  2. Old regex `on\w+\s*=\s*["'][^"']*["']` prematurely terminated on the inner single quote of `'xss'`, leaving malicious executable code in the sanitized HTML output.
  3. `<style>` tags were not stripped, enabling CSS injection / phishing overlay attacks.
  4. `javascript:` links were stripped of the `javascript:` prefix, leaving executable code blocks in href attributes.
- **Expected Behavior:** All event handlers (with any quote style), `<style>` tags, and pseudo-protocol URIs must be completely removed.
- **Actual Behavior:** Attack payload survived sanitization into inbound message body.
- **Technical Root Cause:** Overly restrictive quote regex and missing `<style>` / pseudo-protocol neutralizing replacement.
- **Implemented Fix:** Updated regex in `ResendEmailAdapter.sanitizeHtml` to cleanly remove `<style>` tags, parse single/double/unquoted event handlers (`\s*on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)`), and replace pseudo-protocol links (`javascript:`, `vbscript:`, `data:`) with safe `href="#"`.
- **Regression Test:** `tests/qa-domain-n-security.ts` (Test 2).
- **Verification Evidence:** `tests/qa-domain-n-security.ts` passed 18/18.
- **Final Status:** FIXED & VERIFIED.

---

### BUG-AI-006: Autonomous Catalog Price Queries Erroneously Return Human Handoff Action
- **Domain:** Domain C: AI Receptionist Core Workflows
- **Severity:** P2 — Medium
- **Affected Components / Files:** `src/lib/ai/provider.ts`
- **Exact Reproduction Steps:**
  1. Customer asks about a known catalog service (e.g., "How much is haircut and styling?").
  2. Fallback generator matches the service perfectly and returns the price ("Haircut & Styling: €45").
  3. However, `suggestedAction` was pre-initialized to `{ type: 'human_handoff' }` and `requiresHumanHandoff = true` and was not reset when the match succeeded.
  4. Autonomous answer was erroneously accompanied by an escalation signal to human staff.
- **Expected Behavior:** An exact match for services or business hours should set `suggestedAction = { type: 'none' }` and `requiresHumanHandoff = false`.
- **Actual Behavior:** Staff escalation triggered despite completely confident autonomous answer.
- **Technical Root Cause:** Missing action reset upon catalog match in fallback generation logic.
- **Implemented Fix:** Explicitly set `suggestedAction = { type: 'none' }` and `requiresHumanHandoff = false` whenever a catalog item or business hour inquiry is resolved.
- **Regression Test:** `tests/qa-domain-c-receptionist.ts` (Test 1).
- **Verification Evidence:** All 9 receptionist tests passed.
- **Final Status:** FIXED & VERIFIED.

---

### BUG-INGEST-002: Idempotency Key Generator Throws TypeError on Nullish Event ID
- **Domain:** Domain D, E, G, H: Ingestion & Webhooks
- **Severity:** P2 — Medium
- **Affected Components / Files:** `src/lib/ingestion/idempotency.ts`
- **Exact Reproduction Steps:**
  1. An inbound webhook payload or synthetic event arrives where `eventId` is undefined.
  2. `IdempotencyManager.buildKey(provider, eventId)` calls `eventId.trim()`.
  3. Node.js unhandled TypeError: `Cannot read properties of undefined (reading 'trim')` crashes the event handler.
- **Expected Behavior:** Ingestion layer should safely handle missing `eventId` by defaulting to an empty string or falling back safely.
- **Actual Behavior:** Uncaught exception crashes processing for that event cycle.
- **Technical Root Cause:** Missing null-coalescing check before invoking string methods on `eventId`.
- **Implemented Fix:** Added `const safeId = (eventId || '').trim();` in both `buildKey` and `clear`.
- **Regression Test:** `tests/qa-domain-gh-email-handoff.ts` & `tests/qa-domain-de-webhooks.ts`.
- **Verification Evidence:** All webhook and email idempotency tests passed cleanly.
- **Final Status:** FIXED & VERIFIED.

---
