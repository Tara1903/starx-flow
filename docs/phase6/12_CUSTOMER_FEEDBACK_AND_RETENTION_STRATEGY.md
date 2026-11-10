# STARX-FLOW — WORKSTREAM L
# CUSTOMER FEEDBACK AND RETENTION STRATEGY

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Governing Standard:** Authentic Practitioner Feedback, Zero Fabricated Testimonials, Systematic Engineering Prioritization  

---

## 1. Retention Philosophy: Retention is Acquisition

In B2B SaaS, customer acquisition without retention is a leaky bucket. Acquiring a clinic or salon customer at a cost of £150 only makes financial sense if they remain subscribed for 12+ months (generating £350–£1,200 in Lifetime Value).

Customer retention in service businesses depends entirely on **reliability**:
If the AI receptionist misses a booking or causes a scheduling conflict, the clinic owner cancels immediately. StarX-Flow’s retention strategy is built on mathematical concurrency protection, transparent error handling, and structured practitioner feedback loops.

---

## 2. Customer Feedback Taxonomy

Every customer interaction, support ticket, and cancellation is categorized into a 5-tier taxonomy:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: CRITICAL BLOCKERS (P0 — Immediate Hotfix)                      │
│ • Webhook delivery failure (WhatsApp or Google Calendar sync dropped)   │
│ • Double-booking collision (Database exclusion constraint failure)     │
│ • SLA: Fix deployed within 2 hours.                                    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: INTEGRATION & ONBOARDING STALLS (P1 — High Priority)           │
│ • Meta Business verification stalled in Meta Business Manager          │
│ • Google Cloud OAuth consent warning screen during calendar linking    │
│ • SLA: Solutions architect responds with guided walkthrough in 4 hours.│
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: MISSING FEATURE REQUESTS (P2 — Roadmap Consideration)          │
│ • Multi-staff resource pooling within a single tenant account (CAP-20) │
│ • Outbound automated telephone voice calling                           │
│ • Triage: Aggregated in roadmap feature voting matrix.                 │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 4: UX & WORKFLOW USABILITY FRICTION (P3 — Sprint Refinement)      │
│ • FAQ upload file formatting confusion                                 │
│ • Business hours selector usability on mobile devices                  │
│ • Triage: Reviewed in bi-weekly design refinement sprints.             │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 5: COMMERCIAL & PRICING FEEDBACK                                  │
│ • Requests for annual prepayment discounts                             │
│ • Multi-location group pricing inquiries                               │
│ • Triage: Routed to solutions architect for custom quote.              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Systematic Feedback Capture Mechanisms

1. **In-App Support Intake (`SettingsSection.tsx` & Dashboard):**
   - Direct support email: `support@starx-flow.runs-on.dev`.
   - Dedicated "Need Multi-Location Scaling or Assistance?" quick-link in the dashboard.
2. **Post-Onboarding Micro-Survey (Day 3):**
   - Automatically triggered 72 hours after account creation:
     > *"How did your first test conversation go? (1 click: Flawless / Needs Fine-Tuning / Blocked)"*
   - Users selecting "Blocked" are immediately flagged for human assistance.
3. **Structured Cancellation Flow:**
   - Before a subscription is cancelled via `/api/billing/webhook`, the user selects the primary cancellation reason:
     - [ ] *Switching to another tool (Which one?)*
     - [ ] *Too complicated to connect WhatsApp / Meta*
     - [ ] *Missing multi-staff calendar pooling*
     - [ ] *Business closed / slow season*
     - [ ] *Pricing / cost concerns*
   - Data is stored in `subscriptions.cancellation_reason` for product iteration.

---

## 4. Churn Reduction & Proactive Retention Protocols

| Trigger Condition | Risk Level | Proactive Retention Action |
| :--- | :---: | :--- |
| **0 AI conversations in first 7 days** | **HIGH** | Automated email from founder: *"We noticed your WhatsApp receptionist hasn't received any messages yet. Would you like our solutions engineer to connect it for you on a 10-minute screen share?"* |
| **Google Calendar disconnected** | **HIGH** | High-priority dashboard banner: *"Calendar synchronization paused. Reconnect your Google Calendar to maintain real-time booking."* |
| **Payment Failed (`invoice.payment_failed`)** | **MEDIUM** | In-app notification with Stripe update link; 3-day grace period before subscription pause to prevent customer disruption. |
| **High conversation volume (>80% of limit)** | **LOW (Expansion Opportunity)** | In-app celebration: *"You've automated over 400 customer conversations this month! Upgrade to Growth to unlock unlimited chats."* |

---

## 5. Strict Prohibition on Fabricated Reviews

In strict adherence to Phase 6 governance rules:
- **Zero Automated Review Bots:** No fabricated positive testimonials will be injected into marketing pages or review platforms.
- **Genuine Practitioner Evidence Only:** Social proof will only feature real business owners who have tested the software and consented to publication.
- **Google Maps Review Compliance:** StarX-Flow will never participate in review-gating (filtering negative feedback before Google Maps).
