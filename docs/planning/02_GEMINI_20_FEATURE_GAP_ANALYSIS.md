# StarX-Flow — Phase 4B.1 Blueprint
# Document 02: Master Gemini 20-Feature Gap Analysis

**Document ID:** `SXF-GAP-02`  
**Classification:** Product & Engineering Audit  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Principal Software Architect & Technical Product Manager  

---

## 1. Audit Framework & Classification Criteria

This document provides the definitive gap analysis comparing the existing StarX-Flow codebase against the original **Gemini 20-Feature Commercial Specification**. 

### Status Classifications
- **`VERIFIED`**: Implemented, data-backed, integrated with real endpoints, and validated by test suite.
- **`IMPLEMENTED BUT INCOMPLETE`**: Functional and connected to real tables, but missing advanced edge cases or secondary capabilities.
- **`PARTIALLY IMPLEMENTED`**: Core scaffolding or UI exists, but backend logic, webhooks, or third-party connections are missing.
- **`NOT IMPLEMENTED`**: No functional implementation exists in the repository.
- **`BROKEN`**: Code exists but fails during execution or compilation.
- **`BLOCKED BY EXTERNAL DEPENDENCY`**: Cannot be fully activated without third-party credentials or external verification (e.g., Meta Business Verification).

---

## 2. Summary Status Matrix

| # | Feature Capability | Status | Priority | Complexity | Primary Missing Element |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **01** | AI Receptionist | `VERIFIED` | **P0** | L | Dynamic schema-based tool calling |
| **02** | WhatsApp Integration | `VERIFIED` | **P0** | M | Interactive button templates & media handling |
| **03** | Website Chat Widget | `VERIFIED` | **P0** | S | External CDN production bundle generation |
| **04** | Unified Inbox | `IMPLEMENTED BUT INCOMPLETE` | **P0** | M | Unified cross-channel identity linking & email thread view |
| **05** | AI Knowledge Base / RAG | `IMPLEMENTED BUT INCOMPLETE` | **P1** | M | Binary PDF/DOCX multipart parsing & pgvector indexing |
| **06** | CRM & Contact Management | `VERIFIED` | **P0** | M | Auto-deduplication & merge engine |
| **07** | Lead Management & Scoring | `PARTIALLY IMPLEMENTED` | **P1** | M | Configurable heuristic + AI scoring rule engine |
| **08** | Automated Follow-ups | `PARTIALLY IMPLEMENTED` | **P1** | L | Durable background cron worker for scheduled dispatches |
| **09** | Appointment Scheduling | `VERIFIED` | **P0** | L | Google Calendar & Outlook bi-directional sync |
| **10** | Order Management | `VERIFIED` | **P1** | M | Direct Stripe payment link generation for pending orders |
| **11** | Workflow Automation | `IMPLEMENTED BUT INCOMPLETE` | **P1** | L | Decoupled background execution runtime |
| **12** | AI Voice Telephony | `NOT IMPLEMENTED` (Simulated) | **P2** | XL | Real SIP/WebRTC audio stream, STT/TTS pipeline |
| **13** | Email Integration | `NOT IMPLEMENTED` | **P1** | L | OAuth/IMAP sync & inbound email webhook parser |
| **14** | Instagram DM Integration | `PARTIALLY IMPLEMENTED` | **P1** | M | Dedicated incoming DM webhook route |
| **15** | Analytics & Reporting | `IMPLEMENTED BUT INCOMPLETE` | **P1** | M | Time-series aggregation rollups & scheduled reports |
| **16** | Multi-Tenant Isolation | `VERIFIED` | **P0** | M | Workspace switcher UI in top navigation |
| **17** | Subscription Billing | `IMPLEMENTED BUT INCOMPLETE` | **P0** | M | Pricing page UI alignment (€) & Customer Portal |
| **18** | Business Onboarding Wizard | `VERIFIED` | **P0** | M | Live channel health check verification ping |
| **19** | Admin Governance Dashboard | `VERIFIED` | **P1** | M | System error log streaming & tenant impersonation |
| **20** | Support & Error Handling | `IMPLEMENTED BUT INCOMPLETE` | **P0** | M | Centralized Sentry/structured telemetry capture |

---

## 3. Deep-Dive Gap Analysis by Capability

---

### Feature 01: AI Receptionist

- **Original Intended Functionality:** Autonomous multi-lingual concierge capable of answering customer questions, triaging requests, booking appointments, taking orders, and escalating complex inquiries to human staff.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** Configured in [`src/lib/ai/prompts.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/prompts.ts) (`receptionist` prompt), executed via [`AIProvider`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/provider.ts) and [`AIOrchestrator`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/orchestrator.ts). Supports Gemini 2.0 Flash, NVIDIA fallback, and rule-based fallback.
- **Missing Functionality:** Native function calling (tool execution via JSON schema rather than prompt text heuristics).
- **Required Improvements:** Implement structured tool calling schemas (`tools: [{ name: 'check_availability', parameters: {...} }]`) for Gemini and NVIDIA APIs.
- **Database Requirements:** Reuses `agents`, `agent_memories`, `conversations`, `messages`.
- **API Requirements:** Enhance `/api/chat` and `/api/whatsapp/webhook` to handle tool invocation loops.
- **UI Requirements:** Tool execution trace inspector in `AIPlaygroundSection.tsx`.
- **Security Requirements:** Prompt injection defense verification (already encloses messages in `<customer_message>`).
- **Dependencies:** Google Gemini API, NVIDIA API.
- **Acceptance Criteria:** Agent detects appointment request, invokes calendar availability tool, and returns available slots without hallucination.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (Core Foundation).

---

### Feature 02: WhatsApp Integration

- **Original Intended Functionality:** Direct connectivity to Meta WhatsApp Cloud API for receiving customer messages, sending AI responses, delivering booking confirmations, and dispatching templates.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/app/api/whatsapp/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/whatsapp/webhook/route.ts) implements GET verification and POST message triage. Graph API client dispatches messages via `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`.
- **Missing Functionality:** WhatsApp interactive button templates (quick replies, list messages), media attachment ingestion (audio voice notes, images), and delivery/read receipt status updates.
- **Required Improvements:** Support Meta interactive messages (`type: "interactive"`) for one-tap booking confirmations. Support inbound voice note transcription via Whisper.
- **Database Requirements:** Add `meta_message_id` and delivery status columns to `messages`.
- **API Requirements:** Extend POST webhook handler to parse `statuses` payloads (`delivered`, `read`, `failed`).
- **UI Requirements:** Display WhatsApp delivery checkmarks (single grey, double grey, double blue) in `ConversationThread.tsx`.
- **Security Requirements:** HMAC SHA-256 signature verification (`X-Hub-Signature-256`) against `META_APP_SECRET`.
- **Dependencies:** Meta Developer App, WhatsApp Business Account (WABA).
- **Acceptance Criteria:** Real WhatsApp message received, triaged by AI, and replied to with valid Graph API response within 3.5 seconds.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (Critical Commercial Channel).

---

### Feature 03: Website Chat Widget

- **Original Intended Functionality:** Lightweight, embeddable JavaScript chat widget that local businesses can embed on their website with a simple `<script>` tag.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** React component [`src/components/chat/WebChatWidget.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/chat/WebChatWidget.tsx), backend route [`src/app/api/chat/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/chat/route.ts), and live testbed page [`src/app/chat/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/chat/page.tsx).
- **Missing Functionality:** Standalone compiled CDN bundle (e.g. `public/widget.js`) compiled as a self-contained Web Component / Iframe so external non-React websites can embed it.
- **Required Improvements:** Build a standalone esbuild/vite rollup script outputting `public/widget.js` that mounts an isolated iframe communicating with `/api/chat`.
- **Database Requirements:** Reuses `conversations` (channel = 'Web') and `messages`.
- **API Requirements:** CORS headers on `/api/chat` to allow cross-origin requests from client websites.
- **UI Requirements:** Embed code snippet generator in `ChannelsSection.tsx`.
- **Security Requirements:** Origin domain whitelisting per organization to prevent unauthorized widget hijacking.
- **Dependencies:** None.
- **Acceptance Criteria:** Adding `<script src="https://starx-flow.com/widget.js" data-client-id="..."></script>` on any external HTML page opens widget and streams AI replies.
- **Complexity:** Small (S) — 3 Story Points.
- **Priority:** **P0** (Core Commercial Channel).

---

### Feature 04: Unified Inbox

- **Original Intended Functionality:** Single, multi-channel inbox where business owners and staff can view, filter, and reply to conversations across WhatsApp, Website Chat, Instagram, SMS, and Email in real-time.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** [`src/screens/dashboard/ConversationsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/ConversationsSection.tsx), [`src/components/dashboard/ConversationList.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ConversationList.tsx), [`src/components/dashboard/ConversationThread.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ConversationThread.tsx), and [`src/store/dashboardStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/dashboardStore.ts).
- **Missing Functionality:** Cross-channel customer identity linking (linking a customer's WhatsApp phone with their Email), internal team notes/mentions, conversation assignment to team members, and Instagram/Email thread views.
- **Required Improvements:** Add customer channel identity resolution table. Add internal team notes tab inside `ConversationThread.tsx`. Hook `assigned_to` to `organization_members`.
- **Database Requirements:** Create `channel_identities` table linking `lead_id` to various channel handles (`phone`, `email`, `ig_username`).
- **API Requirements:** `/api/conversations/assign`, `/api/conversations/notes`.
- **UI Requirements:** Channel badge icons on thread avatars, internal notes drawer, staff assignment dropdown.
- **Security Requirements:** RLS ensuring staff only view conversations belonging to their active organization.
- **Dependencies:** Supabase Realtime.
- **Acceptance Criteria:** A customer contacting via WhatsApp and then via Email appears linked under the same CRM customer profile with chronological history.
- **Complexity:** Medium (M) — 8 Story Points.
- **Priority:** **P0** (Core Operational Hub).

---

### Feature 05: AI Knowledge Base / RAG

- **Original Intended Functionality:** Ingest business documents (PDFs, Word docs, URLs, FAQs), chunk and vectorize content, store in pgvector, and retrieve relevant business context to eliminate AI hallucinations.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** [`src/lib/ai/knowledgeEngine.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/knowledgeEngine.ts), [`src/app/api/knowledge/ingest/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/knowledge/ingest/route.ts), [`src/screens/dashboard/KnowledgeSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/KnowledgeSection.tsx), tables `knowledge_documents` and `knowledge_chunks`.
- **Missing Functionality:** Binary file ingestion (PDF, DOCX) via multipart upload, native pgvector embeddings generation via Gemini `text-embedding-004`, and automated URL re-indexing cron.
- **Required Improvements:** Integrate `pdf-parse` or `@pdf/pdfjs-extract` for PDF parsing. Connect Gemini embeddings API to populate `embedding vector(768)` in Postgres.
- **Database Requirements:** Enable `pgvector` extension and add `vector_cosine_ops` HNSW index on `knowledge_chunks.embedding`.
- **API Requirements:** Multipart form upload handler in `/api/knowledge/ingest`.
- **UI Requirements:** File drag-and-drop zone for PDF/DOCX files in `KnowledgeSection.tsx`.
- **Security Requirements:** Strict tenant isolation: vector similarity searches MUST include `where user_id = auth.uid()` filter.
- **Dependencies:** Google Gemini Embeddings API (`text-embedding-004`), Supabase pgvector.
- **Acceptance Criteria:** Upload a 10-page salon service PDF; AI agent accurately cites specific haircut prices in under 500ms.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Core Intelligence).

---

### Feature 06: CRM & Contact Management

- **Original Intended Functionality:** Complete customer directory tracking contact information, conversation history, appointment history, order history, tags, notes, and custom fields.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/store/crmStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/crmStore.ts), [`src/screens/dashboard/CrmSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CrmSection.tsx), table `leads`.
- **Missing Functionality:** Automated contact deduplication (merging duplicates with matching phone numbers or emails) and custom field editor.
- **Required Improvements:** Implement duplicate detection modal and contact merge API.
- **Database Requirements:** Reuses `leads` table.
- **API Requirements:** `POST /api/crm/merge` endpoint.
- **UI Requirements:** Merge contact confirmation dialog in `CrmSection.tsx`.
- **Security Requirements:** RLS enforced on `leads` table per tenant.
- **Dependencies:** None.
- **Acceptance Criteria:** Importing a CSV with existing phone numbers updates the existing record rather than creating orphan duplicates.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (Core CRM).

---

### Feature 07: Lead Management & Scoring

- **Original Intended Functionality:** Automatically evaluate and score leads (0–100) based on behavior, channel interactions, sentiment, budget signals, and booking readiness.
- **Current Implementation Status:** `PARTIALLY IMPLEMENTED`
- **Existing Implementation:** `score` column exists on `leads` table and defaults to `50` or `55`. Displayed in CRM table.
- **Missing Functionality:** Dynamic scoring engine that adjusts scores based on user events (e.g., +20 for asking about prices, +30 for booking intent, -10 for cold inactivity).
- **Required Improvements:** Build `LeadScoringService` evaluating rule weights and AI sentiment signals.
- **Database Requirements:** Create `lead_scoring_rules` table (`id`, `user_id`, `event_type`, `score_delta`, `condition`).
- **API Requirements:** Trigger scoring updates from `AIOrchestrator` upon processing inbound messages.
- **UI Requirements:** Lead score badge with color gradient (Red < 40, Yellow 40-70, Green > 70) and scoring breakdown breakdown drawer.
- **Security Requirements:** Tenant isolation on rules.
- **Dependencies:** None.
- **Acceptance Criteria:** A customer who asks "What are your VIP prices and can I book this Friday?" receives an automatic score upgrade from 50 to 85.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Sales Intelligence).

---

### Feature 08: Automated Follow-ups

- **Original Intended Functionality:** Scheduled outreach to re-engage cold leads, remind customers of upcoming bookings, request Google reviews, and follow up on abandoned quotes.
- **Current Implementation Status:** `PARTIALLY IMPLEMENTED`
- **Existing Implementation:** Database tables `campaigns` and `campaign_recipients` exist in `002_production_core_schema.sql`. Pre-built follow-up templates exist in `WorkflowEditor.tsx`.
- **Missing Functionality:** Scheduled background job dispatcher executing time-delayed follow-ups (e.g. "Send review request 2 hours after appointment ends").
- **Required Improvements:** Connect `job_queue` table with a reliable cron runner (Vercel Cron or Supabase `pg_cron` / Edge Function).
- **Database Requirements:** Reuses `campaigns`, `campaign_recipients`, and `job_queue`.
- **API Requirements:** `POST /api/campaigns/dispatch`, `POST /api/cron/followups`.
- **UI Requirements:** Dedicated "Campaigns & Follow-ups" screen in the dashboard.
- **Security Requirements:** Respect GDPR consent (`consent_logs`) and WhatsApp 24-hour customer service window rules.
- **Dependencies:** Meta WhatsApp Cloud API / Twilio SMS / Resend.
- **Acceptance Criteria:** Completing an appointment triggers an automated review request SMS/WhatsApp message exactly 2 hours later.
- **Complexity:** Large (L) — 8 Story Points.
- **Priority:** **P1** (Core Revenue Booster).

---

### Feature 09: Appointment Scheduling

- **Original Intended Functionality:** Complete appointment management system with business hours, staff rosters, real-time availability checking, booking confirmation, rescheduling, and conflict prevention.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/store/calendarStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/calendarStore.ts), [`src/screens/dashboard/CalendarSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CalendarSection.tsx), tables `appointments` and `working_hours`. Validated in Test Journey 3.
- **Missing Functionality:** External calendar synchronization with Google Calendar and Microsoft Outlook.
- **Required Improvements:** Implement Google Calendar OAuth2 flow and bi-directional sync worker.
- **Database Requirements:** Add `external_calendar_id`, `external_event_id`, and `sync_token` columns to `appointments`.
- **API Requirements:** `GET /api/calendar/google/auth`, `GET /api/calendar/google/callback`, `POST /api/calendar/sync`.
- **UI Requirements:** "Connect Google Calendar" button in `CalendarSection.tsx`.
- **Security Requirements:** Encrypted storage of OAuth refresh tokens in `connected_channels.credentials`.
- **Dependencies:** Google Cloud Console OAuth App, Microsoft Azure App Registration.
- **Acceptance Criteria:** Booking created in StarX-Flow instantly reflects on business owner's Google Calendar, and events booked on Google Calendar block availability in StarX-Flow.
- **Complexity:** Large (L) — 8 Story Points.
- **Priority:** **P0** (Core Operations).

---

### Feature 10: Order Management

- **Original Intended Functionality:** Track customer orders, service packages, product purchases, fulfillment states, and payments in Euro (€).
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/screens/dashboard/OrdersSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/OrdersSection.tsx), [`src/store/orderStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/orderStore.ts), [`src/app/api/orders/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/orders/route.ts), table `orders`.
- **Missing Functionality:** Automatic Stripe payment link generation for unpaid customer orders.
- **Required Improvements:** Add "Send Payment Link" button generating a Stripe Checkout link sent via WhatsApp/SMS to the customer.
- **Database Requirements:** Reuses `orders` table.
- **API Requirements:** `POST /api/orders/payment-link`.
- **UI Requirements:** "Send Payment Link" action button in `OrdersSection.tsx` table.
- **Security Requirements:** European statutory VAT display compliance.
- **Dependencies:** Stripe API.
- **Acceptance Criteria:** Staff clicks "Generate Payment Link" on an order of €85; customer receives payment URL via WhatsApp and completing payment marks order as `paid`.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Commerce & Payments).

---

### Feature 11: Workflow Automation

- **Original Intended Functionality:** Visual no-code workflow editor allowing users to string together triggers, conditions, delays, AI actions, and integrations without coding.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** [`src/screens/dashboard/WorkflowEditor.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowEditor.tsx), [`src/screens/dashboard/WorkflowsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowsSection.tsx), [`src/components/dashboard/ExecutionConsole.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ExecutionConsole.tsx), tables `workflows` and `execution_logs`.
- **Missing Functionality:** Backend execution engine capable of executing arbitrary workflow step sequences with delays and webhook calls.
- **Required Improvements:** Implement backend workflow graph interpreter that converts JSON step configurations into asynchronous execution plans.
- **Database Requirements:** Add `workflow_executions` table tracking state per run.
- **API Requirements:** `POST /api/workflows/execute`.
- **UI Requirements:** Node connection drag handles (React Flow or SVG bezier curves) for enhanced visual editing.
- **Security Requirements:** Loop prevention (maximum 10 steps per execution) and execution timeout guardrails.
- **Dependencies:** Supabase Edge Functions / Vercel Serverless.
- **Acceptance Criteria:** Custom flow "When review left <= 3 stars -> wait 5 minutes -> alert manager -> create urgent task" executes sequentially upon mock review event.
- **Complexity:** Large (L) — 8 Story Points.
- **Priority:** **P1** (Automation Engine).

---

### Feature 12: AI Voice Telephony

- **Original Intended Functionality:** Inbound and outbound AI voice receptionist capable of answering business phone calls, understanding natural speech, holding spoken conversations with low latency (<1s), scheduling appointments over the phone, and transferring calls.
- **Current Implementation Status:** `NOT IMPLEMENTED` (Current UI is a playback simulator).
- **Existing Implementation:** [`src/screens/dashboard/VoiceSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/VoiceSection.tsx), [`src/store/voiceStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/voiceStore.ts), table `calls`.
- **Missing Functionality:** Real telecommunication gateway (Twilio Voice / Telnyx), WebSocket media streaming, real-time STT (Deepgram/Whisper), real-time TTS (ElevenLabs/Cartesia), and live barge-in interruption handling.
- **Required Improvements:** Complete voice gateway architecture (Module D).
- **Database Requirements:** Add `phone_numbers` table mapping leased numbers to tenants.
- **API Requirements:** `POST /api/voice/incoming`, `WSS /api/voice/stream`.
- **UI Requirements:** Phone number leasing and SIP configuration panel in `VoiceSection.tsx`.
- **Security Requirements:** Recording consent notification ("This call may be recorded for quality assurance") before audio streaming begins.
- **Dependencies:** Twilio Voice / Telnyx, Deepgram, ElevenLabs.
- **Acceptance Criteria:** Calling a leased German or UK telephone number connects to the AI Receptionist who converses in German/English and books an appointment into the calendar.
- **Complexity:** Extra Large (XL) — 13 Story Points.
- **Priority:** **P2** (Advanced Commercial Capability).

---

### Feature 13: Email Integration

- **Original Intended Functionality:** Two-way business email integration allowing StarX-Flow to ingest inbound emails from customers, parse inquiries, draft AI responses for human review, and dispatch outbound emails via connected business accounts.
- **Current Implementation Status:** `NOT IMPLEMENTED`
- **Existing Implementation:** [`src/services/email.ts`](file:///c:/Web%20Apps/starx-flow/src/services/email.ts) has queue methods for transactional emails. No inbound email parsing or mailbox synchronization exists.
- **Missing Functionality:** Gmail OAuth, Microsoft 365 OAuth, IMAP/SMTP connector, inbound webhook email parser, and email conversation viewer in the Inbox.
- **Required Improvements:** Implement Google Workspace / MS 365 OAuth and Resend/SendGrid inbound email webhook router.
- **Database Requirements:** Create `email_accounts` and `email_threads` tables.
- **API Requirements:** `GET /api/email/auth`, `POST /api/email/webhook/inbound`, `POST /api/email/send`.
- **UI Requirements:** Email channel setup card in `ChannelsSection.tsx` and rich HTML email composer in `ConversationThread.tsx`.
- **Security Requirements:** Secure storage of OAuth tokens and SPF/DKIM validation on outbound domains.
- **Dependencies:** Google Workspace API, Microsoft Graph API, Resend / Postmark.
- **Acceptance Criteria:** Customer sends email to `contact@salon.de`; email appears in Unified Inbox, AI drafts an answer, staff clicks "Approve & Send", and reply reaches customer's inbox.
- **Complexity:** Large (L) — 8 Story Points.
- **Priority:** **P1** (Core Channel).

---

### Feature 14: Instagram DM Integration

- **Original Intended Functionality:** Automatically respond to Instagram Direct Messages and story mentions using the official Meta Graph API.
- **Current Implementation Status:** `PARTIALLY IMPLEMENTED`
- **Existing Implementation:** Meta OAuth flow in [`src/app/api/meta/auth/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/meta/auth/route.ts) requests `instagram_basic` and `instagram_manage_messages` scopes. Callback detects Instagram Business accounts.
- **Missing Functionality:** Dedicated Instagram incoming webhook receiver, message normalizer, and Graph API outbound message sender for Instagram DMs.
- **Required Improvements:** Implement Instagram webhook handler in `/api/instagram/webhook` sharing the `AIOrchestrator` pipeline.
- **Database Requirements:** Reuses `conversations` (channel = 'Instagram') and `messages`.
- **API Requirements:** `GET /api/instagram/webhook` (verification), `POST /api/instagram/webhook` (events).
- **UI Requirements:** Instagram account handle and follower metrics card in `ChannelsSection.tsx`.
- **Security Requirements:** Adherence to Meta 24-hour messaging window policy.
- **Dependencies:** Meta Developer App with Instagram Graph API permissions.
- **Acceptance Criteria:** Customer sends a DM to the business Instagram page; AI Receptionist triages and responds via Instagram within 3 seconds.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Core Social Channel).

---

### Feature 15: Analytics & Reporting

- **Original Intended Functionality:** Granular analytics dashboards providing conversion rates, response times, channel ROI, booking value, AI resolution rates, and exportable PDF/CSV reports.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** [`src/screens/dashboard/AnalyticsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AnalyticsSection.tsx), [`src/components/dashboard/KPIGrid.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/KPIGrid.tsx), [`src/services/analytics.ts`](file:///c:/Web%20Apps/starx-flow/src/services/analytics.ts), table `analytics_events`.
- **Missing Functionality:** Automated daily/weekly rollups, date-range picker (Last 30 Days, This Month, Custom), and downloadable PDF executive summary report.
- **Required Improvements:** Create a database materialized view or aggregation function calculating hourly and daily rollups.
- **Database Requirements:** Create `analytics_daily_rollups` table.
- **API Requirements:** `GET /api/analytics/summary?period=30d`, `GET /api/analytics/export/pdf`.
- **UI Requirements:** Date range filter dropdown and "Download PDF Report" button in `AnalyticsSection.tsx`.
- **Security Requirements:** Strict tenant filtering on all analytic aggregations.
- **Dependencies:** None.
- **Acceptance Criteria:** Selecting "Last 30 Days" updates revenue, lead conversion rate, and AI resolution metrics calculated from real database events.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Business Intelligence).

---

### Feature 16: Multi-Tenant Isolation

- **Original Intended Functionality:** Complete logical and architectural data isolation between businesses. No business can ever access, modify, or leak another business's leads, messages, documents, or settings.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** Tables `organizations` and `organization_members` in [`002_production_core_schema.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/002_production_core_schema.sql) with strict RLS policies on all 14 production tables. Validated in Test Journey 6.
- **Missing Functionality:** Organization switcher dropdown in the dashboard top navigation bar for users managing multiple business locations.
- **Required Improvements:** Add workspace/organization selector in `DashboardTopBar.tsx`.
- **Database Requirements:** Reuses `organizations` and `organization_members`.
- **API Requirements:** `GET /api/organizations`, `POST /api/organizations/switch`.
- **UI Requirements:** Workspace selector dropdown next to the business name in `DashboardSidebar.tsx` and `DashboardTopBar.tsx`.
- **Security Requirements:** Continual regression testing of RLS policies with simulated unauthorized tokens.
- **Dependencies:** Supabase Auth & RLS.
- **Acceptance Criteria:** Executing a cross-tenant query with an authenticated JWT from Tenant A returns exactly 0 rows from Tenant B.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (Core Security Architecture).

---

### Feature 17: Subscription Billing

- **Original Intended Functionality:** Complete commercial subscription lifecycle with Starter (€49), Pro (€97), and Enterprise (€297) tiers, feature gating, usage limit enforcement, Stripe customer portal, and failed payment recovery.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** [`src/app/api/billing/checkout/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/billing/checkout/route.ts), [`src/app/api/billing/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/billing/webhook/route.ts), [`src/store/billingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/billingStore.ts). Validated in Test Journey 5.
- **Missing Functionality:** Marketing pricing page [`PricingClient.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/pricing/PricingClient.tsx) displays outdated USD pricing ($29 / $59 / $99). Stripe Customer Portal redirect route is missing.
- **Required Improvements:** Update `PricingClient.tsx` to display €49 / €97 / €297 with European features (GDPR compliance, SEPA payments). Implement `/api/billing/portal` route.
- **Database Requirements:** Reuses `subscriptions` and `invoices`.
- **API Requirements:** `POST /api/billing/portal` (generates Stripe billing portal URL).
- **UI Requirements:** "Manage Subscription" button in `SettingsSection.tsx` redirecting to Stripe portal.
- **Security Requirements:** Cryptographic verification of Stripe webhook signatures using `STRIPE_WEBHOOK_SECRET`.
- **Dependencies:** Stripe API & Stripe Customer Portal.
- **Acceptance Criteria:** User clicks "Upgrade to Pro", completes test card checkout, and subscription state immediately updates to `active` with 5,000 AI conversations limit.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (Commercial Monetization).

---

### Feature 18: Business Onboarding Wizard

- **Original Intended Functionality:** Guided self-service flow walking new business owners through registration, business profile, channel connections, AI prompt tuning, knowledge upload, and a test conversation milestone.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/store/onboardingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/onboardingStore.ts), routes in [`src/app/setup/`](file:///c:/Web%20Apps/starx-flow/src/app/setup). Step state machine with dependency unlocking.
- **Missing Functionality:** Automated channel health-check ping ensuring WhatsApp/Web widget is active before allowing user to launch.
- **Required Improvements:** Add automated verification ping on the `/setup/test` step.
- **Database Requirements:** Reuses `profiles.onboarding_complete`.
- **API Requirements:** `/api/setup/verify-connection`.
- **UI Requirements:** Interactive checklist with green pulses in `/setup/launch`.
- **Security Requirements:** Only allow authorized user to complete their own onboarding.
- **Dependencies:** None.
- **Acceptance Criteria:** Completing all 7 setup steps marks `onboarding_complete = true` and lands user in the full Command Center.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (User Activation).

---

### Feature 19: Admin Governance Dashboard

- **Original Intended Functionality:** Super Admin control center to inspect tenant accounts, monitor system health, oversee subscription revenues, manage feature flags, and suspend delinquent or abusive tenants.
- **Current Implementation Status:** `VERIFIED`
- **Existing Implementation:** [`src/app/admin/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/admin/page.tsx), [`src/store/adminStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/adminStore.ts). Client inspection, plan change, status toggling, and RPC secret claim.
- **Missing Functionality:** Platform-wide error log viewer and tenant impersonation mode for customer support.
- **Required Improvements:** Add error logs tab to Admin dashboard streaming `execution_logs` where `type = 'error'`.
- **Database Requirements:** Reuses `profiles`, `subscriptions`, and `execution_logs`.
- **API Requirements:** `GET /api/admin/errors`.
- **UI Requirements:** System health status tab and error feed table in `/admin`.
- **Security Requirements:** Strict RBAC: only profiles where `role = 'admin'` can access `/admin`.
- **Dependencies:** Supabase Auth & RPC.
- **Acceptance Criteria:** Non-admin user visiting `/admin` is redirected; authenticated admin can change tenant plan and view platform metrics.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P1** (Platform Governance).

---

### Feature 20: Support & Error Handling

- **Original Intended Functionality:** Resilient error catching, structured telemetry logging, automated retry policies, dead-letter queues, and graceful AI fallbacks ensuring zero customer communication drops.
- **Current Implementation Status:** `IMPLEMENTED BUT INCOMPLETE`
- **Existing Implementation:** Provider timeout handling (3.5s `AbortSignal`), confidence scoring, rule-based fallback in `AIProvider.generateFallback`, and error catching in API routes.
- **Missing Functionality:** Centralized telemetry capture (e.g. Sentry / Baselime integration) and dead-letter queue processing for failed background dispatches.
- **Required Improvements:** Add `@sentry/nextjs` or structured JSON logger to capture serverless exceptions. Implement background retry worker on `job_queue`.
- **Database Requirements:** Reuses `job_queue` and `execution_logs`.
- **API Requirements:** `POST /api/system/health`.
- **UI Requirements:** Error boundary fallbacks on all dashboard screens.
- **Security Requirements:** Zero secret leakage in client error toasts and logs.
- **Dependencies:** Sentry (optional) / Supabase service role.
- **Acceptance Criteria:** If Gemini API experiences an outage, system seamlessly falls back to NVIDIA or rule engine in under 3.5 seconds without crashing the user session.
- **Complexity:** Medium (M) — 5 Story Points.
- **Priority:** **P0** (System Reliability).
