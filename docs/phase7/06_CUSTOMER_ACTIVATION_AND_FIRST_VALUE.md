# STARX-FLOW — PHASE 7: CUSTOMER ACTIVATION & FIRST VALUE SPECIFICATION

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage F  
**Lead:** Chief Product Officer & Customer Success Lead  
**Activation Target:** First meaningful customer outcome achieved in < 15 minutes  

---

## 1. The Value Journey & Friction Analysis

A customer who signs up is not an activated user. A user is only activated when they achieve **First Meaningful Value (FMV)**.

```
[1. Account Signup] ----> [2. Business Details] ----> [3. AI FAQ Setup] ----> [4. Sandbox Test] ----> [5. First Real Booking]
     (0–2 mins)                (2–5 mins)                (5–10 mins)             (10–12 mins)               (Day 1–3)
         |                          |                          |                       |                        |
      SIGNUP                     ONBOARDED                 CONFIGURED             FIRST PROOF              ACTIVATED
```

### Critical Friction Points Identified in Existing Journey:
1. **Empty State Paralysis:** When a user arrives at `/setup/ai`, they are presented with 2 generic FAQ inputs ("What are your hours?", "Where are you located?"). New clinic and salon owners do not know what questions their AI needs to know to book appointments.
2. **Channel Forcing:** Previously, the onboarding flow suggested connecting WhatsApp and Instagram before testing AI responses. When a user did not have a Meta developer account ready, they felt blocked or dropped out.
3. **Lack of Instant Affirmation:** After running a test in `/setup/test`, users needed immediate confirmation that their AI understood their specific services and pricing.

---

## 2. Friction Reductions & Product Improvements

### 2.1 One-Click Industry FAQ Starter Templates
To eliminate the blank-page dilemma, StarX-Flow introduces instant 1-click industry starter packs in the AI training step (`/setup/ai`):
- **For Hair & Beauty Salons:** Pre-populates deposit requirements, cancellation policies, skin patch test rules (48h prior), and consultation requirements for major color services.
- **For Dental & Medical Clinics:** Pre-populates new patient intake policies, private fees guidance, emergency pain triage protocols, and NHS/private classification rules.

### 2.2 Optional Channel Setup with Sandbox-First Flow
Users are explicitly guided:
> *"You do not need to connect your live WhatsApp or Instagram today. You can train and test your assistant immediately in our Web Sandbox. You can connect your live channels whenever you are ready."*

### 2.3 Meaningful Empty States in the Dashboard
When a new user launches their dashboard:
- Instead of empty tables saying "No data", the inbox and calendar display a clear, interactive guidance card:
  - Step 1: Send a test message to your assistant.
  - Step 2: View the incoming conversation thread.
  - Step 3: Embed the Web Chat widget or share your direct booking link.

---

## 3. Industry-Specific Onboarding Playbooks

### 3.1 Playbook A: Hair & Beauty Salon Onboarding (12 Minutes)
1. **Step 1: Business Profile (2 mins):** Enter salon name, business type ("Beauty & Wellness"), operating hours, and location.
2. **Step 2: Choose Assistant Tone (1 min):** Select **Friendly & Warm** (e.g., emojis enabled, conversational style).
3. **Step 3: Load Salon Starter FAQs (3 mins):** Click "Apply Salon Starter Pack" to immediately configure:
   - *"Do you require a deposit?"* -> *"Yes, we take a £20 deposit to secure your appointment, deductible from your final bill."*
   - *"Do I need a patch test before hair color?"* -> *"Yes, all new color clients must have a quick skin patch test at least 48 hours before treatment."*
   - *"Can I bring a guest or child?"* -> Clear salon policy on accompanying visitors.
4. **Step 4: Test in Sandbox (3 mins):** Ask the assistant about appointment slots and pricing in the interactive test runner.
5. **Step 5: Go Live on Website or Social (3 mins):** Copy the 1-line Web Chat widget script or test link.

### 3.2 Playbook B: Dental & Private Clinic Onboarding (15 Minutes)
1. **Step 1: Clinic Profile (3 mins):** Enter practice name, business type ("Medical & Dental"), practice address, and emergency contact details.
2. **Step 2: Choose Assistant Tone (1 min):** Select **Professional & Empathetic**.
3. **Step 3: Load Dental/Medical Starter FAQs (5 mins):** Click "Apply Clinic Starter Pack" to immediately configure:
   - *"What do I do if I have severe toothache?"* -> Emergency triage questions + emergency slot availability guidance.
   - *"Do you accept NHS or private patients?"* -> Clear distinction of private fees and payment plans.
   - *"What is included in a new patient consultation?"* -> Detailed breakdown (X-rays, examination, treatment plan).
4. **Step 4: Connect Calendar (3 mins):** Authorize Google Calendar or choose StarX-Flow native calendar.
5. **Step 5: Verify Emergency Guardrails in Sandbox (3 mins):** Test emergency keywords to verify the AI properly refers severe trauma or hemorrhage to emergency services.

---

## 4. Activation Definition & Measurement Rules

To ensure strict compliance with Phase 7 integrity rules:
- **`Registered`**: Account created in Supabase Auth.
- **`Onboarded`**: Business profile and AI FAQs saved (`onboardingComplete = true`).
- **`Verified in Sandbox`**: At least 1 test query successfully executed in `/setup/test`.
- **`ACTIVATED`**: At least 1 real customer conversation handled OR 1 real calendar appointment booked.

Only customers who reach the **`ACTIVATED`** state are counted toward Phase 7 milestone achievements.
