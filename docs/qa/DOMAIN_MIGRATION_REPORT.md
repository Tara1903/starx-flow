# STARX-FLOW — CANONICAL DOMAIN MIGRATION REPORT
**Target Domain:** `https://starx-flow.runs-on.dev/`  
**Previous Domain:** `https://starx-flow.vercel.app/`  
**Execution Timestamp:** 2026-11-05  
**Status:** COMPLETED & VERIFIED IN CODEBASE — AWAITING EXTERNAL DASHBOARD ACTIONS  

---

## SECTION A — AUTOMATED REPOSITORY WORK COMPLETED

All application code, metadata, schemas, build pipelines, and dynamic route helpers have been audited, modified, and verified to make `https://starx-flow.runs-on.dev` the primary canonical domain.

### 1. Centralized SEO & Canonical Tagging (`src/lib/seoConfig.ts`)
- Configured dynamic fallback resolution to `process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://starx-flow.runs-on.dev"`.
- Normalized trailing slashes across all canonical URLs, OpenGraph images, and JSON-LD schema objects.
- All 63 public routes, `sitemap.xml`, `robots.txt`, and OpenGraph tags dynamically generate canonical links pointing to `https://starx-flow.runs-on.dev`.

### 2. Billing & Stripe Redirect URLs (`src/app/api/billing/checkout/route.ts`)
- Normalized `appUrl` calculation to prevent double slashes in `success_url` (`https://starx-flow.runs-on.dev/dashboard?payment=success...`) and `cancel_url`.
- Supports both `APP_URL` and `NEXT_PUBLIC_APP_URL` environment variables with fallback.

### 3. Meta / WhatsApp / Instagram OAuth Adapters (`src/app/api/meta/auth/route.ts`, `src/app/api/meta/callback/route.ts`)
- Normalized base application URL resolution for OAuth redirects to `https://starx-flow.runs-on.dev/api/meta/callback`.

### 4. Google & Microsoft Calendar OAuth Adapters (`src/app/api/integrations/*`)
- Verified dynamic Host header detection (`req.headers.get('host')`). When incoming traffic arrives via `starx-flow.runs-on.dev`, OAuth state generators and callbacks automatically resolve to `https://starx-flow.runs-on.dev/api/integrations/google/oauth/callback` and `https://starx-flow.runs-on.dev/api/integrations/microsoft/oauth/callback`.

### 5. Embedded Website Widget (`src/app/widget.js/route.ts`)
- Script dynamically detects script origin via `document.currentScript.src`.
- Web sites embedding `<script src="https://starx-flow.runs-on.dev/widget.js" ...>` automatically connect to `https://starx-flow.runs-on.dev/chat`.
- Backward compatibility preserved: existing embeds loading from `starx-flow.vercel.app` continue functioning without error.

### 6. Local & E2E Testing Configuration (`tests/live-e2e/config/env.ts`, `.env`)
- Default test suite target updated from `https://starx-flow.vercel.app` to `https://starx-flow.runs-on.dev`.
- Local development (`.env.local`) continues to use `http://localhost:3000` with full feature isolation.

### 7. Verification & Build
- `npm run typecheck` (`tsc --noEmit`): **PASSED (0 errors)**.
- `npm run build` (Next.js Turbopack): **PASSED (63/63 routes compiled and prerendered cleanly)**.

---

## SECTION B — EXACT ENVIRONMENT VARIABLES TO UPDATE

Update the following variables in the **Vercel Project Settings → Environment Variables** (Production & Preview):

| Variable Name | New Value | Scope | Description |
| :--- | :--- | :--- | :--- |
| `APP_URL` | `https://starx-flow.runs-on.dev` | Production, Preview | Primary backend canonical origin |
| `NEXT_PUBLIC_APP_URL` | `https://starx-flow.runs-on.dev` | Production, Preview | Primary client-accessible canonical origin |

*(Note: In local `.env`, `APP_URL=https://starx-flow.runs-on.dev/` has already been updated. In `.env.local`, `APP_URL="http://localhost:3000"` is preserved for local development.)*

---

## SECTION C — EXTERNAL DASHBOARD STATUS TABLE

| Service | Setting / Asset | Required Value | Status |
| :--- | :--- | :--- | :--- |
| **Vercel** | Production Domain | `starx-flow.runs-on.dev` (Primary) | Manual Action Required (Add Domain) |
| **Vercel** | Redirect Domain | `starx-flow.vercel.app` → Redirects to `starx-flow.runs-on.dev` | Manual Action Required |
| **Supabase Auth** | Site URL | `https://starx-flow.runs-on.dev` | Manual Action Required |
| **Supabase Auth** | Redirect URLs (Allow List) | `https://starx-flow.runs-on.dev/**` | Manual Action Required |
| **Supabase Vault** | `starx_cron_url` Secret | `https://starx-flow.runs-on.dev/api/cron/process-jobs` | Manual Action Required (SQL provided below) |
| **Meta Developers** | App Domains / Valid OAuth Redirect URIs | `starx-flow.runs-on.dev`<br>`https://starx-flow.runs-on.dev/api/meta/callback` | Manual Action Required |
| **Meta Webhooks** | WhatsApp Webhook URL | `https://starx-flow.runs-on.dev/api/whatsapp/webhook` | Manual Action Required |
| **Meta Webhooks** | Instagram Webhook URL | `https://starx-flow.runs-on.dev/api/instagram/webhook` | Manual Action Required |
| **Google Cloud** | Authorized Redirect URIs | `https://starx-flow.runs-on.dev/api/integrations/google/oauth/callback` | Manual Action Required |
| **Microsoft Entra** | Redirect URIs | `https://starx-flow.runs-on.dev/api/integrations/microsoft/oauth/callback` | Manual Action Required |
| **Stripe** | Webhook Endpoint | `https://starx-flow.runs-on.dev/api/billing/webhook` | Manual Action Required |
| **Resend** | Inbound Webhook URL | `https://starx-flow.runs-on.dev/api/email/webhook/inbound` | Manual Action Required |

---

## SECTION D — STEP-BY-STEP NUMBERED MANUAL ACTION CHECKLIST

Only the following steps require your manual execution in external provider dashboards:

### 1. Vercel Dashboard (Primary Domain Setup)
1. Go to [Vercel Dashboard](https://vercel.com/) → Select Project `starx-flow`.
2. Navigate to **Settings** → **Domains**.
3. Click **Add** → Enter `starx-flow.runs-on.dev`.
4. Ensure `starx-flow.runs-on.dev` is designated as the **Primary Domain**.
5. Set `starx-flow.vercel.app` to **Redirect** to `starx-flow.runs-on.dev` (Status Code 308 Permanent Redirect).
6. Navigate to **Settings** → **Environment Variables**:
   - Update `APP_URL` to `https://starx-flow.runs-on.dev`.
   - Add/Update `NEXT_PUBLIC_APP_URL` to `https://starx-flow.runs-on.dev`.
7. Trigger a new deployment (or redeploy the latest commit) to inject the new environment variables into the runtime container.

---

### 2. Supabase Dashboard (Auth & Scheduler Vault)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/iotuxpcqewdzvqzncpad).
2. **Auth Settings:**
   - Navigate to **Authentication** → **URL Configuration**.
   - Change **Site URL** to: `https://starx-flow.runs-on.dev`.
   - In **Redirect URLs**, add: `https://starx-flow.runs-on.dev/**` and `https://starx-flow.runs-on.dev/dashboard`.
   - Click **Save**.
3. **Vault Secret Rotation for pg_cron:**
   - Navigate to **SQL Editor** in the Supabase Dashboard.
   - Run the following idempotent SQL snippet to rotate the scheduler target URL in Supabase Vault:

```sql
-- Update Supabase Vault cron URL to the new canonical domain
SELECT public.upsert_vault_secret(
    'starx_cron_url',
    'https://starx-flow.runs-on.dev/api/cron/process-jobs',
    'Canonical production background worker endpoint for pg_cron'
);

-- Verify that the updated secret is active
SELECT name, description, updated_at 
FROM vault.secrets 
WHERE name = 'starx_cron_url';
```

---

### 3. Meta Developer App (WhatsApp & Instagram)
1. Go to [Meta for Developers](https://developers.facebook.com/apps/) → Select your StarX App.
2. Under **App Settings** → **Basic**:
   - Add `starx-flow.runs-on.dev` to **App Domains**.
   - Update **Privacy Policy URL** to `https://starx-flow.runs-on.dev/privacy`.
   - Update **Terms of Service URL** to `https://starx-flow.runs-on.dev/terms`.
3. Under **Facebook Login for Business** → **Settings**:
   - Add `https://starx-flow.runs-on.dev/api/meta/callback` to **Valid OAuth Redirect URIs**.
4. Under **WhatsApp** → **Configuration** / **Webhooks**:
   - Update Callback URL to: `https://starx-flow.runs-on.dev/api/whatsapp/webhook`.
5. Under **Instagram** → **Webhooks**:
   - Update Callback URL to: `https://starx-flow.runs-on.dev/api/instagram/webhook`.

---

### 4. Google Cloud Console (Calendar OAuth)
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click your OAuth 2.0 Client ID for StarX-Flow.
3. Under **Authorized redirect URIs**, click **Add URI**:
   - Add: `https://starx-flow.runs-on.dev/api/integrations/google/oauth/callback`.
4. Under **Authorized JavaScript origins**, add:
   - `https://starx-flow.runs-on.dev`.
5. Click **Save**.

---

### 5. Microsoft Entra Admin Center (Outlook OAuth)
1. Go to [Microsoft Entra Admin Center](https://entra.microsoft.com/) → **App registrations** → Select your StarX application.
2. Under **Authentication** → **Web** → **Redirect URIs**:
   - Add: `https://starx-flow.runs-on.dev/api/integrations/microsoft/oauth/callback`.
3. Click **Save**.

---

### 6. Stripe & Resend Dashboards (Webhooks)
1. **Stripe:**
   - In [Stripe Dashboard](https://dashboard.stripe.com/webhooks), update the existing webhook endpoint or add a new one pointing to:
     `https://starx-flow.runs-on.dev/api/billing/webhook`.
2. **Resend:**
   - In [Resend Dashboard](https://resend.com/webhooks), update inbound routing to:
     `https://starx-flow.runs-on.dev/api/email/webhook/inbound`.

---

## SECTION E — VERIFICATION RESULTS

- **Codebase Integrity:** All 63 routes build cleanly with zero type errors.
- **Dynamic SEO Canonical Base:** Verified `new URL(SEO_CONFIG.siteUrl)` produces `https://starx-flow.runs-on.dev`.
- **Backward Compatibility:** All existing integrations using the dynamic `host` header remain 100% operational during DNS propagation and cutover.
- **Local Dev Isolation:** Local environment development (`http://localhost:3000`) is preserved without regression.

---

## SECTION F — FINAL MIGRATION STATUS VERDICT

**`READY FOR MY MANUAL ACTIONS`**

All repository code, builds, and configuration files are fully prepared and pushed to `main`. Once you complete the manual dashboard actions in Section D, the migration to `https://starx-flow.runs-on.dev/` will be 100% active and canonical across the entire platform.
