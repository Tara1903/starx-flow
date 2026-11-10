# STARX-FLOW — WORKSTREAM J
# REVENUE AND PRICING READINESS

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Audited Codebase:** `src/app/api/billing/checkout/route.ts`, `src/app/api/billing/webhook/route.ts`, `src/store/billingStore.ts`, `src/app/pricing/PricingClient.tsx`, `src/screens/dashboard/SettingsSection.tsx`  

---

## 1. Commercial Audit Overview

A SaaS platform cannot convert users into recurring revenue without an audit-proof, resilient billing architecture. 

During Phase 6, StarX-Flow’s monetization engine was audited across five commercial dimensions:
1. **Pricing Transparency & Alignment:** Discrepancy between marketing page prices and internal billing constants.
2. **Checkout Lifecycle:** Initiation of Stripe Checkout sessions via `/api/billing/checkout`.
3. **Webhook Resiliency:** Cryptographic signature verification and lifecycle event handlers in `/api/billing/webhook`.
4. **Subscription State Persistence:** PostgreSQL `subscriptions` and `invoices` table updates.
5. **In-App Commercial Transparency:** Dashboard visibility of subscription tier and resource quotas.

---

## 2. Pricing & Currency Harmonization Analysis

### 2.1 The Pricing Disparity Audit
Our audit revealed a divergence between public marketing pages and internal codebase constants:

| Source | Starter Tier | Growth Tier | Pro Tier | Enterprise Tier | Currency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Marketing Page (`PricingClient.tsx`)** | **$29 / mo** | **$59 / mo** | **$99 / mo** | Custom Quote | USD ($) |
| **Billing Store (`billingStore.ts`)** | **€47 / mo** | *(Not defined)* | **€97 / mo** | **€297 / mo** | EUR (€) |
| **Checkout Route (`api/billing/checkout`)** | EUR | EUR | EUR | EUR | EUR (€) |

### 2.2 Strategic Recommendation & Resolution
- **Currency Strategy for UK & Ireland Beachhead:**
  - For Ireland and EU merchants: **EUR (€)** is the native domestic currency.
  - For UK merchants: Stripe checkout supports dynamic currency conversion into **GBP (£)**.
  - For global/US discovery: Marketing displays USD ($) for international clarity.
- **Harmonization Decision:**
  - In `SettingsSection.tsx`, StarX-Flow now transparently presents:
    > **Starter Tier:** `$29 / €47 per month (0% booking commission)`.
    > **Growth Tier:** `$59 / €97 per month`.
    > **Enterprise Tier:** Custom SLA & Multi-Location Scaling.
  - Flat subscription model with zero per-booking commissions is strictly enforced.

---

## 3. Stripe Checkout & Lifecycle Architecture

```
  Merchant Initiates Upgrade in Dashboard
                    │
                    ▼ POST /api/billing/checkout
  `src/app/api/billing/checkout/route.ts`
  ├── 1. Validates JWT Session via `supabaseAdmin.auth.getUser(token)`
  ├── 2. Inspects `process.env.STRIPE_SECRET_KEY`
  │       ├── IF CONFIGURED: Calls Stripe Checkout Session API
  │       │   └── Returns Stripe hosted URL (`session.url`)
  │       └── IF DEV/PLACEHOLDER: Directly activates subscription in Supabase
  └── 3. Redirects to `/dashboard?payment=success`
```

### 3.1 Stripe Webhook Event Handlers (`/api/billing/webhook`)

| Stripe Webhook Event | Database Action Executed | Target Tables |
| :--- | :--- | :--- |
| **`checkout.session.completed`** | Upserts active subscription record with customer and subscription IDs; updates user profile plan. | `subscriptions`, `profiles` |
| **`invoice.paid`** | Inserts immutable paid invoice record with amount, currency, and hosted invoice URL. | `invoices` |
| **`invoice.payment_failed`** | Updates subscription status to `past_due`; prompts user in dashboard to update billing method. | `subscriptions` |
| **`customer.subscription.deleted`** | Updates subscription status to `cancelled` with `cancelled_at` timestamp. | `subscriptions` |

---

## 4. Phase 6 In-App Commercial Visibility Upgrades

Prior to Phase 6, a logged-in user in `/dashboard` had no way to inspect their active plan, view their monthly conversation limits, or initiate plan upgrades.

In Phase 6, we engineered the **Subscription Plan & Commercial Limits Card** inside [`src/screens/dashboard/SettingsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/SettingsSection.tsx):
- Displays current account tier (`user.plan` or `subscription.planId`).
- Confirms zero commission guarantee.
- Outlines exact plan inclusions (500 AI conversations, two-way Google/Outlook sync, PostgreSQL exclusion lock concurrency protection).
- Provides direct enterprise upgrade intake (`support@starx-flow.runs-on.dev`).

---

## 5. Owner Actions Required for Live Production Billing

To begin accepting live credit card transactions:
1. **Stripe API Keys:** Add live `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in production environment settings.
2. **Stripe Webhook Configuration:**
   - Add endpoint in Stripe Dashboard: `https://starx-flow.runs-on.dev/api/billing/webhook`.
   - Select events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
   - Copy Signing Secret to production `STRIPE_WEBHOOK_SECRET`.
