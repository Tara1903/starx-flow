# STARX-FLOW — PHASE 6.2: OWNER ACTION REGISTER & PRODUCTION RUNBOOK

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage J  
**Role:** Principal SaaS Billing Architect & DevOps Engineer  
**Target Environments:** Supabase Production, Vercel Production, Polar Dashboard  

---

## 1. Executive Summary

This action register outlines the mandatory deployment, configuration, and verification steps required by the platform owner to operationalize the Polar payment integration on production (`https://starx-flow.runs-on.dev`).

All backend code, webhook processing engines, checkout routing, and client billing portals have been built, compiled, and verified against Polar's live API.

---

## 2. Mandatory Owner Action Items

| Item | Service | Action Required | Status |
|---|---|---|---|
| **ACT-62-01** | **Supabase** | Apply `012_polar_billing_provider_and_idempotency.sql` in Supabase SQL Editor | ⏳ Pending Owner Action |
| **ACT-62-02** | **Vercel** | Configure Polar environment variables in Vercel project settings | ⏳ Pending Owner Action |
| **ACT-62-03** | **Polar** | Verify live Webhook Endpoint status in Polar Dashboard | ✅ Configured via API |
| **ACT-62-04** | **Vercel** | Redeploy application or trigger git push to activate environment changes | ⏳ Pending Owner Action |
| **ACT-62-05** | **Production** | Execute 0-dollar verification checkout using discount code `TEST100` | ⏳ Ready for Testing |

---

## 3. Step-by-Step Instructions

### Step 1: Apply Supabase Database Migration (ACT-62-01)

1. Open your browser and navigate to the [Supabase Dashboard](https://supabase.com/dashboard/project/drcrhlckmubfsasgqthf).
2. Select your StarX-Flow production project.
3. In the left navigation sidebar, click on **SQL Editor** (icon looking like `>_`).
4. Click **New Query** (+).
5. Open the migration file from the repository:
   [`supabase/migrations/012_polar_billing_provider_and_idempotency.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/012_polar_billing_provider_and_idempotency.sql)
6. Copy the entire contents of the SQL file and paste them into the SQL Editor window.
7. Click the green **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`).
8. Verify the query executes successfully with status `Success. No rows returned`.
9. In the left sidebar, navigate to **Database** -> **Tables** and confirm:
   - `subscriptions` now has columns: `billing_provider`, `polar_customer_id`, `polar_subscription_id`, `polar_product_id`, `polar_price_id`.
   - `invoices` now has columns: `billing_provider`, `polar_invoice_id`, `polar_order_id`.
   - The table `polar_webhook_events` has been created with RLS enabled.

---

### Step 2: Configure Environment Variables in Vercel (ACT-62-02)

1. Navigate to your [Vercel Dashboard](https://vercel.com/dashboard) and select the `starx-flow` project.
2. Go to **Settings** -> **Environment Variables**.
3. Add the following environment variables for **Production**, **Preview**, and **Development** environments:

| Key | Value | Description |
|---|---|---|
| `POLAR_SERVER` | `production` | Connects SDK to `https://api.polar.sh` |
| `POLAR_ACCESS_TOKEN` | *(Your Polar Organization Access Token)* | Live access token configured in local `.env` |
| `POLAR_WEBHOOK_SECRET` | *(Your Polar Webhook Secret)* | Webhook signing secret configured in local `.env` |
| `POLAR_PRODUCT_STARTER` | `e5050fd1-5a76-4bd4-ab60-b5706f6dd11f` | Polar Starter Product UUID ($29/mo) |
| `POLAR_PRODUCT_PRO` | `350dca5f-0c97-45b8-8a75-e1aa506a8d14` | Polar Pro Product UUID ($59/mo) |
| `POLAR_PRODUCT_ENTERPRISE` | `b2cf5d17-2199-4c33-a1f6-a0b7e4d608e4` | Polar Enterprise Product UUID ($99/mo) |

> [!IMPORTANT]
> Ensure secrets are marked as **Sensitive / Encrypted** in Vercel to prevent exposure in build logs.
> Legacy Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) can be safely removed or kept inactive.

---

### Step 3: Verify Webhook Configuration in Polar Dashboard (ACT-62-03)

The webhook endpoint was programmatically provisioned during Phase 6.2 execution:
- **Webhook Endpoint ID:** `ad9f77dc-5750-41ea-bac5-5238103751cf`
- **Target URL:** `https://starx-flow.runs-on.dev/api/webhook/polar`
- **Format:** `raw`
- **Subscribed Events:**
  - `order.paid`
  - `subscription.active`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.canceled`
  - `subscription.revoked`

To verify:
1. Navigate to [Polar Dashboard > Settings > Webhooks](https://polar.sh/dashboard/starx-flow/settings).
2. Confirm the webhook endpoint `https://starx-flow.runs-on.dev/api/webhook/polar` shows status **Active**.

---

### Step 4: Trigger Vercel Production Redeployment (ACT-62-04)

Once the environment variables are saved in Vercel and the database migration is applied in Supabase:
1. Push the Phase 6.2 commit to GitHub branch `main`, OR
2. In Vercel, navigate to **Deployments** -> select latest deployment -> click **Redeploy** (ensure "Use existing Build Cache" is unchecked so new environment variables take full effect).

---

### Step 5: Execute Zero-Dollar Verification Checkout (ACT-62-05)

To confirm end-to-end checkout, payment confirmation, and webhook entitlement provisioning without incurring real credit card charges:
1. Visit production: `https://starx-flow.runs-on.dev/pricing` or log in and go to Settings > Billing.
2. Click **Upgrade to Pro ($59/mo)**.
3. You will be redirected to the secure Polar hosted checkout page (`https://polar.sh/checkout/...`).
4. In the checkout discount/promo field, enter:
   ```text
   TEST100
   ```
5. Confirm the total adjusts to **$0.00**.
6. Complete the checkout with your test details.
7. Upon redirect back to StarX-Flow:
   - Check Polar Dashboard > Orders to see the order marked as paid ($0.00).
   - Check Polar Dashboard > Webhooks to see `order.paid` and `subscription.created` delivered HTTP 200 OK.
   - Check StarX-Flow Settings > Billing to see the Pro plan active and quota limits updated to 5,000 conversations.
