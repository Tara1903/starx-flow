# STARX-FLOW — PHASE 7: CONTROLLED CUSTOMER PILOT PROGRAM

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage G  
**Program Architect:** Chief Product Officer & Customer Success Lead  
**Pilot Target Cohort:** 3 Initial Pilots → 5 Expanded Pilots → 10 Paying Customers  

---

## 1. Pilot Program Objective & Principles

The Controlled Customer Pilot is an evidence-gathering and validation vehicle designed to test StarX-Flow in real production business environments with founder-level white-glove onboarding and monitoring.

### Core Pilot Principles:
1. **Commercial Intent from Day 1:** The pilot is structured as an evaluation period (14 or 30 days) leading to an active subscription ($29/mo or $59/mo), NOT a perpetual free giveaway.
2. **Founder-Level Support:** The platform owner directly oversees every pilot account, monitors conversation logs (with customer consent), and verifies system performance daily.
3. **Strict Cohort Gating:** New businesses are admitted only after the preceding cohort is stable:
   - **Wave 1:** 3 Pilot Businesses (Intense qualitative observation, daily bug triage).
   - **Wave 2:** 5 Pilot Businesses (Testing self-serve onboarding improvements).
   - **Wave 3:** 10 Paying Customers (Proving conversion and sustainable retention).

---

## 2. Business Eligibility & Qualification Criteria

A business qualifies for the StarX-Flow Pilot Program only if it satisfies all 5 criteria:

| Criterion | Requirement | Verification Method |
|---|---|---|
| **1. Target Geography** | United Kingdom or Ireland (or AU/CA with approved timezone fit) | Verified business address on website/Google Business Profile |
| **2. Target Industry** | Hair/Beauty Salon, Aesthetic Clinic, Dental Clinic, or Fitness Studio | Review of public service menu and booking model |
| **3. Inbound Volume** | At least 10 customer inquiries per week across chat/phone | Confirmed during discovery interview |
| **4. Owner Engagement** | Business owner or practice manager commits to 20-min weekly check-in | Written agreement during pilot kickoff |
| **5. Willingness to Pay** | Explicit agreement that software will convert to paid plan if success criteria are met | Formal pilot agreement |

---

## 3. Pilot Terms & Conversion Process

- **Trial Period:** 14 calendar days from the date of first live deployment.
- **Pilot Commercial Terms:**
  - Standard access to StarX-Flow Starter ($29/mo) or Pro ($59/mo) plan features.
  - 100% discount for the initial 14-day trial period using promo code or trial entitlement.
  - At Day 12, an evaluation review is conducted: if agreed success criteria are met, the business activates their recurring subscription via the Polar Customer Portal.
- **Exit & Cancellation Rights:** The business can discontinue at any moment before Day 14 with zero charge, zero lock-in, and all customer data exportable via `/api/gdpr/export`.

---

## 4. Empirical Pilot Success Criteria

A pilot is certified **SUCCESSFUL** if it achieves at least 4 of the following 5 empirical benchmarks during the 14-day window:

1. **Activation Speed:** Business completes business setup, FAQ upload, and sandbox test in under 20 minutes.
2. **Workflow Completion:** StarX-Flow successfully answers at least 15 real customer questions without requiring human intervention.
3. **Appointment Capture:** At least 2 real customer appointments are scheduled or initiated through the platform.
4. **Zero Double-Bookings:** Zero scheduling conflicts or calendar errors.
5. **Customer Satisfaction:** Business owner rates their confidence in the AI at 8/10 or higher.

---

## 5. Pilot Operating Cadence & Monitoring

```
+---------------------------------------------------------------------------------+
| DAY 0: Kickoff & Configuration Call (30 mins)                                   |
| - Account created, custom FAQs entered, calendar linked, test queries completed.|
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| DAY 3: First Contact & Channel Health Check (Async)                             |
| - Review first inbound conversation logs, adjust FAQ wording or tone if needed. |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| DAY 7: Mid-Point Review (15 mins call / video)                                  |
| - Review number of inquiries handled, review any unanswered questions, tune AI. |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| DAY 12: Commercial Review & Conversion Preparation                              |
| - Present pilot metrics: total hours saved, total inquiries answered, bookings.  |
| - Provide Polar checkout link for subscription continuation.                    |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| DAY 14: Conversion or Graceful Exit                                             |
| - Paid subscription confirmed via Polar webhook OR account archived cleanly.    |
+---------------------------------------------------------------------------------+
```

---

## 6. Pilot Metrics Tracking Sheet (Template)

For each participating business, record:

| Pilot Metric | Business 1 | Business 2 | Business 3 | Target |
|---|---|---|---|:---:|
| **Business Name & Sector** | *(Pending)* | *(Pending)* | *(Pending)* | Salons / Clinics |
| **Onboarding Time** | — | — | — | < 20 mins |
| **Live Inquiries Handled** | — | — | — | > 15 / fortnight |
| **Confirmed Appointments** | — | — | — | > 2 / fortnight |
| **AI Hallucinations / Errors** | — | — | — | **0** |
| **Owner Satisfaction (1-10)** | — | — | — | ≥ 8 |
| **Paid Conversion Status** | — | — | — | Paid via Polar |

*(Note: In accordance with execution rules, no fake pilot data or manufactured business names are recorded.)*
