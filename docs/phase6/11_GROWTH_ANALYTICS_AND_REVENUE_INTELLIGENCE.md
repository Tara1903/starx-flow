# STARX-FLOW — WORKSTREAM K
# GROWTH ANALYTICS AND REVENUE INTELLIGENCE

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Governing Standard:** Privacy-First Telemetry, GDPR / PECR Compliance, Zero Manufactured Numbers  

---

## 1. Analytics Architecture: Privacy-Compliant Measurement

In compliance with EU GDPR and UK PECR regulations, StarX-Flow enforces a **privacy-by-design measurement framework**:
- **Zero Third-Party Invasive Trackers:** No invasive surveillance scripts (e.g., Meta Pixel with third-party behavioral profiling) are loaded without explicit user consent via [`src/components/CookieConsent.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/CookieConsent.tsx).
- **Server-Side Aggregation:** Sensitive funnel events (signups, demo requests, subscriptions) are aggregated server-side via Supabase and Next.js route handlers rather than client-side ad network pixels.
- **Strict Data Truth:** No manufactured search impressions, conversion rates, or MRR figures. Unmeasured metrics are explicitly marked **PENDING LIVE TRAFFIC ACCUMULATION**.

---

## 2. Full-Funnel Metric Taxonomy

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 1. ACQUISITION METRICS (Top of Funnel)                                  │
  │ • Unique Visitors (GSC & Server Logs)                                  │
  │ • Country Distribution (UK, Ireland, Commonwealth vs Other)            │
  │ • Referral Channels (Organic Search, Direct, G2/Capterra, LinkedIn)     │
  │ • High-Intent Demo Inquiries (`demo_requests` table count)             │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 2. ACTIVATION METRICS (Middle of Funnel)                                │
  │ • Signup Initiation Rate (SignupModal impressions vs submissions)       │
  │ • Magic Link Verification Completion Rate                              │
  │ • Onboarding Completion Rate (/setup/welcome → /setup/launch)           │
  │ • Time to First Value (TTFV) (Target: < 5 minutes)                     │
  │ • First Value Activation Rate (% of users executing test AI chat)      │
  ├────────────────────────────────────────────────────────────────────────┤
  │ 3. REVENUE & MONETIZATION METRICS (Bottom of Funnel)                    │
  │ • Trial-to-Paid Conversion Rate (14-day trial → active subscription)    │
  │ • Monthly Recurring Revenue (MRR) (Active subscription sum in EUR/GBP)  │
  │ • Average Revenue Per Account (ARPA) (Target: €47–€97/mo)              │
  │ • Customer Churn Rate (% of cancelled subscriptions per month)          │
  │ • Net Revenue Retention (NRR)                                           │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Telemetry Tables

StarX-Flow’s operational database stores real business telemetry directly in PostgreSQL:

| Metric Category | Database Source Table | Primary Queries / Filters |
| :--- | :--- | :--- |
| **Demo & Inbound Leads** | `demo_requests` | `select count(*), business_type, status from demo_requests group by business_type, status;` |
| **User Signups & Profiles** | `profiles` | `select count(*), business_type, date_trunc('week', created_at) from profiles group by 2, 3;` |
| **Channel Adoptions** | `channels` | `select channel_key, is_connected, count(*) from channels group by 1, 2;` |
| **AI Conversations** | `conversations` | `select count(*), date_trunc('day', created_at) from conversations group by 2;` |
| **Active Subscriptions** | `subscriptions` | `select count(*), plan_id, sum(amount) from subscriptions where status = 'active' group by plan_id;` |
| **Paid Invoices & Revenue** | `invoices` | `select sum(amount), currency, date_trunc('month', paid_at) from invoices where status = 'paid' group by 2, 3;` |

---

## 4. Search Engine Attribution Tracking

To track which keyword clusters generate real business customers, StarX-Flow leverages clean URL parameters and Search Console data:
- **UTM Parameter Architecture:**
  - `utm_source`: `g2`, `capterra`, `producthunt`, `linkedin`, `partner_agency`
  - `utm_medium`: `directory`, `social`, `referral`, `screencast`
  - `utm_campaign`: `beachhead_uk_clinic`, `beachhead_ie_wellness`, `zerocommission_switch`
- **Organic Search Attribution Cadence:**
  - Domain verified: November 2026.
  - Performance data requires 28+ days of search impressions in Google Search Console before export.
  - The monthly export (`Queries.csv` and `Pages.csv`) will populate StarX-Flow’s Tier 1 keyword metrics table.
