# Backend Extraction & Migration Map

This document outlines the architecture for migrating the backend from Supabase Edge Functions to Vercel Serverless Functions, while isolating the local `whatsapp-server` runtime and removing localhost dependencies.

## 1. Backend Boundary & Architecture

**Target State:**
- **Frontend:** Vercel (Static / SPA)
- **Backend:** Vercel Serverless Functions (API Routes)
- **Worker:** Render / Railway / Dedicated VM (Standalone Node.js Process)
- **Database:** Supabase (PostgreSQL, Auth, Storage)

The boundary is drawn between the stateless API (Vercel) and the stateful, persistent WebSocket connection (WhatsApp Worker).

---

## 2. Migration Map

### Files Moved
The following Supabase Edge Functions will be extracted and moved to Vercel API routes (e.g., an `api/` directory at the project root for Next.js/Vite integration, or Vercel's standard `api/` folder):
- `supabase/functions/ai-processor/` → `api/ai-processor.ts`
- `supabase/functions/process-queue/` → `api/process-queue.ts`
- `supabase/functions/send-email/` → `api/send-email.ts`
- `supabase/functions/stripe-webhook/` → `api/stripe-webhook.ts`
- `supabase/functions/whatsapp-webhook/` → `api/whatsapp-webhook.ts`

### Files Untouched
- `src/*` (React Frontend UI components remain as they are)
- `supabase/*.sql` (Database schemas, tables, and migrations stay in Supabase)
- `package.json`, `vite.config.ts`, `vercel.json` (Core frontend configuration remains intact)

### Routes Mapping
- **Vercel Serverless Routes (New Backend):**
  - `POST /api/ai-processor`
  - `POST /api/process-queue`
  - `POST /api/send-email`
  - `POST /api/stripe-webhook`
  - `POST /api/whatsapp-webhook`
- **WhatsApp Worker Routes (Persistent Host):**
  - `GET /`
  - `GET /ping`
  - `GET /ready`
  - `POST /api/whatsapp/reset`
  - `POST /api/whatsapp/connect`

---

## 3. Extract Local Runtime & Remove Localhost Dependency

**Current State:**
`whatsapp-server/index.js` defaults to `http://localhost:10000` and posts messages to `${SUPABASE_URL}/functions/v1/ai-processor`.

**Extraction Strategy:**
1. **Isolate Worker:** The `whatsapp-server` directory will be treated as an independent microservice with its own `package.json` and deployed to a persistent container service (e.g., Render, Railway, DigitalOcean).
2. **Remove Localhost Dependency:** 
   - Ensure the hosting provider defines a public URL environment variable (e.g., `RENDER_EXTERNAL_URL` or `PUBLIC_WORKER_URL`).
   - The worker writes this external URL to the `connected_channels` table in Supabase so the Frontend knows exactly where to send `connect` and `reset` requests, fully eliminating the fallback to `localhost:10000`.
3. **Update Upstream Target:** Modify `whatsapp-server` to forward incoming messages to the new Vercel API route (`https://<your-vercel-domain>.vercel.app/api/ai-processor`) instead of the old Supabase Edge function.

---

## 4. Environment Variables

### Vercel (Frontend + Serverless Backend)
- `VITE_SUPABASE_URL` / `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (For backend operations)
- `NVIDIA_API_KEY`
- `STRIPE_SECRET_KEY` (For `api/stripe-webhook`)
- `STRIPE_WEBHOOK_SECRET`

### WhatsApp Worker (Render / Railway)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TARGET_USER_ID`
- `PORT` (Provided by the host environment)
- `RENDER_EXTERNAL_URL` / `PUBLIC_WORKER_URL` (Removes localhost dependency)
- `VERCEL_API_URL` (To route payloads to the new `api/ai-processor` endpoint)

---

## 5. Deployment Order

1. **Database Layer (Supabase):**
   - Execute any pending `.sql` migrations.
   - Verify `connected_channels` and `baileys_auth` tables are active.
2. **Backend & Frontend Layer (Vercel):**
   - Deploy the project to Vercel containing both the React `src/` and the new `api/` serverless functions.
   - Configure all necessary backend environment variables in the Vercel dashboard.
3. **Worker Layer (Persistent Host):**
   - Deploy `whatsapp-server` to a persistent environment (Render/Railway).
   - Inject the newly created Vercel domain as `VERCEL_API_URL` into the worker's environment variables.
   - Ensure `RENDER_EXTERNAL_URL` is set so the worker registers its public endpoint in the database.
4. **Validation:**
   - Test frontend connection to the worker via the dynamically registered `server_url`.
   - Send a test message on WhatsApp to verify the worker successfully routes the request to Vercel's `api/ai-processor`.
