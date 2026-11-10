# STARX-FLOW — SEARCH CONSOLE BASELINE & INDEXING ANALYSIS
**Phase:** 5 — Global Keyword Intelligence & Customer Acquisition Engine  
**Document ID:** `docs/phase5/05_SEARCH_CONSOLE_BASELINE_AND_INDEXING_ANALYSIS.md`  
**Target Domain:** `https://starx-flow.runs-on.dev`  
**Git Branch:** `main`  
**Analysis Date:** November 2026  
**Status:** Live Search Engine Performance Baseline & Verification Record  

---

## 1. PROPERTY CONFIGURATION & VERIFICATION STATUS

StarX-Flow's Google Search Console and Bing Webmaster environments were audited for property binding, ownership validation, and indexation pipeline health:

| Environment | Property Identifier | Verification Method | Live Verification Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Google Search Console** | `https://starx-flow.runs-on.dev/` (URL-prefix) | HTML Verification Token (`google34347f6dcab51b3a.html`) | **VERIFIED (Active)** | Serves HTTP 200 on live production domain; token file matches registered Google property. |
| **Bing Webmaster Tools** | `https://starx-flow.runs-on.dev/` (Domain/URL) | Bing HTML Token / XML Key (`96ecf7203d92415582f1ba6110f0814f.txt`) | **CONNECTED** | IndexNow protocol active; fallback HTTP endpoint in place. |
| **Authoritative XML Sitemap** | `https://starx-flow.runs-on.dev/sitemap.xml` | Server-rendered Next.js metadata route | **ACTIVE (48 URLs)** | HTTP 200; UTF-8 XML formatted; valid `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`. |
| **Authoritative Robots Policy** | `https://starx-flow.runs-on.dev/robots.txt` | Server-rendered Next.js metadata route | **ACTIVE** | HTTP 200; allows `Googlebot`, `Bingbot`, `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`. |

---

## 2. INDEXATION STATUS & CRAWLER DISCOVERY LIFECYCLE

### 2.1 The Indexation Reality
1. **Homepage (`/`):** Confirmed indexed by Googlebot. The homepage served as the root verification target and initial entity citation.
2. **Commercial Landing Pages (Pillar, Industry, Competitor):**
   - In recent Search Console checks, newly deployed commercial and competitor landing pages were categorized in the "Discovered - currently not indexed" or "Crawled - currently not indexed" processing states.
   - **Critical Operating Rule:** This is normal and expected for a recently deployed domain undergoing initial authority establishment. We do **NOT** assume all 48 URLs are indexed immediately, nor do we attempt to brute-force manual indexing requests (which triggers Google Search Console rate limits and algorithmic spam filters).
3. **Google Search Console "Pages" Report Processing Window:**
   - Google Search Console updates page-level indexation reports on a 48-to-72-hour delay.
   - Sitemaps submitted to GSC are processed asynchronously by Googlebot's scheduling queue based on site crawl budget, domain authority, and page rendering performance.

---

## 3. SEARCH CONSOLE METRIC MONITORING FRAMEWORK

Once the Google Search Console Pages report completes its initial crawl cycle, performance will be evaluated across four primary analytical dimensions:

### 3.1 Macro Visibility Metrics
- **Total Impressions:** Aggregate visibility across all search queries. Benchmark: Monitor weekly growth trends rather than absolute spikes.
- **Total Organic Clicks:** Number of searchers visiting the domain from organic SERP listings.
- **Average Click-Through Rate (CTR):** Ratio of clicks to impressions. High-intent commercial queries typically average 3.5%–7.0% for top 3 positions; 1.0%–2.5% for positions 4–10.
- **Average Position:** Aggregate ranking position across all impressions.

### 3.2 Query-Level Performance Segmentation
Queries will be grouped into distinct commercial intent buckets:
1. **Brand Queries:** `starx-flow`, `starxflow`, `starx-flow ai` (Target: Position 1.0, CTR >30%).
2. **Category / Commercial Queries:** `ai business automation`, `whatsapp ai chatbot for business`, `instagram dm automation software` (Target: Top 20 establishing phase; climb to Top 10).
3. **Industry-Specific Queries:** `ai receptionist for dental clinics`, `whatsapp automation for gyms`, `salon appointment booking bot` (Target: Top 10 due to lower competition and hyper-specific intent).
4. **Competitor Alternative Queries:** `manychat alternatives`, `mindbody alternatives`, `wati alternatives` (Target: Top 10 commercial evaluation queries).

### 3.3 Coverage & Indexing Health
- **Valid (Indexed):** Pages successfully stored in Google's primary index and eligible for SERP impression.
- **Discovered - Currently Not Indexed:** Googlebot knows the URL exists (via sitemap or internal links) but has not yet allocated crawl resources to fetch it. (Resolution: Natural progression; internal link consolidation).
- **Crawled - Currently Not Indexed:** Googlebot fetched the page but elected not to index it immediately. (Resolution: Inspect content depth, unique value proposition, schema markup, and avoid near-duplicate vertical copy).
- **Excluded by 'noindex' tag:** Only private application routes (`/dashboard/*`, `/admin/*`, `/api/*`) must be in this category. Public landing pages must NEVER carry `noindex`.

### 3.4 Country-Level Traffic Distribution
Evaluate geographical impression volume to validate the Tier 1 market hypothesis:
- United Kingdom (UK)
- United States (US)
- Australia (AU)
- Canada (CA)
- European Union (IE, NL, DE)

---

## 4. OWNER EXPORT WORKFLOW (IN THE ABSENCE OF DIRECT API CREDENTIALS)

Because the project currently operates without a direct Google Search Console service account credential in the application environment, the project owner should periodically provide monthly performance exports using the following standard procedure:

### Monthly GSC Export Checklist
1. Open **[Google Search Console](https://search.google.com/search-console)**.
2. Select property: **`https://starx-flow.runs-on.dev/`**.
3. Navigate to **Performance** > **Search results**.
4. Set Date filter to: **Most recent 28 days**.
5. In the top-right corner, click **Export** > **Download CSV / Google Sheets**.
   - The export will include: `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, and `SearchAppearance.csv`.
6. Store exports in `docs/phase5/data/gsc-exports/YYYY-MM/` for longitudinal performance tracking and keyword gap identification.

---

## 5. TECHNICAL GOVERNANCE RULES

- 🚫 **DO NOT repeatedly spam "Request Indexing":** Requesting indexing repeatedly for the same URL or submitting all 48 URLs manually triggers quota blocks and does not accelerate Googlebot's evaluation algorithms.
- 🚫 **DO NOT modify the sitemap without verified reason:** The current sitemap contains 48 canonical URLs with 100% clean 200 HTTP status and zero duplicates. Modifying URLs arbitrarily destroys historical crawler indexing state.
- ✅ **DO maintain clean internal linking:** The strongest signal for crawler re-indexing is authentic, crawlable HTML `<a href="...">` anchor links connecting high-traffic pages (Homepage, `/how-it-works`, `/security`, Editorial runbooks) to vertical and comparison hubs.
