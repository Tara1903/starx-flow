# STARX-FLOW — EDITORIAL CONTENT & PUBLICATION PLAN
**Phase:** 5 — Global Keyword Intelligence & Customer Acquisition Engine  
**Document ID:** `docs/phase5/09_EDITORIAL_CONTENT_AND_PUBLICATION_PLAN.md`  
**Target Domain:** `https://starx-flow.runs-on.dev`  
**Git Branch:** `main`  
**Status:** Canonical Editorial Governance & Content Opportunity Backlog  

---

## 1. EDITORIAL INTEGRITY & ANTI-HALLUCINATION STANDARDS

To protect domain authority and maintain high search engine quality scores (Google Search Essentials, E-E-A-T principles):

1. **Zero Generic AI Filler:** Every article must deliver practical, engineering-grade or operational value written from the perspective of practitioners. Articles must never be vague listicles or superficial regurgitations.
2. **Zero Fabricated Outcomes:** Do not invent composite customer quotes, unverified conversion lifts, or fictional clinic names. All technical mechanisms (webhooks, PostgreSQL exclusion constraints, HMAC signatures, Supabase RLS) and operational workflows must reflect actual system capabilities.
3. **Verified Sources & Evidence:** All architectural diagrams, code snippets (e.g. PostgreSQL DDL, API webhook payloads), and regulatory references (GDPR Articles 15/17) must be verifiable in the StarX-Flow codebase.

---

## 2. THE 15 HIGH-IMPACT ARTICLE OPPORTUNITIES

Topics are scored across 6 dimensions: Commercial Relevance (CR), Search Demand (SD), Production Evidence (PE), Content Depth (CD), Competitive Moat (CM), and Conversion Potential (CP) (Scale 1–10, Max 60):

| # | Slug | Working Title | Core Topic & Semantic Target | Target Route | Score (Max 60) | Status |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: |
| **01** | `calendar-integration` | **Why Polling APIs Cause Double-Bookings: How Real-Time Webhooks Protect Service Calendars** | Concurrency, two-way calendar sync, PostgreSQL GiST exclusion constraints | `/resources/articles/calendar-integration` | **58 / 60** | **PUBLISHED & VERIFIED** |
| **02** | `clinic-receptionist` | **Deploying AI Receptionists in Medical & Dental Practices: Administrative Guardrails and Triage** | Clinical AI boundaries, emergency telephone handoff, zero medical hallucination | `/resources/articles/clinic-receptionist` | **57 / 60** | **PUBLISHED & VERIFIED** |
| **03** | `google-reviews-seo` | **The Local SEO Review Engine: How Automated WhatsApp Follow-Ups Drive Google Map Pack Prominence** | Post-service review triggers, timing formulas, Google non-gating policy | `/resources/articles/google-reviews-seo` | **56 / 60** | **PUBLISHED & VERIFIED** |
| **04** | `missed-call-recovery` | **The Anatomy of a Missed Call: How Instant WhatsApp Follow-Ups Recover Lost Service Revenue** | After-hours lead triage, instant text response speed, telephony disconnects | `/resources/articles/missed-call-recovery` | **54 / 60** | Backlog (Month 2) |
| **05** | `spa-no-shows` | **Eliminating Salon & Spa No-Shows: Interactive Two-Way Confirmations vs. Passive SMS** | 24-hr interactive confirmation, calendar slot re-opening, Stripe retainers | `/resources/articles/spa-no-shows` | **53 / 60** | **PUBLISHED & VERIFIED** |
| **06** | `gym-onboarding` | **Automating Boutique Fitness Onboarding: Digital Waivers, Class Prep & Trial Conversion** | Gym trial signups, WhatsApp waiver dispatch, automated class prep guides | `/resources/articles/gym-onboarding` | **52 / 60** | **PUBLISHED & VERIFIED** |
| **07** | `scaling-failures` | **Why Local Service Businesses Fail to Scale: Decoupling Front-Desk Headcount from Appointment Growth** | Front-desk labor bottlenecks, flat SaaS subscription vs commission overhead | `/resources/articles/scaling-failures` | **51 / 60** | **PUBLISHED & VERIFIED** |
| **08** | `whatsapp-cloud-api-guide` | **WhatsApp Business App vs. WhatsApp Cloud API: Architectural Guide for Growing Businesses** | Rate limits, webhook infrastructure, multi-agent inbox concurrency | `/resources/articles/whatsapp-cloud-api-guide` | **50 / 60** | Backlog (Month 2) |
| **09** | `instagram-dm-lead-funnel` | **Turning Instagram Story Replies into Booked Appointments: Multi-Step DM Qualification** | Social commerce, natural language parsing, CRM lead scoring from DMs | `/resources/articles/instagram-dm-lead-funnel` | **49 / 60** | Backlog (Month 2) |
| **10** | `restaurant-whatsapp-reservations` | **Bypassing Aggregator Commissions: How Independent Restaurants Take Direct WhatsApp Bookings** | Direct dining reservations, Google Calendar table sync, zero per-cover fees | `/resources/articles/restaurant-whatsapp-reservations` | **48 / 60** | Backlog (Month 3) |
| **11** | `ai-prompt-injection-defense` | **Securing Customer-Facing AI Agents: Prompt Injection Defense and Boundary Enforcement** | Adversarial prompt protection, tool-calling validation, customer data privacy | `/resources/articles/ai-prompt-injection-defense` | **48 / 60** | Backlog (Month 3) |
| **12** | `multi-staff-scheduling-architecture` | **Roster Optimization for Multi-Chair Salons: Managing Shift Overlaps, Breaks & Room Buffers** | Resource management, provider buffer times, multi-calendar concurrency | `/resources/articles/multi-staff-scheduling-architecture` | **47 / 60** | Backlog (Month 3) |
| **13** | `deposit-automation-stripe` | **Collecting Upfront Booking Retainers via WhatsApp Chat: Stripe Hosted Checkout Best Practices** | Upfront deposit collection, Stripe webhook verification, no-show reduction | `/resources/articles/deposit-automation-stripe` | **46 / 60** | Backlog (Month 3) |
| **14** | `real-estate-viewing-bot` | **Automated Property Tour Scheduling: Qualifying Buyers and Syncing Broker Availability** | Property viewing booking, buyer budget pre-qualification, realtor calendar sync | `/resources/articles/real-estate-viewing-bot` | **45 / 60** | Backlog (Month 3) |
| **15** | `multi-location-franchise-routing` | **Centralized AI Dispatching for Franchises: Geo-Routing Inbound Inquiries to Local Branches** | Multi-branch routing, location-specific service menus, enterprise governance | `/resources/articles/multi-location-franchise-routing` | **44 / 60** | Backlog (Month 3) |

---

## 3. DEPLOYED EDITORIAL ASSETS & PRE-RENDERING STATUS

Currently, **6 high-priority technical articles** are fully authored, sanitized, and pre-rendered in `src/app/resources/articles/[articleSlug]/ArticleViewerClient.tsx`:
1. `calendar-integration` (Verified & live)
2. `clinic-receptionist` (Verified & live)
3. `google-reviews-seo` (Verified & live)
4. `gym-onboarding` (Verified & live in client database)
5. `spa-no-shows` (Verified & live in client database)
6. `scaling-failures` (Verified & live in client database)

All articles feature:
- Canonical URLs with permanent `https://starx-flow.runs-on.dev` domain.
- `TechArticle` / `Article` JSON-LD schema with verified organization authorship ("StarX-Flow Product & Engineering Team").
- Direct contextual links back to relevant commercial landing pages (`/product`, `/security`, `/industries/dental-clinics`, `/industries/gyms-fitness`, `/industries/beauty-salons`).
