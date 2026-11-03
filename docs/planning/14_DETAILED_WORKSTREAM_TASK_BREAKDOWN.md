# STARX-FLOW — DETAILED WORKSTREAM TASK BREAKDOWN
**Document Reference:** `docs/planning/14_DETAILED_WORKSTREAM_TASK_BREAKDOWN.md`  
**Phase:** Phase 4B.2 — Final Execution Plan Refinement & Engineering Baseline  
**Date:** 2026-11-01  
**Status:** Canonical Baseline — Ready for Implementation  

---

## 1. Executive Workstream Structure

The 15 engineering workstreams encompass all tasks required to transition StarX-Flow from its current working foundation to a hardened, commercially viable enterprise SaaS platform. Every task possesses a unique identifier (`WS-XX-TXX`), concrete architectural specifications, dependencies, testing requirements, story point estimation, and verification evidence.

Total Workstreams: 15  
Total Discrete Tasks: 28 Tasks  
Total Story Points: 93 SP (Reconciled exact sum of all 28 itemized tasks; previously cited as 87 SP prior to detailed task expansion)  

---

## WORKSTREAM 01: Shared Ingestion & Messaging Gateway (WS-01)
**Epic:** Standardize incoming and outgoing message payloads across WhatsApp, Web Chat, Email, and Instagram into a single canonical event pipeline.

### WS-01-T01: Channel-Agnostic Message Normalization Schema
- **Description:** Implement a unified TypeScript schema and parser that maps raw external provider payloads (Meta WhatsApp Cloud API, Web Chat SSE, Resend Email Webhook, Instagram Graph API) into a standardized `CanonicalMessage` interface.
- **Subtasks:**
  1. Define `CanonicalMessage`, `MessageSender`, `MessageAttachment`, and `MessageChannel` types in `src/types/messaging.ts`.
  2. Implement parser functions: `normalizeWhatsAppPayload()`, `normalizeWebChatPayload()`, `normalizeEmailPayload()`, and `normalizeInstagramPayload()`.
  3. Validate all normalized messages through a Zod schema (`canonicalMessageSchema`).
- **Technical Dependencies:** Existing `src/types/database.ts`.
- **Database Changes:** None (Data modeling normalization).
- **API Changes:** None directly; used internally by webhook routes.
- **Frontend Changes:** None.
- **Integration Requirements:** Meta WhatsApp API specs, Resend Inbound specs.
- **Security Requirements:** Strip potential XSS vectors and sanitize message body strings using DOMPurify/validator before normalization.
- **Testing Tasks:** Unit tests covering malformed payloads, media attachments, and missing fields across all 4 channels.
- **Acceptance Criteria:** 100% of incoming messages from any channel produce identical typed objects conforming to `CanonicalMessage`.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** `tests/unit/normalization.test.ts` passes with 100% code coverage.

### WS-01-T02: Inbound Rate Limiting & Replay Attack Defense
- **Description:** Protect ingestion webhooks against denial-of-service, rapid bursts, and replay attacks.
- **Subtasks:**
  1. Implement Redis/KV-based sliding window rate limiter in `src/lib/security/rateLimit.ts` (100 req/min per IP/channel).
  2. Implement webhook idempotency check: store external message IDs in KV cache for 24 hours; discard duplicate deliveries immediately with HTTP 200 OK.
  3. Verify cryptographic webhook signatures (HMAC SHA-256 for Meta; Svix/HMAC for Resend).
- **Technical Dependencies:** Upstash Redis or Vercel KV.
- **Database Changes:** None.
- **API Changes:** Middleware wrapper for `/api/integrations/*`.
- **Frontend Changes:** None.
- **Integration Requirements:** Secret verification keys (`WHATSAPP_APP_SECRET`, `RESEND_WEBHOOK_SECRET`).
- **Security Requirements:** Immediate termination of requests failing signature validation with HTTP 401 Unauthorized.
- **Testing Tasks:** Integration test simulating replayed WhatsApp message IDs and forged HMAC headers.
- **Acceptance Criteria:** Duplicate webhooks return HTTP 200 within <15ms without touching Supabase database.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Test suite `tests/security/webhook-replay.test.ts` passing.

---

## WORKSTREAM 02: Unified Inbox & Omnichannel Conversation Engine (WS-02)
**Epic:** Deliver a high-performance, real-time multi-channel communication command center with staff collaboration tools.

### WS-02-T01: Channel-Independent Conversation Threading Model
- **Description:** Decouple conversation records from single-channel constraints so a customer can transition between WhatsApp, Web Chat, and Email within the same unified thread.
- **Subtasks:**
  1. Update `conversations` query handlers to support querying by `customer_id` across multiple channels.
  2. Add `channel` indicator column to individual `messages` rows rather than fixing it solely on `conversations`.
  3. Update conversation listing API to compute aggregate unread counts and latest channel indicators.
- **Technical Dependencies:** WS-01-T01, existing `conversations` and `messages` tables.
- **Database Changes:** Add index on `messages (customer_id, created_at DESC)`.
- **API Changes:** Update `GET /api/conversations` and `GET /api/conversations/[id]/messages`.
- **Frontend Changes:** Update `UnifiedInbox.tsx` message bubbles to display channel origin badges (WhatsApp pill, Email pill, Web pill).
- **Integration Requirements:** None.
- **Security Requirements:** Enforce PostgreSQL RLS: users can only access conversations belonging to their `organization_id`.
- **Testing Tasks:** End-to-end test verifying messages received from WhatsApp and Web Chat display sequentially in the same thread.
- **Acceptance Criteria:** Customer sending message via WhatsApp followed by Web Chat appears in one continuous conversation stream.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Passing integration test `tests/journeys/unified-thread.test.ts`.

### WS-02-T02: Internal Notes & Staff Collaboration
- **Description:** Allow internal staff members to leave private notes and mention team members inside conversation threads without exposing them to customers.
- **Subtasks:**
  1. Add `is_internal` boolean flag and `author_user_id` uuid reference to `messages` schema.
  2. Update message creation endpoint to accept `is_internal: true`.
  3. Guard outbound channel dispatchers: NEVER forward messages where `is_internal = true` to WhatsApp, Resend, or Instagram.
  4. Render internal notes in `UnifiedInbox.tsx` with distinct yellow background styling, padlock icon, and author avatar.
- **Technical Dependencies:** Existing `messages` table, Supabase Auth.
- **Database Changes:** `ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false;`
- **API Changes:** `POST /api/conversations/[id]/messages` accepts `{ content, is_internal: boolean }`.
- **Frontend Changes:** Add "Internal Note" toggle tab in the message composer.
- **Integration Requirements:** None.
- **Security Requirements:** Strict server-side verification: outbound integration dispatcher rejects any message marked internal.
- **Testing Tasks:** Security unit test verifying an internal note is filtered out from WhatsApp API outbound dispatch payload.
- **Acceptance Criteria:** Internal notes display to team members but are 100% prevented from sending to the customer's phone or email.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Unit test `tests/security/internal-notes-leakage.test.ts` passing.

### WS-02-T03: Real-Time Synchronization & Agent Collision Detection
- **Description:** Implement live updates for incoming messages and show when another team member is viewing or drafting a reply.
- **Subtasks:**
  1. Initialize Supabase Realtime subscription in `useInbox.ts` listening to `INSERT` and `UPDATE` on `messages` table.
  2. Implement presence channel `inbox-presence:{org_id}:{conversation_id}` tracking active staff viewers and typing status.
  3. Render presence pills: "Sarah is typing..." or "Viewed by Marcus" in the conversation header.
- **Technical Dependencies:** Supabase Realtime enabled on `messages`.
- **Database Changes:** Ensure `REPLICA IDENTITY FULL` on `messages` table for Supabase Realtime.
- **API Changes:** None (Uses Supabase Realtime WebSocket).
- **Frontend Changes:** Add presence avatar stack and typing indicator banner in `UnifiedInbox.tsx`.
- **Integration Requirements:** Supabase Realtime quota.
- **Security Requirements:** Ensure presence channel is scoped to tenant ID so foreign tenants cannot listen to presence broadcasts.
- **Testing Tasks:** Browser concurrency test with two simulated agents viewing the same conversation.
- **Acceptance Criteria:** Incoming message arrives in UI in <300ms without page reload; typing indicator appears within 200ms.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Automated Playwright test verifying multi-tab presence synchronization.

---

## WORKSTREAM 03: Cross-Channel Customer Identity Resolution (WS-03)
**Epic:** Link external phone numbers, email addresses, and social handles to a single unified customer profile.

### WS-03-T01: Channel Identities Schema & Resolution Engine
- **Description:** Implement the `channel_identities` table and lookup service that matches inbound identifiers (E.164 phone, email, Instagram scoped ID) to an existing customer record or provisions a new one.
- **Subtasks:**
  1. Specify `channel_identities` table in Migration 003 (with columns: `id`, `organization_id`, `customer_id`, `channel`, `external_user_id`, `profile_data`, `verified_at`).
  2. Create resolution service `src/lib/crm/identityResolver.ts`.
  3. Resolution algorithm:
     - Check `channel_identities` by `(organization_id, channel, external_user_id)`.
     - If not found, check `customers` by phone or email.
     - If found in `customers`, create link in `channel_identities`.
     - If not found, create new `customer` and link identity.
- **Technical Dependencies:** Migration 003 schema.
- **Database Changes:** Creation of `channel_identities` table with unique constraint on `(organization_id, channel, external_user_id)`.
- **API Changes:** Internal service method `resolveOrCreateCustomer()`.
- **Frontend Changes:** Customer profile view in CRM displays linked identities (WhatsApp icon with phone, Email icon with address, IG icon with handle).
- **Integration Requirements:** None.
- **Security Requirements:** RLS policy restricting `channel_identities` by `organization_id`.
- **Testing Tasks:** Unit tests testing all branches of the resolution algorithm (new user, existing phone match, existing email match).
- **Acceptance Criteria:** Customer messaging first on WhatsApp (+49170123456) and later emailing (hans@example.com) merges into single CRM record upon email verification.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** `tests/unit/identity-resolver.test.ts` passing all 6 identity permutation scenarios.

### WS-03-T02: Manual Profile Merge Tooling in CRM
- **Description:** Provide staff with a UI tool to manually merge duplicate customer profiles when identity attributes differ.
- **Subtasks:**
  1. Build API route `POST /api/crm/customers/merge` accepting `source_customer_id` and `target_customer_id`.
  2. Server transaction: reassign all `conversations`, `messages`, `appointments`, `orders`, and `channel_identities` from source to target customer, then soft-delete source.
  3. Add "Merge Contact" button and selection modal in `CRMSection.tsx`.
- **Technical Dependencies:** WS-03-T01.
- **Database Changes:** None.
- **API Changes:** New endpoint `POST /api/crm/customers/merge`.
- **Frontend Changes:** Add merge action button and modal in CRM contact drawer.
- **Integration Requirements:** None.
- **Security Requirements:** Admin/Manager role required to execute contact merges. Action logged in `audit_logs`.
- **Testing Tasks:** Integration test verifying all historical appointments and orders transition to the target customer without orphan records.
- **Acceptance Criteria:** Merged contact retains combined history of all orders and conversations with zero data loss.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Verification test `tests/crm/contact-merge.test.ts`.

---

## WORKSTREAM 04: Tool-Augmented AI Receptionist & Agent Workforce (WS-04)
**Epic:** Upgrade AI agents from text-only conversationalists to tool-augmented agents capable of executing database transactions autonomously.

### WS-04-T01: Structured Tool Calling Specification & Dispatcher
- **Description:** Implement JSON Schema tool definitions for Gemini 2.5 Flash / Pro and NVIDIA NIM, enabling agents to book appointments, check service availability, update customer details, and look up orders.
- **Subtasks:**
  1. Define tool schemas in `src/lib/ai/tools.ts`:
     - `checkCalendarAvailability({ date, service_id })`
     - `bookAppointment({ customer_id, service_id, start_time, notes })`
     - `lookupOrderStatus({ order_id, customer_id })`
     - `updateCustomerProfile({ customer_id, name, email, custom_fields })`
     - `transferToHumanAgent({ reason, urgency })`
  2. Implement execution router executing corresponding database operations with tenant isolation.
  3. Implement multi-turn tool calling loop in `src/lib/ai/provider.ts` handling `tool_calls` and returning `tool_results`.
- **Technical Dependencies:** Existing `src/lib/ai/provider.ts`, Gemini Function Calling API.
- **Database Changes:** None.
- **API Changes:** Update `POST /api/chat` to execute tool calls server-side.
- **Frontend Changes:** Chat UI displays tool execution pill: "Checking calendar availability..." -> "Appointment booked for Friday at 14:00".
- **Integration Requirements:** Google Gemini 2.5 Function Calling or OpenAI-compatible tool calling on NVIDIA NIM.
- **Security Requirements:** All tool functions MUST validate the session `organization_id` internally to prevent arbitrary parameter manipulation.
- **Testing Tasks:** Mock tool-call integration tests verifying arguments conform to Zod schemas and DB updates succeed.
- **Acceptance Criteria:** User says "Book me a haircut for tomorrow at 3pm" -> AI invokes `bookAppointment` with valid ISO timestamp -> appointment appears in Supabase `appointments` table.
- **Estimated Complexity:** 5 Story Points.
- **Completion Evidence:** Automated test `tests/ai/tool-calling-e2e.test.ts`.

### WS-04-T02: Inbound Voice Note Audio Transcription
- **Description:** Enable AI Receptionist to transcribe and understand incoming WhatsApp and web voice notes.
- **Subtasks:**
  1. Add audio downloader in WhatsApp webhook: fetch media binary using Meta Graph API with bearer token.
  2. Stream audio buffer to Whisper / Deepgram speech-to-text API.
  3. Inject transcribed text into AI prompt with `[Voice Note]: "..."` tag.
  4. Store transcription text in `messages.content` and media URL in `messages.media_url`.
- **Technical Dependencies:** Deepgram API key or OpenAI Whisper API key.
- **Database Changes:** None (`media_url` and `metadata` columns already exist).
- **API Changes:** WhatsApp webhook media ingestion handler.
- **Frontend Changes:** Audio player widget in `UnifiedInbox.tsx` with expandable transcription text.
- **Integration Requirements:** Deepgram / OpenAI Whisper API.
- **Security Requirements:** Downloaded audio files stored in private Supabase Storage bucket with signed URL expiration (60 minutes).
- **Testing Tasks:** Test ingestion of a 15-second `.ogg` Opus audio voice note.
- **Acceptance Criteria:** Customer voice note on WhatsApp is transcribed with >95% accuracy and answered intelligently by AI Receptionist in <3 seconds.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Integration test `tests/integrations/voice-note-transcription.test.ts`.

---

## WORKSTREAM 05: Customer Knowledge Base & Multi-Tenant RAG Pipeline (WS-05)
**Epic:** Deliver high-precision, tenant-isolated vector retrieval with automated document ingestion and citation generation.

### WS-05-T01: Automated Document Processing & Chunking Pipeline
- **Description:** Build production document ingestion pipeline supporting TXT, Markdown, PDF, and DOCX files with smart semantic chunking.
- **Subtasks:**
  1. Implement file parser in `src/lib/rag/parser.ts` extracting clean text from uploaded buffers.
  2. Implement semantic sliding-window chunker (500 tokens, 50 token overlap) preserving paragraph boundaries.
  3. Compute embeddings using Google `text-embedding-004` (768 dimensions).
  4. Batch upsert chunks into `knowledge_chunks` table with `organization_id` foreign key.
- **Technical Dependencies:** `pdf-parse`, `@google/genai`, Supabase `knowledge_chunks`.
- **Database Changes:** Ensure `knowledge_chunks` has HNSW index on `embedding vector_cosine_ops`.
- **API Changes:** `POST /api/knowledge/upload` accepting multipart file upload.
- **Frontend Changes:** Upload progress bar, document status pill (`Processing`, `Indexed`, `Error`), and chunk count in `KnowledgeBaseSection.tsx`.
- **Integration Requirements:** Google Gemini Embedding API.
- **Security Requirements:** Maximum file size 10MB; file type validation; chunk data strictly tagged with `organization_id`.
- **Testing Tasks:** Ingestion test uploading a 20-page sample business FAQ PDF; verify chunk count and embedding dimension (768).
- **Acceptance Criteria:** 20-page PDF processes and indexes into Supabase pgvector in <12 seconds.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Ingestion pipeline test `tests/rag/document-indexer.test.ts`.

### WS-05-T02: Source Citation & Retrieval Confidence Scoring
- **Description:** Equip AI responses with explicit source citations and threshold confidence filtering to eliminate hallucinations.
- **Subtasks:**
  1. Update `match_knowledge_chunks` RPC query to return similarity score, document title, and page number.
  2. Implement confidence cutoff: if top chunk similarity is <0.65, instruct AI to politely state it does not have that specific information.
  3. Format citations in chat responses with clickable reference badges `[Source: Pricing FAQ, p. 2]`.
- **Technical Dependencies:** WS-05-T01.
- **Database Changes:** None.
- **API Changes:** `/api/chat` response includes `citations` array in metadata.
- **Frontend Changes:** Collapsible "Sources Cited" accordion below AI chat message in widget and inbox.
- **Integration Requirements:** None.
- **Security Requirements:** Chunks from other organizations are mathematically excluded via RLS and RPC filter.
- **Testing Tasks:** Automated query test with known questions from uploaded doc; assert similarity >0.75 and correct title cited.
- **Acceptance Criteria:** AI response contains valid citations for factual business claims; out-of-domain questions trigger honest fallback.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Test suite `tests/rag/citation-accuracy.test.ts`.

---

## WORKSTREAM 06: Production External Calendar Sync (WS-06)
**Epic:** Bidirectional real-time synchronization between StarX-Flow booking system and Google Calendar / Microsoft Outlook.

### WS-06-T01: Google Calendar OAuth 2.0 & Event Push/Pull
- **Description:** Connect staff member Google accounts, export bookings to Google Calendar, and import busy slots to prevent double-booking.
- **Subtasks:**
  1. Implement OAuth flow: `GET /api/integrations/google-calendar/connect` and `GET /api/integrations/google-calendar/callback`.
  2. Store encrypted refresh token in `integrations` table (`credentials.refresh_token`).
  3. Build bidirectional synchronization worker:
     - On booking created in StarX-Flow: create event on user's primary Google Calendar via Google Calendar API v3.
     - Webhook listener for Google Calendar push notifications (`POST /api/integrations/google-calendar/webhook`): import external busy blocks into `staff_unavailability` table.
- **Technical Dependencies:** Google Cloud Console OAuth 2.0 App (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
- **Database Changes:** Create `staff_unavailability` table or store external calendar block records.
- **API Changes:** OAuth endpoints + Google webhook receiver.
- **Frontend Changes:** "Connect Google Calendar" button with connected status and sync toggle in Settings -> Integrations.
- **Integration Requirements:** Google Calendar API.
- **Security Requirements:** AES-256 encryption on stored refresh tokens. Scopes restricted to `https://www.googleapis.com/auth/calendar.events`.
- **Testing Tasks:** Integration test simulating Google Calendar event creation and external busy block conflict check.
- **Acceptance Criteria:** Booking created in StarX-Flow appears on staff member's Google Calendar in <3s; personal event on Google Calendar immediately removes slot from public booking page.
- **Estimated Complexity:** 5 Story Points.
- **Completion Evidence:** Integration test `tests/integrations/google-calendar-sync.test.ts`.

### WS-06-T02: Microsoft Outlook / Office 365 Calendar Sync
- **Description:** Implement equivalent bidirectional synchronization for Microsoft 365 / Outlook calendars via Microsoft Graph API.
- **Subtasks:**
  1. Implement Azure AD OAuth flow: `/api/integrations/outlook/connect` and callback.
  2. Sync StarX-Flow appointments to Outlook Calendar via Microsoft Graph `/me/events`.
  3. Listen to Microsoft Graph webhook notifications for event changes.
- **Technical Dependencies:** Microsoft Entra ID App (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`).
- **Database Changes:** None (reuses `integrations` table).
- **API Changes:** Outlook OAuth and webhook endpoints.
- **Frontend Changes:** "Connect Outlook Calendar" button in Settings.
- **Integration Requirements:** Microsoft Graph API.
- **Security Requirements:** Encrypted token storage.
- **Testing Tasks:** Outlook event creation mock test.
- **Acceptance Criteria:** Outlook calendar sync operates with identical parity to Google Calendar.
- **Estimated Complexity:** 4 Story Points.
- **Completion Evidence:** Test suite `tests/integrations/outlook-calendar-sync.test.ts`.

---

## WORKSTREAM 07: Inbound/Outbound Email Integration (WS-07)
**Epic:** Enable two-way email communication inside Unified Inbox via Resend inbound webhook and custom domain dispatching.

### WS-07-T01: Resend Inbound Email Webhook & Threading
- **Description:** Receive customer emails via Resend Inbound Webhook, parse headers, and thread replies into existing conversations.
- **Subtasks:**
  1. Implement webhook endpoint `POST /api/integrations/email/inbound`.
  2. Parse sender, subject, HTML body, plain text body, `Message-ID`, and `In-Reply-To` headers.
  3. Extract conversation reference from reply headers or email subject tags (e.g. `[#SF-1042]`).
  4. Resolve customer record by sender email; append inbound message to `messages` table.
- **Technical Dependencies:** Resend Inbound Webhook setup (`RESEND_API_KEY`).
- **Database Changes:** Add `email_message_id` and `in_reply_to` columns to `messages` table if not present.
- **API Changes:** New endpoint `POST /api/integrations/email/inbound`.
- **Frontend Changes:** Email messages in `UnifiedInbox.tsx` display subject line, sender email, and rich HTML preview.
- **Integration Requirements:** Resend MX record configuration on tenant or platform domain.
- **Security Requirements:** Verify Resend webhook signature using Svix signature validator.
- **Testing Tasks:** Test ingestion of raw multipart MIME email payload.
- **Acceptance Criteria:** Customer replying to a StarX-Flow email has their response appear in Unified Inbox within 2 seconds.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Integration test `tests/integrations/email-inbound.test.ts`.

### WS-07-T02: Outbound Email Dispatcher with Custom Domain Branding
- **Description:** Send rich branded emails directly from Unified Inbox using the tenant's verified domain.
- **Subtasks:**
  1. Build outbound email sender in `src/lib/email/dispatcher.ts`.
  2. Configure `From:` header using tenant business name (`"Boutique Hotel" <support@hotel.com>`).
  3. Include RFC-compliant threading headers: `References` and `In-Reply-To` matching earlier email.
  4. Track delivery status via Resend webhooks (`sent`, `delivered`, `bounced`).
- **Technical Dependencies:** Resend API.
- **Database Changes:** None.
- **API Changes:** Triggered via `POST /api/conversations/[id]/messages` when channel is `email`.
- **Frontend Changes:** Email reply composer with Subject line input and rich formatting.
- **Integration Requirements:** Tenant domain DNS records (DKIM, SPF, DMARC).
- **Security Requirements:** Prevent open relay: sender domain must be verified on tenant's account.
- **Testing Tasks:** Send test email to mock inbox; assert valid DKIM and threading headers.
- **Acceptance Criteria:** Outbound email reaches customer inbox with 100% SPF/DKIM alignment and groups correctly in Gmail/Apple Mail threads.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/email/outbound-dispatch.test.ts`.

---

## WORKSTREAM 08: Instagram Direct Message Integration (WS-08)
**Epic:** Ingest and reply to Instagram Direct Messages through Meta Graph API within the Unified Inbox.

### WS-08-T01: Instagram Webhook Ingestion & Message Parsing
- **Description:** Implement Meta Webhook handler for Instagram Direct Messages, story mentions, and reactions.
- **Subtasks:**
  1. Create endpoint `GET/POST /api/integrations/instagram`.
  2. Verify webhook challenge token with `META_VERIFY_TOKEN`.
  3. Parse Instagram payload: `entry[0].messaging[0].message` (text, attachments, story shares).
  4. Resolve customer by Instagram Scoped ID (IGSID); persist in `messages` and `conversations`.
- **Technical Dependencies:** Meta App with `instagram_manage_messages` permission.
- **Database Changes:** None.
- **API Changes:** New endpoint `POST /api/integrations/instagram`.
- **Frontend Changes:** Instagram icon badge and profile handle display in Unified Inbox.
- **Integration Requirements:** Instagram Professional account linked to Facebook Page.
- **Security Requirements:** Verify SHA-256 HMAC signature in `x-hub-signature-256`.
- **Testing Tasks:** Unit test parsing Instagram text message and image attachment webhook JSON.
- **Acceptance Criteria:** Inbound Instagram DM appears in Unified Inbox in <2 seconds.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Integration test `tests/integrations/instagram-webhook.test.ts`.

### WS-08-T02: Outbound Instagram DM Dispatcher
- **Description:** Enable staff and AI Receptionist to send direct replies to Instagram users via Meta Graph API.
- **Subtasks:**
  1. Build sender in `src/lib/integrations/instagram.ts` calling `POST https://graph.facebook.com/v19.0/me/messages`.
  2. Handle 24-hour standard messaging window constraint (warn staff if window has expired).
  3. Send text and quick-reply options.
- **Technical Dependencies:** Meta Graph API v19.0.
- **Database Changes:** None.
- **API Changes:** Triggered via `POST /api/conversations/[id]/messages` when channel is `instagram`.
- **Frontend Changes:** Warning banner in inbox when messaging window has expired.
- **Integration Requirements:** Valid Facebook Page Access Token.
- **Security Requirements:** Strict tenant credential isolation.
- **Testing Tasks:** Outbound message dispatch test with mock Graph API response.
- **Acceptance Criteria:** Message sent from StarX-Flow inbox delivers to user's Instagram mobile app in <2s.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Test suite `tests/integrations/instagram-outbound.test.ts`.

---

## WORKSTREAM 09: Durable Background Job Engine & Automated Follow-Up Campaigns (WS-09)
**Epic:** Deliver a reliable, persistent background job queue for scheduled automated follow-ups that survive server restarts.

### WS-09-T01: Durable Job Queue Architecture
- **Description:** Implement a robust database-backed job queue for scheduled tasks (delayed messages, appointment reminders, lead decay checks).
- **Subtasks:**
  1. Create `scheduled_jobs` table or Edge Function cron runner (`id`, `organization_id`, `job_type`, `payload`, `run_at`, `status`, `attempts`, `error_message`).
  2. Implement scheduler utility: `scheduleJob({ job_type, run_at, payload })`.
  3. Build worker processor endpoint `/api/cron/process-jobs` executed every minute via Vercel Cron or Supabase `pg_cron`.
  4. Implement optimistic locking (`UPDATE ... WHERE status = 'pending' AND run_at <= NOW() FOR UPDATE SKIP LOCKED`).
- **Technical Dependencies:** Vercel Cron or Supabase `pg_cron`.
- **Database Changes:** Create `scheduled_jobs` table with index on `(status, run_at)`.
- **API Changes:** New endpoint `GET /api/cron/process-jobs` (guarded by `CRON_SECRET`).
- **Frontend Changes:** None.
- **Integration Requirements:** Vercel Cron configuration (`vercel.json`).
- **Security Requirements:** Endpoint strictly protected by `Bearer ${CRON_SECRET}` header.
- **Testing Tasks:** Concurrency test verifying multiple workers never process the same job twice.
- **Acceptance Criteria:** Job scheduled for `T + 2 hours` executes within 60 seconds of designated timestamp; 0 duplicate executions.
- **Estimated Complexity:** 4 Story Points.
- **Completion Evidence:** Worker test `tests/cron/job-queue.test.ts`.

### WS-09-T02: Multi-Stage Follow-Up Sequence Engine
- **Description:** Build automated follow-up sequences (e.g. 1 hour post-appointment review request, 24-hour reminder) with stop-on-reply logic.
- **Subtasks:**
  1. Build sequence trigger listener: when appointment marked `completed`, schedule Follow-Up Step 1 (`T + 1h`).
  2. Build cancel-on-reply hook: when customer sends any inbound message, automatically set pending follow-up jobs for that customer to `cancelled`.
  3. Add channel fallback: if WhatsApp delivery fails or 24h window closed, fallback to sending follow-up via Email.
- **Technical Dependencies:** WS-09-T01.
- **Database Changes:** None.
- **API Changes:** Follow-up campaign execution logic.
- **Frontend Changes:** Campaign execution metrics in `FollowUpBuilder.tsx` (Scheduled, Sent, Replied, Cancelled).
- **Integration Requirements:** WhatsApp and Resend dispatchers.
- **Security Requirements:** Respect customer opt-out / STOP keyword requests immediately.
- **Testing Tasks:** End-to-end test: schedule follow-up -> simulate customer reply -> assert pending job is cancelled.
- **Acceptance Criteria:** Customer reply cancels subsequent automated messages; quiet hours (21:00-08:00) delay dispatch to 09:00 next morning.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/automation/followup-sequence.test.ts`.

---

## WORKSTREAM 10: Deterministic Workflow Automation Engine (WS-10)
**Epic:** Implement the server-side runtime for the visual drag-and-drop workflow builder.

### WS-10-T01: Workflow Graph Execution Runtime
- **Description:** Implement the topological execution engine that takes a workflow graph JSON (nodes, edges, conditions) and executes steps deterministically.
- **Subtasks:**
  1. Build workflow runner in `src/lib/workflow/engine.ts`.
  2. Implement node executors:
     - `TriggerNode`: Event ingestion (`appointment.created`, `lead.score_changed`, `tag.added`).
     - `ConditionNode`: Logical evaluations (`customer.tags includes 'VIP'`, `order.total > 100`).
     - `ActionNode`: Actions (`send_whatsapp`, `send_email`, `create_task`, `call_webhook`).
  3. Record execution state in `workflow_executions` table (Migration 003).
- **Technical Dependencies:** Migration 003 (`workflow_executions`).
- **Database Changes:** Table `workflow_executions` created.
- **API Changes:** Endpoint `POST /api/workflows/[id]/test-run`.
- **Frontend Changes:** "Test Run" button on `WorkflowCanvas.tsx` with live node highlight animation during execution.
- **Integration Requirements:** None.
- **Security Requirements:** Sandboxed webhook actions: prevent SSRF by disallowing private IP address ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`).
- **Testing Tasks:** Execute a 5-node branching workflow with simulated inputs; assert correct path taken.
- **Acceptance Criteria:** Workflow executes end-to-end within <800ms; every step's input, output, and execution duration is persisted in `workflow_executions`.
- **Estimated Complexity:** 5 Story Points.
- **Completion Evidence:** Integration test `tests/workflow/engine-execution.test.ts`.

---

## WORKSTREAM 11: Voice Telephony Engine (WS-11)
**Epic:** Transition Voice Section from simulation to real-time conversational telephony via Twilio, Deepgram, and ElevenLabs.

### WS-11-T01: Twilio Media Stream WebSocket Gateway
- **Description:** Implement bidirectional audio WebSocket gateway connecting Twilio incoming calls to speech-to-text, LLM, and text-to-speech services.
- **Subtasks:**
  1. Build WebSocket server in `src/lib/voice/gateway.ts` (configured for standalone deployment on Fly.io / Railway or Next.js custom server).
  2. Implement Twilio TwiML webhook endpoint: `POST /api/voice/incoming` returning `<Connect><Stream url="wss://voice.starxflow.com/media-stream" /></Connect>`.
  3. Handle audio pipeline:
     - Twilio `media` event (mu-law 8kHz audio) -> Stream to Deepgram Live Transcription WebSocket.
     - Deepgram transcript -> Stream to Gemini 2.5 Flash.
     - Gemini token stream -> Stream to ElevenLabs WebSocket (Turbo v2.5).
     - ElevenLabs audio chunks -> Encode to mu-law -> Send back to Twilio `media` event.
- **Technical Dependencies:** Twilio Voice, Deepgram API, ElevenLabs API.
- **Database Changes:** Migration 003 `phone_numbers` table.
- **API Changes:** TwiML webhook `/api/voice/incoming` and status callback `/api/voice/status`.
- **Frontend Changes:** Live call indicator in `VoiceSection.tsx` showing active call duration, caller ID, and live transcript stream.
- **Integration Requirements:** Twilio Account SID, Auth Token, Provisioned EU phone number.
- **Security Requirements:** Authenticate Twilio webhook signature (`X-Twilio-Signature`).
- **Testing Tasks:** Mock audio streaming test validating mu-law transcoding and WebSocket packet round-trip.
- **Acceptance Criteria:** Inbound call answered in <1.2s; end-to-end conversational voice latency <800ms; natural turn-taking with interruption handling.
- **Estimated Complexity:** 8 Story Points.
- **Completion Evidence:** Telephony integration test `tests/voice/media-stream.test.ts`.

### WS-11-T02: Call Summary, Recording & CRM Record Attachment
- **Description:** Process post-call audio recordings, generate structured summaries with sentiment analysis, and attach them to customer CRM profiles.
- **Subtasks:**
  1. Handle Twilio `recordingStatusCallback` webhook: download encrypted call recording.
  2. Execute post-call LLM analysis: generate 3-sentence summary, action items, customer sentiment score, and key topics.
  3. Create record in `call_logs` table linked to `customer_id`.
  4. Auto-create follow-up tasks in Kanban if action items are detected.
- **Technical Dependencies:** WS-11-T01.
- **Database Changes:** Ensure `call_logs` table has `recording_url`, `summary`, and `sentiment` columns.
- **API Changes:** New endpoint `POST /api/voice/recording-callback`.
- **Frontend Changes:** Call recording audio player and summary badge in Customer CRM timeline.
- **Integration Requirements:** Twilio Call Recording API.
- **Security Requirements:** Audio recordings stored in private Supabase Storage bucket with signed access tokens.
- **Testing Tasks:** Process sample call recording; assert CRM summary and action items are correctly generated.
- **Acceptance Criteria:** Within 10 seconds of call completion, full transcript, audio playback, and action items are visible in CRM.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/voice/post-call-summary.test.ts`.

---

## WORKSTREAM 12: Lead Scoring & Pipeline Analytics (WS-12)
**Epic:** Deliver configurable event-driven lead scoring and high-performance pre-computed analytics rollups.

### WS-12-T01: Event-Driven Lead Scoring Engine
- **Description:** Implement real-time lead score recalculation based on customer interactions (WhatsApp reply: +10 pts, Appointment booked: +50 pts, Inactivity 14 days: -15 pts).
- **Subtasks:**
  1. Specify `lead_scoring_rules` table in Migration 003.
  2. Build event listener `evaluateLeadScore(customerId, eventType)`.
  3. When score crosses threshold (e.g. 75 pts), auto-update stage to `Qualified` and trigger alert.
  4. Implement nightly lead decay job in `/api/cron/lead-decay`.
- **Technical Dependencies:** Migration 003 (`lead_scoring_rules`).
- **Database Changes:** `lead_scoring_rules` table created.
- **API Changes:** Endpoints `GET/POST /api/crm/lead-scoring/rules`.
- **Frontend Changes:** Scoring rules editor in Settings -> CRM; score badge with flame icon for hot leads in CRM list.
- **Integration Requirements:** None.
- **Security Requirements:** Tenant isolation on rules.
- **Testing Tasks:** Fire sequential events for a customer; assert lead score increments accurately.
- **Acceptance Criteria:** Customer booking appointment immediately increases score by 50 points; high-score lead triggers notification to assigned staff.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/crm/lead-scoring.test.ts`.

### WS-12-T02: Database-Backed Daily Analytics Rollups
- **Description:** Replace slow real-time aggregations with pre-computed daily rollup tables for instant dashboard performance.
- **Subtasks:**
  1. Specify `analytics_daily_rollups` table in Migration 003 (`organization_id`, `date`, `metric_name`, `metric_value`, `dimensions`).
  2. Build aggregation job computing daily metrics (conversations, revenue, new leads, bookings) run nightly via cron.
  3. Update `GET /api/analytics` to query `analytics_daily_rollups` with date range filters (`7d`, `30d`, `90d`).
- **Technical Dependencies:** Migration 003 (`analytics_daily_rollups`).
- **Database Changes:** Table `analytics_daily_rollups` created with composite unique index on `(organization_id, date, metric_name)`.
- **API Changes:** Rewrite `GET /api/analytics` endpoint.
- **Frontend Changes:** Update `AnalyticsSection.tsx` charts to consume structured rollup series without client-side calculation.
- **Integration Requirements:** None.
- **Security Requirements:** Tenant isolation via RLS.
- **Testing Tasks:** Query performance benchmark: assert response time <250ms with 100,000 historical rows.
- **Acceptance Criteria:** Analytics dashboard renders in <300ms across all date ranges with zero UI freezing.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Benchmark test `tests/analytics/rollup-query.test.ts`.

---

## WORKSTREAM 13: Usage-Based Metering & Stripe Billing Hardening (WS-13)
**Epic:** Synchronize pricing tiers (€49, €97, €297), enforce hard plan quotas, and automate Stripe billing lifecycles.

### WS-13-T01: Commercial Pricing Tier Realignment & Checkout
- **Description:** Align frontend pricing displays and backend checkout endpoints to the canonical European business tiering (€49 Starter, €97 Growth, €297 Enterprise).
- **Subtasks:**
  1. Update `PricingClient.tsx` to display €49, €97, and €297 with exact feature allowances.
  2. Verify Stripe Price IDs in `src/lib/stripe/config.ts` map to live Euro products in Stripe Dashboard.
  3. Update `POST /api/stripe/checkout` to validate chosen tier and pass tax ID collection settings for EU VAT.
- **Technical Dependencies:** Stripe API credentials (`STRIPE_SECRET_KEY`).
- **Database Changes:** None.
- **API Changes:** Update `/api/stripe/checkout`.
- **Frontend Changes:** Pricing page update; currency symbol set to €; VAT inclusion notice added.
- **Integration Requirements:** Stripe Billing Products.
- **Security Requirements:** Secure checkout session creation with signed metadata.
- **Testing Tasks:** E2E test initiating checkout for each of the 3 tiers.
- **Acceptance Criteria:** Selecting €97 Growth plan creates valid Stripe Checkout session with correct line item, currency, and tax collection.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Automated test `tests/billing/checkout-tiers.test.ts`.

### WS-13-T02: Plan Quota Metering & Enforcement Middleware
- **Description:** Track monthly AI message and voice minute consumption; enforce hard limits with upgrade prompts.
- **Subtasks:**
  1. Add `monthly_ai_messages_used` and `monthly_voice_minutes_used` to `organizations` or dedicated usage table.
  2. Build middleware `checkUsageQuota(organizationId, metric)`:
     - Starter: 1,000 AI messages / mo, 0 voice minutes.
     - Growth: 5,000 AI messages / mo, 120 voice minutes.
     - Enterprise: 25,000 AI messages / mo, 600 voice minutes.
  3. If limit exceeded, return HTTP 402 Payment Required with `{ error: 'QUOTA_EXCEEDED', upgrade_url: '...' }`.
  4. Build reset cron job executing on 1st of each month.
- **Technical Dependencies:** WS-13-T01.
- **Database Changes:** Usage counter columns on `organizations` table.
- **API Changes:** Middleware integrated into `/api/chat` and `/api/voice/*`.
- **Frontend Changes:** Usage progress bar in Dashboard TopBar and Settings -> Billing with "Upgrade Plan" button.
- **Integration Requirements:** Stripe Customer Portal for instant upgrades.
- **Security Requirements:** Atomic increments (`UPDATE organizations SET monthly_ai_messages_used = monthly_ai_messages_used + 1`) to avoid race conditions.
- **Testing Tasks:** Concurrency test exhausting quota and asserting subsequent API calls return HTTP 402.
- **Acceptance Criteria:** Tenant at 1,000 messages on Starter plan receives clear upgrade modal; zero over-quota AI calls permitted without upgrade.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/billing/quota-enforcement.test.ts`.

---

## WORKSTREAM 14: Enterprise Multi-Tenant Security, Audit Logs & GDPR Enforcement (WS-14)
**Epic:** Deliver uncompromised multi-tenant isolation, cryptographic protection for secrets, immutable audit logging, and automated GDPR compliance.

### WS-14-T01: Application-Level Credential Encryption
- **Description:** Encrypt sensitive third-party integration credentials (WhatsApp tokens, Google OAuth refresh tokens, Stripe keys) at rest using AES-256-GCM.
- **Subtasks:**
  1. Implement encryption utility `src/lib/security/crypto.ts` with `encryptSecret(text)` and `decryptSecret(ciphertext)` using `crypto` module.
  2. Update `integrations` table repository: automatically encrypt `credentials` JSON before `INSERT`/`UPDATE`; decrypt on retrieval.
  3. Store master key in environment variable `ENCRYPTION_KEY` (32 bytes hex-encoded).
- **Technical Dependencies:** Node.js `crypto` module.
- **Database Changes:** None (`credentials` column stores encrypted string or JSON payload).
- **API Changes:** Transparent encryption in integration repository.
- **Frontend Changes:** Credential inputs in Settings display masked values (`sk_live_••••••••`).
- **Integration Requirements:** Secure environment variable provisioning on Vercel.
- **Security Requirements:** AES-256-GCM authenticated encryption with unique initialization vector (IV) per record.
- **Testing Tasks:** Unit test asserting stored database string is unreadable ciphertext; decryption recovers exact original plaintext.
- **Acceptance Criteria:** Database dump exposes zero plaintext API keys or OAuth tokens; decrypted in memory only when executing API calls.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Security test `tests/security/credential-encryption.test.ts`.

### WS-14-T02: Immutable Audit Logging System
- **Description:** Implement tamper-evident audit logging for all authentication, data modification, and security-sensitive tenant actions.
- **Subtasks:**
  1. Specify `audit_logs` table in Migration 003 (`id`, `organization_id`, `actor_id`, `actor_type`, `action`, `target_type`, `target_id`, `changes`, `ip_address`, `created_at`).
  2. Implement logger utility `recordAuditLog({ actorId, action, targetType, targetId, changes })`.
  3. Attach audit hooks to: User login, Password reset, Team member role changes, Contact deletion, Integration credential update, GDPR export/delete.
  4. Create read-only Audit Log viewer in Settings -> Security.
- **Technical Dependencies:** Migration 003 (`audit_logs`).
- **Database Changes:** Table `audit_logs` created with append-only RLS policy (no `UPDATE` or `DELETE` allowed).
- **API Changes:** Endpoint `GET /api/settings/audit-logs`.
- **Frontend Changes:** Audit log table in Settings with date, actor, action, and JSON diff viewer.
- **Integration Requirements:** None.
- **Security Requirements:** Append-only policy: neither standard users nor admins can modify or delete existing audit log rows.
- **Testing Tasks:** Attempt to update or delete an `audit_logs` row via SQL client; assert PostgreSQL error `permission denied`.
- **Acceptance Criteria:** 100% of sensitive operations record an immutable audit row within the same transaction.
- **Estimated Complexity:** 3 Story Points.
- **Completion Evidence:** Test suite `tests/security/audit-logging.test.ts`.

---

## WORKSTREAM 15: Platform Reliability, Observability & Production Go-Live (WS-15)
**Epic:** Implement comprehensive error tracking, synthetic health monitoring, automated backups, and production activation verification.

### WS-15-T01: Sentry Error Monitoring & Distributed Tracing
- **Description:** Integrate Sentry across Next.js client, serverless API routes, and edge runtime for real-time error tracking and performance tracing.
- **Subtasks:**
  1. Configure `@sentry/nextjs` in `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
  2. Scrub PII from error reports (strip customer phone numbers, emails, and credit card patterns before transmission).
  3. Set up performance tracing on AI gateway and database queries.
- **Technical Dependencies:** Sentry DSN (`SENTRY_DSN`).
- **Database Changes:** None.
- **API Changes:** Sentry error boundary wrapper on API routes.
- **Frontend Changes:** Global React error boundary displaying user-friendly fallback with incident reference code.
- **Integration Requirements:** Sentry project.
- **Security Requirements:** Zero customer PII or API tokens sent to Sentry.
- **Testing Tasks:** Trigger simulated unhandled exception in API route; verify event appears in Sentry dashboard with scrubbed payload.
- **Acceptance Criteria:** Unhandled exceptions captured with stack trace in <5s; 0 PII leaks.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** Test suite `tests/observability/sentry-integration.test.ts`.

### WS-15-T02: Synthetic Health Check & Production Activation Audit
- **Description:** Implement automated end-to-end synthetic health check endpoint validating database connectivity, AI provider availability, and third-party integrations.
- **Subtasks:**
  1. Build endpoint `GET /api/health` returning granular component statuses (`database: ok`, `ai_gateway: ok`, `redis: ok`).
  2. Implement automated post-deployment smoke test script `tests/smoke-test.ts`.
  3. Validate zero critical security vulnerabilities via `npm audit`.
- **Technical Dependencies:** All previous workstreams.
- **Database Changes:** None.
- **API Changes:** Public/internal health check endpoint.
- **Frontend Changes:** None.
- **Integration Requirements:** External uptime monitor (BetterStack or Pingdom).
- **Security Requirements:** Detailed diagnostic info restricted to authorized requests.
- **Testing Tasks:** Execute full end-to-end smoke test suite on production staging environment.
- **Acceptance Criteria:** Health check returns HTTP 200 with all subsystems healthy in <350ms; smoke tests pass with 100% success rate.
- **Estimated Complexity:** 2 Story Points.
- **Completion Evidence:** CI/CD workflow verification and green health check report.

---

## 3. Workstream Summary Table

| Workstream ID | Workstream Title | Total Tasks | Total Story Points | Critical Path Predecessor |
|---|---|---|---|---|
| **WS-01** | Shared Ingestion & Messaging Gateway | 2 | 4 SP | None (Foundation) |
| **WS-02** | Unified Inbox & Omnichannel Conversation Engine | 3 | 8 SP | WS-01 |
| **WS-03** | Cross-Channel Customer Identity Resolution | 2 | 5 SP | WS-01, Migration 003 |
| **WS-04** | Tool-Augmented AI Receptionist & Agent Workforce | 2 | 8 SP | WS-01, WS-05 |
| **WS-05** | Customer Knowledge Base & Multi-Tenant RAG Pipeline | 2 | 5 SP | Foundation |
| **WS-06** | Production External Calendar Sync (Google & Outlook) | 2 | 9 SP | Foundation |
| **WS-07** | Inbound/Outbound Email Integration (Resend) | 2 | 6 SP | WS-01, WS-02 |
| **WS-08** | Instagram Direct Message Integration (Meta Graph API) | 2 | 5 SP | WS-01, WS-02 |
| **WS-09** | Durable Background Job Engine & Follow-Up Campaigns | 2 | 7 SP | Migration 003 |
| **WS-10** | Deterministic Workflow Automation Engine | 1 | 5 SP | WS-09, Migration 003 |
| **WS-11** | Voice Telephony Engine (Twilio + Deepgram + ElevenLabs) | 2 | 11 SP | WS-04, Migration 003 |
| **WS-12** | Lead Scoring & Pipeline Analytics | 2 | 6 SP | Migration 003 |
| **WS-13** | Usage-Based Metering & Stripe Billing Hardening | 2 | 5 SP | Foundation |
| **WS-14** | Enterprise Multi-Tenant Security, Audit Logs & GDPR | 2 | 5 SP | Migration 003 |
| **WS-15** | Platform Reliability, Observability & Production Go-Live | 2 | 4 SP | All Prior WS |
| **TOTAL** | **15 Workstreams** | **28 Tasks** | **93 Story Points** | Reconciled Exact Sum |
