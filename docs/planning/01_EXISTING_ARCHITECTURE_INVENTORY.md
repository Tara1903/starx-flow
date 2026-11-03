# StarX-Flow — Phase 4B.1 Blueprint
# Document 01: Existing Architecture Inventory

**Document ID:** `SXF-ARCH-01`  
**Classification:** Technical Architecture Specification  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Principal Software Architect & Lead Systems Engineer  

---

## 1. Executive Summary & Audit Scope

This document establishes the verified inventory of all existing architectural components, source modules, database schemas, API routes, external dependencies, and technical debt present in the **StarX-Flow** codebase.

StarX-Flow is architected as an **AI Operating System for European Local Businesses**, combining autonomous customer communication (WhatsApp, Web Chat, Instagram, SMS, Email), customer relationship management (CRM), appointment scheduling, order processing, workflow automation, and multi-tenant billing under strict European data privacy compliance (GDPR and EU AI Act alignment).

This inventory is based on an exhaustive, file-by-file code audit conducted in November 2026. Every statement in this document reflects verified repository code rather than design assumptions.

---

## 2. Core Technology Stack Inventory

| Architectural Layer | Technology / Framework | Version / Specification | Hosting / Infrastructure |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.2.7` with Turbopack | Vercel Edge & Serverless Network |
| **UI Library** | React | `19.0.0` / React DOM `19.0.0` | Client hydration & SSR |
| **Styling Engine** | Tailwind CSS | `v4.0.0-alpha.32` + `@tailwindcss/postcss` | Bundled via PostCSS |
| **Motion & Animation** | Motion (`motion/react`) | `12.4.7` (Framer Motion v12) | Hardware-accelerated CSS/SVG |
| **State Management** | Zustand | `5.0.3` | Client-side reactive memory stores |
| **Database & Auth** | Supabase (PostgreSQL 15+) | `@supabase/supabase-js` `2.48.1` | AWS eu-central-1 (Frankfurt) / Dublin |
| **Row-Level Security** | PostgreSQL RLS | Native Postgres Security Definer | Enforced per-request via JWT / uid |
| **AI Gateway** | Multi-Provider Abstraction | Gemini 2.0 Flash (`generativelanguage.googleapis.com`) & NVIDIA (`integrate.api.nvidia.com`) | External HTTPS REST / AbortSignal |
| **Payments** | Stripe | `@stripe/stripe-js` `5.6.0` + Server REST | Stripe SEPA / Credit Cards / Webhooks |
| **Messaging** | Meta WhatsApp Cloud API | Meta Graph API `v19.0` | Meta Developer Platform Webhooks |
| **Icons & Typography** | Lucide React | `0.475.0` | Tree-shaken SVG icons |

---

## 3. Detailed Subsystem & Module Inventory

### Module 1: Identity, Authentication & Multi-Tenancy

- **Source Files:**
  - Client Auth Store: [`src/store/authStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/authStore.ts)
  - Supabase Browser Client: [`src/lib/supabase.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/supabase.ts)
  - Privileged Admin Client: [`src/lib/supabaseAdmin.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/supabaseAdmin.ts)
  - Database Schema: [`supabase/migrations/001_initial_schema.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/001_initial_schema.sql), [`supabase/migrations/002_production_core_schema.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/002_production_core_schema.sql)
- **Database Tables:**
  - `profiles`: Extends Supabase `auth.users`, records `business_name`, `owner_name`, `email`, `role`, `onboarding_complete`.
  - `organizations`: Multi-tenant organization container holding `name`, `slug`, `plan`, `settings` (currency, timezone, locale).
  - `organization_members`: Junction table mapping `organization_id` to `user_id` with roles (`owner`, `admin`, `member`).
- **Functionality Implemented:**
  - Email/password signup, login, session persistence, logout.
  - Automatic profile generation via database trigger `on_auth_user_created`.
  - Multi-tenant organization creation and role-based membership.
  - Offline demo fallback when Supabase credentials are not detected.
- **Known Limitations & Debt:**
  - Password reset and email verification rely on Supabase Auth templates without custom branding.
  - Organization switching is not yet surfaced as a tenant selector dropdown in the top navigation bar.

---

### Module 2: Autonomous AI Workforce

- **Source Files:**
  - Agent Role & Type Definitions: [`src/lib/ai/types.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/types.ts)
  - Agent System Prompts: [`src/lib/ai/prompts.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/prompts.ts)
  - Provider Abstraction & Guardrails: [`src/lib/ai/provider.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/provider.ts)
  - Central Dispatcher: [`src/lib/ai/orchestrator.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/orchestrator.ts)
  - Agent Store: [`src/store/agentStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/agentStore.ts)
  - Dashboard Agents Screen: [`src/screens/dashboard/AgentsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AgentsSection.tsx)
- **Database Tables:**
  - `agents`: Defines autonomous worker agents with `role`, `system_prompt`, `permissions`, `is_active`.
  - `agent_memories`: Key-value memory entries scoped to `user_id` and optional `lead_id`.
  - `usage_records`: Tracks consumption (`ai_conversations`).
- **Functionality Implemented:**
  - 8 specialized agents pre-configured: Receptionist, Sales, Support, Appointment, Order, Followup, Marketing, Analyst.
  - Multi-model routing: Primary Google Gemini 2.0 Flash, secondary NVIDIA API, tertiary rule-based fallback.
  - Prompt injection defense: Wraps untrusted customer inputs inside `<customer_message>` XML tags with explicit negative constraints.
  - Automatic intent classification (appointment, billing complaint, pricing inquiry).
  - Human handoff escalation flag (`requiresHumanHandoff`) when manager or human agent is requested.
- **Known Limitations & Debt:**
  - Tool/function calling is currently evaluated via intent parsing rather than native OpenAI/Gemini tool calling schemas.
  - Agent memory is currently key-value text without dynamic semantic ranking.

---

### Module 3: Knowledge Base & Vector RAG Engine

- **Source Files:**
  - Chunking & Retrieval Engine: [`src/lib/ai/knowledgeEngine.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/knowledgeEngine.ts)
  - Ingestion API: [`src/app/api/knowledge/ingest/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/knowledge/ingest/route.ts)
  - Knowledge API: [`src/app/api/knowledge/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/knowledge/route.ts)
  - Knowledge Store: [`src/store/knowledgeStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/knowledgeStore.ts)
  - Knowledge Dashboard Screen: [`src/screens/dashboard/KnowledgeSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/KnowledgeSection.tsx)
- **Database Tables:**
  - `knowledge_documents`: Master record (`title`, `document_type`, `source_url`, `content`, `chunks_count`, `status`).
  - `knowledge_chunks`: Vector chunks (`chunk_index`, `chunk_content`, `token_count`, `embedding`).
- **Functionality Implemented:**
  - Document types supported: `faq`, `text`, `url` (with automated HTML plain-text stripping).
  - Sliding window chunker (600 characters max, 100 character overlap, sentence boundary snapping).
  - Tenant-isolated retrieval ensuring queries are hard-filtered by `user_id`.
  - Interactive RAG Retrieval Inspector in dashboard for testing vector matches and confidence scores.
- **Known Limitations & Debt:**
  - PDF/DOCX binary file upload parser currently expects raw text; binary extraction (e.g. `pdf-parse`) is not yet hooked to multipart form uploads.
  - pgvector cosine distance query relies on keyword matching fallback when pgvector extension is not enabled on local dev database.

---

### Module 4: Unified Communication Inbox & Channels

- **Source Files:**
  - Web Chat API: [`src/app/api/chat/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/chat/route.ts)
  - WhatsApp Webhook: [`src/app/api/whatsapp/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/whatsapp/webhook/route.ts)
  - Legacy Edge Function: [`api/whatsapp-webhook.ts`](file:///c:/Web%20Apps/starx-flow/api/whatsapp-webhook.ts)
  - Meta OAuth Routes: [`src/app/api/meta/auth/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/meta/auth/route.ts), [`src/app/api/meta/callback/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/meta/callback/route.ts)
  - Embeddable Widget: [`src/components/chat/WebChatWidget.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/chat/WebChatWidget.tsx)
  - Widget Demo Page: [`src/app/chat/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/chat/page.tsx)
  - Dashboard Inbox: [`src/screens/dashboard/ConversationsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/ConversationsSection.tsx)
  - Channel Grid: [`src/components/dashboard/ChannelGrid.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ChannelGrid.tsx)
  - Integration Modal: [`src/components/IntegrationModal.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/IntegrationModal.tsx)
- **Database Tables:**
  - `conversations`: Threads with `channel`, `customer_name`, `customer_phone`, `status`, `unread_count`.
  - `messages`: Normalized message entries with `direction`, `role`, `content`, `status`, `attachments`.
  - `connected_channels`: Channel credentials and connection flags (`WhatsApp`, `Instagram`, `SMS`, `Reviews`, `Web`).
- **Functionality Implemented:**
  - Inbound WhatsApp message verification and auto-response dispatch via Meta Graph API `v19.0`.
  - Inbound Web Chat API processing with session isolation.
  - Real-time inbox synchronization via Supabase Realtime channels.
  - Human takeover toggle allowing staff to interrupt AI and send manual messages.
- **Known Limitations & Debt:**
  - Root `api/whatsapp-webhook.ts` duplicates App Router route and should be removed.
  - Instagram DM webhook receiving endpoint is missing (only Meta OAuth callback is present).
  - Inbound Email parsing and SMTP/IMAP sync endpoints are missing.

---

### Module 5: CRM & Customer Lifecycle

- **Source Files:**
  - CRM Store: [`src/store/crmStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/crmStore.ts)
  - CRM Dashboard Screen: [`src/screens/dashboard/CrmSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CrmSection.tsx)
  - Customer Profile Drawer: [`src/components/dashboard/CustomerProfile.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/CustomerProfile.tsx)
- **Database Tables:**
  - `leads`: Full lead record with `name`, `phone`, `email`, `status`, `source`, `score`, `tags`, `notes`, `custom_fields`.
- **Functionality Implemented:**
  - Contact management with real-time Supabase querying.
  - Status progression: `new` → `contacted` → `qualified` → `converted` → `lost`.
  - Full-text search by name, phone, and email.
  - Status and source filtering.
  - CSV lead import and CSV lead export.
  - Automatic lead resolution from inbound messages.
- **Known Limitations & Debt:**
  - Lead scoring is currently a static number or heuristic calculation rather than a configurable algorithmic rule engine.
  - Duplicate contact merging across different channels requires explicit identity resolution logic.

---

### Module 6: Appointments & Calendar Scheduling

- **Source Files:**
  - Calendar Store: [`src/store/calendarStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/calendarStore.ts)
  - Calendar Dashboard Screen: [`src/screens/dashboard/CalendarSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/CalendarSection.tsx)
- **Database Tables:**
  - `appointments`: Booking entries with `service_name`, `start_time`, `end_time`, `timezone`, `status`, `reminder_sent`.
  - `working_hours`: Weekly schedule with `day_of_week` (0-6), `start_time`, `end_time`, `is_active`.
- **Functionality Implemented:**
  - Live appointment booking and status updating (`scheduled`, `confirmed`, `completed`, `cancelled`).
  - Strict conflict detection: calculates overlap `(newStart < existingEnd && newEnd > existingStart)` and blocks double-booking.
  - Working hours definition with European time zone support (`Europe/Berlin`).
- **Known Limitations & Debt:**
  - External bi-directional calendar synchronization (Google Calendar API & Microsoft Outlook Graph API) is not yet connected via OAuth.
  - Automated SMS/WhatsApp reminder cron worker is defined in `services/jobQueue.ts` but requires scheduled job dispatch.

---

### Module 7: Orders & Business Operations

- **Source Files:**
  - Orders API: [`src/app/api/orders/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/orders/route.ts)
  - Order Store: [`src/store/orderStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/orderStore.ts)
  - Orders Dashboard Screen: [`src/screens/dashboard/OrdersSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/OrdersSection.tsx)
- **Database Tables:**
  - `orders`: Tracks `order_number` (`SX-XXXX`), `customer_name`, `items` (JSON array of name, quantity, price), `total_amount`, `currency` (`EUR`), `status`, `payment_status`.
- **Functionality Implemented:**
  - Order creation modal with dynamic line items and auto-summed totals in Euro (€).
  - Status switcher (`pending`, `processing`, `completed`, `cancelled`).
  - Payment status switcher (`unpaid`, `paid`, `refunded`).
  - Revenue calculation formatted according to European conventions (`145,00 €`).
- **Known Limitations & Debt:**
  - No external POS (Square, Clover) sync currently exists.
  - Automated Stripe payment link generation for pending orders is not yet hooked.

---

### Module 8: Kanban Task Management

- **Source Files:**
  - Task Store: [`src/store/taskStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/taskStore.ts)
  - Tasks Dashboard Screen: [`src/screens/dashboard/TasksSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/TasksSection.tsx)
- **Database Tables:**
  - `tasks`: Records `title`, `description`, `status` (`todo`, `in_progress`, `completed`), `priority` (`low`, `medium`, `high`, `urgent`), `due_date`.
- **Functionality Implemented:**
  - 3-column interactive Kanban board.
  - Task creation modal with priority tags.
  - One-click column advancement and task deletion.
- **Known Limitations & Debt:**
  - Drag-and-drop HTML5 drag events are basic; no complex drag-reordering animation library attached.

---

### Module 9: Workflow Automation & Visual Flow Builder

- **Source Files:**
  - Workflow Editor: [`src/screens/dashboard/WorkflowEditor.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowEditor.tsx)
  - Workflows Dashboard Screen: [`src/screens/dashboard/WorkflowsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/WorkflowsSection.tsx)
  - Execution Console: [`src/components/dashboard/ExecutionConsole.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ExecutionConsole.tsx)
  - Auth Store Workflows slice: [`src/store/authStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/authStore.ts)
- **Database Tables:**
  - `workflows`: Flow configurations with `trigger`, `action`, `config` (JSON steps array), `is_active`, `executions_count`.
  - `execution_logs`: Runtime execution history and failure traces.
- **Functionality Implemented:**
  - Visual node editor with Trigger, Condition, and Action steps.
  - Pre-built templates (After-Hours Auto-Responder, 5-Star Review Booster, Urgent Complaint Escalation).
  - Execution simulation log console.
- **Known Limitations & Debt:**
  - Workflows are triggered primarily via AI Orchestrator heuristics; an autonomous background workflow engine executing multi-step delays and HTTP webhooks is not yet fully decoupled.

---

### Module 10: Marketing Campaigns & Follow-up Sequences

- **Source Files:**
  - Campaign Database Tables: [`supabase/migrations/002_production_core_schema.sql`](file:///c:/Web%20Apps/starx-flow/supabase/migrations/002_production_core_schema.sql)
  - Consent Service: [`src/services/consent.ts`](file:///c:/Web%20Apps/starx-flow/src/services/consent.ts)
- **Database Tables:**
  - `campaigns`: Marketing broadcasts with `channel`, `message_template`, `target_segment`, `sent_count`, `delivered_count`, `response_count`.
  - `campaign_recipients`: Per-lead recipient dispatch tracking with `status` (`pending`, `sent`, `failed`, `replied`, `opted_out`).
  - `consent_logs`: GDPR consent tracking per channel and type.
- **Functionality Implemented:**
  - Database schema and consent recording logic.
  - Segment target structure.
- **Known Limitations & Debt:**
  - Dedicated Campaign UI screen in the dashboard is not yet exposed in the sidebar.
  - WhatsApp marketing template approval workflow with Meta Business Manager is not yet automated.

---

### Module 11: AI Voice Telephony & Assistant

- **Source Files:**
  - Voice Store: [`src/store/voiceStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/voiceStore.ts)
  - Voice Dashboard Screen: [`src/screens/dashboard/VoiceSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/VoiceSection.tsx)
- **Database Tables:**
  - `calls`: Records `customer_name`, `customer_phone`, `direction`, `status`, `duration_seconds`, `recording_url`, `transcription`, `summary`, `sentiment`.
- **Functionality Implemented:**
  - Call history table, call detail inspector with simulated audio waveform playback, transcript viewer, and sentiment pills.
  - Interactive call simulation modal demonstrating call intake logic.
- **Known Limitations & Debt:**
  - **Telephony is currently simulated.** No live Twilio or Telnyx SIP trunk or WebRTC audio stream is connected to real-time speech-to-text (Whisper/Deepgram) or text-to-speech (ElevenLabs/Cartesia).

---

### Module 12: Business OS (Memories, Goals & Autonomous Run Loop)

- **Source Files:**
  - Business Store: [`src/store/businessStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/businessStore.ts)
  - Business OS Screen: [`src/screens/dashboard/BusinessOSSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/BusinessOSSection.tsx)
- **Database Tables:**
  - `business_goals`: Business KPIs (`target_value`, `current_value`, `unit`, `status`).
  - `business_memories`: Persistent business facts (`category`, `key`, `value`).
- **Functionality Implemented:**
  - Executive Cockpit with system autonomy toggle (Max Autonomy vs Human in Loop).
  - Business Memory Board with category filtering (Hours, Policy, Pricing, General).
  - Goal tracking with dynamic progress bars.
  - Autonomous run-loop simulation logger.

---

### Module 13: Analytics, Telemetry & Reporting

- **Source Files:**
  - Analytics Service: [`src/services/analytics.ts`](file:///c:/Web%20Apps/starx-flow/src/services/analytics.ts)
  - Analytics Screen: [`src/screens/dashboard/AnalyticsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/AnalyticsSection.tsx)
  - KPI Grid Component: [`src/components/dashboard/KPIGrid.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/KPIGrid.tsx)
  - Execution Chart: [`src/components/dashboard/ExecutionChart.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ExecutionChart.tsx)
  - Channel Distribution: [`src/components/dashboard/ChannelDistribution.tsx`](file:///c:/Web%20Apps/starx-flow/src/components/dashboard/ChannelDistribution.tsx)
- **Database Tables:**
  - `analytics_events`: Buffered event ingestion (`event_type`, `event_data`).
  - `usage_records`: Usage metering records.
- **Functionality Implemented:**
  - Real-time KPI cards for Revenue (€), Active Leads, Bookings, AI Resolution Rate.
  - 7-day execution trend chart with hover tooltips.
  - Channel distribution donut/progress breakdown.
  - Buffered event flushing to prevent client performance degradation.

---

### Module 14: Billing, Subscriptions & Stripe Lifecycle

- **Source Files:**
  - Checkout API: [`src/app/api/billing/checkout/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/billing/checkout/route.ts)
  - Webhook API: [`src/app/api/billing/webhook/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/billing/webhook/route.ts)
  - Billing Store: [`src/store/billingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/billingStore.ts)
  - Pricing Page: [`src/app/pricing/PricingClient.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/pricing/PricingClient.tsx)
- **Database Tables:**
  - `subscriptions`: Stripe customer and subscription state, current period start/end, trial status.
  - `invoices`: Invoices and payment status records.
- **Functionality Implemented:**
  - Stripe Checkout Session creation with plan resolution.
  - Stripe Webhook handler verifying signatures and processing `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
  - Local dev auto-activation fallback when Stripe secret is not configured.
- **Known Limitations & Debt:**
  - Pricing discrepancy: [`PricingClient.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/pricing/PricingClient.tsx) displays legacy USD pricing ($29 / $59 / $99), while backend [`billingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/billingStore.ts) and checkout route use Euro (€49 / €97 / €297).
  - Stripe Customer Portal redirect endpoint is not yet hooked.

---

### Module 15: Self-Service Onboarding Wizard

- **Source Files:**
  - Onboarding Store: [`src/store/onboardingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/onboardingStore.ts)
  - Setup Routes: [`src/app/setup/`](file:///c:/Web%20Apps/starx-flow/src/app/setup) (Account, WhatsApp, Instagram, SMS, AI, Test, Launch)
- **Functionality Implemented:**
  - Multi-step guided wizard with dependency-aware step unlocking.
  - Readiness score calculation (0–100%).
  - Channel connection verification.
  - AI prompt and tone configuration.

---

### Module 16: Super Admin & Governance Dashboard

- **Source Files:**
  - Admin Store: [`src/store/adminStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/adminStore.ts)
  - Admin Dashboard: [`src/app/admin/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/admin/page.tsx)
  - Admin Login / Setup: [`src/app/admin/login/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/admin/login/page.tsx), [`src/app/admin/setup/page.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/admin/setup/page.tsx)
- **Functionality Implemented:**
  - Platform-wide client overview (Business Name, Owner, Plan, Status, Workflows, Executions).
  - Client detail modal with plan upgrade/downgrade and status toggling (`Active`, `Trial`, `Inactive`, `Churned`).
  - RPC function `claim_admin_role` using one-time setup secret.
- **Known Limitations & Debt:**
  - Admin governance operates primarily on `profiles` and `clients`; deeper cross-tenant inspection of AI provider latencies and API errors requires dedicated admin analytics views.

---

### Module 17: GDPR, European Localization & Privacy

- **Source Files:**
  - GDPR Export API: [`src/app/api/gdpr/export/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/gdpr/export/route.ts)
  - GDPR Deletion API: [`src/app/api/gdpr/delete/route.ts`](file:///c:/Web%20Apps/starx-flow/src/app/api/gdpr/delete/route.ts)
  - European Localization Utilities: [`src/lib/locale.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/locale.ts)
  - Settings Screen GDPR Section: [`src/screens/dashboard/SettingsSection.tsx`](file:///c:/Web%20Apps/starx-flow/src/screens/dashboard/SettingsSection.tsx)
- **Database Tables:**
  - `consent_logs`: Consent tracking.
- **Functionality Implemented:**
  - Article 20 Right to Data Portability: one-click JSON download containing all tenant leads, conversations, messages, appointments, orders, and telemetry.
  - Article 17 Right to Erasure: cascade deletion wiping all personal and operational data for a tenant upon explicit confirmation.
  - Standardized Euro formatting (`formatEuro`), European dates (`formatEuropeanDate`), and CET/CEST time zone handling.
  - Data localization badge indicating EU Frankfurt (`eu-central-1`) and ISO 27001 data sovereignty.

---

### Module 18: Security, Bot Defense & Rate Limiting

- **Source Files:**
  - StarX Shield Bot Defense: [`src/lib/shield.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/shield.ts)
  - Vercel Security Headers: [`vercel.json`](file:///c:/Web%20Apps/starx-flow/vercel.json)
- **Functionality Implemented:**
  - Passive, zero-overhead client-side bot detection (mouse velocity variance, keystroke timing, headless Chrome flags, honeypots).
  - Vercel security headers configured: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy.

---

## 4. Master Database Table Inventory

| Table Name | Defined In | Primary Key | Foreign Keys | RLS Enabled | Core Purpose |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `profiles` | `001_initial_schema` | `id` (UUID) | `auth.users(id)` | **YES** | User and business identity profile |
| `organizations` | `002_production_core` | `id` (UUID) | None | **YES** | Multi-tenant company/workspace entity |
| `organization_members` | `002_production_core` | `id` (UUID) | `org_id`, `user_id` | **YES** | Organization RBAC memberships |
| `leads` | `002_production_core` | `id` (UUID) | `user_id`, `org_id` | **YES** | CRM customer and prospect records |
| `conversations` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | **YES** | Multi-channel conversation threads |
| `messages` | `002_production_core` | `id` (UUID) | `conversation_id` | **YES** | Granular inbound/outbound messages |
| `appointments` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | **YES** | Calendar bookings & schedules |
| `working_hours` | `002_production_core` | `id` (UUID) | `user_id` | **YES** | Weekly availability schedule |
| `orders` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | **YES** | Customer orders, items, totals in € |
| `tasks` | `002_production_core` | `id` (UUID) | `user_id` | **YES** | Internal to-dos and Kanban items |
| `knowledge_documents` | `002_production_core` | `id` (UUID) | `user_id`, `org_id` | **YES** | Master RAG knowledge documents |
| `knowledge_chunks` | `002_production_core` | `id` (UUID) | `document_id`, `user_id` | **YES** | Vectorized text chunks for RAG |
| `campaigns` | `002_production_core` | `id` (UUID) | `user_id` | **YES** | Broadcast and follow-up campaigns |
| `campaign_recipients` | `002_production_core` | `id` (UUID) | `campaign_id`, `lead_id`| **YES** | Campaign delivery status per lead |
| `analytics_events` | `002_production_core` | `id` (UUID) | `user_id` | **YES** | Ingested telemetry events |
| `usage_records` | `002_production_core` | `id` (UUID) | `user_id` | **YES** | Subscription usage metering counters |
| `consent_logs` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | **YES** | GDPR compliance audit log |
| `workflows` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Automated workflows & step configs |
| `connected_channels` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Integrations & channel credentials |
| `execution_logs` | `001_initial_schema` | `id` (UUID) | `user_id`, `wf_id` | **YES** | Workflow and AI execution logs |
| `agents` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Custom agent prompts and configs |
| `agent_memories` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Short/long-term agent memory key-values |
| `business_goals` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Business metric targets |
| `business_memories` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Organizational memory board facts |
| `calls` | `001_initial_schema` | `id` (UUID) | `user_id`, `lead_id` | **YES** | Telephony records & transcripts |
| `subscriptions` | `001_initial_schema` | `id` (UUID) | `user_id` | **YES** | Stripe subscription state |
| `invoices` | `001_initial_schema` | `id` (UUID) | `user_id`, `sub_id` | **YES** | Stripe invoice receipts |
| `job_queue` | `001_initial_schema` | `id` (UUID) | None | **YES** | Background asynchronous jobs |

---

## 5. API Route Inventory

| Method | Endpoint | File Location | Auth Required | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/chat` | `src/app/api/chat/route.ts` | Public (Visitor) | Handles visitor web chat interactions |
| `GET` | `/api/whatsapp/webhook` | `src/app/api/whatsapp/webhook/route.ts` | Meta Verify Token | Meta WhatsApp webhook challenge verification |
| `POST` | `/api/whatsapp/webhook` | `src/app/api/whatsapp/webhook/route.ts` | Meta Signature | Receives and triages WhatsApp customer messages |
| `GET` | `/api/meta/auth` | `src/app/api/meta/auth/route.ts` | User Session | Generates Meta OAuth redirect URL for FB connect |
| `GET` | `/api/meta/callback` | `src/app/api/meta/callback/route.ts` | OAuth Code | Exchanges token, discovers pages/WABA, stores creds |
| `POST` | `/api/knowledge/ingest` | `src/app/api/knowledge/ingest/route.ts` | Authenticated | Chunks and indexes text, FAQs, and crawled URLs |
| `GET` | `/api/knowledge` | `src/app/api/knowledge/route.ts` | Authenticated | Lists indexed knowledge base documents |
| `DELETE`| `/api/knowledge` | `src/app/api/knowledge/route.ts` | Authenticated | Deletes document and cascades chunk deletion |
| `GET` | `/api/orders` | `src/app/api/orders/route.ts` | Authenticated | Lists business customer orders |
| `POST` | `/api/orders` | `src/app/api/orders/route.ts` | Authenticated | Creates a new customer order with line items |
| `PATCH` | `/api/orders` | `src/app/api/orders/route.ts` | Authenticated | Updates order status or payment status |
| `POST` | `/api/billing/checkout` | `src/app/api/billing/checkout/route.ts` | Authenticated | Creates Stripe checkout session for plans |
| `POST` | `/api/billing/webhook` | `src/app/api/billing/webhook/route.ts` | Stripe Signature | Processes subscription and invoice events |
| `GET` | `/api/gdpr/export` | `src/app/api/gdpr/export/route.ts` | Authenticated | Exports complete tenant JSON data archive (Art. 20) |
| `POST` | `/api/gdpr/delete` | `src/app/api/gdpr/delete/route.ts` | Authenticated | Permanently cascades deletion of all tenant data (Art. 17) |

---

## 6. Technical Debt & Architectural Discrepancies Register

| Item ID | Component / Area | Description of Technical Debt / Discrepancy | Severity | Recommended Remediation |
| :---: | :--- | :--- | :---: | :--- |
| **DEBT-01** | Root `api/` folder | Legacy serverless files `api/whatsapp-webhook.ts`, `api/whatsapp/connect.ts`, and `api/whatsapp/reset.ts` duplicate App Router routes. | **Medium** | Safe deprecation and removal in favor of `src/app/api/*`. |
| **DEBT-02** | Pricing Discrepancy | Marketing page [`PricingClient.tsx`](file:///c:/Web%20Apps/starx-flow/src/app/pricing/PricingClient.tsx) has hardcoded USD prices ($29 / $59 / $99), while backend [`billingStore.ts`](file:///c:/Web%20Apps/starx-flow/src/store/billingStore.ts) and checkout route use Euro (€49 / €97 / €297). | **High** | Align marketing UI to consume centralized `PLANS` from `billingStore.ts` formatted in Euro. |
| **DEBT-03** | Telephony Simulation | `VoiceSection.tsx` and `voiceStore.ts` operate on simulated call timers and transcripts. No real SIP or WebRTC audio bridge exists. | **High** | Implement production Twilio/Telnyx Media Streams + STT/TTS gateway (Module D). |
| **DEBT-04** | Missing Channel Webhooks | Instagram DM incoming webhook and Email IMAP/SMTP sync endpoints are missing. | **High** | Implement dedicated Instagram webhook and Email inbound parsing routes. |
| **DEBT-05** | External Calendar Sync | Google Calendar and Outlook synchronization is currently missing OAuth flows and delta synchronization workers. | **High** | Implement Google Calendar & Microsoft Graph API sync services (Module G). |
| **DEBT-06** | Workflow Runtime | Workflows currently trigger via heuristics inside `AIOrchestrator`; a standalone execution engine for scheduled multi-step workflows is required. | **Medium** | Implement durable execution worker using `job_queue` and Supabase Edge Functions. |
