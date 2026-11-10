# STARX-FLOW — PHASE 6.1: DEFECT REMEDIATION & ENGINEERING LOG

**Audit Date:** 2026-11-10  
**Lead Engineers:** Principal SaaS Architect & Staff Full-Stack Security Engineer  
**Scope:** Vulnerability Root Cause Analysis, Code Diff Documentation, Regression Verification  

---

## 1. Summary of Defects Remediation

During the independent verification of Phase 6, six distinct defects across database permissions, API security, sandbox integration, and payment processing were identified. All six defects were directly repaired, code-reviewed, and verified in the local workspace.

| Defect ID | Severity | Subsystem | Description | Fix Status |
|---|---|---|---|---|
| **DEF-601** | **CRITICAL** | Database / RLS | Cross-tenant lead data leakage in `011_demo_requests_and_lead_capture.sql` | **REMEDIATED** |
| **DEF-602** | **HIGH** | API Security | Missing `Content-Type: application/json` enforcement in `/api/demo` | **REMEDIATED** |
| **DEF-603** | **HIGH** | Denial-of-Service | Missing payload size limitation in `/api/demo` | **REMEDIATED** |
| **DEF-604** | **HIGH** | Abuse Prevention | Ephemeral single-container rate limiting in `/api/demo` | **REMEDIATED** |
| **DEF-605** | **MEDIUM** | User Onboarding | Web Sandbox `/setup/test` was disconnected from the actual AI pipeline | **REMEDIATED** |
| **DEF-606** | **CRITICAL** | Billing Security | Dev-mode auto-activation allowed free subscriptions in production | **REMEDIATED** |
| **DEF-607** | **CRITICAL** | Billing Security | Missing HMAC-SHA256 signature verification in `/api/billing/webhook` | **REMEDIATED** |

---

## 2. Deep-Dive Remediation Records

### DEF-601: RLS Cross-Tenant Lead Data Leakage
- **File:** `supabase/migrations/011_demo_requests_and_lead_capture.sql`
- **Root Cause:** The `SELECT` policy evaluated `organization_members.role IN ('owner', 'admin')`. In StarX-Flow, every tenant owner has `role = 'owner'` in their own organization. This granted all authenticated customers access to read all platform-wide sales demo leads.
- **Remediation:** Changed the policy to strictly verify `profiles.role = 'admin'`, restricting lead visibility exclusively to global platform administrators and the backend `service_role`.

---

### DEF-602 & DEF-603: Missing Content-Type & Payload Cap
- **File:** `src/app/api/demo/route.ts`
- **Root Cause:** Inbound POST requests were parsed with `await request.json()` without checking the `Content-Type` header or `Content-Length`, risking memory bloat from oversized payloads.
- **Remediation:**
  - Added check for `content-type.includes('application/json')` -> returns `HTTP 415`.
  - Added check for `contentLength > 50000` (50 KB max) -> returns `HTTP 413`.

---

### DEF-604: Ephemeral In-Memory Rate Limiting
- **File:** `src/app/api/demo/route.ts`
- **Root Cause:** Rate-limiting was stored purely in a module-scoped JavaScript `Map`. On Vercel, requests are routed to different serverless lambdas and cold-starts flush memory, rendering process-local rate limits ineffective against distributed abuse.
- **Remediation:** Added a Two-Tier Rate Limiting strategy:
  1. Fast in-memory circuit-breaker (checks local map).
  2. Distributed persistent check against Supabase `demo_requests` table querying count of entries matching `ip_address` in the past 10 minutes.

---

### DEF-605: Web Sandbox Mock AI Disconnection
- **File:** `src/app/setup/test/page.tsx`
- **Root Cause:** The sandbox used a static `setTimeout` with a canned template response, preventing users from testing their configured FAQs, tone, and bot logic.
- **Remediation:** Rewrote `handleSendTest` to dispatch a real `POST /api/chat` request passing `aiConfig.businessName`, `aiConfig.tone`, and `aiConfig.faqs`, with fallback logic to local FAQ matching if the network is interrupted.

---

### DEF-606: Production Billing Auto-Activation Vulnerability
- **File:** `src/app/api/billing/checkout/route.ts`
- **Root Cause:** If `STRIPE_SECRET_KEY` was missing, the checkout route automatically created an active paid subscription in the database. In a production environment without live keys, any user could upgrade their account for free.
- **Remediation:** Added a fail-closed guard:
  ```typescript
  if (process.env.NODE_ENV === 'production' && !isLiveKey) {
    return NextResponse.json({ error: 'Live billing gateway is currently undergoing scheduled maintenance.' }, { status: 503 });
  }
  ```

---

### DEF-607: Missing HMAC Signature Verification in Billing Webhook
- **File:** `src/app/api/billing/webhook/route.ts`
- **Root Cause:** The webhook route only verified regex matching on the `stripe-signature` header (`t=` and `v1=`) without calculating or verifying the cryptographic HMAC-SHA256 signature, allowing arbitrary webhook forgery.
- **Remediation:**
  1. Enforced `crypto.createHmac('sha256', webhookSecret)` calculation over `${timestamp}.${rawBody}`.
  2. Implemented 300-second replay attack tolerance check (`Math.abs(now - timestamp) > 300`).
  3. Enforced constant-time buffer comparison (`crypto.timingSafeEqual`) to eliminate timing attack vectors.
  4. Added production guard failing closed (`HTTP 503`) if webhook secret is not configured in production.

---

## 3. Regression Verification Audit

Following all code changes:
- `npm run typecheck` (`tsc --noEmit`): **Zero errors**.
- `npx tsx tests/test-demo-lead-engine.ts`: **8/8 PASSED**.
- `npx tsx tests/qa-domain-n-security.ts`: **18/18 PASSED**.
- `npm run scan:secrets`: **Zero credentials found**.
- `npm run build`: **106 static pages generated successfully**.
