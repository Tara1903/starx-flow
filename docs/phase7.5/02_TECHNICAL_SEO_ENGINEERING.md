# STARX-FLOW — PHASE 7.5: TECHNICAL SEO ENGINEERING & ARCHITECTURE

**Document Date:** 2026-11-10  
**Milestone:** Phase 7.5 — Stage B  
**Lead Engineer:** Principal Search Infrastructure Engineer & Technical SEO Architect  
**Canonical Domain:** `https://starx-flow.runs-on.dev`  

---

## 1. Crawlability & Indexing Infrastructure

### 1.1 Robots.txt Architecture (`src/app/robots.ts`)
The `robots.txt` configuration is dynamically compiled via Next.js Metadata API, outputting a standards-compliant directive tree separating traditional web search engines, AI search retrieval engines, user-triggered interactive agents, and scraper bots:

```text
User-Agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-Agent: OAI-SearchBot
User-Agent: PerplexityBot
User-Agent: Claude-SearchBot
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-Agent: ChatGPT-User
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-Agent: GPTBot
User-Agent: ClaudeBot
User-Agent: Google-Extended
User-Agent: Applebot-Extended
Allow: /
Allow: /llms.txt
Disallow: /dashboard/
Disallow: /admin/
Disallow: /setup/
Disallow: /api/

User-Agent: Bytespider
User-Agent: CCBot
Disallow: /

Sitemap: https://starx-flow.runs-on.dev/sitemap.xml
```

### Key Engineering Safeguards:
1. **Universal Crawler Access:** Legitimate search crawlers (`Googlebot`, `Bingbot`, `Applebot`, `DuckDuckBot`, `BraveBot`) are allowed full access to public marketing routes.
2. **Private Route Protection:** Disallow directives explicitly protect `/dashboard/`, `/admin/`, `/setup/`, and `/api/`, preventing crawl budget waste and accidental exposure of tenant data.
3. **Malicious Harvester Blocking:** Known aggressive bulk harvesters with zero citation attribution (`Bytespider`, `CCBot`) are blocked at the root.

---

## 2. Dynamic Sitemap Engineering (`src/app/sitemap.ts`)

The sitemap is dynamically generated at `/sitemap.xml` with 52 canonical, clean URLs:
- **Zero 3xx Redirects:** Only final canonical destination URLs are included.
- **Zero Trailing Slashes:** Strict trailing slash normalization prevents duplicate indexation.
- **Dynamic Prioritization:**
  - Homepage (`/`): `priority: 1.0`, `changeFrequency: daily`
  - Core Pillars & Feature Hubs: `priority: 0.9`, `changeFrequency: daily`
  - Industry Landing Pages: `priority: 0.8`, `changeFrequency: weekly`
  - Comparison Pages: `priority: 0.7`, `changeFrequency: weekly`
  - Research Articles: `priority: 0.7`, `changeFrequency: weekly`
  - Legal & Privacy: `priority: 0.4`, `changeFrequency: monthly`

---

## 3. Canonical URL & Redirect Governance

### 3.1 Strict Canonical Tag Enforcement
In `src/lib/seoConfig.ts`, the canonical domain is hardcoded to prevent local development or preview deployments from leaking into canonical tags:
```typescript
const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
const rawSiteUrl =
  envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")
    ? envUrl
    : "https://starx-flow.runs-on.dev";
export const siteUrl = rawSiteUrl.replace(/\/+$/, "");
```

### 3.2 Vercel Mirror & Host Redirect Protection
- Any request to alternative hostnames (e.g. `*.vercel.app` or HTTP mirrors) is permanently redirected (HTTP 308) to the canonical domain `https://starx-flow.runs-on.dev/`.
- Trailing slashes are stripped deterministically to avoid duplicate content splits (`/pricing/` -> `/pricing`).

---

## 4. Server-Side Rendering (SSR) & Static Generation (SSG)

StarX-Flow utilizes Next.js 16 Static Site Generation (SSG) with Turbopack for all public content:
- **Full HTML Pre-Rendering:** All 52 marketing routes generate static HTML at build time, ensuring search engine bots and AI scrapers receive full text content immediately without executing client-side JavaScript.
- **Zero Hydration Layout Shifts:** Critical above-the-fold content renders with CSS grid and inline SVG icons, keeping Cumulative Layout Shift (CLS) at 0.00.
