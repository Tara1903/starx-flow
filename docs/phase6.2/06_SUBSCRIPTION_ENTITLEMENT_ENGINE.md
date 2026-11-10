# STARX-FLOW — PHASE 6.2: SUBSCRIPTION ENTITLEMENT & ACCESS CONTROL ENGINE

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage F  
**Lead Engineer:** Principal SaaS Architect & Entitlement Systems Lead  
**Components:** `src/lib/usage/usageService.ts`, `src/lib/polar.ts`, `src/store/billingStore.ts`  

---

## 1. Architectural Philosophy

Polar serves as the authoritative payment provider and Merchant of Record, but **StarX-Flow retains 100% server-side control over access enforcement, feature gating, and resource metering**.

The system maps external Polar products to internal plan keys, which in turn govern granular capability limits enforced by `UsageService.checkEntitlement`:

```
Polar Product UUID (e.g. `e5050fd1-...`)
                │
                ▼
Internal Plan ID (`starter`)
                │
                ▼
Database Profile State (`profiles.plan = 'starter'`)
                │
                ▼
UsageService Central Metering Engine
  - AI Conversations Quota: 500 / mo
  - Contacts Limit: 1,000
  - Calendar Syncs: 3 Staff Calendars
  - Concurrency Lock: Enabled
```

---

## 2. Commercial Tier Entitlement Specifications

| Entitlement Dimension | Free Trial | Starter ($29/mo) | Pro ($59/mo) | Enterprise ($99/mo) |
|---|---|---|---|---|
| **AI Conversations / Mo** | 50 | 500 | 5,000 | Unlimited (-1) |
| **Contacts Storage** | 100 | 1,000 | 10,000 | Unlimited (-1) |
| **Staff Team Members** | 1 | 3 | 10 | Unlimited (-1) |
| **Connected Calendars** | 1 | 3 | 10 | Unlimited (-1) |
| **Active Workflows** | 2 | 10 | 50 | Unlimited (-1) |
| **WhatsApp Messages** | 20 | 500 | 2,500 | 15,000 |
| **Voice Minutes** | 5 | 0 | 120 | 600 |
| **Google Review Booster** | Disabled | Standard | Automated | Multi-Location |
| **Concurrency Lock** | Basic | Guaranteed | Guaranteed | Guaranteed |

---

## 3. Lifecycle Enforcement & Cancellation Policies

1. **Active Subscriptions (`status = 'active'`):**
   - User profile retains paid plan identifier (`starter`, `pro`, `enterprise`).
   - All feature gates and quotas evaluate to paid thresholds.
2. **Cancellation with Remaining Period (`status = 'active'`, `cancel_at != null`):**
   - Customer maintains full access to their paid entitlements until the exact timestamp specified in `current_period_end`.
   - No premature revocation occurs upon clicking cancel.
3. **Revocation or Expiration (`status = 'cancelled'`):**
   - Webhook dispatches `subscription.revoked` or period expires.
   - System updates `profiles.plan = 'free'`.
   - Entitlements immediately scale down to `free` trial limits. Active data is preserved read-only.
4. **Upgrades & Downgrades:**
   - Webhook `subscription.updated` modifies `polar_product_id` and resets `profiles.plan`.
   - Quotas immediately reflect new plan allowances without requiring user re-authentication.
