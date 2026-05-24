# Vercel Backend Implementation

## Objective
Unify the backend by migrating all local Node.js server code and Supabase Edge Functions into Vercel Serverless Functions. This strictly eliminates laptop dependencies, external workers, and localhost references while maintaining a ₹0/month operational cost.

---

## 1. Identified Backend Endpoints

**From Local Express Server (`whatsapp-server/index.js`):**
- `POST /api/whatsapp/connect` (Initiates WhatsApp session)
- `POST /api/whatsapp/reset` (Resets WhatsApp session)
- `GET /ping` & `GET /ready` (Healthchecks)

**From Supabase Edge Functions (`supabase/functions/`):**
- `POST /ai-processor` (LLM processing)
- `POST /process-queue` (Async task queueing)
- `POST /send-email` (Resend integration)
- `POST /stripe-webhook` (Payment processing)
- `POST /whatsapp-webhook` (Meta Cloud API ingestion)

---

## 2. Final `api/` Directory Structure (Vercel)

The backend will reside natively inside the Vercel deployment via an `api/` directory at the project root.

```text
api/
├── ai-processor.ts         (Moved from Supabase)
├── process-queue.ts        (Moved from Supabase)
├── send-email.ts           (Moved from Supabase)
├── stripe-webhook.ts       (Moved from Supabase)
├── whatsapp-webhook.ts     (Moved from Supabase)
└── whatsapp/
    ├── connect.ts          (Extracted from local server)
    └── reset.ts            (Extracted from local server)
```

---

## 3. Moving Local Server Code

The Express endpoints from the local `whatsapp-server` must be refactored into Vercel Serverless Functions.

**Changes required for `api/whatsapp/connect.ts` & `reset.ts`:**
- **Remove Baileys:** Vercel functions cannot maintain the long-lived WebSockets required by the Baileys library due to serverless execution limits (typically 10-15 seconds).
- **Refactor to Meta Cloud API:** The `/connect` endpoint will be rewritten to validate Meta OAuth tokens sent by the frontend, rather than spawning a socket to generate a QR code.
- **Database Operations:** The Vercel functions will strictly handle stateless JWT verification and Supabase `connected_channels` table updates.

---

## 4. Edge Functions Migration Policy

*Constraint Check: "Move Edge Functions only if required"*
Supabase Edge Functions are already serverless, scale instantly, and are free up to 500k invocations/month. 

**Recommendation:**
- To achieve the target architecture (`Backend → Vercel Functions`), we will move all Supabase functions into Vercel's `api/` folder.
- **Why?** It centralizes the deployment pipeline. A single `git push` to Vercel will deploy both the frontend and the entire backend, avoiding the need for a separate `supabase functions deploy` step.
- The Deno code (`import { serve } from "https://deno.land..."`) will be translated into standard Node.js/Vercel standard exports (`export default async function handler(req, res)`).

---

## 5. Deployment Order

1. **Environment Configuration:**
   - Migrate all keys from `.env.supabase.example` and local `.env` into Vercel's Environment Variables dashboard.
2. **Backend Scaffolding:**
   - Create the `api/` directory in the project root.
   - Refactor and copy the local server logic and Deno functions into Vercel-compatible `.ts` files.
3. **Frontend Re-routing:**
   - Update `IntegrationModal.tsx` and `WhatsAppStep.tsx` to call `/api/whatsapp/connect` and `/api/whatsapp/reset` directly, stripping out all `http://localhost:10000` fallbacks.
4. **Vercel Deployment:**
   - Push the unified repository to GitHub to trigger Vercel CI/CD.
5. **Supabase Cleanup:**
   - Once verified, delete the `supabase/functions/` directory to prevent duplicate backend maintenance.
6. **Local Worker Teardown:**
   - Delete the `whatsapp-server/` directory from the repository. The laptop runtime is officially deprecated.
