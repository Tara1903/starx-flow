# STARX-FLOW — BUSINESS DECISION REGISTER
**Document Reference:** `docs/planning/16_BUSINESS_DECISION_REGISTER.md`  
**Phase:** Phase 4B.2 — Final Execution Plan Refinement & Engineering Baseline  
**Date:** 2026-11-01  
**Status:** Formal Decision Register — Explicit Status Tracking  

---

## 1. Decision Register Purpose & Policy

This register formally documents the core strategic, economic, and compliance decisions governing StarX-Flow. In accordance with architectural governance rules, **proposed configurations are not treated as silently approved**. Each decision outlines its current status, architectural rationale, financial/unit economic consequences, compliance implications, and the explicit sign-off required from the Business Owner.

---

## 2. Decision Log

```
+---------------+-----------------------------------------------+---------------------------------------+
| Decision ID   | Decision Title                                | Current Governance Status             |
+---------------+-----------------------------------------------+---------------------------------------+
| BDR-01        | Tiered Pricing Structure (€49 / €97 / €297)   | PROPOSED — PENDING OWNER SIGN-OFF     |
| BDR-02        | Inbound Email via Resend Webhook Architecture | ARCHITECTURALLY RECOMMENDED           |
| BDR-03        | AI Voice Telephony Stack Selection            | ARCHITECTURALLY RECOMMENDED           |
| BDR-04        | Meta Business Verification Protocol           | EXTERNAL BLOCKER — ESCALATED TO OWNER |
+---------------+-----------------------------------------------+---------------------------------------+
```

---

### BDR-01: Commercial Tiered Pricing Structure (€49 / €97 / €297)

#### Current Status: **PROPOSED — PENDING OWNER SIGN-OFF**

#### Context & Discrepancy:
During repository discovery, a significant discrepancy was identified between the marketing frontend and the billing backend:
- The public pricing page (`src/components/pricing/PricingClient.tsx`) displays legacy pricing in US Dollars: **\$29 (Starter), \$59 (Growth), \$99 (Pro)**.
- The backend checkout handler (`src/app/api/stripe/checkout/route.ts`) and billing store (`src/lib/stores/billingStore.ts`) configure pricing in Euros: **€49 (Starter), €97 (Growth), €297 (Enterprise)**.

#### Proposed Recommendation:
Standardize the entire platform on the Euro tiering (**€49 / €97 / €297 / month**), aligned with European local businesses (SMEs):
- **Starter (€49/mo):** 1 AI Receptionist, 1,000 AI messages, Web Chat + WhatsApp, 1 Calendar, 1 Team Seat.
- **Growth (€97/mo):** All 8 AI Agents, 5,000 AI messages, 120 Voice Minutes, WhatsApp + Email + IG, 3 Staff Calendars, 5 Team Seats.
- **Enterprise (€297/mo):** Unlimited Agents, 25,000 AI messages, 600 Voice Minutes, Custom Knowledge Base, Dedicated EU Virtual Number, Unlimited Seats, 24/7 SLA.

#### Implementation Consequences:
- Update `PricingClient.tsx` copy, numbers, and features to eliminate user confusion.
- Update Stripe live product catalogs with matching tax codes (`txcd_10000000` Software as a Service).
- Enforce strict middleware quota checks in `/api/chat` and `/api/voice/*`.

#### Unit Economics & Margin Analysis:
- *Average COGS per Starter User (€49):* ~1,000 Gemini Flash tokens + WhatsApp conversation fee = ~€4.50. **Gross Margin: ~90.8%**.
- *Average COGS per Growth User (€97):* ~5,000 Gemini tokens + WhatsApp + 120 Voice mins (Deepgram + ElevenLabs) = ~€16.80. **Gross Margin: ~82.6%**.
- *Average COGS per Enterprise User (€297):* High usage + dedicated virtual number + 600 Voice mins = ~€48.50. **Gross Margin: ~83.7%**.

#### Owner Action Required:
Sign off on standardizing on **€49 / €97 / €297** and authorize updating `PricingClient.tsx`.

---

### BDR-02: Inbound Email Ingestion Architecture (Resend Webhook vs. AWS SES / SendGrid)

#### Current Status: **ARCHITECTURALLY RECOMMENDED — READY FOR EXECUTION**

#### Context:
StarX-Flow currently sends transactional emails using Resend (`src/lib/email/client.ts`). Inbound email processing is required to enable unified two-way email conversations in the Unified Inbox.

#### Architectural Options Evaluated:
1. **Option A: Resend Inbound Webhooks (Recommended)**
   - Resend provides native inbound email parsing via MX record forwarding to a signed webhook endpoint (`/api/integrations/email/inbound`).
   - *Pros:* Zero additional external vendors; leverages existing `RESEND_API_KEY`; clean JSON payload with parsed headers and attachments.
   - *Cons:* Requires tenant or platform domain MX record setup.
2. **Option B: AWS SES + S3 + Lambda / SendGrid Inbound Parse**
   - *Pros:* High volume deliverability.
   - *Cons:* High infrastructure complexity; AWS IAM credential management; higher dev overhead.

#### Proposed Recommendation:
Implement **Option A (Resend Inbound Webhook)** for unified developer ergonomics and low maintenance overhead.

#### Compliance & Legal Notes:
- Emails may contain European customer PII. Resend servers located in EU / US under Standard Contractual Clauses (SCCs).
- Incoming message bodies must be sanitized before storage to prevent stored XSS attacks.

#### Owner Action Required:
Approve Resend Inbound as the default email ingestion provider and configure DNS MX records for `inbound.starxflow.com`.

---

### BDR-03: AI Voice Telephony Stack Selection

#### Current Status: **ARCHITECTURALLY RECOMMENDED — READY FOR EXECUTION**

#### Context:
The existing `VoiceSection.tsx` simulates call logs with synthetic timers. True commercial voice telephony requires real PSTN/SIP phone connectivity, streaming speech-to-text, fast LLM reasoning, and natural speech synthesis.

#### Architectural Options Evaluated:
1. **Option A: Twilio Media Stream + Deepgram Nova-2 + ElevenLabs Turbo v2.5 (Recommended)**
   - Bidirectional WebSocket streaming between Twilio Voice and AI pipeline.
   - *Pros:* Maximum flexibility; lowest latency (<800ms conversational turn-taking); best European voice accents (ElevenLabs); fine-grained cost control.
   - *Cons:* Requires maintaining a lightweight persistent WebSocket gateway (Fly.io / Railway Node.js).
2. **Option B: Fully Managed Voice Platforms (Vapi.ai / Retell AI / Bland.ai)**
   - *Pros:* Fast setup; managed WebSocket server.
   - *Cons:* Double markup on telephony; vendor lock-in; third-party data processing agreements required for GDPR compliance; platform margin compression.

#### Proposed Recommendation:
Implement **Option A (Twilio + Deepgram + ElevenLabs)** via an isolated WebSocket gateway microservice.

#### Cost & Economics Breakdown (Per Voice Minute):
- Twilio Inbound Voice (EU): €0.010 / min.
- Deepgram Nova-2 STT: €0.0043 / min.
- Gemini 2.5 Flash LLM: €0.002 / min.
- ElevenLabs Turbo v2.5 TTS: €0.040 / min.
- *Total Cost per Voice Minute:* **~€0.056 / minute** (~€3.36 per hour of continuous call time).
- Fits comfortably within the Growth (€97) and Enterprise (€297) margins.

#### Compliance & Regulatory Notes:
- Telephony recording in the EU requires explicit two-party consent or a mandatory pre-call announcement: *"This call may be recorded for quality and appointment booking purposes."*
- Twilio Regulatory Compliance requires business registration documents (address, tax ID) to provision local EU virtual phone numbers (+49 Germany, +33 France, +34 Spain).

#### Owner Action Required:
1. Approve the Twilio + Deepgram + ElevenLabs technical stack.
2. Authorize provisioning a Twilio account with EU regulatory identity submission.

---

### BDR-04: Meta Business Verification & App Review Protocol

#### Current Status: **EXTERNAL BLOCKER — ESCALATED TO OWNER**

#### Context:
StarX-Flow integrates with Meta WhatsApp Cloud API and Instagram Direct Messages (Graph API). While development can proceed using Meta Test Phone Numbers and Sandbox Sandboxed Instagram accounts, production commercial deployment cannot go live until Meta conducts official Business Verification.

#### Requirements for Meta Production Approval:
1. **Official Legal Entity Documentation:** Registered European company extract (Handelsregisterauszug, Kbis, CIF, or Companies House Certificate), official utility bill matching business address, and European tax registration (USt-IdNr / VAT).
2. **Meta App Review Permissions:**
   - `whatsapp_business_messaging` (for WhatsApp Cloud API production tiering beyond 50 phone numbers/day).
   - `instagram_manage_messages` (for reading and replying to Instagram DMs).
   - `pages_manage_metadata` & `pages_messaging`.
3. **App Privacy Policy & Terms of Service URLs:** Must be publicly accessible on `https://starxflow.com/privacy` and `https://starxflow.com/terms`.

#### External Timeline & Impact on Roadmap:
- Meta Business Verification typically requires **5 to 14 business days**.
- Meta App Review for permissions takes **3 to 7 business days**.
- **Crucial Architectural Note:** Engineering implementation (WS-01, WS-02, WS-08) is built against Meta's standard sandbox API and test numbers without waiting. Verification is only an external blocker for the final production rollout (Sprint 5).

#### Owner Action Required:
Initiate Meta Business Verification in the Meta Business Manager and submit legal entity documents immediately to prevent blocking the final launch.

---

## 3. Summary of Approvals Needed from Business Owner

| Decision ID | Decision Title | Action Needed | Blocking Impact |
|---|---|---|---|
| **BDR-01** | €49 / €97 / €297 Pricing Structure | Explicit written approval to update frontend pricing copy and Stripe products. | Non-blocking for backend dev; required before marketing launch. |
| **BDR-02** | Resend Inbound Email Webhook | Approval to configure DNS MX records for inbound domain. | Non-blocking; needed for WS-07 live testing. |
| **BDR-03** | Twilio + Deepgram + ElevenLabs Stack | Approval to create Twilio and Deepgram accounts and deploy WebSocket gateway. | Non-blocking; needed for WS-11 live telephony. |
| **BDR-04** | Meta Business Verification | Upload legal company docs to Meta Business Manager. | **Critical Path for Production WhatsApp/IG Go-Live**. |
