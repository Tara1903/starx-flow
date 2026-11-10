# STARX-FLOW — PHASE 1
# DETAILED MODULE ARCHITECTURE (8 CORE MODULES)

**Document ID:** P1-DOC-04  
**Project:** StarX-Flow  
**Initiative:** Universal Search & AI Discoverability  
**Phase:** 1 — Engineering Blueprint  
**Scope:** Deep Architectural Specification of Modules M1 through M8  
**Author / Execution Agent:** Antigravity  
**Status:** COMPLETE MODULE SPECIFICATIONS

---

## MODULE 1: SEARCH INTELLIGENCE (M1)

### 1. Responsibilities
- Centralized generation and validation of page metadata (title tags, meta descriptions, canonical URLs, robots meta tags).
- Resolution of metadata for programmatic and dynamic routes (`/compare/*`, `/industries/*`).
- Generation of high-fidelity OpenGraph and Twitter/X summary cards for 100% of public routes.

### 2. Internal Components
- `MetadataRegistry`: Central dictionary of static routes and metadata rules (`seoConfig.ts`).
- `DynamicMetadataResolver`: Parameterized resolver for dynamic slug routes.
- `CanonicalNormalizer`: Strips trailing slashes, query parameters, and enforces HTTPS.
- `OGCardGenerator`: Maps routes to dedicated 1200x630 social preview assets.

### 3. Input & Output Data
- **Inputs:** Route path (`pathname`), dynamic route parameters (`params.competitorId`, `params.industryId`), site configuration.
- **Outputs:** Next.js `Metadata` object conforming to Next.js 16 metadata schema.

### 4. Dependencies & API Boundaries
- **Dependencies:** None (Pure TypeScript logic in Next.js Server Components).
- **API Boundaries:** Invoked exclusively via Next.js `generateMetadata()` lifecycle hook during server rendering.

### 5. Storage & Background Processing
- **Storage:** In-memory configuration file (`src/lib/seoConfig.ts`).
- **Background Processing:** None; executes synchronously during SSR / build time.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Automated CI check ensuring 100% of routes return non-empty titles and descriptions.
- **Error Handling:** If an unknown route slug is requested, fall back cleanly to `SEO_CONFIG.defaultTitle` and `SEO_CONFIG.defaultDescription`.
- **Security:** Sanitization of dynamic slug inputs to prevent cross-site scripting (XSS) via meta attributes.

### 7. Acceptance Criteria
- Every public route renders a unique `<title>` under 60 characters with exactly one brand suffix.
- Zero routes render `title: MISSING` or `canonical: MISSING`.

---

## MODULE 2: TECHNICAL INTELLIGENCE (M2)

### 2. Responsibilities
- Dynamic sitemap index generation and priority scoring.
- Management of crawler directives in `robots.txt` (including AI bots).
- Automated submission and ping to IndexNow protocol upon deployment.
- Monitoring edge server response times and Core Web Vitals (TTFB, LCP, CLS).

### 2. Internal Components
- `SitemapGenerator`: Next.js `src/app/sitemap.ts` dynamic route handler.
- `RobotsDirectiveManager`: Next.js `src/app/robots.ts` dynamic route handler.
- `IndexNowDispatcher`: Automated client sending modified URLs to `api.indexnow.org`.
- `PerformanceHealthWatcher`: Automated synthetic monitor checking live TTFB and status codes.

### 3. Input & Output Data
- **Inputs:** List of valid public routes, deployment timestamps, IndexNow secret key.
- **Outputs:** `sitemap.xml` (valid XML), `robots.txt` (valid robots syntax), HTTP 200/202 responses from IndexNow API.

### 4. Dependencies & API Boundaries
- **Dependencies:** Node.js `fetch` for IndexNow; Next.js metadata routes.
- **API Boundaries:** Public GET endpoints `/sitemap.xml` and `/robots.txt`; outbound POST to `https://api.indexnow.org/indexnow`.

### 5. Storage & Background Processing
- **Storage:** IndexNow key file (`public/[key].txt`).
- **Background Processing:** Post-deployment webhook triggering IndexNow URL submissions.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** HTTP status verification; GSC sitemap status telemetry.
- **Error Handling:** IndexNow network timeouts handled gracefully with exponential backoff (max 3 retries); failure does not block deployment.
- **Security:** Sensitive admin and dashboard routes strictly blocked in `robots.txt` (`Disallow: /dashboard/`, `Disallow: /admin/`, `Disallow: /setup/`).

### 7. Acceptance Criteria
- Valid `sitemap.xml` listing all 20+ public routes with current `lastmod` dates.
- Explicit allow rules for `GPTBot`, `PerplexityBot`, and `ClaudeBot` in `robots.txt`.

---

## MODULE 3: AI VISIBILITY INTELLIGENCE (M3)

### 1. Responsibilities
- Maintenance of machine-readable specifications (`/llms.txt` and `/llms-full.txt`).
- Direct injection of semantic question-and-answer microdata blocks for AI answer extraction.
- Weekly automated GEO citation and visibility benchmarking across ChatGPT, Perplexity, and Gemini.

### 2. Internal Components
- `LLMsSpecEngine`: Generates concise summary and deep architectural text files.
- `SemanticQAExtractor`: Semantic DOM component (`AIContent.tsx`) with Schema.org `Question` and `Answer` microdata.
- `GEOMonitoringRunner`: Automated evaluation script querying LLM APIs with standardized buyer prompts.

### 3. Input & Output Data
- **Inputs:** Verified product capabilities, pricing plans, competitor differences, buyer prompt library.
- **Outputs:** Plaintext markdown files (`/llms.txt`, `/llms-full.txt`), microdata HTML, weekly AI recommendation score reports.

### 4. Dependencies & API Boundaries
- **Dependencies:** External LLM APIs (Perplexity, OpenAI, Gemini) for benchmarking.
- **API Boundaries:** Public GET endpoints `/llms.txt` and `/llms-full.txt`.

### 5. Storage & Background Processing
- **Storage:** Static files in `public/`; benchmarking observation logs in `tests/geo-benchmarks/`.
- **Background Processing:** Weekly scheduled GitHub Action or cron job running prompt evaluation suite.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** LLM answer accuracy tracking; hallucination rate detection.
- **Error Handling:** Stale API keys handled with local fallback mock; zero exposure of secrets in public markdown.
- **Security:** Strictly verified business facts only; zero fabrication of capabilities or certifications.

### 7. Acceptance Criteria
- `/llms.txt` and `/llms-full.txt` return HTTP 200 with active production URLs (`starx-flow.runs-on.dev`).
- Factual single-sentence definitions present for all core platform capabilities.

---

## MODULE 4: ENTITY INTELLIGENCE (M4)

### 1. Responsibilities
- Multi-schema JSON-LD structured data generation conforming to Schema.org.
- Disambiguation of StarX-Flow organization identity in Google Knowledge Graph.
- Dynamic breadcrumb generation and software offer markup.

### 2. Internal Components
- `OrganizationSchemaBuilder`: Emits `Organization` schema with populated `sameAs` array.
- `SoftwareApplicationBuilder`: Emits `SoftwareApplication` with feature lists and pricing offers.
- `BreadcrumbSchemaBuilder`: Dynamic `BreadcrumbList` generator based on URL segments.
- `FAQSchemaBuilder`: Generates `FAQPage` schema from verified Q&A datasets.

### 3. Input & Output Data
- **Inputs:** Site configuration, pricing constants, active social profile URLs, breadcrumb segments.
- **Outputs:** Syntactically valid JSON-LD script blocks injected into HTML `<head>`.

### 4. Dependencies & API Boundaries
- **Dependencies:** None (Self-contained in `src/components/seo/SchemaMarkup.tsx`).
- **API Boundaries:** Server-side JSON-LD injection in Next.js Server Components.

### 5. Storage & Background Processing
- **Storage:** Static and dynamic schema templates.
- **Background Processing:** None; executes synchronously during SSR.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Google Rich Results Test API integration in automated test suites.
- **Error Handling:** Decouple unverified customer review ratings (`AggregateRating`) until verified external links exist to prevent Google manual action penalties.
- **Security:** Strict JSON encoding (`JSON.stringify`) to prevent script injection vulnerabilities.

### 7. Acceptance Criteria
- 100% pass on Google Rich Results Test for `/`, `/pricing`, `/features`, and `/product`.
- `sameAs` array populated with verified external profiles.

---

## MODULE 5: CONTENT INTELLIGENCE (M5)

### 1. Responsibilities
- Programmatic competitor comparison generation (`/compare/[competitorId]`).
- Vertical industry playbook generation (`/industries/[industryId]`).
- Topic cluster architecture and educational guide publishing (`/resources/articles/*`).

### 2. Internal Components
- `CompetitorComparisonEngine`: Side-by-side feature comparison grids and savings calculators.
- `IndustryPlaybookEngine`: Bespoke industry workflows, service taxonomies, and compliance specs.
- `ArticleKnowledgeEngine`: Markdown-backed educational blog and playbooks.

### 3. Input & Output Data
- **Inputs:** Structured comparison datasets (Zapier, Make, Mindbody, Vagaro, Calendly), vertical industry configs.
- **Outputs:** High-converting, deeply indexed semantic HTML pages.

### 4. Dependencies & API Boundaries
- **Dependencies:** Next.js dynamic routing (`[competitorId]`, `[industryId]`).
- **API Boundaries:** Public routes `/compare/*`, `/industries/*`, `/resources/*`.

### 5. Storage & Background Processing
- **Storage:** Local TypeScript data dictionaries or Markdown content files.
- **Background Processing:** Static site generation (SSG) with on-demand Incremental Static Regeneration (ISR).

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Google Search Console impressions and average position across competitor comparison queries.
- **Error Handling:** 404 handling with intelligent redirects if an invalid competitor slug is requested.
- **Security:** Objective, fact-checked comparative claims based on public competitor documentation.

### 7. Acceptance Criteria
- Dedicated comparison pages for all 7 sitemap competitors with unique titles, meta descriptions, and comparison tables.
- Bespoke content depth on all 5 vertical industry pages.

---

## MODULE 6: AUTHORITY INTELLIGENCE (M6)

### 1. Responsibilities
- Management and corroboration of external B2B software directory citations (G2, Capterra, AlternativeTo).
- Auditing and curation of authentic customer proof, testimonials, and verifiable ROI metrics.
- Establishing transparent author and founder E-E-A-T credentials.

### 2. Internal Components
- `DirectoryRegistryTracker`: Tracks vendor listing status and profile completion.
- `CustomerEvidenceVerifier`: Replaces generic testimonial placeholders with verified beta cohort evidence.
- `AuthorCredentialManager`: Structured founder and engineering team profiles for `/about`.

### 3. Input & Output Data
- **Inputs:** Founder credentials, verified customer permission releases, external directory URLs.
- **Outputs:** Attributed customer case study blocks, verified `Person` schemas, backlink citations.

### 4. Dependencies & API Boundaries
- **Dependencies:** External software directories; Founder administrative actions.
- **API Boundaries:** Inbound referral links and public profile pages.

### 5. Storage & Background Processing
- **Storage:** Verified customer testimonial records; author profile data.
- **Background Processing:** Periodic backlink and mention monitoring scripts.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Referring domain count and domain rating telemetry.
- **Error Handling:** Any customer feedback without explicit written consent is anonymized or aggregated.
- **Security:** Zero fabrication of customer endorsements or certifications.

### 7. Acceptance Criteria
- Testimonial section on homepage links to verified business entities or transparent beta benchmarks.
- Claimed software vendor profiles on G2 and AlternativeTo.

---

## MODULE 7: SOCIAL INTELLIGENCE (M7)

### 1. Responsibilities
- Establishing cohesive brand entity links across primary social networks (LinkedIn, YouTube, X).
- Embedding high-resolution video demonstrations of the 2-second WhatsApp booking interaction.
- Synchronizing OpenGraph visual cards with social platform aspect ratios.

### 2. Internal Components
- `SocialNodeConnector`: Integrates verified social profile links into `Footer.tsx` and `SchemaMarkup.tsx`.
- `VideoEmbedManager`: Responsive, privacy-conscious YouTube/Loom video player components.
- `SocialCardValidator`: Automated validation of Twitter Summary Cards and LinkedIn OpenGraph renders.

### 3. Input & Output Data
- **Inputs:** Video embed IDs, claimed social profile handles.
- **Outputs:** Responsive video embeds, verified outbound link icons, valid social meta cards.

### 4. Dependencies & API Boundaries
- **Dependencies:** YouTube iframe player, social profile URLs.
- **API Boundaries:** Outbound links in `Footer.tsx`.

### 5. Storage & Background Processing
- **Storage:** Static thumbnail images; embed configuration.
- **Background Processing:** None.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Social share card preview verification via Twitter Card Validator and LinkedIn Post Inspector.
- **Error Handling:** Graceful fallback placeholder if embedded video fails to load.
- **Security:** Video embeds use privacy-enhanced mode (`youtube-nocookie.com`).

### 7. Acceptance Criteria
- `@starxflow` claimed on X and linked in footer.
- 60-second product demo video embedded on `/product`.

---

## MODULE 8: GROWTH INTELLIGENCE (M8)

### 1. Responsibilities
- Conversion Rate Optimization (CRO) across marketing landing pages and trial onboarding.
- Directing top-of-funnel search traffic to interactive AI receptionist simulator (`/chat`).
- Monitoring real-user Core Web Vitals to prevent page experience degradation.

### 2. Internal Components
- `TrialFunnelTracker`: Measures conversion rate from marketing visitor to onboarding start (`/setup/welcome`).
- `InteractiveSimulatorGateway`: Embedded and standalone entry points to live AI chat demo (`/chat`).
- `WebVitalsTelemetryWatcher`: Tracks real-world LCP, INP, and CLS performance.

### 3. Input & Output Data
- **Inputs:** Internal privacy-safe analytics events (`analytics_events` table).
- **Outputs:** Conversion funnel dashboards, Core Web Vitals health scorecards.

### 4. Dependencies & API Boundaries
- **Dependencies:** `src/services/analytics.ts`, `src/services/consent.ts`.
- **API Boundaries:** Internal Supabase analytics queue.

### 5. Storage & Background Processing
- **Storage:** Existing `analytics_events` and `analytics_daily_rollups` Supabase tables.
- **Background Processing:** Daily rollup worker processing job queue.

### 6. Monitoring, Error Handling & Security
- **Monitoring:** Onboarding completion drop-off rates.
- **Error Handling:** Analytics events drop silently if user denies cookie consent.
- **Security:** Strict GDPR/ePrivacy compliance; zero personally identifiable information (PII) logged in analytics.

### 7. Acceptance Criteria
- Clear, high-contrast CTA buttons ("Try Free for 14 Days", "Test Live Receptionist") on all marketing routes.
- 100% Core Web Vitals pass rate on mobile and desktop.
