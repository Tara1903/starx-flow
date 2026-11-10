# STARX-FLOW — PHASE 1
# SECURITY & ACCESS ARCHITECTURE

**Document ID:** P1-DOC-10  
**Project:** StarX-Flow  
**Initiative:** Universal Search & AI Discoverability  
**Phase:** 1 — Engineering Blueprint  
**Scope:** Secrets Isolation, Server-Side Key Boundaries, Tenant Isolation, Audit Logging, Safe Deployment & Credential Rotation  
**Author / Execution Agent:** Antigravity  
**Status:** COMPLETE SECURITY & ACCESS SPECIFICATION

---

## 1. SECURITY PRINCIPLES & PRIVILEGE BOUNDARIES

The Universal Discovery Engine (UDE) operates under strict Zero-Trust privilege boundaries:
- **Zero Client-Side Exposure:** Private credentials (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NVIDIA_API_KEY`, `GEMINI_API_KEY`, `META_APP_SECRET`) are restricted exclusively to server-side Node.js runtimes. Client bundles only receive public prefixed environment variables (`NEXT_PUBLIC_*`).
- **Read-Only Operation on Core State:** Optimization modules read public configuration and emit HTML metadata. They do not write to or mutate customer database records (`users`, `appointments`, `messages`).
- **No Secret Reproduction:** In strict compliance with security guidelines, real API keys or sensitive customer credentials are **never reproduced** in documentation or public reports.

```mermaid
flowchart TD
    subgraph ClientBrowser["Client-Side Browser Environment"]
        PublicBundle["Next.js Client Bundle"]
        AnonKey["NEXT_PUBLIC_SUPABASE_ANON_KEY (Protected by RLS)"]
        PublicAppURL["NEXT_PUBLIC_APP_URL"]
    end

    subgraph ServerRuntime["Server-Side Node.js / Vercel Edge"]
        ServerSecrets["Vercel Secrets / .env (Git-Ignored)"]
        NvidiaKey["NVIDIA_API_KEY (Server Only)"]
        GeminiKey["GEMINI_API_KEY (Server Only)"]
        StripeKey["STRIPE_SECRET_KEY (Server Only)"]
        MetaSecret["META_APP_SECRET (Server Only)"]
        ServiceRole["SUPABASE_SERVICE_ROLE_KEY (Server Only)"]
    end

    subgraph RLSBoundary["Database Row Level Security (RLS)"]
        PostgresDB[("PostgreSQL Database")]
    end

    ClientBrowser x-.-x|BLOCKED (Never Bundled)| ServerSecrets
    ClientBrowser -->|Queries with Anon JWT| RLSBoundary
    ServerRuntime -->|Authenticated API Calls| RLSBoundary
    ServerRuntime -->|Server-to-Server LLM Calls| NvidiaKey
```

---

## 2. CREDENTIAL STORAGE & ROTATION PROTOCOLS

### 2.1 Git Repository Protection & Environment Isolation
- All `.env*` files are strictly excluded from source control via `.gitignore`.
- Production environment variables are managed directly in Vercel Project Settings as encrypted **Secrets** (Type: `Secret`).
- Live HTTP audit verified that attempting to query `https://starx-flow.runs-on.dev/.env` returns HTTP 404 at the edge CDN.

### 2.2 Key Rotation Lifecycle & Remediation
If an external API key or token is rotated or updated:
1. **NVIDIA AI NIM Token:**
   - Update `NVIDIA_API_KEY` in Vercel Dashboard -> Environment Variables -> Type: `Secret`.
   - Update companion variables: `NVIDIA_MODEL=deepseek-ai/deepseek-v4.1-flash`, `DEFAULT_AI_PROVIDER=nvidia`.
   - Trigger a project redeployment in Vercel for the new secret to propagate.
2. **Google Gemini API Key:**
   - Update `GEMINI_API_KEY` in Vercel Dashboard -> Select `GEMINI_API_KEY` -> Edit.
   - Trigger redeployment.
3. **Repository History Remediation:**
   - If any API key is ever accidentally committed to git history in older commits, use `git filter-repo` or BFG Repo-Cleaner to permanently scrub the token from commit history, invalidate the key immediately in the vendor dashboard, and rotate to a fresh secret.

---

## 3. AUDIT LOGGING & TRACEABILITY

All administrative optimization actions (e.g. metadata updates, IndexNow pings, sitemap regeneration) are logged with:
- **Timestamp:** ISO 8601 UTC string.
- **Actor:** Execution agent or user ID.
- **Action Type:** `METADATA_UPDATE`, `SCHEMA_MUTATION`, `INDEXNOW_DISPATCH`.
- **Target URL / Path:** Impacted public route.
- **Diff Summary:** Concise description of the modification.

---

## 4. PRODUCTION DEPLOYMENT CONTROLS & GATES

To ensure zero risk of production degradation during discoverability rollouts:
1. **TypeScript Pre-Compile Gate:** `npm run typecheck` (`tsc --noEmit`) must exit with code 0.
2. **Next.js Production Build Gate:** `npm run build` must complete with 63/63 routes compiled without warnings.
3. **Automated E2E Regression Gate:** Run Playwright test suite (`tests/live-e2e/`) verifying that `/setup/welcome`, `/dashboard`, and `/api/chat` pass with 100% assertions before merging into `main`.
4. **Human Review Sign-Off:** Optimization PRs require formal sign-off from the four-member review team (Founder, ChatGPT, Gemini Spark, Antigravity).
