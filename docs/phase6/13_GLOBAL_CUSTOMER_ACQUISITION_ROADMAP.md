# STARX-FLOW — WORKSTREAM M
# GLOBAL CUSTOMER ACQUISITION ROADMAP (DAYS 1–90)

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Execution Horizon:** 6 Two-Week Sprints (90 Days Total)  

---

## 1. Roadmap Architecture

The 90-day acquisition roadmap executes in disciplined, observable sprints. Each sprint has defined engineering outputs, acquisition experiments, and verification gates.

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ SPRINT 1 (D1–15) │───▶│ SPRINT 2 (D16–30)│───▶│ SPRINT 3 (D31–45)│
│ Acquisition      │    │ Conversion & Demo│    │ Marketplace &    │
│ Readiness Audit  │    │ Engine Deploy    │    │ Partner Outreach │
└──────────────────┘    └──────────────────┘    └──────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ SPRINT 4 (D46–60)│───▶│ SPRINT 5 (D61–75)│───▶│ SPRINT 6 (D76–90)│
│ Beachhead Market │    │ Activation &     │    │ Growth Review &  │
│ Acquisition Runs │    │ Retention Tuning │    │ Expansion Gate   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Sprint-by-Sprint Execution Plan

### Sprint 1 (Days 1–15): Acquisition Readiness & Commercial Alignment
- **Focus:** Complete adversarial audit of product, funnel, and billing infrastructure.
- **Key Tasks:**
  - Audit all 106 production routes for broken links, redirect loops, and conversion drop-offs.
  - Formulate UK & Ireland beachhead strategy; document Wave 2 expansion hypotheses.
  - Identify pricing disparities between marketing pages ($29/$59/$99) and billing store (€47/€97/€297).
  - Audit database schema for single-tenant multi-staff scheduling limitations.
- **Deliverables:** `01_CUSTOMER_ACQUISITION_READINESS_AUDIT.md`, `02_GLOBAL_BEACHHEAD_MARKET_PLAN.md`, `03_IDEAL_CUSTOMER_PROFILES_AND_BUYER_JOURNEYS.md`.

### Sprint 2 (Days 16–30): Conversion & Lead Generation Engine Implementation
- **Focus:** Deploy missing lead capture and demo booking infrastructure.
- **Key Tasks:**
  - Engineer `/api/demo` with sliding-window rate limiting (max 5/10 min) and honeypot traps.
  - Create interactive `DemoModal.tsx` for consultative buyers; bind to "Book a Demo" buttons across navbar, product, and landing pages.
  - Create database migration `011_demo_requests_and_lead_capture.sql` with RLS policies.
  - Embed Subscription & Commercial Limits card inside `SettingsSection.tsx`.
  - Fix `/signup` 404 URL via permanent server redirect to `/setup/welcome`.
  - Execute automated lead capture test suite (`tests/test-demo-lead-engine.ts`).
- **Deliverables:** `04_CONVERSION_AND_ACTIVATION_ENGINE.md`, `05_LEAD_GENERATION_AND_DEMO_SYSTEM.md`, `06_CUSTOMER_ONBOARDING_AND_ACTIVATION.md`.

### Sprint 3 (Days 31–45): Marketplace Activation & Ecosystem Outreach
- **Focus:** Establish external directory presence and initiate agency partner outreach.
- **Key Tasks:**
  - Owner to submit vendor profiles on G2, Capterra, and Trustpilot using `@starx-flow.runs-on.dev` domain email.
  - Launch Product Hunt maker preparation with screencast gallery assets.
  - Initiate value-first 1-to-1 outreach to 30 boutique dental and aesthetic web design agencies in London and Dublin using Template 1.
  - Publish YouTube product demonstration: *"Deploying an AI WhatsApp Receptionist in Medical Practices Without Hallucinations"*.
- **Deliverables:** `07_EXTERNAL_MARKETPLACE_ACTIVATION_PLAN.md`, `08_PARTNERSHIP_AND_OUTBOUND_STRATEGY.md`, `09_CONTENT_LED_GROWTH_PLAN.md`.

### Sprint 4 (Days 46–60): Controlled Beachhead Acquisition Experiments
- **Focus:** Run targeted experiments in the UK and Ireland.
- **Key Tasks:**
  - Launch Experiment 1: Zero-Commission Private Clinic positioning targeting London and Dublin clinics.
  - Launch Experiment 2: Boutique Fitness trial-to-membership WhatsApp conversion.
  - Monitor Search Console for first 28-day organic impressions; export `Queries.csv` to map live search demand to landing pages.
  - Measure demo request volume, signup velocity, and onboarding drop-offs.
- **Deliverables:** Interim Experiment Report, Search Console Baseline Export.

### Sprint 5 (Days 61–75): Activation & Retention Optimization
- **Focus:** Eliminate drop-offs between signup and first value.
- **Key Tasks:**
  - Review onboarding completion rates: analyze step-by-step telemetry (`/setup/welcome` → `/setup/launch`).
  - Optimize Web Sandbox default fallback for merchants awaiting Meta WhatsApp verification.
  - Conduct 1-to-1 practitioner interviews with first 10 active trial users.
  - Resolve Tier 1 and Tier 2 feedback items from customer feedback taxonomy.
- **Deliverables:** `12_CUSTOMER_FEEDBACK_AND_RETENTION_STRATEGY.md` Updates, Onboarding Funnel Telemetry.

### Sprint 6 (Days 76–90): Growth Economics & Wave 2 Expansion Review
- **Focus:** Comprehensive business evaluation against the 50-customer gate.
- **Key Tasks:**
  - Calculate unit economics: Customer Acquisition Cost (CAC), Trial-to-Paid Conversion Rate, Monthly Recurring Revenue (MRR), and Churn.
  - Review G2 and Trustpilot verified customer reviews.
  - Evaluate readiness to unlock Wave 2 expansion markets (Australia and Canada).
  - Prepare Phase 7 roadmap.
- **Deliverables:** `14_PHASE6_MARKET_ACTIVATION_AND_ACCEPTANCE_REPORT.md`.

---

## 3. Risk Management & Governance Checkpoints

1. **Anti-Spam Gate:** No bulk unsolicited mailings or scraping. Any outreach must remain strictly 1-to-1 personalized.
2. **Data Integrity Gate:** No fabricated customers, reviews, or revenue statistics. If a metric cannot be measured, it is reported as **PENDING LIVE TRAFFIC ACCUMULATION**.
3. **Production Stability Gate:** Zero unverified changes to database schemas or production authentication. All code changes must pass `tsc --noEmit`, `scan:secrets`, and Turbopack production build.
