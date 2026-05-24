# StarX Codebase Deployment Audit

## Runtime Architecture Overview

**1. Which code runs in browser:**
- The React single-page application located in the `src/` directory.
- Built static assets (`dist/`, `public/`).
- Entry point `index.html`.

**2. Which code runs locally on laptop:**
- `whatsapp-server/`: A background Node.js process using the Baileys library to maintain a persistent connection to WhatsApp Web.
- Root-level administration and seeding scripts (e.g., `generate-pdfs.js`, `seed-phase1.cjs`, `check-db.ts`).

**3. Which code already runs on Vercel:**
- The React frontend application. This is explicitly configured by the `vercel.json` file which handles routing rewrites and security headers for the static build.

**4. Which code depends on localhost:**
- The Vite development server (`npm run dev`).
- The `whatsapp-server` instances often run on a local machine to prevent conflicts over Supabase auth keys (as noted by the anti-Render script logic in its `index.js`).

**5. Which services are persistent:**
- **Supabase Database (PostgreSQL)**: Stores user data, channels, and WhatsApp authentication keys (managed via `supabase-*.sql` migrations).
- **Supabase Authentication**: Manages user identities.

**6. Which endpoints are backend only:**
- Supabase Edge Functions in `supabase/functions/`:
  - `ai-processor`
  - `process-queue`
  - `send-email`
  - `stripe-webhook`
  - `whatsapp-webhook`

**7. Which jobs require background execution:**
- `whatsapp-server`: The WhatsApp connection script (`whatsapp-server/index.js`) runs a continuous polling/WebSocket connection to keep the bot alive.
- Queue processing jobs that might be running on Edge Functions (e.g., `process-queue`).

**8. Which modules can move to serverless:**
- The frontend is already serverless (Vercel).
- API routes and webhooks are already serverless (Supabase Edge Functions).

**9. Which modules cannot move:**
- `whatsapp-server`: The Baileys WhatsApp client maintains a long-lived WebSocket connection and continuously reads/writes encryption keys. Serverless environments (like AWS Lambda or Vercel Functions) have short maximum execution timeouts and cannot sustain persistent WebSockets efficiently, leading to dropped connections and re-authentication loops. It requires a long-running container or virtual machine.

---

## File Classification

### Frontend
- `src/` (React app, components, utilities, pages)
- `public/` (Static assets like fonts/images)
- `dist/` (Compiled production bundle)
- `index.html` (Application entry point)
- `package.json` (Frontend dependencies)
- `vite.config.ts` (Vite build config)
- `tsconfig.json` (TypeScript config)
- `vercel.json` (Vercel deployment config)

### Backend
- `supabase/functions/` (Edge functions for webhooks and AI processing)
- `supabase/*.sql` (PostgreSQL schemas and migrations)
- `check-db.ts`, `check-db-channels.ts`, `check-auth.ts` (Database inspection scripts)

### Worker
- `whatsapp-server/` (WhatsApp Baileys connection process)
- `generate-pdfs.js`, `generate-presentation-pdfs.js`, `generate-presentations.js` (PDF generators)
- `cleanup.cjs`, `refactor.cjs`, `seed-phase1.cjs`, `test-preview.cjs`, `update_auth.cjs`, `inspect-channels.cjs` (Local admin, DB maintenance, and utility scripts)

### Shared
- *(No explicitly shared modules/libraries between Frontend and Backend in a separate workspace)*

### Ignore
- `.agents/`
- `.env`, `.env.example`, `.env.local`, `.env.vercel.production`, `.env.vercel.tmp`
- `.git/`, `.github/`, `.gitignore`, `.gitattributes`
- `.vercel/`
- `README.md`
- `auth_config.json`, `auth_payload.json`, `metadata.json`
- `node_modules/`, `whatsapp-server/node_modules/`
- `package-lock.json`, `whatsapp-server/package-lock.json`, `skills-lock.json`
- `scratch/`
