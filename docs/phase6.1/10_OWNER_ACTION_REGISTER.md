# STARX-FLOW — PHASE 6.1: OWNER ACTION REGISTER & EXTERNAL CONFIGURATION ROADMAP

**Document Date:** 2026-11-10  
**Auditor:** Principal SaaS Architect & DevOps Lead  
**Scope:** External Third-Party Consoles, Credentials, Dashboard Actions  

---

## 1. Overview & Action Priority Standard

Code-level remediation and automated security controls are complete and verified within the repository. The following actions require direct access to external third-party dashboards (Supabase, Stripe, Google Cloud Console, Meta Developers) and cannot be executed autonomously by the AI agent.

Each action is classified by priority:
- **P1 — Critical:** Required for live database persistence and live customer monetization.
- **P2 — High:** Required for public multi-tenant calendar and messaging connectivity.
- **P3 — Normal:** Authority and brand directory maintenance.

---

## 2. Priority 1 (Critical Actions)

### Action 1.1: Apply Migration 011 to Live Supabase Production
- **External Console:** [Supabase Dashboard — SQL Editor](https://supabase.com/dashboard/project/iqcffezepjndjmvpwhgx/sql)
- **Objective:** Ensure the live database creates the `demo_requests` table with the remediated RLS policies.
- **Instructions:**
  1. Open the Supabase SQL Editor.
  2. Paste the contents of `supabase/migrations/011_demo_requests_and_lead_capture.sql`.
  3. Execute the SQL script.
  4. Verify in Table Editor that `demo_requests` appears with RLS enabled.

---

### Action 1.2: Configure Live Stripe Billing in Vercel
- **External Consoles:** 
  - [Stripe Dashboard — API Keys](https://dashboard.stripe.com/apikeys)
  - [Vercel Project Settings — Environment Variables](https://vercel.com/)
- **Objective:** Transition billing gateway from dev-mode to live credit card processing.
- **Instructions:**
  1. In Stripe Dashboard, obtain:
     - `Secret key` (`sk_live_...`)
     - `Publishable key` (`pk_live_...`)
  2. Navigate to [Stripe Webhooks](https://dashboard.stripe.com/webhooks).
  3. Click **Add destination** and set Endpoint URL:  
     `https://starx-flow.runs-on.dev/api/billing/webhook`
  4. Select the following events:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
  5. Reveal and copy the **Signing secret** (`whsec_...`).
  6. In Vercel Project Settings -> Environment Variables, add/update for `Production`:
     - `STRIPE_SECRET_KEY = sk_live_...`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...`
     - `STRIPE_WEBHOOK_SECRET = whsec_...`
  7. Redeploy production or trigger a new deployment.

---

## 3. Priority 2 (High Actions)

### Action 2.1: Google Cloud Console OAuth 2.0 Verification
- **External Console:** [Google Cloud Console — APIs & Services](https://console.cloud.google.com/apis/credentials)
- **Objective:** Remove "Google hasn't verified this app" warning on Google Calendar sync.
- **Instructions:**
  1. Select the project associated with StarX-Flow.
  2. Ensure **Google Calendar API** is enabled.
  3. Under **Credentials** -> **OAuth 2.0 Client IDs**:
     - Add Authorized JavaScript origin: `https://starx-flow.runs-on.dev`
     - Add Authorized redirect URI: `https://starx-flow.runs-on.dev/api/integrations/google/oauth/callback`
  4. Under **OAuth consent screen**:
     - Set App Domain: `https://starx-flow.runs-on.dev/`
     - Set Privacy Policy link: `https://starx-flow.runs-on.dev/privacy`
     - Set Terms of Service link: `https://starx-flow.runs-on.dev/terms`
     - Submit for verification for scopes `calendar.events` and `calendar.readonly`.

---

### Action 2.2: Meta Developer Portal & WhatsApp Webhook Configuration
- **External Console:** [Meta for Developers](https://developers.facebook.com/apps/)
- **Objective:** Enable multi-tenant WhatsApp Cloud API inbound messaging.
- **Instructions:**
  1. Select your Meta Business App.
  2. In the WhatsApp product dashboard -> **Configuration**:
     - Set Callback URL: `https://starx-flow.runs-on.dev/api/whatsapp/webhook`
     - Set Verify Token: Enter the value defined in `META_VERIFY_TOKEN`.
     - Subscribe to webhook field: `messages`.
  3. Complete Meta Business Verification by uploading official company registration documents.
  4. Submit App Review for permissions:
     - `whatsapp_business_messaging`
     - `pages_messaging`
     - `instagram_manage_messages`

---

## 4. Priority 3 (Authority Maintenance)

### Action 3.1: SaaS Directory Profiles
- **Target Directories:** G2, Capterra, Product Hunt, LinkedIn.
- **Policy Compliance:** Maintain as an online SaaS provider. Do NOT invent, rent, or publish a virtual physical street address to attempt Google Business Profile claiming, as StarX-Flow is an online cloud SaaS platform.
