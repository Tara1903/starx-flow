# STARX-FLOW — PHASE 7: 90-DAY LAUNCH EXECUTION ROADMAP

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage M  
**Author:** Launch Operations Director & Chief Product Officer  
**Format:** Six 15-Day Operational Sprints  
**Target Objective:** Acquire & Retain the First 10 Genuinely Paying Businesses  

---

## 1. Roadmap Architecture & Sprint Overview

```
[Sprint 1: Days 1–15]   Launch Hardening, Prospect Lead Center & Initial Discovery (UK Salons)
           |
           v
[Sprint 2: Days 16–30]  White-Glove Onboarding for First 3 Pilot Businesses (Cohort 1)
           |
           v
[Sprint 3: Days 31–45]  First 3 Paid Conversions (Polar MoR) & Clinic Discovery Expansion
           |
           v
[Sprint 4: Days 46–60]  Cohort 2 Pilot Deployment (5 Businesses) & Video Acquisition Launch
           |
           v
[Sprint 5: Days 61–75]  First-Month Cohort Retention Audit & Agency Referral Channel Pilot
           |
           v
[Sprint 6: Days 76–90]  Scale to 10 Paying Customers & Early Product-Market Fit Synthesis
```

---

## 2. Detailed 15-Day Sprint Breakdown

### Sprint 1 (Days 1–15): Launch Hardening & Initial Discovery
- **Objective:** Finalize operational foundations, implement the internal Demo Lead/Prospect Manager, and conduct 10 customer discovery interviews with UK salon owners.
- **Engineering Requirements:**
  - Build the Admin Lead Management tab in `src/app/admin/page.tsx` connected to `demo_requests`.
  - Add 1-click industry FAQ starter packs into `/setup/ai`.
- **Owner Actions:**
  - Review and approve outreach copy for Experiment 1.
  - Verify email forwarding for `support@starx-flow.runs-on.dev`.
- **Customer-Facing Milestone:** 10 discovery conversations completed.
- **Success Metric:** At least 3 qualified salon owners request to see a customized live demo.
- **Risks & Mitigation:** Low outreach response rate -> Pivot copy from features to after-hours lost revenue.
- **Exit Criteria:** 3 qualified pilot prospects identified.

---

### Sprint 2 (Days 16–30): The First 3 Pilot Businesses (Cohort 1)
- **Objective:** Onboard the first 3 pilot businesses with 1-on-1 founder support and verify live production usage.
- **Engineering Requirements:**
  - Monitor live conversation logs, adjust AI tone thresholds, fix any unexpected edge cases in appointment slot calculations.
- **Owner Actions:**
  - Conduct 30-minute kickoff calls with each pilot business owner.
  - Configure their services, FAQs, and calendar connection together.
- **Customer-Facing Milestone:** First 3 businesses actively receiving customer inquiries through StarX-Flow.
- **Success Metric:** Each pilot business handles > 10 inquiries with zero hallucinations.
- **Risks & Mitigation:** Business fails to embed web widget -> Founder offers to screen-share or embed it on their website.
- **Exit Criteria:** 3 businesses complete 14 days of live testing.

---

### Sprint 3 (Days 31–45): First Paid Conversions & Clinic Discovery
- **Objective:** Convert the first 3 pilots into paying Polar subscribers ($29/mo or $59/mo) and initiate discovery in private dental/aesthetic clinics.
- **Engineering Requirements:**
  - Verify Polar subscription webhooks (`order.paid`, `subscription.active`) process cleanly in production database.
- **Owner Actions:**
  - Conduct Day 12 commercial review with Cohort 1.
  - Send checkout links via Polar portal.
- **Customer-Facing Milestone:** First paying customers active in production!
- **Success Metric:** At least 2 of 3 pilot businesses convert to paid Polar subscriptions.
- **Risks & Mitigation:** Price sensitivity -> Emphasize the monetary value of appointments booked during the trial.
- **Exit Criteria:** First verified MRR generated via Polar.

---

### Sprint 4 (Days 46–60): Cohort 2 Pilot Deployment & Video Acquisition
- **Objective:** Deploy 5 new pilot businesses (expanding into private clinics) and publish 60-second video walkthroughs.
- **Engineering Requirements:**
  - Polish empty states and guided tooltips across the user dashboard.
- **Owner Actions:**
  - Record and publish Experiment 2 video demonstrations on LinkedIn and Instagram.
  - Onboard 5 new pilot practices.
- **Customer-Facing Milestone:** 5 new businesses active in pilot onboarding.
- **Success Metric:** ≥ 5 inbound demo requests generated from video content.
- **Risks & Mitigation:** Increased support requests -> Document recurring questions in clinic knowledge base.
- **Exit Criteria:** 5 pilot businesses achieve First Meaningful Value (FMV) in < 15 minutes.

---

### Sprint 5 (Days 61–75): Retention Audit & Agency Referral Channel
- **Objective:** Audit Month 2 retention of Cohort 1, convert Cohort 2 pilots, and test agency referral partnerships.
- **Engineering Requirements:**
  - Build automated integration health indicators into the dashboard.
- **Owner Actions:**
  - Conduct pre-renewal check with Cohort 1.
  - Contact 15 local UK digital web agencies with the referral revenue-share proposal.
- **Customer-Facing Milestone:** 100% renewal rate for Cohort 1; first agency referral call scheduled.
- **Success Metric:** At least 6 total paying customers active.
- **Risks & Mitigation:** Cancellation risk -> Address feedback immediately and refine AI responses.
- **Exit Criteria:** Zero churn among paying customers.

---

### Sprint 6 (Days 76–90): 10 Paying Customers & PMF Synthesis
- **Objective:** Achieve the ambitious milestone of 10 genuinely paying, activated businesses and synthesize early product-market fit findings.
- **Engineering Requirements:**
  - Run the Sean Ellis PMF survey in the customer dashboard.
- **Owner Actions:**
  - Review 90-day unit economics, total MRR, and conversion metrics with leadership.
- **Customer-Facing Milestone:** Target of 10 paying customers reached.
- **Success Metric:** 10 active paying customers; Sean Ellis test > 40% "very disappointed".
- **Risks & Mitigation:** Target missed -> Analyze pipeline drop-off and extend sprint cycles with proven channel.
- **Exit Criteria:** Phase 7 Final Review and roadmap preparation for Phase 8.
