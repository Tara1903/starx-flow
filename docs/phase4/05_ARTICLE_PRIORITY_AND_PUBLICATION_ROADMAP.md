# STARX-FLOW — ARTICLE PRIORITY & PUBLICATION ROADMAP
**Phase:** 4 — Authority, Trust, Brand Entity & AI Search Visibility Engine  
**Document ID:** `docs/phase4/05_ARTICLE_PRIORITY_AND_PUBLICATION_ROADMAP.md`  
**Target Domain:** `https://starx-flow.runs-on.dev`  
**Git Branch:** `main`  
**Status:** Canonical Editorial Backlog & Initial Publication Plan  

---

## 1. THE 15-ARTICLE EDITORIAL RESEARCH BACKLOG

Every candidate topic has been evaluated across 7 weighted dimensions (Scale 1–10, Max Score 70):
1. **Search Intent Clarity (SI):** Does the search query indicate an urgent, solvable business problem?
2. **Business Relevance (BR):** Does this directly touch the core purchasing decision for StarX-Flow?
3. **Evidence Availability (EA):** Can we back this with verified technical and operational facts?
4. **Product Relevance (PR):** Can we link directly to verified, live product functionality?
5. **Competitive Difficulty (CD):** Can we outperform existing shallow blog posts? (Higher = Less competitive / easier to win)
6. **Content Uniqueness (CU):** Does our architectural approach provide a novel angle?
7. **Conversion Potential (CP):** Will an educated reader transition to a free trial or demo?

| # | Proposed Slug | Working Title | Cluster | SI | BR | EA | PR | CD | CU | CP | Total Score | Priority Tier |
| :-: | :--- | :--- | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :---: |
| **01** | `calendar-integration` | **Why Polling APIs Cause Double-Bookings: How Real-Time Webhooks Protect Service Calendars** | Concurrency / Tech | 9 | 10 | 10 | 10 | 9 | 10 | 9 | **67 / 70** | **PRIORITY 1 (Deploy Now)** |
| **02** | `clinic-receptionist` | **Deploying AI Receptionists in Medical & Dental Practices: Administrative Guardrails and Triage** | Clinical AI | 10 | 10 | 9 | 9 | 9 | 9 | 10 | **66 / 70** | **PRIORITY 1 (Deploy Now)** |
| **03** | `google-reviews-seo` | **The Local SEO Review Engine: How Automated WhatsApp Follow-Ups Drive Google Map Pack Prominence** | Local SEO | 10 | 9 | 10 | 9 | 8 | 9 | 10 | **65 / 70** | **PRIORITY 1 (Deploy Now)** |
| **04** | `missed-call-recovery` | **The Anatomy of a Missed Call: How Instant Text Recovery Recovers Abandoned Local Leads** | Lead Capture | 9 | 10 | 9 | 9 | 8 | 8 | 9 | **62 / 70** | Priority 2 (Month 2) |
| **05** | `spa-no-shows` | **Eliminating Salon & Spa No-Shows: Interactive Two-Way Confirmations vs. Passive SMS** | Operations | 9 | 9 | 9 | 9 | 7 | 8 | 9 | **60 / 70** | Priority 2 (Month 2) |
| **06** | `whatsapp-cloud-api-guide` | **WhatsApp Business App vs. WhatsApp Cloud API: The Architectural Guide for Growing Businesses** | WhatsApp Infra | 9 | 8 | 10 | 9 | 7 | 8 | 8 | **59 / 70** | Priority 2 (Month 2) |
| **07** | `gym-member-onboarding` | **Automating Boutique Fitness Onboarding: Digital Waivers, Class Prep & Trial Conversion** | Fitness Verticals | 8 | 9 | 8 | 9 | 8 | 8 | 8 | **58 / 70** | Priority 2 (Month 2) |
| **08** | `instagram-dm-lead-funnel` | **Turning Instagram Story Replies into Booked Appointments: A Multi-Step DM Qualification Framework** | Social Commerce | 9 | 8 | 8 | 9 | 7 | 8 | 8 | **57 / 70** | Priority 3 (Month 3) |
| **09** | `restaurant-whatsapp-reservations` | **Bypassing Aggregator Commissions: How Restaurants Take Direct Reservations on WhatsApp** | Dining Verticals | 8 | 8 | 9 | 8 | 8 | 8 | 8 | **57 / 70** | Priority 3 (Month 3) |
| **10** | `ai-prompt-injection-defense` | **Securing Customer-Facing AI Agents: Prompt Injection Defense and Boundary Enforcement** | AI Security | 8 | 8 | 9 | 9 | 8 | 8 | 7 | **57 / 70** | Priority 3 (Month 3) |
| **11** | `multi-staff-scheduling-architecture` | **Roster Optimization for High-Volume Salons: Managing Shift Overlaps, Breaks, and Room Buffers** | Operations | 8 | 8 | 8 | 8 | 8 | 8 | 7 | **55 / 70** | Priority 3 (Month 3) |
| **12** | `deposit-automation-stripe` | **Collecting Upfront Booking Retainers via WhatsApp Chat: Stripe Hosted Checkout Best Practices** | Payments | 8 | 8 | 9 | 8 | 7 | 7 | 8 | **55 / 70** | Priority 3 (Month 3) |
| **13** | `real-estate-viewing-bot` | **Automated Property Tour Scheduling: Qualifying Home Buyers and Syncing Broker Availability** | Real Estate | 8 | 7 | 8 | 7 | 8 | 7 | 7 | **52 / 70** | Priority 4 (Future) |
| **14** | `local-service-scaling-bottlenecks` | **Why Local Service Businesses Plateau: Decoupling Front-Desk Headcount from Appointment Growth** | Strategy | 7 | 8 | 7 | 7 | 7 | 7 | 7 | **50 / 70** | Priority 4 (Future) |
| **15** | `multi-location-franchise-routing` | **Centralized AI Dispatching for Franchises: Geo-Routing Inbound Customer Inquiries to Local Branches** | Enterprise | 7 | 7 | 7 | 7 | 8 | 7 | 6 | **49 / 70** | Priority 4 (Future) |

---

## 2. THE THREE INITIAL IMPLEMENTATION ARTICLES

The top 3 articles provide immediate, verifiable authority without requiring speculative external evidence:

### Article 1: `calendar-integration`
- **Canonical Route:** `https://starx-flow.runs-on.dev/resources/articles/calendar-integration`
- **Focus:** Concurrency, API architecture, two-way Google/Outlook calendar synchronization, and PostgreSQL exclusion constraints.
- **Unique Angle:** Breaks down the mechanical failure of polling intervals (e.g. 15-minute sync cycles) used by legacy scheduling tools, explaining how webhook-driven bi-directional locking guarantees zero double-bookings.
- **Verified Product Links:** Links to `/features` (Multi-Calendar Sync), `/security` (PostgreSQL RLS & Exclusion Constraints), and `/pricing`.

### Article 2: `clinic-receptionist`
- **Canonical Route:** `https://starx-flow.runs-on.dev/resources/articles/clinic-receptionist`
- **Focus:** Clinical administrative automation, emergency symptom escalation, and patient privacy boundaries.
- **Unique Angle:** Candidly explains that conversational AI should never diagnose medical symptoms or collect sensitive health histories over unencrypted channels, focusing strictly on administrative logistics (scheduling, directions, provider hours, and instant human handoffs for clinical urgency).
- **Verified Product Links:** Links to `/industries/dental-clinics`, `/industries/wellness-therapy`, and `/ai-customer-support`.

### Article 3: `google-reviews-seo`
- **Canonical Route:** `https://starx-flow.runs-on.dev/resources/articles/google-reviews-seo`
- **Focus:** Google Business Profile ranking factors (Relevance, Distance, Prominence) and automated post-service WhatsApp review workflows.
- **Unique Angle:** Analyzes the "Golden 2-Hour Window" after service checkout when customer sentiment is peak, explaining how direct messaging follow-ups outperform ignored email blasts.
- **Verified Product Links:** Links to `/features` (Google Review Booster), `/industries/beauty-salons`, and `/pricing`.

---

## 3. FACTUAL REMEDIATION & STANDARDIZATION IN CODE

The existing draft data in `src/app/resources/articles/[articleSlug]/ArticleViewerClient.tsx` must be sanitized during implementation:
1. **Author Sanitization:** Replace "Elena Rostova", "Dr. Marcus Vance", and "Tariq Mahmood" with verified organizational author: **"StarX-Flow Product & Engineering Team"**.
2. **Metrics Sanitization:** Strip unmeasured simulated metrics ("90% No-Show Reduction", "Admin Workload Red. 65%", "Sync Latency Rate 200ms", "Double-Booking Incidents 0"). Replace with factual operational parameters:
   - *Calendar Sync:* Webhook event-driven synchronization; database exclusion constraint locking.
   - *Clinic AI:* 24/7 automated administrative triage; immediate keyword-triggered human notification.
   - *Review Engine:* Direct WhatsApp checkout trigger; private merchant feedback gate.
3. **Route & Static Generation:** Add `generateStaticParams()` to `src/app/resources/articles/[articleSlug]/page.tsx` so all verified articles are statically pre-rendered at build time.
4. **Sitemap Integration:** Add the 3 verified article routes to `src/app/sitemap.ts` to ensure full indexing.
