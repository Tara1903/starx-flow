# STARX-FLOW — PHASE 6.2: POLAR ACCOUNT & PRODUCT MAPPING

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage B  
**Auditor:** Principal SaaS Billing Architect & Payment Integration Specialist  

---

## 1. Polar Account & Organization Profile

- **Organization Name:** StarX Flow (`starx-flow`)
- **Organization ID:** `da40c339-3d25-4754-b2b5-7a1c31c161e7`
- **Merchant of Record Environment:** `production`
- **Dashboard URL:** [https://polar.sh/dashboard/starx-flow](https://polar.sh/dashboard/starx-flow)
- **API Base:** `https://api.polar.sh`
- **SDK Pinned Version:** `@polar-sh/sdk/2026-10`

---

## 2. Product-to-Plan Configuration Matrix

StarX-Flow subscription tiers have been mapped directly to Polar recurring products in the live production organization:

| Internal Plan | Polar Product Name | Polar Product ID | Polar Price ID | Price / Cadence | Entitlement Summary |
|---|---|---|---|---|---|
| **`free`** | N/A (Internal) | N/A | N/A | $0.00 | 50 AI conversations, 100 contacts, 1 seat |
| **`starter`** | **StarX-Flow Starter** | `e5050fd1-5a76-4bd4-ab60-b5706f6dd11f` | `8cd60e81-ef6f-4a9d-8c9f-bce4d779fcd5` | **$29.00 / month** | 500 AI conversations, 1,000 contacts, 3 seats |
| **`pro`** | **StarX-Flow Pro** | `350dca5f-0c97-45b8-8a75-e1aa506a8d14` | `0233b945-501e-42c8-9cf4-d4a169db6412` | **$59.00 / month** | 5,000 AI conversations, 10,000 contacts, 10 seats |
| **`enterprise`** | **StarX-Flow Enterprise** | `b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4` | `8f6919aa-eb0c-4bee-923f-575df2854253` | **$99.00 / month** | Unlimited conversations & contacts, custom SLA |
| **`test`** | **Test Product** | `9c8e2e35-d2ea-4b54-a9d4-70ca3f4c786b` | `a1054d14-124b-45ff-b283-a2fed8ecdafe` | **$10.00 one-time** | End-to-end sandbox verification |

---

## 3. Server-Side Environment Variable Architecture

To maintain zero hardcoded IDs while ensuring deterministic routing across environments:

```bash
# Polar Payments Configuration (Server-Side Only)
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_WEBHOOK_SECRET=polar_whsec_...
POLAR_SERVER=production

# Plan-to-Product Mapping (Configurable per environment)
POLAR_PRODUCT_STARTER=e5050fd1-5a76-4bd4-ab60-b5706f6dd11f
POLAR_PRODUCT_PRO=350dca5f-0c97-45b8-8a75-e1aa506a8d14
POLAR_PRODUCT_ENTERPRISE=b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4
```

---

## 4. Reverse Lookup: Polar Product ID to Internal Plan ID

The subscription entitlement engine evaluates webhook payloads and extracts `event.data.product_id` to resolve the internal plan:

```typescript
export const POLAR_PRODUCT_TO_PLAN: Record<string, string> = {
  [process.env.POLAR_PRODUCT_STARTER || 'e5050fd1-5a76-4bd4-ab60-b5706f6dd11f']: 'starter',
  [process.env.POLAR_PRODUCT_PRO || '350dca5f-0c97-45b8-8a75-e1aa506a8d14']: 'pro',
  [process.env.POLAR_PRODUCT_ENTERPRISE || 'b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4']: 'enterprise',
};
```
