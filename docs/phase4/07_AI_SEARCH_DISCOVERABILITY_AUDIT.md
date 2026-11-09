# STARX-FLOW — AI SEARCH DISCOVERABILITY & GEO AUDIT
**Phase:** 4 — Authority, Trust, Brand Entity & AI Search Visibility Engine  
**Document ID:** `docs/phase4/07_AI_SEARCH_DISCOVERABILITY_AUDIT.md`  
**Target Domain:** `https://starx-flow.runs-on.dev`  
**Git Branch:** `main`  
**Status:** Complete AEO/GEO Technical Discoverability Audit  

---

## 1. EXECUTIVE SUMMARY & OBJECTIVES

Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) differ fundamentally from traditional keyword density ranking tactics. Modern AI search engines (Google AI Overviews, Perplexity, ChatGPT Search, Claude, Gemini, Copilot):
1. **Retrieve crawlable HTML:** They ingest server-rendered Markdown and text from public URLs. Client-side JavaScript hidden behind user interactions is ignored or unindexed.
2. **Extract direct factual statements:** They prioritize concise, unambiguous definition sentences (high information-gain blocks).
3. **Validate cross-entity facts:** They compare statements across the website, `llms.txt`, and structured Schema.org JSON-LD to verify consistency. Discrepancies reduce citation confidence.

This audit evaluates StarX-Flow's crawl accessibility, content extractability, and semantic markup across traditional and generative search systems.

---

## 2. CRAWLER POLICY AUDIT (`/robots.txt`)

StarX-Flow’s crawler policy in `src/app/robots.ts` has been verified live on `https://starx-flow.runs-on.dev/robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-agent: OAI-SearchBot
User-agent: PerplexityBot
User-agent: Claude-SearchBot
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-agent: Bytespider
User-agent: CCBot
Disallow: /

Sitemap: https://starx-flow.runs-on.dev/sitemap.xml
```

### Strategic Evaluation:
- **Search Retrieval Crawlers (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`):** FULLY ALLOWED on public marketing pages and `/llms.txt`. Enables real-time web retrieval during active user searches.
- **User-Triggered Fetchers (`ChatGPT-User`):** ALLOWED on public routes. Enables ChatGPT browsing users to inspect links.
- **Model-Training Bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`):** ALLOWED on public marketing pages to ensure StarX-Flow's brand identity, feature matrix, and pricing are ingested into next-generation foundation model weights.
- **Scrapers / Low-Attribution Harvesters (`Bytespider`, `CCBot`):** DISALLOWED to protect server resources and prevent unlicensed scraping.
- **Private Routes (`/dashboard/`, `/admin/`, `/setup/`, `/api/`):** STRICTLY RESTRICTED across all bot categories to protect customer tenant privacy.

---

## 3. INFORMATION ARCHITECTURE & EXTRACTION READINESS

| Evaluation Dimension | Required Standard | Current Implementation in StarX-Flow | Verdict |
| :--- | :--- | :--- | :---: |
| **Server-Side Pre-Rendering (SSG/SSR)** | Essential content must be present in initial HTML payload | Next.js 16 App Router statically generates all 42 public pages via `generateStaticParams()` or server components | **PASS** |
| **Direct Answer Blocks (`<KeyTakeaway>`)** | High information-gain answer summaries at top of pages | Prominently rendered on all 13 industry pages, 13 competitor hubs, and pillar pages | **PASS** |
| **Machine-Readable Index (`/llms.txt`)** | Concise, markdown-formatted directory of capabilities and URLs | Deployed at `/llms.txt` with industry and comparison directory links | **PASS (Needs Sanitization)** |
| **Entity Consistency Across Pages** | Unified definition of brand, product category, and pricing | Audit identified legacy exaggerations ("HIPAA compliant", fake metrics) that need sanitization | **REMEDIATION REQUIRED** |
| **Structured Data Accuracy** | Valid JSON-LD schemas matching visible DOM without inflated ratings | `SchemaMarkup.tsx` currently contains fabricated `AggregateRating` (850 reviews, 4.9 rating) | **REMEDIATION REQUIRED** |
| **Canonical Tag Consistency** | Every page must specify absolute canonical tag pointing to `starx-flow.runs-on.dev` | All 42 public routes verified with matching `<link rel="canonical">` | **PASS** |

---

## 4. REMEDIATION REQUIREMENTS FOR AI SEARCH VISIBILITY

1. **Sanitize `public/llms.txt`:**
   - Remove "HIPAA-Compliant Security: End-to-end encryption".
   - Replace with: "Strict Tenant Isolation: Row Level Security (RLS) on PostgreSQL, TLS 1.3 encryption in transit, and AES-256 encryption at rest."
   - Add new trust pages: `/security`, `/integrations`, `/how-it-works`.
   - Add initial editorial articles: `/resources/articles/calendar-integration`, `/resources/articles/clinic-receptionist`, `/resources/articles/google-reviews-seo`.
2. **Clean JSON-LD Schemas in `src/components/seo/SchemaMarkup.tsx`:**
   - Eliminate fabricated `aggregateRating` from `softwareApplicationSchema()`.
   - Remove unverified "HIPAA-Compliant Security" feature bullet.
   - Inject clean, authoritative `Organization` and `WebSite` schemas.
3. **Server-Rendered Content Guarantees:**
   - Ensure all new trust and editorial pages render their primary content in semantic server HTML (`<article>`, `<header>`, `<section>`, `<table>`, `<dl>`) rather than inside purely client-rendered or dynamically loaded modals.
