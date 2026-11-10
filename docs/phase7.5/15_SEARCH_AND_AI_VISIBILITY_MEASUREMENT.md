# 15 — Search & AI Visibility Measurement Framework

**Project:** StarX-Flow  
**Phase:** 7.5 — Universal Search Engine, AI Discovery & Conversion Optimization  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Author:** Principal Growth Analytics Architect & Search Performance Researcher  
**Status:** Certified & Production Verified  

---

## 1. Executive Summary & Objective

Accurate measurement is required to evaluate the performance of StarX-Flow's search and AI discovery engine. In Phase 7.5, we reject fabricated metrics, estimated third-party vanity numbers, and untrackable proxies.

This document establishes the verified measurement methodology for tracking traditional search visibility, answer engine citations, generative retrieval presence, and downstream conversion attribution.

---

## 2. Dual Search Visibility Measurement Model

```
+---------------------------------------------------------------------------------+
|                       SEARCH & AI MEASUREMENT ARCHITECTURE                      |
+---------------------------------------------------------------------------------+
|  1. TRADITIONAL SEARCH ENGINES        |  2. GENERATIVE & ANSWER ENGINES         |
|  - Google Search Console (API)        |  - Perplexity Citation Frequency        |
|  - Bing Webmaster Tools               |  - OpenAI SearchGPT Grounded Mentions   |
|  - Impressions, Clicks, CTR, Position |  - Google AI Overviews Source Badges    |
|  - Branded vs Non-Branded Queries     |  - Direct AI Referral Traffic Logs      |
+---------------------------------------+-----------------------------------------+
|                      3. CONVERSION & REVENUE ATTRIBUTION                        |
|  - First-touch & Last-touch UTM Attribution                                     |
|  - Demo Lead Form Submission Rate (`/api/demo`)                                 |
|  - Polar Merchant of Record Subscription Activations                            |
+---------------------------------------------------------------------------------+
```

---

## 3. Traditional Organic Search KPIs

Data collected via Google Search Console and Bing Webmaster Tools API:

1. **Total Organic Impressions:** Aggregate count of SERP appearances for StarX-Flow URLs.
2. **Total Organic Clicks:** Verified visitor clicks navigating to `https://starx-flow.runs-on.dev/`.
3. **Average Click-Through Rate (CTR):** Measured by query intent category:
   - *Branded Queries (e.g. "StarX-Flow", "StarX-Flow AI"):* Target $\ge 25\%$.
   - *Commercial Vertical Queries (e.g. "dental ai receptionist"):* Target $\ge 4.5\%$.
   - *Informational Article Queries (e.g. "how to reduce spa no shows"):* Target $\ge 2.5\%$.
4. **Average Position:** Tracking progression into Top 10 for primary beachhead terms in the UK and Ireland.

---

## 4. Generative AI Visibility & Citation Tracking

Unlike traditional SERPs with fixed rankings, generative engines synthesize answers dynamically. Visibility is evaluated through a structured sampling matrix:

### 4.1 Evaluated Generative Engines
- **Perplexity.ai (Sonar / Pro Search):** Evaluated weekly across 20 core SMB automation queries.
- **Google AI Overviews (SGE):** Monitored for appearance of domain citations in knowledge cards.
- **ChatGPT Search / SearchGPT:** Monitored for primary link grounding when querying B2B software alternatives.
- **Claude Search:** Evaluated for technical architecture citation.

### 4.2 Citation Scoring Formula
$$\text{AI Visibility Index (AIV)} = \frac{\text{Citations Generated}}{\text{Total Prompts Sampled}} \times \text{Position Weight Factor}$$
Where citations appearing as the #1 primary reference carry a weight of 1.0, and secondary footnotes carry 0.5.

---

## 5. Privacy-Preserving Conversion Attribution

StarX-Flow rejects invasive third-party tracking scripts that degrade page performance and trigger GDPR cookie consent banners. 

Instead, conversion attribution is tracked natively:
- **UTM Capture:** `utm_source`, `utm_medium`, `utm_campaign`, and `referrer` parameters are captured client-side and attached directly to the `/api/demo` lead submission payload.
- **Server-Side Session Attribution:** Stored securely in PostgreSQL alongside lead records.
- **Polar Checkout Metadata:** Conversion source identifiers are passed to Polar checkout sessions to link paying subscriptions back to the originating acquisition channel.
