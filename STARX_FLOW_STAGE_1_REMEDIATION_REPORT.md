# STARX FLOW — STAGE 1 CRITICAL PRE-LAUNCH REMEDIATION REPORT
## Resolution of P0-1 (Billing Entitlement Unification) & P0-2 (WhatsApp Webhook Security)

**Execution Date:** 2026-11-13  
**Target Environment:** Local Release Candidate (`https://starx-flow.runs-on.dev`, Branch: `feat/master-redesign`, Commit: `3215324`)  
**Status:** **BOTH P0 REMEDIATIONS IMPLEMENTED AND VERIFIED LOCALLY** (Deployment Not Performed)  

---

### Executive Summary

In accordance with the Independent Flagship Product Benchmark & Launch Readiness Audit, the two critical P0 findings that blocked commercial launch have been thoroughly remediated, tested, and verified locally.

1. **P0-1 — Billing Plan & Entitlement Discrepancy (RESOLVED):**
   - Established a single, typed, canonical plan registry in `src/lib/plans.ts`.
   - Unified plan identifiers to **Starter ($29/mo)**, **Growth ($59/mo)**, and **Pro ($99/mo)** across public pricing, Polar SDK configurations, billing store, usage metering services, and dashboard settings.
   - Eliminated legacy unmapped prices ($47, $97, $297) and prevented privilege escalation through safe plan normalization (`normalizePlanId`).
   - Verified via 29/29 dedicated automated tests in `tests/test-billing-entitlements.ts` and 9/9 in `tests/test-polar-billing.ts`.

2. **P0-2 — WhatsApp Webhook Signature Enforcement (RESOLVED):**
   - Completely eradicated the development authentication bypass in `src/lib/ingestion/adapters/whatsappAdapter.ts`.
   - Implemented strict fail-closed enforcement when `WHATSAPP_APP_SECRET` or `META_APP_SECRET` is missing.
   - Enforced constant-time cryptographic HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) against exact raw request bytes.
   - Protected against malformed headers, tampered payloads, and unauthenticated POST requests across both `/api/whatsapp/webhook` and `/api/webhooks/whatsapp`.
   - Preserved Meta's legitimate GET verification handshake (`hub.challenge`).
   - Verified via 13/13 dedicated automated tests in `tests/test-whatsapp-webhook-security.ts`.

---

## 1. Initial Issues & Root Cause Analysis

### P0-1: Billing Discrepancy Root Causes

| System Layer | Pre-Remediation State | Root Cause & Failure Mode |
| :--- | :--- | :--- |
| **Public Pricing** (`PricingClient.tsx`) | Starter ($29), Growth ($59), Pro ($99) | Advertised plans did not match internal SDK or billing store definitions. |
| **Polar SDK Mapping** (`polar.ts`) | `starter` ($29), `pro` ($59), `enterprise` ($99) | Product ID for $59 was keyed to `pro` instead of `growth`; $99 was keyed to `enterprise`. |
| **Billing Store** (`billingStore.ts`) | `free` ($0), `starter` ($47), `pro` ($97), `enterprise` ($297) | Legacy hardcoded Stripe prices remained in active Zustand store, creating entitlement mismatches. |
| **Usage Metering** (`usageService.ts`) | `starter` (€49), `pro` (€97, named "Growth Plan"), `enterprise` (€297) | Quota limits checked against outdated €49/€97/€297 tier definitions. |
| **Checkout API** (`/api/billing/checkout`) | Validated only `starter`, `pro`, `enterprise` | Selecting marketed "Growth" plan threw 400 Bad Request error. |

*Impact:* Purchasing "Growth" ($59) initiated Polar checkout for product `pro`. On webhook delivery, `billingStore.ts` applied legacy $97 Pro limits rather than Growth limits, leading to entitlement leakage and customer confusion.

### P0-2: WhatsApp Webhook Security Root Causes

| Vulnerability Location | Pre-Remediation Code | Vulnerability Mechanism |
| :--- | :--- | :--- |
| `src/lib/ingestion/adapters/whatsappAdapter.ts` (L18-21) | `if (!appSecret) return { authorized: true };` | **Fail-Open Bypass:** If `META_APP_SECRET` was not populated in production, all unsigned inbound POST requests were admitted as authorized. |
| Signature Parsing (L37-46) | `crypto.subtle.verify` without length checks | Malformed headers could throw uncaught exceptions; lacked timing-safe comparison on raw string digests. |
| Webhook Route (`/api/whatsapp/webhook`) | Lacked malformed non-JSON payload guarding | Raw body parsing did not catch syntax errors before adapter processing. |

*Impact:* Malicious actors could forge customer messages, trigger unauthenticated AI receptionist function executions, or manipulate CRM lead records by submitting unsigned POST payloads.

---

## 2. Technical Remediation Implementation

### 2.1 Canonical Plan Registry (`src/lib/plans.ts`)

Created a centralized, immutable source of truth defining all active subscription plans, pricing, quotas, and Polar mappings:

```typescript
export type PlanTier = 'free' | 'starter' | 'growth' | 'pro';

export const CANONICAL_PLANS: Record<PlanTier, CanonicalPlan> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    priceInCents: 0,
    interval: 'month',
    currency: 'USD',
    limits: { /* 50 conversations, 100 contacts, 1 calendar, 2 workflows */ }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceInCents: 2900,
    interval: 'month',
    currency: 'USD',
    polarProductId: POLAR_PRODUCT_IDS.starter,
    limits: { /* 500 conversations, 1,000 contacts, 3 calendars, 10 workflows, 60 voice mins */ }
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 59,
    priceInCents: 5900,
    interval: 'month',
    currency: 'USD',
    popular: true,
    polarProductId: POLAR_PRODUCT_IDS.growth,
    limits: { /* 5,000 conversations, 5,000 contacts, 10 calendars, 50 workflows, 120 voice mins */ }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    priceInCents: 9900,
    interval: 'month',
    currency: 'USD',
    polarProductId: POLAR_PRODUCT_IDS.pro,
    limits: { /* 25,000 conversations, 25,000 contacts, 25 calendars, unlimited workflows, 600 voice mins */ }
  }
};
```

#### Safe Plan Normalization Function
```typescript
export function normalizePlanId(rawPlanId?: string | null): PlanTier {
  if (!rawPlanId) return 'free';
  const cleaned = rawPlanId.trim().toLowerCase();
  if (cleaned === 'starter') return 'starter';
  if (cleaned === 'growth') return 'growth';
  if (cleaned === 'pro') return 'pro';
  if (cleaned === 'enterprise') return 'pro'; // Legacy alias gracefully mapped to Pro ($99)
  return 'free'; // Safe fallback prevents elevation of privilege
}
```

### 2.2 Polar SDK Alignment (`src/lib/polar.ts`)
- Re-aligned `POLAR_PLANS` to `starter` ($29), `growth` ($59), and `pro` ($99).
- Maintained a backward-compatible alias `enterprise` $\rightarrow$ `pro` ($99).
- Updated `POLAR_PRODUCT_TO_PLAN` reverse lookup to map `POLAR_PRODUCT_IDS.growth` to `'growth'`.

### 2.3 Store & Metering Synchronization
- **`src/store/billingStore.ts`:** Replaced legacy $47/$97/$297 plan definitions with canonical values ($29 Starter, $59 Growth, $99 Pro, $0 Free). Wrapped all DB row conversions in `normalizePlanId`.
- **`src/lib/usage/usageService.ts`:** Synchronized `CONFIGURABLE_PLANS` with canonical quotas and pricing.
- **`src/app/api/billing/checkout/route.ts`:** Validates requested plans against `isPaidPlan(normalizedPlan)` (`starter`, `growth`, `pro`), rejecting unauthorized or legacy plan keys with HTTP 400.
- **`src/screens/dashboard/SettingsSection.tsx`:** Updated upgrade buttons to `Upgrade to Growth ($59/mo)` and `Upgrade to Pro ($99/mo)` with accurate inclusion summaries.
- **`src/app/pricing/PricingClient.tsx`:** Directly bound to `CANONICAL_PLANS`.

### 2.4 WhatsApp Webhook Security (`src/lib/ingestion/adapters/whatsappAdapter.ts`)
Implemented constant-time HMAC-SHA256 verification with strict fail-closed behavior:

```typescript
async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
  const signature = request.headers.get('x-hub-signature-256');
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

  // 1. Mandatory Application Secret check (Fail Closed)
  if (!appSecret || typeof appSecret !== 'string' || appSecret.trim() === '') {
    console.error('[WhatsApp Webhook Security] Fail-closed: WHATSAPP_APP_SECRET is not configured on server.');
    return { authorized: false, reason: 'Webhook verification secret not configured (fail closed)' };
  }

  // 2. Mandatory Signature Header check
  if (!signature || typeof signature !== 'string') {
    return { authorized: false, reason: 'Missing x-hub-signature-256 header' };
  }

  // 3. Signature Format Validation (Meta format: "sha256=<64-char-hex>")
  const trimmedSig = signature.trim();
  if (!trimmedSig.startsWith('sha256=')) {
    return { authorized: false, reason: 'Malformed signature header: missing sha256= prefix' };
  }

  const providedHex = trimmedSig.slice(7).trim();
  if (providedHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(providedHex)) {
    return { authorized: false, reason: 'Malformed signature header: invalid hex digest length or characters' };
  }

  // 4. Constant-Time HMAC-SHA256 Signature Verification
  try {
    const expectedHex = crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
    const providedBuffer = Buffer.from(providedHex.toLowerCase(), 'hex');
    const expectedBuffer = Buffer.from(expectedHex.toLowerCase(), 'hex');

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { authorized: false, reason: 'Invalid HMAC signature' };
    }

    return { authorized: true };
  } catch (err: any) {
    return { authorized: false, reason: `Signature verification exception: ${err.message}` };
  }
}
```

- Added dual route alias `src/app/api/webhooks/whatsapp/route.ts` to guarantee that incoming webhooks directed to either `/api/whatsapp/webhook` or `/api/webhooks/whatsapp` are authenticated identically.

---

## 3. Files Changed and Created

| File Path | Type | Action Summary |
| :--- | :---: | :--- |
| `src/lib/plans.ts` | **New** | Authoritative canonical plan registry, types, quotas, and normalization. |
| `src/lib/polar.ts` | **Modified** | Aligned Polar plans and product mapping to `starter` ($29), `growth` ($59), `pro` ($99). |
| `src/store/billingStore.ts` | **Modified** | Aligned `PLANS` with canonical pricing; eliminated legacy $47/$97 prices; normalized plan IDs. |
| `src/lib/usage/usageService.ts` | **Modified** | Synchronized `CONFIGURABLE_PLANS` with canonical plan quotas. |
| `src/app/api/billing/checkout/route.ts` | **Modified** | Enforced validation against canonical paid plans (`starter`, `growth`, `pro`). |
| `src/lib/polarWebhookHandler.ts` | **Modified** | Added `normalizePlanId` handling on incoming Polar webhook subscriptions and orders. |
| `src/screens/dashboard/SettingsSection.tsx` | **Modified** | Updated current tier label and upgrade actions to Growth ($59/mo) and Pro ($99/mo). |
| `src/app/pricing/PricingClient.tsx` | **Modified** | Directly bound marketing pricing cards to `CANONICAL_PLANS`. |
| `public/llms.txt` | **Modified** | Updated commercial pricing disclosure to Starter ($29), Growth ($59), Pro ($99). |
| `src/lib/ingestion/adapters/whatsappAdapter.ts`| **Modified** | Eradicated dev bypass; enforced fail-closed HMAC-SHA256 with `crypto.timingSafeEqual`. |
| `src/app/api/whatsapp/webhook/route.ts` | **Modified** | Hardened against non-JSON payloads and adapter unavailability; preserved GET challenge. |
| `src/app/api/webhooks/whatsapp/route.ts` | **New** | Route alias ensuring identical fail-closed verification. |
| `tests/test-billing-entitlements.ts` | **New** | 29 dedicated automated tests for canonical plans, Polar mapping, and quota enforcement. |
| `tests/test-whatsapp-webhook-security.ts` | **New** | 13 dedicated automated tests for fail-closed security, timing-safe checks, and GET challenge. |
| `tests/test-polar-billing.ts` | **Modified** | Updated tier assertions to verify `starter`, `growth`, and `pro`. |

---

## 4. Verification & Automated Test Results

All automated test suites, typechecks, and production builds were executed locally and passed with zero errors:

| Verification Suite | Target | Result | Status |
| :--- | :--- | :---: | :---: |
| **`test-billing-entitlements.ts`** | Canonical plans, Polar maps, store sync, normalization, server quotas | **29/29 Passed** | ✅ Verified |
| **`test-whatsapp-webhook-security.ts`** | HMAC signatures, fail-closed behavior, tampered payloads, GET challenge | **13/13 Passed** | ✅ Verified |
| **`test-polar-billing.ts`** | Polar checkout security, portal auth, product lookup, webhook verification | **9/9 Passed** | ✅ Verified |
| **`test:security`** | Unauthenticated 401s, RBAC 403s, tenant boundary, secret scrubbing | **20/20 Passed** | ✅ Verified |
| **`test:integrity`** | Idempotency keys, retry coalescing, empty states | **8/8 Passed** | ✅ Verified |
| **`test:seo`** | Canonical URLs, sitemap, robots.txt, llms.txt, Schema.org graph | **22/22 Passed** | ✅ Verified |
| **`scan:secrets`** | 638 tracked files scanned for exposed credentials | **0 Secrets Found** | ✅ Verified |
| **`audit:design`** | 225 UI source files scanned for design, token, and cursor consistency | **0 Violations** | ✅ Verified |
| **`typecheck` (`tsc --noEmit`)** | Full codebase TypeScript compilation | **0 Errors** | ✅ Verified |
| **`build` (`next build --webpack`)** | Next.js 16 production bundle & SSG prerender (115 pages) | **Exit Code 0** | ✅ Verified |

---

## 5. Database & Migration Assessment

- **Database Table Structure:** The `subscriptions` table utilizes `plan_id text` and the `profiles` table utilizes `plan text`. No rigid PostgreSQL enum constraints exist on plan names.
- **Migration Requirement:** **No database schema migration was necessary.** The existing tables seamlessly accept `'starter'`, `'growth'`, and `'pro'`.
- **Historical Records Safety:** The `normalizePlanId` function maps legacy `'enterprise'` subscriptions directly to the `'pro'` tier without altering historical row IDs.

---

## 6. Production Deployment Prerequisites

Before deploying this release candidate to production Vercel:

1. **Polar Product Catalog Environment Variables:**
   Ensure the following environment variables are configured in the Vercel Production Environment:
   - `POLAR_PRODUCT_STARTER`: UUID of Starter product ($29/mo) in Polar Dashboard.
   - `POLAR_PRODUCT_GROWTH`: UUID of Growth product ($59/mo) in Polar Dashboard.
   - `POLAR_PRODUCT_PRO`: UUID of Pro product ($99/mo) in Polar Dashboard.
   - `POLAR_WEBHOOK_SECRET`: Polar webhook signing secret.
2. **Meta WhatsApp Cloud API Secrets:**
   Ensure the following environment variables are configured in Vercel:
   - `WHATSAPP_APP_SECRET` (or `META_APP_SECRET`): The Meta App Secret used for HMAC-SHA256 signature verification.
   - `META_VERIFY_TOKEN`: The webhook handshake verification token.

---

## 7. Rollback Considerations

- In the unlikely event that a rollback is required, all changes are strictly additive or standardizing. Reverting to base commit `3215324` restores previous files without any database schema corruption or lost state.

---

*Report prepared by Google Antigravity Senior Engineering Team.*  
*Stage 1 Critical Pre-Launch Remediation: COMPLETE.*
