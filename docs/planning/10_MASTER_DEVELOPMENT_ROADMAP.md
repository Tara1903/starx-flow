# StarX-Flow — Phase 4B.1 Blueprint
# Document 10: Master Development Roadmap

**Document ID:** `SXF-ROADMAP-10`  
**Classification:** Engineering Roadmap & Execution Sequence  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Technical Project Manager & Principal Software Architect  

---

## 1. Roadmap Overview & Execution Strategy

This master roadmap organizes the remaining engineering work into **15 targeted workstreams** arranged by technical dependency, commercial criticality, and risk profile.

### Priority Classifications
- **P0 (Critical Foundation & Commercial MVP):** Mandatory for core system integrity, security, and initial customer revenue.
- **P1 (Core Commercial Differentiators):** Essential for a competitive, fully autonomous operating system.
- **P2 (Advanced Telecommunications & Scaling):** Next-generation telephony and multi-location capabilities.
- **P3 (Optimizations & Edge Cases):** Micro-optimizations, auxiliary adapters, and aesthetic polish.

---

## 2. Parallelization Lanes & Execution Phases

```mermaid
gantt
    title StarX-Flow Commercial Engineering Execution Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Core MVP
    WS 01: Core Data & Cleanup (P0)       :active, ws01, 2026-11-02, 3d
    WS 04: Billing & Pricing Align (P0)    :ws04, after ws01, 3d
    WS 02: Unified Inbox Foundation (P0)   :ws02, after ws01, 4d
    WS 03: Google Calendar Sync (P0)       :ws03, after ws01, 4d
    WS 05: Onboarding Polish (P0)          :ws05, after ws04, 3d
    section Phase 2: Commercial Channels
    WS 06: Instagram DM Integration (P1)   :ws06, after ws02, 4d
    WS 07: Business Email Integration (P1) :ws07, after ws02, 5d
    WS 08: Knowledge Base PDF/pgvector (P1):ws08, after ws01, 4d
    WS 09: Lead Scoring Engine (P1)        :ws09, after ws02, 3d
    section Phase 3: Automation & Operations
    WS 10: Follow-up Engine & Cron (P1)    :ws10, after ws03, 4d
    WS 11: Workflow Graph Runtime (P1)     :ws11, after ws10, 5d
    WS 12: Analytics Daily Rollups (P1)    :ws12, after ws09, 3d
    WS 13: Super Admin Governance (P1)     :ws13, after ws04, 3d
    section Phase 4: Voice & Hardening
    WS 14: Voice Telephony Gateway (P2)    :ws14, after ws02, 8d
    WS 15: Security & Verification (P0)    :ws15, after ws11, 4d
```

### Concurrent Parallelization Lanes
- **Lane A (Backend & Messaging):** Workstreams 02 (Inbox), 06 (Instagram), 07 (Email).
- **Lane B (Operations & Commerce):** Workstreams 03 (Calendar), 04 (Billing), 10 (Follow-ups).
- **Lane C (AI & Intelligence):** Workstreams 08 (PDF/pgvector), 09 (Lead Scoring), 14 (Voice Telephony).

---

## 3. Detailed Workstream Specifications

---

### Workstream 01: Shared Architecture & Core Data Cleanup
- **Priority:** **P0** | **Complexity:** Small (3 SP) | **Duration:** 3 Days
- **Prerequisites:** None.
- **Tasks:**
  1. Safely deprecate and remove legacy root `api/` files (`api/whatsapp-webhook.ts`, `api/whatsapp/connect.ts`) to eliminate routing conflicts with App Router.
  2. Implement Migration `003_commercial_additions.sql` creating `channel_identities`, `lead_scoring_rules`, and `analytics_daily_rollups`.
  3. Ensure `src/types/database.ts` reflects all new tables.
- **Files Modified:** `api/*`, `src/types/database.ts`, `supabase/migrations/003_commercial_additions.sql`.
- **Testing:** Verify zero build regressions via `npm run typecheck` and `npm run build`.

---

### Workstream 02: Unified Communication Inbox & Channel Routing
- **Priority:** **P0** | **Complexity:** Medium (8 SP) | **Duration:** 4 Days
- **Prerequisites:** Workstream 01.
- **Tasks:**
  1. Build `ChannelRouter` service resolving inbound handles to single `lead_id` using `channel_identities`.
  2. Implement staff assignment (`assigned_to`) and internal team notes tab inside `ConversationThread.tsx`.
  3. Connect real-time delivery status indicators (single/double checkmarks for WhatsApp).
  4. Ensure human takeover pauses AI auto-responses and routes alerts to assigned staff.
- **Files Modified:** `src/lib/ai/orchestrator.ts`, `src/components/dashboard/ConversationThread.tsx`, `src/store/dashboardStore.ts`.
- **Testing:** Verify that a WhatsApp message and a Web Chat message from the same contact merge into a single thread.

---

### Workstream 03: External Calendar Bi-Directional Synchronization
- **Priority:** **P0** | **Complexity:** Large (8 SP) | **Duration:** 4 Days
- **Prerequisites:** Workstream 01.
- **Tasks:**
  1. Implement Google Calendar OAuth routes: `GET /api/calendar/google/auth` and `GET /api/calendar/google/callback`.
  2. Implement calendar delta sync worker importing Google Calendar busy events to block StarX-Flow slots.
  3. Implement outbound event push creating calendar events in user's primary Google Calendar upon StarX-Flow booking.
  4. Add "Connect Google Calendar" button and status pill in `CalendarSection.tsx`.
- **Files Modified:** `src/app/api/calendar/*`, `src/screens/dashboard/CalendarSection.tsx`, `src/store/calendarStore.ts`.
- **Testing:** Schedule event on Google Calendar; verify that StarX-Flow marks that time slot as conflicted and blocks booking.

---

### Workstream 04: Commercial Subscription Billing & Pricing Alignment
- **Priority:** **P0** | **Complexity:** Medium (5 SP) | **Duration:** 3 Days
- **Prerequisites:** Workstream 01.
- **Tasks:**
  1. Update [`src/app/pricing/PricingClient.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/pricing/PricingClient.tsx) to eliminate legacy USD pricing and display canonical **€49 Starter**, **€97 Pro**, and **€297 Enterprise** tiers with European SEPA details.
  2. Implement Stripe Customer Portal endpoint `POST /api/billing/portal` allowing self-service invoice downloads and card updates.
  3. Add "Manage Billing & Invoices" button in `SettingsSection.tsx`.
  4. Hook quota check in `AIOrchestrator` enforcing plan limits.
- **Files Modified:** `src/app/pricing/PricingClient.tsx`, `src/app/api/billing/portal/route.ts`, `src/screens/dashboard/SettingsSection.tsx`, `src/lib/ai/orchestrator.ts`.
- **Testing:** Perform test checkout on Pro plan; verify redirection to dashboard and access to billing portal.

---

### Workstream 05: Self-Service Business Onboarding Polish
- **Priority:** **P0** | **Complexity:** Small (3 SP) | **Duration:** 3 Days
- **Prerequisites:** Workstream 04.
- **Tasks:**
  1. Add live automated connection verification ping on `/setup/test` ensuring WhatsApp or Web Widget is responding.
  2. Implement workspace/organization switcher dropdown in `DashboardTopBar.tsx` and `DashboardSidebar.tsx`.
  3. Persist progress in `profiles.onboarding_complete` and route directly to Command Center upon completion.
- **Files Modified:** `src/app/setup/test/page.tsx`, `src/components/dashboard/DashboardTopBar.tsx`, `src/store/onboardingStore.ts`.
- **Testing:** Complete full registration and onboarding wizard as a new user; verify clean landing in dashboard.

---

### Workstream 06: Instagram DM Official Integration
- **Priority:** **P1** | **Complexity:** Medium (5 SP) | **Duration:** 4 Days
- **Prerequisites:** Workstream 02.
- **Tasks:**
  1. Implement `src/app/api/instagram/webhook/route.ts` with GET verification and POST event handling.
  2. Normalize Instagram-Scoped User IDs (IGSID) and route to `AIOrchestrator`.
  3. Dispatches AI reply via Meta Graph API `v19.0` respecting the 24-hour messaging window.
  4. Add Instagram connection metrics card in `ChannelsSection.tsx`.
- **Files Modified:** `src/app/api/instagram/webhook/route.ts`, `src/screens/dashboard/ChannelsSection.tsx`.
- **Testing:** Verify receiving simulated Instagram DM webhook event and emitting Graph API message call.

---

### Workstream 07: Business Email Integration
- **Priority:** **P1** | **Complexity:** Large (8 SP) | **Duration:** 5 Days
- **Prerequisites:** Workstream 02.
- **Tasks:**
  1. Implement inbound email webhook endpoint `POST /api/email/webhook/inbound` parsing Resend/Postmark payloads.
  2. Link incoming email to CRM lead and create conversation thread in Unified Inbox.
  3. Generate AI response draft and display in `ConversationThread.tsx` with "Approve & Send" action.
  4. Implement outbound email dispatcher `POST /api/email/send` using verified tenant domain.
- **Files Modified:** `src/app/api/email/*`, `src/screens/dashboard/ConversationsSection.tsx`, `src/services/email.ts`.
- **Testing:** Send test inbound email; verify thread appearance in Inbox and delivery of approved reply.

---

### Workstream 08: AI Knowledge Base PDF/DOCX Binary Parsing & pgvector
- **Priority:** **P1** | **Complexity:** Medium (5 SP) | **Duration:** 4 Days
- **Prerequisites:** Workstream 01.
- **Tasks:**
  1. Integrate `pdf-parse` into `/api/knowledge/ingest` to extract clean plain text from uploaded PDF/DOCX files.
  2. Add drag-and-drop file upload zone in `KnowledgeSection.tsx`.
  3. Connect Gemini `text-embedding-004` to generate vector embeddings stored in `knowledge_chunks.embedding`.
  4. Enable pgvector HNSW indexing on Supabase database.
- **Files Modified:** `src/app/api/knowledge/ingest/route.ts`, `src/screens/dashboard/KnowledgeSection.tsx`, `src/lib/ai/knowledgeEngine.ts`.
- **Testing:** Upload multi-page price list PDF; test semantic vector match retrieval in Knowledge Inspector.

---

### Workstream 09: Dynamic Lead Management & Scoring Engine
- **Priority:** **P1** | **Complexity:** Small (3 SP) | **Duration:** 3 Days
- **Prerequisites:** Workstream 02.
- **Tasks:**
  1. Implement `LeadScoringService` evaluating deterministic rules and AI intent signals.
  2. Automatically update `leads.score` and status upon high-intent keywords or appointment booking.
  3. Add Lead Score breakdown drawer in `CrmSection.tsx` showing score factor contributions.
  4. Implement duplicate contact merge modal in CRM.
- **Files Modified:** `src/screens/dashboard/CrmSection.tsx`, `src/store/crmStore.ts`, `src/lib/ai/orchestrator.ts`.
- **Testing:** Simulate pricing inquiry; verify score updates from 50 to 75 in CRM table.

---

### Workstream 10: Durable Automated Follow-up Engine & Background Worker
- **Priority:** **P1** | **Complexity:** Large (8 SP) | **Duration:** 4 Days
- **Prerequisites:** Workstream 03.
- **Tasks:**
  1. Create background worker endpoint `GET /api/cron/queue-worker` secured by `CRON_SECRET`.
  2. Implement appointment post-service triggers enqueuing review request jobs in `job_queue` (2-hour delay).
  3. Implement automated 24-hour appointment reminder dispatcher via WhatsApp/SMS.
  4. Build "Campaigns & Follow-ups" management view in the dashboard.
- **Files Modified:** `src/app/api/cron/queue-worker/route.ts`, `src/services/jobQueue.ts`, `src/store/calendarStore.ts`.
- **Testing:** Complete appointment in calendar; run cron endpoint; verify review request message enqueued and processed.

---

### Workstream 11: Workflow Automation Builder Runtime
- **Priority:** **P1** | **Complexity:** Large (8 SP) | **Duration:** 5 Days
- **Prerequisites:** Workstream 10.
- **Tasks:**
  1. Implement backend workflow graph interpreter reading `workflows.config` steps array.
  2. Support triggers: `whatsapp_message`, `appointment_completed`, `review_received`, `lead_created`.
  3. Support conditions: `sentiment_check`, `keyword_match`, `outside_hours`.
  4. Support actions: `send_message`, `create_task`, `notify_team`, `update_lead`.
  5. Log execution traces into `workflow_executions` table.
- **Files Modified:** `src/lib/workflowRuntime.ts`, `src/screens/dashboard/WorkflowEditor.tsx`, `src/app/api/workflows/execute/route.ts`.
- **Testing:** Execute simulated workflow run; verify step execution trace logged in `ExecutionConsole.tsx`.

---

### Workstream 12: Business Analytics Rollups & PDF Reporting
- **Priority:** **P1** | **Complexity:** Small (3 SP) | **Duration:** 3 Days
- **Prerequisites:** Workstream 09.
- **Tasks:**
  1. Implement daily rollup aggregation worker populating `analytics_daily_rollups`.
  2. Add date-range picker filter (7d, 30d, 90d, Year) in `AnalyticsSection.tsx`.
  3. Implement exportable executive summary report generator.
- **Files Modified:** `src/screens/dashboard/AnalyticsSection.tsx`, `src/services/analytics.ts`.
- **Testing:** Verify date filter updates KPI cards and chart with real pre-aggregated metrics.

---

### Workstream 13: Super Admin Governance & Telemetry Streams
- **Priority:** **P1** | **Complexity:** Small (3 SP) | **Duration:** 3 Days
- **Prerequisites:** Workstream 04.
- **Tasks:**
  1. Add error stream monitoring tab in `/admin` streaming failed executions from `execution_logs`.
  2. Implement tenant suspension toggle blocking API access for suspended organizations.
  3. Add platform-wide MRR revenue telemetry widget.
- **Files Modified:** `src/app/admin/page.tsx`, `src/store/adminStore.ts`.
- **Testing:** Trigger an artificial error; verify appearance in Admin Error Monitor.

---

### Workstream 14: AI Voice Telephony Gateway & Real-Time Media Streams
- **Priority:** **P2** | **Complexity:** Extra Large (13 SP) | **Duration:** 8 Days
- **Prerequisites:** Workstream 02, Workstream 03.
- **Tasks:**
  1. Set up Twilio Voice webhook `POST /api/voice/incoming` returning TwiML WebSocket stream.
  2. Build Edge WebSocket media stream server bridging Deepgram Nova-2 STT and ElevenLabs TTS.
  3. Connect streaming LLM tokens from Gemini 2.0 Flash to TTS audio chunks.
  4. Implement live barge-in interruption detection halting audio playback upon caller speech.
  5. Replace simulator in `VoiceSection.tsx` with live phone number provisioning and call log inspector.
- **Files Modified:** `src/app/api/voice/*`, `src/screens/dashboard/VoiceSection.tsx`, `src/store/voiceStore.ts`.
- **Testing:** Make a live phone call to leased Twilio number; verify spoken German/English conversation and calendar booking.

---

### Workstream 15: Production Hardening, Security Audit & Legal Sign-off
- **Priority:** **P0** | **Complexity:** Medium (5 SP) | **Duration:** 4 Days
- **Prerequisites:** All prior workstreams.
- **Tasks:**
  1. Comprehensive automated security audit: test RLS on all 24 tables with unauthorized JWT tokens.
  2. Verify zero secrets exposed in client bundles or public repositories.
  3. Execute automated test suite across all 6 end-to-end user journeys.
  4. Verify Turbopack production build compiles with zero errors.
  5. Prepare legal handoff package (DPA, Subprocessor registry, EU AI Act transparency documentation).
- **Files Modified:** Entire codebase verification, `tests/verify-journeys.ts`.
- **Testing:** All 6 end-to-end user journeys pass with 100% success rate.
