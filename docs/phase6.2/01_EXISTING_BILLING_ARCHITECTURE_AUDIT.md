# STARX-FLOW — PHASE 6.2: EXISTING BILLING ARCHITECTURE AUDIT

**Audit Date:** 2026-11-10  
**Auditor:** Principal SaaS Billing Architect, Senior Backend Engineer & Payment Integration Specialist  
**Milestone:** Phase 6.2 — Stage A  
**Repository:** https://github.com/Tara1903/starx-flow  
**Target Architecture:** Complete migration from Stripe to Polar (Merchant of Record)  

---

## 1. Executive Summary

A comprehensive architectural audit of StarX-Flow's legacy Stripe billing infrastructure was conducted. StarX-Flow previously implemented a hybrid Stripe Checkout and Webhook model, storing billing records in Supabase PostgreSQL tables (`subscriptions` and `invoices`). The system currently references Stripe customer identifiers (`stripe_customer_id`), subscription identifiers (`stripe_subscription_id`), and invoice identifiers (`stripe_invoice_id`) across backend route handlers, client Zustand stores, and database schemas.

To transition to Polar as the Merchant of Record without data loss or downtime:
- All historical Stripe records must remain preserved.
- The subscription schema must be upgraded to support Polar identifiers alongside legacy Stripe data.
- Active checkout sessions and webhook processing must be systematically routed through Polar's official SDK (`@polar-sh/sdk`).

---

## 2. Legacy Stripe Implementation Inventory

### 2.1 Checkout Route: `src/app/api/billing/checkout/route.ts`
- **Mechanism:** Direct HTTPS `fetch` call to Stripe API endpoint: `POST https://api.stripe.com/v1/checkout/sessions`.
- **Payload:** URL-encoded parameters creating a `mode: 'subscription'` session with:
  - `client_reference_id: user.id`
  - `metadata[user_id]`, `metadata[plan_id]`, `metadata[billing_cycle]`
  - `line_items[0][price_data][name]`, `line_items[0][price_data][unit_amount]`
  - `success_url` and `cancel_url` pointing back to `/dashboard`.
- **Fallbacks:** In Phase 6.1, a production safeguard was added to block dev-mode auto-activation when `STRIPE_SECRET_KEY` was missing (`HTTP 503`).

### 2.2 Webhook Route: `src/app/api/billing/webhook/route.ts`
- **Mechanism:** Next.js Route Handler listening for Stripe webhooks.
- **Security:** Verified `stripe-signature` header using Node.js `crypto.createHmac('sha256', secret)` with a 300-second replay tolerance window.
- **Events Handled:**
  - `checkout.session.completed`: Upserted row into `subscriptions` table and updated `profiles.plan`.
  - `invoice.paid`: Inserted row into `invoices` table.
  - `invoice.payment_failed`: Updated `subscriptions.status = 'past_due'`.
  - `customer.subscription.deleted`: Updated `subscriptions.status = 'cancelled'`.

### 2.3 Client State: `src/store/billingStore.ts`
- **Store Architecture:** Zustand store managing client-side billing state.
- **Models:**
  - `Subscription`: Explicitly typed with `stripeCustomerId: string | null` and `stripeSubscriptionId: string | null`.
  - `Invoice`: Explicitly typed with `stripeInvoiceId: string | null`.
  - `PLANS`: Defines resource limits for `free`, `starter`, `pro`, and `enterprise`.
- **Converters:** `dbRowToSubscription` and `dbRowToInvoice` map snake_case PostgreSQL rows to camelCase TypeScript models.

### 2.4 User Interface: `src/screens/dashboard/SettingsSection.tsx` & `src/app/pricing/`
- **Settings Dashboard:** Displays active tier (`user.plan || subscription.planId`), subscription status, commercial resource limits, and upgrade CTA.
- **Pricing Landing Page:** Renders flat subscription tiers ($29/mo Starter, $59/mo Growth, $99/mo Pro) with 0% booking commission highlights.

---

## 3. Database Schema Audit: Supabase PostgreSQL

### 3.1 `subscriptions` Table (`001_initial_schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  plan_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'usd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 `invoices` Table (`001_initial_schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  paid_at TIMESTAMPTZ,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 Multi-Tenant Linkage
- Subscriptions are linked to individual accounts via `user_id UUID REFERENCES auth.users(id)`.
- Users belong to organizations via `organization_members (user_id, organization_id, role)`.
- Entitlements belong to the user's active tenant organization.

---

## 4. Dependencies & Components Requiring Migration

| Component | Current State | Required Target State |
|---|---|---|
| Checkout API | Calls Stripe Checkout API directly | Uses `polar.checkouts.create` via `@polar-sh/sdk` |
| Webhook Route | Verifies Stripe HMAC signature | Verifies Polar signature via `webhooks.validateEvent` |
| Webhook Events | Listens for Stripe event types | Listens for Polar event types (`order.paid`, `subscription.active`, etc.) |
| Database Schema | `stripe_customer_id`, `stripe_subscription_id` | Add `polar_customer_id`, `polar_subscription_id`, `billing_provider` |
| Webhook Idempotency | No database-backed idempotency table | Implement `polar_webhook_events` table with unique constraint on `event_id` |
| Billing Portal | None (Stripe customer portal unlinked) | Link to Polar hosted customer portal via `polar.customerSessions.create` |
| Environment Config | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Deprecate Stripe vars; enforce `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` |

---

## 5. Decommissioning Constraints
1. **Preserve Legacy Records:** Existing rows in `subscriptions` and `invoices` must remain intact.
2. **Provider Awareness:** The schema must support a `billing_provider` field default to `'polar'`, retaining historical records marked `'stripe'`.
3. **Fail-Safe Webhook:** No unverified webhooks will be processed.
