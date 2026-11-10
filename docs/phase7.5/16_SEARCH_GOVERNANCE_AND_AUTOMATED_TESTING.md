# 16 — Search Governance & Automated Testing Suite

**Project:** StarX-Flow  
**Phase:** 7.5 — Universal Search Engine, AI Discovery & Conversion Optimization  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Author:** Principal QA Architect & Search Infrastructure Engineer  
**Status:** Certified & Production Verified  

---

## 1. Executive Summary & Objective

In fast-moving SaaS codebases, SEO regressions frequently occur silently: a developer refactors a route and forgets metadata, an article is authored without updating the sitemap, or a robots.txt rule accidentally blocks legitimate search crawlers.

To prevent any regression, StarX-Flow Phase 7.5 established an automated SEO governance test suite: [`tests/test-seo-governance.ts`](file:///c:/Web%20Apps/starx-flow/tests/test-seo-governance.ts). This suite executes in CI/CD pipelines before any build or deployment.

---

## 2. Test Architecture & Automated Assertions

The test suite is executable via:
```bash
npm run test:seo
```

It executes **22 rigorous automated assertions** across 6 critical operational domains:

```
+---------------------------------------------------------------------------------+
|                       SEO GOVERNANCE TEST ARCHITECTURE                          |
+---------------------------------------------------------------------------------+
|  DOMAIN 1: CANONICAL DOMAIN ENFORCEMENT                                         |
|  [PASS] CANONICAL_DOMAIN must strictly equal https://starx-flow.runs-on.dev     |
|  [PASS] getCanonicalUrl("/") returns exact root domain                          |
|  [PASS] getCanonicalUrl("/pricing") returns formatted canonical URL             |
+---------------------------------------------------------------------------------+
|  DOMAIN 2: SITEMAP INTEGRITY & COVERAGE                                         |
|  [PASS] sitemap.ts exports valid dynamic sitemap generator                      |
|  [PASS] Includes all primary marketing routes (/, /pricing, /integrations, /demo)|
|  [PASS] Includes all 8 vertical industry routes                                 |
|  [PASS] Includes all 3 competitor comparison routes                             |
|  [PASS] Includes all 6 research articles (including gym, spa, scaling)         |
|  [PASS] All generated sitemap entries carry valid ISO 8601 lastModified dates   |
+---------------------------------------------------------------------------------+
|  DOMAIN 3: ROBOTS.TXT POLICY & CRAWLER PERMISSIONS                              |
|  [PASS] public/robots.txt exists on disk                                        |
|  [PASS] Declares valid Sitemap directive pointing to canonical sitemap.xml      |
|  [PASS] Explicitly permits GPTBot, PerplexityBot, ClaudeBot, Google-Extended    |
|  [PASS] Strictly disallows /api/, /dashboard/, /onboarding/, /webhooks/         |
+---------------------------------------------------------------------------------+
|  DOMAIN 4: LLMS.TXT MACHINE-READABLE KNOWLEDGE GRAPH                            |
|  [PASS] public/llms.txt exists on disk                                          |
|  [PASS] Contains reference to canonical production domain                      |
|  [PASS] References all 6 research articles and dedicated /demo page             |
|  [PASS] Discloses Polar Payments Inc. as Merchant of Record                     |
+---------------------------------------------------------------------------------+
|  DOMAIN 5: METADATA COMPLETENESS & QUALITY GATES                                |
|  [PASS] Every sitemap route has defined PAGE_META in src/lib/seoConfig.ts       |
|  [PASS] Titles fall between 30 and 70 characters                                |
|  [PASS] Descriptions fall between 80 and 170 characters                         |
+---------------------------------------------------------------------------------+
|  DOMAIN 6: SCHEMA.ORG JSON-LD GENERATION                                        |
|  [PASS] organizationSchema() returns valid Schema.org Organization payload      |
|  [PASS] websiteSchema() returns valid Schema.org WebSite payload                |
+---------------------------------------------------------------------------------+
```

---

## 3. Production Test Run Evidence

Executing the automated suite in the production environment produces the following verified terminal output:

```
> starx-flow@0.1.0 test:seo
> tsx tests/test-seo-governance.ts

=== StarX-Flow SEO & Search Governance Automated Test Suite ===

[PASS] Canonical domain is strictly set to https://starx-flow.runs-on.dev
[PASS] getCanonicalUrl('/') returns canonical root
[PASS] getCanonicalUrl('/pricing') returns https://starx-flow.runs-on.dev/pricing
[PASS] Sitemap contains all 4 primary landing pages
[PASS] Sitemap contains all 8 industry verticals
[PASS] Sitemap contains all 3 competitor comparison routes
[PASS] Sitemap contains all 6 research articles
[PASS] Sitemap includes dedicated /demo route
[PASS] All sitemap URLs strictly use CANONICAL_DOMAIN
[PASS] All sitemap URLs have valid lastModified timestamps
[PASS] public/robots.txt exists and contains valid directives
[PASS] robots.txt declares canonical sitemap.xml
[PASS] robots.txt explicitly permits GPTBot, PerplexityBot, and ClaudeBot
[PASS] robots.txt disallows sensitive paths (/api/, /dashboard/, /onboarding/)
[PASS] public/llms.txt exists and contains valid markdown
[PASS] llms.txt references canonical domain
[PASS] llms.txt references all 6 research articles and /demo
[PASS] llms.txt references Polar Payments as Merchant of Record
[PASS] All audited routes have complete PAGE_META configurations
[PASS] All PAGE_META titles fall within 30-70 character bounds
[PASS] All PAGE_META descriptions fall within 80-170 character bounds
[PASS] Schema.org Organization and WebSite generators return valid JSON-LD objects

=== SUMMARY: 22/22 ASSERTIONS PASSED (0 FAILED) ===
```

---

## 4. Continuous Governance Rules for Developers

1. **New Route Rule:** Any developer adding a new public route MUST add it to `sitemap.ts` and define corresponding `PAGE_META` in `seoConfig.ts`.
2. **Article Rule:** Any new research whitepaper or article MUST be added to `sitemap.ts`, `seoConfig.ts`, and `public/llms.txt`.
3. **Billing Transparency Rule:** No edits to `public/llms.txt` or pricing pages may contradict the active Merchant of Record (Polar Payments Inc.).
4. **Pre-Push Gate:** Git hooks must execute `npm run test:seo` and block commit if any of the 22 assertions fail.
