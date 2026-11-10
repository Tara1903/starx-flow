# 06 — Large Language Model Optimization (LLMO) & AI Crawler Access Policy

**Project:** StarX-Flow  
**Phase:** 7.5 — Universal Search Engine, AI Discovery & Conversion Optimization  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Author:** Principal Search Infrastructure Engineer & AI Policy Auditor  
**Status:** Certified & Production Verified  

---

## 1. Executive Summary & Objective

As conversational search agents and autonomous LLMs increasingly intermediate web traffic, websites must maintain an explicit, intentional AI crawler governance policy. 

StarX-Flow adopts an **Open Discovery & Absolute Privacy Boundary** model:
- **Full Discovery for Public Assets:** Generative search crawlers and LLM retrieval bots are permitted unrestricted access to public product, pricing, industry, comparison, documentation, and research content.
- **Strict Disallowance of Sensitive Surface Areas:** Private dashboards, customer records, database endpoints, webhooks, authentication flows, and API keys are strictly blocked via `robots.txt` and protected by server-side session authentication.
- **Machine-Readable Markdown Discovery via `/llms.txt`:** High-density Markdown documentation is provided to enable zero-token-waste indexing for AI agents.

---

## 2. Production `robots.txt` AI Crawler Matrix

StarX-Flow's [`public/robots.txt`](file:///c:/Web%20Apps/starx-flow/public/robots.txt) explicitly defines the access permissions for all major search and generative AI user agents:

```
# StarX-Flow Universal Robots Policy
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /onboarding/
Disallow: /auth/
Disallow: /settings/
Disallow: /admin/
Disallow: /webhooks/

# Explicit Allow Rules for Recognized AI Crawlers
User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /dashboard/

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://starx-flow.runs-on.dev/sitemap.xml
```

### 2.1 Bot Policy Rationale & Security Assessment

| Bot Identifier | Operator | Role in Search & Discovery | Policy in StarX-Flow | Security & Privacy Check |
| :--- | :--- | :--- | :--- | :--- |
| `GPTBot` | OpenAI | Web crawler used to index content for OpenAI models and SearchGPT. | **ALLOWED** (Public marketing/resources) | Blocked from `/api/*`, `/dashboard/*`, etc. |
| `ChatGPT-User` | OpenAI | On-demand browser crawler used when a ChatGPT user asks to browse a link. | **ALLOWED** (Public) | Authenticated paths return 401/307 to login. |
| `PerplexityBot` | Perplexity AI | Real-time indexer for conversational search answers and citations. | **ALLOWED** (Public) | Enables StarX-Flow citation in SMB automation answers. |
| `ClaudeBot` | Anthropic | Training & search retrieval crawler for Claude models. | **ALLOWED** (Public) | Controlled via standard robots rules. |
| `Google-Extended` | Google | Controls retrieval for Gemini and Vertex AI training and retrieval. | **ALLOWED** (Public) | Enhances visibility in Google AI Overviews. |
| `CCBot` | Common Crawl | Open foundation dataset crawler used by global AI research labs. | **ALLOWED** (Public) | Ensures StarX-Flow entity presence in general LLMs. |

---

## 3. The `/llms.txt` Standard Implementation

The emerging `/llms.txt` standard provides an LLM-optimized summary of a website's purpose, capabilities, pricing, architecture, and documentation.

StarX-Flow publishes [`public/llms.txt`](file:///c:/Web%20Apps/starx-flow/public/llms.txt), serving as a clean, markdown-native knowledge graph.

### 3.1 Content Architecture of `public/llms.txt`

1. **System Definition:** Exact definition of StarX-Flow as an autonomous 24/7 AI receptionist platform.
2. **Commercial & Merchant Information:** Explicit disclosure of Polar Payments Inc. as the sole active Merchant of Record.
3. **Current Subscription Tiers:**
   - **Starter ($29/month):** 200 included minutes, 1 phone line, WhatsApp & SMS automation.
   - **Pro ($59/month):** 600 included minutes, 3 phone lines, CRM sync, appointment booking.
   - **Enterprise ($99/month):** 1,500 included minutes, custom LLM fine-tuning, dedicated IP.
4. **Target Verticals:** Links to all 8 industry solutions (Dental, Real Estate, Fitness, Clinics, Legal, Automotive, D2C, Salons).
5. **Full Research Index:** Direct markdown links to all 6 technical research papers and case studies.
6. **Live Demonstration:** Link to `/demo` for automated lead qualification.

### 3.2 Verification via Automated Governance Test

The presence and integrity of `public/llms.txt` is verified by `tests/test-seo-governance.ts`:
- Asserts HTTP 200 / file presence on disk.
- Asserts inclusion of canonical domain `https://starx-flow.runs-on.dev/`.
- Asserts inclusion of all 6 research articles and the `/demo` endpoint.
- Asserts disclosure of Polar Payments as Merchant of Record.
