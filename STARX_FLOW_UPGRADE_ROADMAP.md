# STARX FLOW — UPGRADE ROADMAP (P0 TO P3)
## Comprehensive Technical & Experience Remediation Plan

---

### Document Overview & Executive Summary

This roadmap defines the prioritized engineering, product, and design actions required to elevate StarX Flow from its current production state (`https://starx-flow.runs-on.dev`) to market-leading parity with flagship benchmarks (**Apple, Linear, Stripe, Vercel, Framer, Intercom, HubSpot, Calendly, Raycast, ManyChat, Retell AI**).

Recommendations are strictly categorized by impact and urgency:
- **P0: Launch Blockers** — Critical data integrity, entitlement, or functional breakdowns that must be resolved prior to public commercial operation.
- **P1: Important Before Launch** — High-visibility polish, parity essentials, keyboard navigation, and friction reducers that directly impact customer conversion and daily utility.
- **P2: Premium Quality Improvements** — Interaction fluidities, visual canvas builders, live WebRTC media streams, and sophisticated micro-interactions.
- **P3: Post-Launch Strategic Expansion** — Multi-tenant agency white-labeling, native mobile companion experiences, and frontier voice intelligence.

Every recommendation includes: **Exact Problem**, **Evidence & Component Locations**, **Proposed Solution**, **Benchmark Inspiration**, **User & Business Impact**, **Engineering Complexity**, **Dependencies**, and **Measurable Acceptance Criteria**.

---

## 1. P0 — Launch Blockers

### P0-1: Billing Tier Naming, Polar Product ID, and Store Entitlement Discrepancy

- **Exact Problem:**
  There is a critical misalignment across three core layers of the monetization stack:
  1. The public marketing page (`src/app/pricing/PricingClient.tsx`) advertises **Starter ($29/mo)**, **Growth ($59/mo)**, and **Pro ($99/mo)**.
  2. The Polar SDK integration (`src/lib/polar.ts`) maps product keys to **starter ($29)**, **pro ($59)**, and **enterprise ($99)**.
  3. The local dashboard billing store (`src/store/billingStore.ts`) uses legacy tier keys **free ($0)**, **starter ($47)**, and **pro ($97)** with mismatched usage limit thresholds.
  
  When a paying customer purchases the marketed "Growth" plan ($59/mo), the Polar checkout initiates Polar plan `pro`. When the webhook returns `pro`, `billingStore.ts` maps this to legacy Pro limits ($97 tier) rather than Growth limits, leading to entitlement leaks, customer confusion, and broken tier downgrade logic.

- **Evidence & Code Locations:**
  - `src/app/pricing/PricingClient.tsx` (Lines 48–110): Defines plans as `{ id: 'starter', price: 29 }, { id: 'growth', price: 59 }, { id: 'pro', price: 99 }`.
  - `src/lib/polar.ts` (Lines 18–34): `POLAR_PRODUCTS = { starter: process.env.POLAR_STARTER_PRODUCT_ID, pro: process.env.POLAR_GROWTH_PRODUCT_ID, enterprise: process.env.POLAR_PRO_PRODUCT_ID }`.
  - `src/store/billingStore.ts` (Lines 22–58): `type PlanTier = 'free' | 'starter' | 'pro'; PLAN_LIMITS = { free: { contacts: 50 }, starter: { contacts: 500, price: 47 }, pro: { contacts: 2500, price: 97 } }`.
  - `src/app/api/billing/webhook/route.ts`: Parses product name and tier claims.

- **Proposed Solution:**
  1. Standardize the `PlanTier` type throughout the entire codebase to:
     ```typescript
     export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';
     ```
  2. Update `src/store/billingStore.ts` with accurate pricing and tiered quotas:
     - **Starter ($29/mo):** 1,000 WhatsApp contacts/mo, 1 AI Voice Agent, 100 voice mins/mo, 3 active workflows, 1 staff seat.
     - **Growth ($59/mo):** 5,000 WhatsApp contacts/mo, 3 AI Voice Agents, 500 voice mins/mo, 15 active workflows, 5 staff seats, custom CRM webhooks.
     - **Pro ($99/mo):** 25,000 WhatsApp contacts/mo, 10 AI Voice Agents, 2,000 voice mins/mo, unlimited workflows, 15 staff seats, priority AI latency SLA.
     - **Enterprise (Custom):** Unlimited volumes, dedicated database cluster, custom fine-tuned acoustic voice models.
  3. Re-align `src/lib/polar.ts` product ID environment variable bindings to match `POLAR_PRODUCT_STARTER`, `POLAR_PRODUCT_GROWTH`, `POLAR_PRODUCT_PRO`.
  4. Ensure `src/app/api/billing/webhook/route.ts` translates Polar webhook product identifiers into the validated `PlanTier` enum when writing to Supabase `organizations.subscription_tier`.

- **Benchmark Inspiration:**
  - **Stripe & Linear:** 100% atomic alignment between marketing pricing tables, billing portal checkout sessions, and application permission gates.

- **User & Business Impact:**
  - Prevents revenue leakage, billing support tickets, customer over-billing disputes, and silent provisioning failures on launch day.

- **Engineering Complexity:**
  - **Medium** (~4–6 hours).

- **Dependencies:**
  - Polar Dashboard product catalogue configuration, Supabase `organizations` table migration.

- **Measurable Acceptance Criteria:**
  - Purchasing "Growth" on `https://starx-flow.runs-on.dev/pricing` opens Polar checkout displaying exactly "$59.00 USD / month".
  - On completed checkout webhook delivery, the organization's record in Supabase reflects `subscription_tier = 'growth'`.
  - `billingStore.ts` returns `contactsLimit = 5000` and `voiceMinutesLimit = 500`.

---

### P0-2: WhatsApp Webhook Signature Validation & Multi-Tenant Message Routing

- **Exact Problem:**
  `src/app/api/webhooks/whatsapp/route.ts` handles inbound Meta Cloud API messages. While message extraction and Supabase insertion operate cleanly, the production endpoint currently uses a fallback development bypass when `WHATSAPP_APP_SECRET` is not set in environment variables. If launched without strict signature enforcement, an attacker could spoof inbound customer messages, manipulate CRM lead statuses, or trigger malicious AI agent function calls.

- **Evidence & Code Locations:**
  - `src/app/api/webhooks/whatsapp/route.ts` (Lines 15–38): Webhook verification handshake and `x-hub-signature-256` validation.
  - `src/lib/whatsapp/metaClient.ts`: Outbound payload signing and API key handling.

- **Proposed Solution:**
  1. Remove all development signature bypasses in production mode (`process.env.NODE_ENV === 'production'`).
  2. Implement strict constant-time HMAC-SHA256 signature verification:
     ```typescript
     import crypto from 'crypto';
     function verifyMetaSignature(rawBody: string, signatureHeader: string, appSecret: string): boolean {
       const [algorithm, hash] = signatureHeader.split('=');
       if (algorithm !== 'sha256' || !hash) return false;
       const expectedHash = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
       return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
     }
     ```
  3. Validate tenant phone number ID (`entry[0].changes[0].value.metadata.phone_number_id`) against verified organizations before admitting the message into the event bus.

- **Benchmark Inspiration:**
  - **Stripe & Intercom:** Zero-tolerance signature verification with timing-safe comparisons and replay-attack timestamp boundaries.

- **User & Business Impact:**
  - Guarantees enterprise-grade security and prevents conversational injection attacks or spoofed customer leads.

- **Engineering Complexity:**
  - **Low** (~2–3 hours).

- **Dependencies:**
  - Meta App Secret configured in production Vercel environment variables.

- **Measurable Acceptance Criteria:**
  - Inbound HTTP POST requests lacking a valid `x-hub-signature-256` header immediately receive HTTP 401 Unauthorized.
  - Valid Meta-signed payloads process successfully in <150ms.

---

## 2. P1 — Important Before Launch (Brand Polish & High-Touch Utility)

### P1-1: Hero Interactive Demo Industry Scenario Switcher

- **Exact Problem:**
  The flagship homepage Hero showcases an interactive WhatsApp booking preview. However, the preview currently defaults permanently to the `Dental / Clinic` scenario. The 4 tab triggers above the frame (`Healthcare`, `Real Estate`, `Gyms & Fitness`, `Restaurants`) update active CSS borders, but do not re-seed the interactive conversation timeline to showcase the other tailored industry dialogues.

- **Evidence & Code Locations:**
  - `src/components/home/Hero.tsx` (Lines 112–195): Industry tab selector buttons.
  - `src/components/home/HeroInteractiveDemo.tsx`: WhatsApp timeline state and script sequencing.

- **Proposed Solution:**
  1. Create a declarative scenario dictionary in `src/components/home/heroScenarios.ts` containing realistic dialogues and simulated widgets for all 5 target verticals:
     - **Dental / Clinic:** Dr. Sarah slot confirmation, tooth cleaning quote, calendar invite.
     - **Real Estate:** 3-bedroom property brochure PDF download, open-house tour booking, price guide.
     - **Gyms & Fitness:** 1-on-1 personal training trial pass, fitness assessment scheduler, class timetable.
     - **Restaurants:** Table for 4 reservation, dietary preference capture, instant VIP confirmation.
     - **Professional Services:** 30-min strategy consultation, discovery questionnaire, automated Zoom link.
  2. Connect the active tab index to `HeroInteractiveDemo.tsx` via Framer Motion `AnimatePresence mode="wait"`, smoothly fading out the previous scenario and initiating the selected vertical's conversational sequence with natural typing delays.

- **Benchmark Inspiration:**
  - **Stripe:** Interactive billing demo tabs (Invoicing, Subscriptions, Payments) that instantly swap realistic card, invoice, and checkout states.
  - **Apple:** Product feature tab switchers with fluid cross-fading typography and preview widgets.

- **User & Business Impact:**
  - Multiplies homepage conversion rate for non-medical prospects who immediately see their exact business workflow automated in front of them.

- **Engineering Complexity:**
  - **Medium** (~5–7 hours).

- **Dependencies:**
  - `HeroInteractiveDemo.tsx`, scenario scripts.

- **Measurable Acceptance Criteria:**
  - Clicking "Real Estate" swaps the WhatsApp chat header avatar, title, and conversation script to the property booking sequence within 200ms.
  - Switching tabs resets the typing indicator animation cleanly without console warnings or layout shifts.

---

### P1-2: Linear-Style Keyboard Navigation & Fast Actions in CRM & Unified Inbox

- **Exact Problem:**
  While the CRM Leads table (`src/app/dashboard/leads/page.tsx`) and Unified Inbox (`src/app/dashboard/conversations/page.tsx`) support mouse clicks and hover spotlights, they lack keyboard-first shortcuts for high-velocity power operators. Users cannot cycle conversations with `j`/`k` or arrow keys, nor can they archive/resolve tickets with single-key strokes (`e` or `r`).

- **Evidence & Code Locations:**
  - `src/app/dashboard/leads/page.tsx`
  - `src/app/dashboard/conversations/page.tsx`
  - `src/components/dashboard/crm/LeadTable.tsx`
  - `src/components/dashboard/inbox/ConversationList.tsx`

- **Proposed Solution:**
  1. Implement a lightweight global keyboard hook `useListKeyboardNavigation`:
     - `ArrowDown` / `j`: Move selection to next lead/conversation.
     - `ArrowUp` / `k`: Move selection to previous lead/conversation.
     - `Enter`: Open selected lead detail modal or focus message input field.
     - `Escape`: Close detail modal or clear selection.
     - `e`: Archive / Mark as resolved.
     - `s`: Star / Flag high-priority lead.
  2. Add visible emerald keyboard badge hints (`kbd` tags) inside table headers and conversation headers when focus is detected.
  3. Ensure all inputs and search bars yield focus cleanly without trapping navigation.

- **Benchmark Inspiration:**
  - **Linear:** Unmatched `j`/`k` list traversal and single-key issue triage.
  - **Raycast:** Instant keyboard shortcuts with elegant translucent badges.

- **User & Business Impact:**
  - Triples daily operator productivity in high-volume WhatsApp support centres; wins praise from power users and sales directors.

- **Engineering Complexity:**
  - **Medium** (~6–8 hours).

- **Dependencies:**
  - Keyboard event listeners, ARIA listbox accessibility roles.

- **Measurable Acceptance Criteria:**
  - Pressing `j` and `k` in the inbox shifts the focused conversation item and updates the right-hand chat viewport without mouse intervention.
  - Active keyboard focus states display a distinct `2px solid rgba(16, 185, 129, 0.4)` emerald focus outline.

---

### P1-3: Unified Toast System & Mutation State Polish

- **Exact Problem:**
  Currently, feedback notifications across the application use a mix of local inline state alerts (`text-emerald-400 bg-emerald-950/40`), browser alerts, and standard toast notifications. Some asynchronous mutations (e.g. updating business hours in `/dashboard/settings`, exporting CSV in `/dashboard/leads`, or testing a prompt in `/dashboard/voice`) complete without an immediate tactile confirmation toast.

- **Evidence & Code Locations:**
  - `src/app/dashboard/settings/page.tsx`
  - `src/app/dashboard/leads/page.tsx`
  - `src/components/dashboard/voice/PromptEditor.tsx`
  - `src/components/ui/Toast.tsx` / `src/hooks/useToast.ts`

- **Proposed Solution:**
  1. Standardize on the centralized Liquid Glass toast system (`useToast()`):
     - Background: `rgba(2, 10, 6, 0.85)` with `backdrop-filter: blur(16px)` and emerald rim border `rgba(16, 185, 129, 0.25)`.
     - Variants: `success` (emerald check icon), `error` (crimson warning icon), `info` (cyan info icon), `loading` (smooth emerald spinner).
  2. Ensure every asynchronous mutation button displays a micro-spinner and disabled state during pending transit, followed by an emerald toast within 50ms of network completion.
  3. Add an "Undo" action hook for destructive operations (e.g., lead deletion, workflow step deletion).

- **Benchmark Inspiration:**
  - **Vercel & Stripe:** Discreet, non-intrusive floating toasts anchored to the bottom-right viewport with precise dismiss animations and action buttons.

- **User & Business Impact:**
  - Eliminates user uncertainty, eliminates accidental double-submits, and delivers a cohesive enterprise feel.

- **Engineering Complexity:**
  - **Low** (~3–4 hours).

- **Dependencies:**
  - Central `ToastContainer` in `src/components/ClientShell.tsx`.

- **Measurable Acceptance Criteria:**
  - Every mutation across all 12 dashboard views fires a consistent Liquid Glass toast with proper role="status" accessibility.

---

## 3. P2 — Premium Quality Improvements

### P2-1: Interactive Drag-and-Drop Node Workflow Canvas (React Flow / xyflow)

- **Exact Problem:**
  `src/components/dashboard/WorkflowEditor.tsx` currently represents multi-step automations using vertical form configuration cards. While functional for linear sequences (Trigger $\rightarrow$ Filter $\rightarrow$ Action), it lacks visual branch representation for conditional logic (e.g., "If VIP customer $\rightarrow$ send Voice Call; Else $\rightarrow$ send WhatsApp message"). Competitors like ManyChat and Make.com win customers primarily on the perceived ease of their interactive flowcharts.

- **Evidence & Code Locations:**
  - `src/app/dashboard/workflows/page.tsx`
  - `src/components/dashboard/WorkflowEditor.tsx`
  - `src/store/workflowStore.ts`

- **Proposed Solution:**
  1. Integrate `@xyflow/react` (React Flow) into `WorkflowEditor.tsx` styled with StarX Flow's obsidian-and-emerald design language:
     - Obsidian canvas background (`#020805`) with subtle emerald dot grid pattern.
     - Custom node components (`TriggerNode`, `ActionNode`, `ConditionNode`, `DelayNode`) with Liquid Glass cards and emerald connection handles.
     - Smooth cubic bezier connection edges with animated emerald data packet pulses (`stroke: #10b981`, animated dasharray).
  2. Maintain 100% backward compatibility with the existing JSON schema in `src/store/workflowStore.ts` by compiling visual node graphs into execution DAGs automatically.
  3. Include a mini-map, zoom controls (25% to 200%), and automatic layout button (Dagre / ELK algorithm).

- **Benchmark Inspiration:**
  - **ManyChat & Make.com:** Intuitive visual automation mapping.
  - **Linear & Vercel:** Ultra-crisp dark-mode canvas styling with zero UI clutter.

- **User & Business Impact:**
  - Unlocks significant marketing value (dramatic product GIFs and videos); reduces onboarding time for non-technical operations managers by 60%.

- **Engineering Complexity:**
  - **High** (~12–16 hours).

- **Dependencies:**
  - `@xyflow/react` package installation, node layout serialization engine.

- **Measurable Acceptance Criteria:**
  - Users can drag a "WhatsApp Trigger" onto the canvas, link it to an "AI Agent Reply" node, and save the workflow into Supabase `workflows` table.
  - The canvas renders at steady 60fps during pan, zoom, and node repositioning.

---

### P2-2: Multi-Staff Round-Robin Availability & Calendar Booking Engine

- **Exact Problem:**
  `src/app/dashboard/calendar/page.tsx` manages appointment slots for a single business entity. High-growth service businesses (dental clinics with 5 dentists, real estate brokerages with 10 agents, gyms with multiple trainers) require automated round-robin distribution to allocate leads to the next available team member.

- **Evidence & Code Locations:**
  - `src/app/dashboard/calendar/page.tsx`
  - `src/app/api/calendar/slots/route.ts`
  - `src/store/calendarStore.ts`

- **Proposed Solution:**
  1. Add a `staff_members` table in Supabase linked to `organizations`:
     - Fields: `id`, `name`, `email`, `google_calendar_token`, `working_hours`, `weight`, `is_active`.
  2. Implement a round-robin allocation engine in `src/app/api/calendar/book/route.ts`:
     - Checks free/busy status across all qualified staff calendars simultaneously.
     - Assigns the booking to the staff member with the lowest scheduled appointment count for the current calendar week.
  3. Upgrade `/dashboard/calendar` with a staff filter toggle allowing the receptionist to view individual or unified team schedules.

- **Benchmark Inspiration:**
  - **Calendly & HubSpot:** Team scheduling pages with automated round-robin and collective meeting availability.

- **User & Business Impact:**
  - Allows StarX Flow to close mid-market and multi-provider accounts currently locked into Calendly or Mindbody.

- **Engineering Complexity:**
  - **Medium** (~8–10 hours).

- **Dependencies:**
  - Multi-calendar Google OAuth refresh token management in Supabase.

- **Measurable Acceptance Criteria:**
  - When 2 staff members are configured with identical availability, consecutive bookings alternate between staff members and sync to their respective Google Calendars.

---

### P2-3: Real-Time WebRTC Telephony Carrier Integration in Voice Studio

- **Exact Problem:**
  The Voice AI dashboard (`src/app/dashboard/voice/page.tsx`) provides an audio waveform visualizer and configures AI prompt parameters, voice selection, and call logs. However, the browser "Test Agent" feature currently simulates speech interaction via local Web Audio synthesizers rather than connecting directly to an active bidirectional WebRTC voice pipeline (such as LiveKit, Retell AI, or Twilio).

- **Evidence & Code Locations:**
  - `src/app/dashboard/voice/page.tsx`
  - `src/components/dashboard/voice/VoiceRadar.tsx`
  - `src/store/voiceStore.ts`

- **Proposed Solution:**
  1. Implement a WebRTC duplex audio client in `src/lib/voice/webRtcClient.ts`:
     - Streams microphone audio via Opus codec to a secure streaming edge proxy.
     - Receives low-latency (<500ms) synthesized response audio chunks and pipes them through an `AudioContext` analyser node to drive `VoiceRadar.tsx`.
  2. Add real-time speech transcription visualizer showing live customer utterances and AI agent thoughts in a split streaming terminal.
  3. Provide one-click inbound phone number provisioning (Twilio / Telnyx API integration) directly from `/dashboard/voice/numbers`.

- **Benchmark Inspiration:**
  - **Retell AI & Vapi:** Zero-latency browser phone simulator with real-time token/latency waterfall charts.

- **User & Business Impact:**
  - Creates the ultimate "aha!" moment during sales demos and empowers prospects to test their AI receptionist's actual voice latency before paying.

- **Engineering Complexity:**
  - **High** (~14–18 hours).

- **Dependencies:**
  - Streaming voice backend endpoint (LiveKit / Retell / ElevenLabs Conversational AI WebRTC token endpoint).

- **Measurable Acceptance Criteria:**
  - Clicking "Test Live Agent" in `/dashboard/voice` prompts for microphone access, initiates a real WebRTC session, and responds vocally to spoken prompts with latency under 800ms.

---

## 4. P3 — Post-Launch Strategic Expansion

### P3-1: Multi-Tenant Agency White-Labeling & Custom Domain Routing

- **Exact Problem:**
  Digital marketing agencies managing WhatsApp automation for multiple client businesses want to present StarX Flow under their own branding, custom logos, and custom domains (e.g. `receptionist.agencyname.com`) without referencing StarX Flow.

- **Evidence & Code Locations:**
  - `src/middleware.ts`
  - `src/app/dashboard/layout.tsx`
  - `src/components/BrandLogo.tsx`

- **Proposed Solution:**
  1. Add domain wildcard routing in `src/middleware.ts` utilizing Vercel Edge Middleware:
     - Resolves custom hostnames against `organizations.custom_domain`.
     - Rewrites root to the agency's custom branded portal.
  2. Add organization branding customization settings:
     - Custom logo upload, favicon upload, agency support email, and primary accent color override (persisted in `organizations.branding_config`).
  3. Deliver an Agency Portal tab for managing sub-accounts with consolidated billing.

- **Benchmark Inspiration:**
  - **GoHighLevel (GHL):** Agency white-labeling infrastructure that powers thousands of reselling agencies.

- **User & Business Impact:**
  - Unlocks wholesale B2B agency distribution channels capable of onboarding hundreds of sub-merchants per agency partner.

- **Engineering Complexity:**
  - **High** (~16–20 hours).

- **Dependencies:**
  - Vercel Custom Domains API, SSL automated provisioning.

---

### P3-2: Progressive Web App (PWA) & Push Notification Companion

- **Exact Problem:**
  Business owners away from their desks cannot receive instant push alerts when a VIP customer requests urgent human handover on WhatsApp or when an AI call finishes with negative sentiment.

- **Proposed Solution:**
  1. Configure `next-pwa` with a hardened service worker and web app manifest (`manifest.json`):
     - StarX Flow emerald icon assets, standalone display mode, dark status bar color (`#020805`).
  2. Implement Web Push Notifications via standard VAPID keys:
     - "🚨 Urgent Handover: Dr. Miller's Clinic — John Doe requested human staff."
  3. Provide 1-tap WhatsApp reply launch directly from the mobile lock screen.

- **Benchmark Inspiration:**
  - **Linear & Intercom:** Flawless mobile companion apps that notify instantly without battery drain.

- **User & Business Impact:**
  - Drastically lowers response time for escalated conversations and increases executive product stickiness.

- **Engineering Complexity:**
  - **Medium** (~8–10 hours).

- **Dependencies:**
  - VAPID keys, Web Push API support.

---

### P3-3: Multilingual Acoustic Fine-Tuning & Regional Accent Models

- **Exact Problem:**
  Currently, voice synthesis relies on standard international English, Spanish, and French models. Businesses in the UK, Australia, India, and the Gulf require hyper-localized regional accents to ensure callers feel comfortable and confident in the AI receptionist.

- **Proposed Solution:**
  1. Integrate ElevenLabs and Cartesia multilingual voice models with regional accent tags (e.g., `en-GB-London`, `en-US-Southern`, `en-AU-Sydney`, `es-MX-Guadalajara`).
  2. Implement automatic language detection from the caller's initial spoken words and dynamically switch the speech-to-text and text-to-speech models mid-call.

- **Benchmark Inspiration:**
  - **Intercom Fin & Retell AI:** Autonomous multi-language switching with native dialect inflection.

- **User & Business Impact:**
  - Broadens addressable international market across the UK, Europe, Australia, and APAC.

- **Engineering Complexity:**
  - **Medium** (~6–8 hours).

- **Dependencies:**
  - Cartesia / ElevenLabs regional voice model catalog.

---

## 5. Upgrade Execution Schedule & Effort Matrix

| Recommendation ID | Name | Priority | Complexity | Est. Dev Hours | Target Release Milestone |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **P0-1** | Billing Tier & Entitlement Unification | **P0** | Medium | 4–6 h | Pre-Launch Hotfix (Immediate) |
| **P0-2** | WhatsApp Signature Validation Hardening | **P0** | Low | 2–3 h | Pre-Launch Hotfix (Immediate) |
| **P1-1** | Hero Scenario Dynamic Switcher | **P1** | Medium | 5–7 h | Launch Release (Sprint 1) |
| **P1-2** | Linear-Style Keyboard Shortcuts (`j`/`k`) | **P1** | Medium | 6–8 h | Launch Release (Sprint 1) |
| **P1-3** | Unified Toast & Mutation State Polish | **P1** | Low | 3–4 h | Launch Release (Sprint 1) |
| **P2-1** | Drag-and-Drop Node Workflow Canvas | **P2** | High | 12–16 h | Version 1.1 (Post-Launch Month 1) |
| **P2-2** | Multi-Staff Round-Robin Calendar Engine | **P2** | Medium | 8–10 h | Version 1.1 (Post-Launch Month 1) |
| **P2-3** | Real-Time WebRTC Telephony Carrier | **P2** | High | 14–18 h | Version 1.2 (Post-Launch Month 2) |
| **P3-1** | Agency White-Labeling & Custom Domains | **P3** | High | 16–20 h | Version 2.0 (Quarter 2) |
| **P3-2** | PWA & Instant Mobile Web Push | **P3** | Medium | 8–10 h | Version 2.0 (Quarter 2) |
| **P3-3** | Multilingual Regional Accent Models | **P3** | Medium | 6–8 h | Version 2.0 (Quarter 2) |

---

*Authored by the Google Antigravity Independent Product-Design, Engineering & Launch-Readiness Auditing Team.*
*Target Codebase: StarX Flow (`https://github.com/Tara1903/starx-flow` / `https://starx-flow.runs-on.dev`).*
