# STARX-FLOW — WORKSTREAM F
# CUSTOMER ONBOARDING AND ACTIVATION

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Flow Audited:** `/setup/welcome` → `/setup/account` → `/setup/whatsapp` → `/setup/instagram` → `/setup/sms` → `/setup/ai` → `/setup/test` → `/setup/launch`  

---

## 1. Onboarding Objective: Shortening Time to First Value (TTFV)

The primary goal of StarX-Flow's onboarding architecture is to compress **Time to First Value (TTFV)** to under 5 minutes. 

If a merchant signs up and encounters external blockers (such as waiting days for Meta to verify their business phone number), they abandon the platform. StarX-Flow's dual-path onboarding guarantees that every user reaches an instant "Aha!" moment on Day 1 regardless of external approval timelines.

---

## 2. The 8-Step Progressive Setup Wizard

```
  Step 1: /setup/welcome
  ├── Value summary: "Train Your AI", "Unified Messaging", "Automate Workflows"
  └── Action: "Begin Guided Setup" or "Skip to Dashboard"
         │
         ▼
  Step 2: /setup/account
  ├── Collects: Owner Name, Business Name, Industry Vertical, Phone
  └── Writes to Supabase `profiles` table & initializes `aiConfig`
         │
         ▼
  Step 3: /setup/whatsapp (The Dual-Track Channel)
  ├── Track A (Instant): "Web Sandbox Mode" (Instant zero-approval test widget)
  └── Track B (Production): "Meta Cloud API OAuth" (Connect Meta WABA ID)
         │
         ▼
  Step 4: /setup/instagram (Optional)
  └── Connects Meta Graph API for Instagram DM automation
         │
         ▼
  Step 5: /setup/sms (Optional)
  └── Connects Twilio SMS credentials or skips
         │
         ▼
  Step 6: /setup/ai (Brain Training)
  ├── Sets Tone: "Professional", "Friendly", "Casual"
  └── Knowledge Ingestion: Uploads business FAQs, services, pricing, and clinic hours
         │
         ▼
  Step 7: /setup/test (The "Aha!" Moment)
  └── Live interactive chat simulator testing grounded FAQ retrieval and booking
         │
         ▼
  Step 8: /setup/launch
  ├── Confetti animation, accomplishment summary checklist, readiness score
  └── Redirects to redesigned Command Center Dashboard (/dashboard)
```

---

## 3. Managing External Approval Dependencies (Meta Business Verification)

One of the greatest operational friction points in WhatsApp SaaS onboarding is the **Meta Business Manager review timeline**:
- Connecting an official WhatsApp Business phone number requires:
  1. A Meta Business Manager account.
  2. Business legal verification (incorporation docs, utility bill).
  3. Display name review.
  4. Webhook verification.
- This process typically takes between **2 hours and 3 business days**.

### The StarX-Flow Dual-Track Solution:
1. **The Instant Web Sandbox:**
   During `/setup/whatsapp`, users are presented with two clear options:
   - *"Test Now in Web Sandbox (Instant): Test your AI receptionist right now in our browser simulator without needing any Meta approvals."*
   - *"Connect Official WhatsApp Number: Link your Meta Business account for live WhatsApp messaging."*
2. **Zero-Blocker Guarantee:**
   Users who choose the Web Sandbox complete 100% of the onboarding wizard in under 4 minutes. They train their AI brain, test live scheduling, and see their dashboard populated with real data.
3. **Asynchronous Meta Onboarding Support:**
   Once inside the dashboard, an alert badge in the Channels section provides step-by-step documentation and support for submitting their Meta Business verification documents.

---

## 4. Segment-Specific Onboarding Paths

### 4.1 Segment A (Small Business Self-Serve)
- **Path:** Pure self-serve digital wizard.
- **Key Metric:** Completed within 5 minutes.
- **Focus:** Quick win — connect Google Calendar, upload 3 FAQs (Opening hours, price of primary service, parking location), and send a test message.

### 4.2 Segment B (Mid-Market Assisted Onboarding)
- **Path:** Pre-onboarding architecture consultation via `DemoModal`.
- **Key Metric:** Multi-calendar setup and white-glove webhook configuration.
- **Focus:** Enterprise governance — setting up staff accounts, connecting corporate Microsoft Outlook calendars, configuring custom cancellation buffers, and verifying GDPR data export policies.

---

## 5. Drop-Off Monitoring & In-App Smart Nudges

If a user abandons setup before completing Step 8, the application triggers persistent recovery mechanisms:
- **Dashboard Setup Banner:** In `src/components/setup/SetupBanner.tsx`, a persistent banner displays remaining tasks (e.g., *"Setup 60% Complete: Connect your calendar to enable autonomous booking"*).
- **Interactive Checklist:** In `src/components/setup/SetupChecklist.tsx`, clickable checklist items allow users to jump directly back to incomplete configuration steps.
- **Readiness Score Indicator:** In `src/components/setup/ReadinessScore.tsx`, a color-coded radial progress dial provides visual motivation to reach 100% operational readiness.
