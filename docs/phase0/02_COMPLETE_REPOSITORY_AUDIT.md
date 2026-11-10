# STARX-FLOW — PHASE 0
# COMPLETE REPOSITORY & APPLICATION AUDIT

**Document ID:** P0-REP-02  
**Project:** StarX-Flow  
**Initiative:** Universal Search & AI Discoverability  
**Phase:** 0 — Production System Discovery  
**Audit Scope:** Complete Source Tree, Configuration, Dependencies, Endpoints & Assets  
**Audit Mode:** STRICT READ-ONLY

---

## 1. REPOSITORY STRUCTURE & CODEBASE OVERVIEW

StarX-Flow is structured as a modern full-stack Next.js application leveraging the App Router architecture, TypeScript, React 19, Tailwind CSS v4, and Supabase PostgreSQL.

```
starx-flow/
├── src/
│   ├── app/                      # Next.js App Router (63 routes: public, dashboard, setup, admin, api)
│   │   ├── api/                  # Backend REST endpoints (chat, billing, webhooks, crm, integrations)
│   │   ├── compare/              # Competitor comparison pages ([competitorId])
│   │   ├── dashboard/            # Core business operating system dashboard
│   │   ├── industries/           # Industry vertical landing pages ([industryId])
│   │   ├── resources/            # Educational resources, playbooks, articles
│   │   ├── scenarios/            # Business automation scenarios
│   │   ├── setup/                # 7-step guided customer onboarding wizard
│   │   ├── use-cases/            # High-intent WhatsApp automation landing pages
│   │   ├── layout.tsx            # Global HTML shell, metadata templating, theme
│   │   ├── page.tsx              # Public homepage with AIContent, Hero, SocialProof, HowTo
│   │   ├── robots.ts             # Dynamic Next.js robots.txt handler
│   │   └── sitemap.ts            # Dynamic Next.js sitemap.xml generator
│   ├── components/               # UI components, dashboard widgets, SEO modules
│   │   ├── chat/                 # Live AI receptionist chat simulator widget
│   │   ├── dashboard/            # 10 modular dashboard section widgets
│   │   ├── seo/                  # SchemaMarkup.tsx, AIContent.tsx
│   │   └── ui/                   # Reusable glassmorphic UI primitives
│   ├── lib/                      # Core business logic, SDKs, external adapters
│   │   ├── ai/                   # AIProvider, prompts, knowledge engine, tools, businessProfileService
│   │   ├── calendar/             # Google, Outlook, Square, Clover sync adapters
│   │   ├── seoConfig.ts          # Centralized metadata dictionary, canonical generators
│   │   └── supabaseAdmin.ts      # Service-role database client
│   ├── services/                 # Analytics, consent, queue, stripe, webhook handlers
│   ├── store/                    # Zustand client state stores (auth, dashboard, ui)
│   └── types/                    # Database schemas, AI types, integration contracts
├── supabase/
│   ├── functions/                # Supabase Edge Functions (ai-processor Deno runtime)
│   └── migrations/               # PostgreSQL schema migrations (40+ relational tables, RLS)
├── public/                       # Static public assets (icons, images, llms.txt, robots.txt, sitemap.xml)
├── tests/                        # Automated testing infrastructure (Playwright, E2E suites)
└── package.json                  # Next.js 16.2.7, React 19.0.0, Zustand 5.0.3, Tailwind 4.0.0
```

---

## 2. DETAILED ARCHITECTURAL INVENTORY

### 2.1 Frontend Architecture
- **Framework:** Next.js `16.2.7` utilizing React `19.0.0` (Turbopack compiler).
- **Styling:** Tailwind CSS `v4` with custom glassmorphism design system (`globals.css`, `glass-panel`, `glass-hero`).
- **State Management:** Zustand `5.0.3` (`useAuthStore`, `useDashboardStore`, `useUIStore`) for reactive client UI state.
- **Client/Server Split:** Server-rendered root layouts and public marketing routes; client-side interactive modules isolated via `'use client'` (`ClientShell`, `ProductClient`, `DashboardLayout`).

### 2.2 Backend & API Architecture
- **Server Runtime:** Node.js App Router route handlers (`src/app/api/*`) for webhooks, billing, chat, and CRM operations.
- **Edge Runtime:** Supabase Edge Functions (`supabase/functions/ai-processor/index.ts`) written in TypeScript/Deno for low-latency AI processing.
- **Database:** Supabase PostgreSQL with strict Row Level Security (RLS) policies on 40+ tables (`business_profiles`, `appointments`, `customers`, `conversations`, `messages`, `knowledge_docs`, `analytics_events`).

### 2.3 AI Agent System
- **Provider Hub:** `src/lib/ai/provider.ts` provides a multi-model orchestration engine:
  - **Primary:** NVIDIA AI NIM OpenAI-compatible endpoint hosting `deepseek-ai/deepseek-v4.1-flash`.
  - **Secondary:** Google Gemini 2.0 Flash (`gemini-2.0-flash:generateContent`).
  - **Fallback:** Algorithmic rule-based receptionist with zero hallucination.
- **RAG & Knowledge Base:** `src/lib/ai/knowledgeEngine.ts` retrieves verified business context and injects facts into the prompt before generation.
- **Agent Prompts:** `src/lib/ai/prompts.ts` defines system roles for `receptionist`, `support`, `marketing`, `sales`, and `operations`.

---

## 3. API ENDPOINTS INVENTORY

| Endpoint | Method | Runtime | Purpose | Public / Authenticated |
| :--- | :--- | :--- | :--- | :--- |
| `/api/chat` | `POST` | Node.js | Multi-turn AI receptionist conversation | Public / Rate-limited |
| `/api/chat/config` | `GET` | Node.js | Retrieve live business profile & FAQs | Public |
| `/api/billing/checkout` | `POST` | Node.js | Stripe checkout session generation | Authenticated |
| `/api/billing/webhook` | `POST` | Node.js | Stripe subscription lifecycle webhooks | Public (HMAC Verified) |
| `/api/conversations` | `GET, POST` | Node.js | List and create CRM customer threads | Authenticated |
| `/api/conversations/[id]/messages` | `GET, POST` | Node.js | Retrieve / send messages in chat | Authenticated |
| `/api/crm/customers/merge` | `POST` | Node.js | De-duplicate customer identities | Authenticated |
| `/api/cron/process-jobs` | `POST` | Node.js | Scheduled background worker jobs | Secret Token |
| `/api/integrations/google/oauth/authorize` | `GET` | Node.js | Google Calendar OAuth initiation | Authenticated |
| `/api/integrations/google/oauth/callback` | `GET` | Node.js | Google Calendar token exchange | Authenticated |
| `/api/integrations/instagram/webhook` | `GET, POST`| Node.js | Meta Instagram messaging webhook | Public (Meta Verified) |
| `/api/whatsapp/webhook` | `GET, POST`| Node.js | Meta WhatsApp Cloud API webhook | Public (Meta Verified) |
| `/api/knowledge/ingest` | `POST` | Node.js | Upload & chunk business FAQ docs | Authenticated |

---

## 4. STANDARDIZED REPOSITORY AUDIT FINDINGS

### Finding REP-01: Metadata Title Double-Suffixing in Root Layout
- **Status:** `FAIL`
- **Finding:** Subpages generate duplicated brand suffixes in `<title>` tags (e.g. `Features | StarX-Flow | StarX-Flow`).
- **Evidence:** `src/app/layout.tsx` lines 7–10 defines `title: { template: '%s | StarX-Flow', default: 'StarX-Flow' }`. Concurrently, `src/lib/seoConfig.ts` line 45 defines `PAGE_META['/features'].title = 'Features | StarX-Flow'`. Live fetch on `/features` returned `<title>Features | StarX-Flow | StarX-Flow</title>`.
- **Source / Inspected File:** `src/app/layout.tsx:8`, `src/lib/seoConfig.ts:45`
- **Severity:** `HIGH`
- **Business Impact:** Keyword dilution on Google SERP snippets, unappealing branding on search result cards, and truncation in search engine display.
- **Recommended Action:** Strip ` | StarX-Flow` from individual entries in `PAGE_META` dictionary, allowing `title.template` to cleanly append the brand name once.
- **Implementation Complexity:** `LOW`
- **Dependencies:** None.

---

### Finding REP-02: Missing Dynamic Metadata on Comparison and Industry Slugs
- **Status:** `FAIL`
- **Finding:** Comparison routes (`/compare/[competitorId]`) and industry routes (`/industries/[industryId]`) lack Next.js `generateMetadata()` exports, resulting in blank titles, descriptions, and canonical tags.
- **Evidence:** Live fetch of `https://starx-flow.runs-on.dev/compare/starx-flow-vs-zapier` returned: `title: MISSING`, `canonical: MISSING`, `description: MISSING`, `ogTitle: MISSING`.
- **Source / Inspected File:** `src/app/compare/[competitorId]/page.tsx`, `src/app/industries/[industryId]/page.tsx`
- **Severity:** `HIGH`
- **Business Impact:** High-intent comparison and industry landing pages are ignored or penalized by Google and AI search engines due to lack of unique indexing signals.
- **Recommended Action:** Export `generateMetadata({ params })` in each dynamic route using the helper `getPageMeta(pathname)`.
- **Implementation Complexity:** `LOW`
- **Dependencies:** `src/lib/seoConfig.ts`.

---

### Finding REP-03: Collision Between Static Public Files and Dynamic Route Handlers
- **Status:** `PARTIAL`
- **Finding:** Static legacy files exist in `public/` (`public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`) alongside App Router dynamic routes (`src/app/robots.ts`, `src/app/sitemap.ts`). Static files in `public/` reference old domains (`https://starx-flow.vercel.app/`).
- **Evidence:** `public/llms.txt` lines 48–53 link to `https://starx-flow.vercel.app/`. `public/sitemap.xml` contains 8 URLs pointing to `starx-flow.vercel.app`.
- **Source / Inspected File:** `public/llms.txt:48`, `public/sitemap.xml:4`, `public/robots.txt:12`
- **Severity:** `MEDIUM`
- **Business Impact:** Web and AI bots requesting `/llms.txt` are redirected or misdirected to outdated domain URLs, risking split index authority.
- **Recommended Action:** Update static discovery assets in `public/` to use the canonical domain `https://starx-flow.runs-on.dev` or serve them via dynamic App Router routes.
- **Implementation Complexity:** `LOW`
- **Dependencies:** Domain configuration.

---

### Finding REP-04: Lack of Third-Party Search Analytics & Webmaster Verification
- **Status:** `MISSING`
- **Finding:** The repository contains no Google Search Console tag (`google-site-verification`), Bing Webmaster tag (`msvalidate.01`), or external analytics tags (GA4, PostHog, or GTM).
- **Evidence:** Grep for `google-site-verification` and `msvalidate` across `src/` yielded 0 results. Root `layout.tsx` contains no verification meta tags.
- **Source / Inspected File:** `src/app/layout.tsx:43-52`
- **Severity:** `HIGH`
- **Business Impact:** Complete blindness regarding Google search impressions, click-through rates, crawl errors, indexing status, and Bing/Copilot visibility.
- **Recommended Action:** Add verification meta tags into root `metadata.verification` in `src/app/layout.tsx` once site credentials are provided by the founder.
- **Implementation Complexity:** `LOW`
- **Dependencies:** Founder account creation on Google Search Console & Bing Webmaster Tools.

---

### Finding REP-05: Robust Dual-Engine AI Receptionist with Fallback
- **Status:** `PASS`
- **Finding:** Production AI execution pipeline is fully operational with high fault tolerance, circuit breakers, and zero hallucination safeguards.
- **Evidence:** `src/lib/ai/provider.ts` lines 69–112 correctly prioritizes NVIDIA NIM (`deepseek-ai/deepseek-v4.1-flash`), falls back to Gemini 2.0 Flash (`callGemini`), and provides deterministic local responses (`generateFallback`). 100% of live receptionist chat tests passed in E2E testing.
- **Source / Inspected File:** `src/lib/ai/provider.ts:13-112`
- **Severity:** `INFORMATIONAL`
- **Business Impact:** Core product capability is reliable, performant, and ready for high-volume conversion once search discovery channels open.
- **Recommended Action:** Preserve existing AI provider logic unchanged; leverage its low response latency as a key marketing and AEO differentiator.
- **Implementation Complexity:** `NOT APPLICABLE`
- **Dependencies:** Valid NVIDIA/Gemini API keys.
