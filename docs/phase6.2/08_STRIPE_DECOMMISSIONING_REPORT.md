# STARX-FLOW — PHASE 6.2: STRIPE DECOMMISSIONING & MIGRATION REPORT

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage H  
**Lead Engineer:** Principal SaaS Billing Architect & DevOps Engineer  
**Objective:** Complete decommissioning of Stripe as active payment provider and safe migration to Polar  

---

## 1. Decommissioning Summary

Stripe has been completely retired from active billing operations across StarX-Flow. Polar now serves as the sole active Merchant of Record and payment processor. All active checkout creation, recurring subscription management, webhook event processing, and customer billing portal operations are routed through Polar.

Zero active billing requests communicate with Stripe endpoints.

---

## 2. Component-by-Component Decommissioning Audit

| Component | Legacy Stripe State | Remediated Polar State | Audit Status |
|---|---|---|---|
| **Checkout Route** (`/api/billing/checkout`) | Invoked `https://api.stripe.com/v1/checkout/sessions` via direct fetch. | Uses `polar.checkouts.create` via official `@polar-sh/sdk`. | **DECOMMISSIONED** |
| **Webhook Route** (`/api/billing/webhook`) | Verified Stripe HMAC signature and parsed Stripe event objects. | Uses `webhooks.validateEvent` via `@polar-sh/sdk/2026-10`. | **DECOMMISSIONED** |
| **Dependencies** (`package.json`) | No Stripe SDK was installed (used raw fetch calls). | `@polar-sh/sdk` installed directly without deprecated framework adapters. | **VERIFIED** |
| **Client State** (`billingStore.ts`) | Managed Stripe subscription IDs. | Extended with `polarCustomerId`, `polarSubscriptionId`, `billingProvider`. | **MIGRATED** |
| **Dashboard UI** (`SettingsSection.tsx`) | Directed upgrades to mailto or dev fallback. | Features direct Polar Checkout and Customer Portal integration. | **MIGRATED** |
| **Environment Variables** (`.env.example`) | Documented `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. | Deprecated in docs; replaced with `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`. | **MIGRATED** |

---

## 3. Preservation of Historical Stripe Records

In strict accordance with Non-Negotiable Rule 12 and Rule 13:
- **Zero Historical Data Deleted:** All existing rows in `subscriptions` and `invoices` remain intact in Supabase PostgreSQL.
- **Preserved Columns:** `stripe_customer_id`, `stripe_subscription_id`, and `stripe_invoice_id` are permanently preserved in the database schema.
- **Provider Flagging:** Migration `012_polar_billing_provider_and_idempotency.sql` introduces the `billing_provider` column, allowing queries to distinguish historical `'stripe'` subscribers from active `'polar'` subscribers.

---

## 4. Migration Strategy for Legacy Subscribers

For any accounts with legacy Stripe subscriptions:
1. **Uninterrupted Access:** The backend entitlement engine checks `subscriptions.status = 'active'`, granting full plan entitlements regardless of whether `billing_provider` is `'stripe'` or `'polar'`.
2. **Voluntary Upgrade Transition:** If a legacy subscriber clicks "Upgrade Plan" or changes their tier in Settings, the system creates a new Polar subscription.
3. **Cancellation & Expiration:** If a legacy Stripe subscription is cancelled or expires, the account falls back to the `free` tier. Any subsequent renewal requires completing a Polar checkout session.
