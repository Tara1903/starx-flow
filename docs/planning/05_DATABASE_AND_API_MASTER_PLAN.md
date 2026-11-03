# StarX-Flow — Phase 4B.1 Blueprint
# Document 05: Database & API Master Plan

**Document ID:** `SXF-DATA-05`  
**Classification:** Database Schema & API Specifications  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Principal Software Architect & Database Architect  

---

## PART 1 — DATABASE SCHEMA MASTER SPECIFICATION

This specification outlines the unified database schema combining verified existing tables with required schema enhancements for commercial completion.

---

### 1. Existing Tables Retained & Reused

| Table Name | Schema Migration | Primary Key | Key Foreign Keys | Purpose & Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `001_initial_schema` | `id` (UUID) | `auth.users(id)` | User identity and system role (`user`, `admin`). |
| `organizations` | `002_production_core` | `id` (UUID) | None | Core tenant entity with European settings. |
| `organization_members` | `002_production_core` | `id` (UUID) | `org_id`, `user_id` | Multi-tenant RBAC (`owner`, `admin`, `member`). |
| `leads` | `002_production_core` | `id` (UUID) | `user_id`, `org_id` | Core CRM customer contact records. |
| `conversations` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | Multi-channel conversation threads. |
| `messages` | `002_production_core` | `id` (UUID) | `conversation_id` | Granular communication messages. |
| `appointments` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | Calendar bookings and schedules. |
| `working_hours` | `002_production_core` | `id` (UUID) | `user_id` | Weekly business operating hours. |
| `orders` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | Customer purchases and orders in Euro. |
| `tasks` | `002_production_core` | `id` (UUID) | `user_id` | Internal staff to-dos & Kanban. |
| `knowledge_documents` | `002_production_core` | `id` (UUID) | `user_id`, `org_id` | Master RAG knowledge documents. |
| `knowledge_chunks` | `002_production_core` | `id` (UUID) | `document_id`, `user_id` | Vector chunks for RAG search. |
| `campaigns` | `002_production_core` | `id` (UUID) | `user_id` | Marketing broadcast campaigns. |
| `campaign_recipients` | `002_production_core` | `id` (UUID) | `campaign_id`, `lead_id`| Per-lead campaign delivery status. |
| `analytics_events` | `002_production_core` | `id` (UUID) | `user_id` | Buffered telemetry ingestion records. |
| `usage_records` | `002_production_core` | `id` (UUID) | `user_id` | Subscription consumption metering. |
| `consent_logs` | `002_production_core` | `id` (UUID) | `user_id`, `lead_id` | GDPR compliance audit log. |
| `calls` | `001_initial_schema` | `id` (UUID) | `user_id`, `lead_id` | Telephony records and transcripts. |
| `subscriptions` | `001_initial_schema` | `id` (UUID) | `user_id` | Stripe customer & subscription state. |
| `invoices` | `001_initial_schema` | `id` (UUID) | `user_id`, `sub_id` | Invoices and payment records. |
| `job_queue` | `001_initial_schema` | `id` (UUID) | None | Asynchronous task queue. |

---

### 2. Proposed Schema Additions (Migration 003)

The following tables are specified for subsequent execution in Phase 4B.2 to fulfill missing feature capabilities:

#### A. Table `channel_identities` (Cross-Channel Customer Linking)
- **Purpose:** Resolves a single customer across disparate communication identifiers (WhatsApp phone, Email address, Instagram-scoped ID) to avoid duplicate customer profiles.
- **Columns:**
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  - `lead_id`: UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE
  - `channel`: TEXT NOT NULL CHECK (channel IN ('WhatsApp', 'Instagram', 'SMS', 'Web', 'Email'))
  - `identifier`: TEXT NOT NULL (e.g. `+491701234567`, `client@domain.de`, `ig_scoped_8921`)
  - `is_verified`: BOOLEAN DEFAULT true
  - `created_at`: TIMESTAMPTZ DEFAULT now()
- **Constraints:** UNIQUE (`user_id`, `channel`, `identifier`)
- **Indexes:** `CREATE INDEX idx_channel_identities_lookup ON channel_identities(user_id, identifier)`
- **RLS Policy:** `(auth.uid() = user_id)`

#### B. Table `lead_scoring_rules` (Configurable Lead Scoring)
- **Purpose:** Stores business-configured scoring criteria and score weight adjustments.
- **Columns:**
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  - `rule_name`: TEXT NOT NULL
  - `event_type`: TEXT NOT NULL ('keyword_matched', 'booking_requested', 'complaint_raised', 'order_placed')
  - `condition_value`: TEXT NOT NULL (e.g. 'vip,pricing,quote')
  - `score_delta`: INTEGER NOT NULL (e.g. `+20`, `-15`)
  - `is_active`: BOOLEAN DEFAULT true
  - `created_at`: TIMESTAMPTZ DEFAULT now()
- **RLS Policy:** `(auth.uid() = user_id)`

#### C. Table `analytics_daily_rollups` (High-Performance Time-Series Aggregations)
- **Purpose:** Pre-computed daily summary metrics to power dashboard charts with zero full-table scan latency.
- **Columns:**
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  - `date`: DATE NOT NULL
  - `inbound_messages`: INTEGER DEFAULT 0
  - `outbound_messages`: INTEGER DEFAULT 0
  - `ai_resolutions`: INTEGER DEFAULT 0
  - `human_handoffs`: INTEGER DEFAULT 0
  - `revenue_eur`: NUMERIC DEFAULT 0
  - `appointments_booked`: INTEGER DEFAULT 0
  - `orders_completed`: INTEGER DEFAULT 0
  - `created_at`: TIMESTAMPTZ DEFAULT now()
- **Constraints:** UNIQUE (`user_id`, `date`)
- **Indexes:** `CREATE INDEX idx_rollups_user_date ON analytics_daily_rollups(user_id, date)`
- **RLS Policy:** `(auth.uid() = user_id)`

#### D. Table `phone_numbers` (Telephony Number Provisioning)
- **Purpose:** Tracks leased virtual phone numbers assigned to tenants for the AI Voice Receptionist.
- **Columns:**
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  - `provider`: TEXT NOT NULL ('twilio', 'telnyx')
  - `phone_number`: TEXT NOT NULL (E.164 format, e.g. `+493012345678`)
  - `friendly_name`: TEXT
  - `country_code`: TEXT DEFAULT 'DE'
  - `status`: TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'released'))
  - `capabilities`: JSONB DEFAULT '{"voice": true, "sms": true}'::jsonb
  - `created_at`: TIMESTAMPTZ DEFAULT now()
- **Constraints:** UNIQUE (`phone_number`)
- **RLS Policy:** `(auth.uid() = user_id)`

#### E. Table `workflow_executions` (Workflow Run Traces)
- **Purpose:** Maintains execution traces for debugging, auditing, and retry purposes.
- **Columns:**
  - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  - `workflow_id`: UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE
  - `user_id`: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  - `trigger_event`: JSONB NOT NULL
  - `status`: TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused'))
  - `steps_executed`: INTEGER DEFAULT 0
  - `current_step_id`: TEXT
  - `execution_trace`: JSONB DEFAULT '[]'::jsonb
  - `error_message`: TEXT
  - `started_at`: TIMESTAMPTZ DEFAULT now()
  - `completed_at`: TIMESTAMPTZ
- **Indexes:** `CREATE INDEX idx_wf_exec_user ON workflow_executions(user_id, status)`
- **RLS Policy:** `(auth.uid() = user_id)`

---

## PART 2 — API MASTER SPECIFICATION

The following tables specify all new and modified API routes required for commercial completion:

### 1. Inbound Communications & Webhooks

#### `POST /api/instagram/webhook`
- **Purpose:** Receives Instagram Direct Messages and messaging events from Meta.
- **Auth:** Meta Signature verification via `X-Hub-Signature-256`.
- **Request Schema:**
  ```json
  {
    "object": "instagram",
    "entry": [
      {
        "id": "17841400000000000",
        "time": 1793530000,
        "messaging": [
          {
            "sender": { "id": "user_scoped_id" },
            "recipient": { "id": "page_id" },
            "timestamp": 1793530000,
            "message": { "mid": "m_123", "text": "Do you have slots today?" }
          }
        ]
      }
    ]
  }
  ```
- **Response Schema:** `200 OK` with `"EVENT_RECEIVED"`
- **Rate Limit:** 100 req/sec per webhook domain.

#### `POST /api/email/webhook/inbound`
- **Purpose:** Ingests parsed email inquiries from transactional email providers (Resend/Postmark).
- **Auth:** Webhook signing secret (`X-Webhook-Secret`).
- **Request Schema:**
  ```json
  {
    "sender": "anna.schmidt@berlin-mail.de",
    "recipient": "info@salon-zenith.starx-flow.com",
    "subject": "Booking inquiry for wedding styling",
    "text": "Hello, I would like to inquire about wedding packages for June 15.",
    "html": "<p>Hello, I would like to inquire...</p>",
    "attachments": []
  }
  ```
- **Response Schema:** `200 OK` with `{ "conversationId": "...", "leadId": "..." }`

---

### 2. External Calendar Synchronization

#### `GET /api/calendar/google/auth`
- **Purpose:** Initiates OAuth2 authorization flow with Google Calendar API.
- **Auth:** Authenticated User Session (`auth.uid()`).
- **Response:** `302 Redirect` to `https://accounts.google.com/o/oauth2/v2/auth`.

#### `GET /api/calendar/google/callback`
- **Purpose:** Receives Google OAuth authorization code, exchanges for tokens, stores in `connected_channels`.
- **Auth:** OAuth authorization code & state validation.
- **Response:** `302 Redirect` to `/dashboard?calendar=connected`.

#### `POST /api/calendar/sync`
- **Purpose:** Manually or automatically reconciles calendar events with external Google/Outlook calendars.
- **Auth:** Authenticated User Session.
- **Request Schema:** `{ "calendarId": "primary" }`
- **Response Schema:** `{ "syncedEvents": 14, "conflictsResolved": 0 }`

---

### 3. Voice Telephony

#### `POST /api/voice/incoming`
- **Purpose:** Twilio webhook triggered upon an incoming voice call to a leased number.
- **Auth:** Twilio HMAC-SHA1 signature verification (`X-Twilio-Signature`).
- **Response Schema:** TwiML XML document:
  ```xml
  <Response>
    <Say voice="Polly.Vicki" language="de-DE">Willkommen bei StarX Salon. Wie kann ich Ihnen helfen?</Say>
    <Connect>
      <Stream url="wss://starx-flow.com/api/voice/stream" />
    </Connect>
  </Response>
  ```

#### `POST /api/voice/webhook/completed`
- **Purpose:** Persists call recordings, duration, and status when call terminates.
- **Auth:** Twilio HMAC-SHA1 signature verification.
- **Response Schema:** `200 OK`

---

### 4. Commerce & Billing

#### `POST /api/orders/payment-link`
- **Purpose:** Generates a hosted Stripe payment link for an outstanding customer order.
- **Auth:** Authenticated User Session.
- **Request Schema:** `{ "orderId": "ord-101" }`
- **Response Schema:** `{ "paymentUrl": "https://buy.stripe.com/test_...", "orderNumber": "SX-892104" }`

#### `POST /api/billing/portal`
- **Purpose:** Generates a Stripe Customer Portal session URL for managing invoices, cards, and cancellations.
- **Auth:** Authenticated User Session.
- **Request Schema:** `{}`
- **Response Schema:** `{ "portalUrl": "https://billing.stripe.com/session/..." }`

---

### 5. Workflow Automation & Cron Jobs

#### `GET /api/cron/queue-worker`
- **Purpose:** Scheduled worker executing delayed follow-up jobs and appointment reminders.
- **Auth:** Bearer Token (`CRON_SECRET`).
- **Response Schema:** `{ "processed": 8, "succeeded": 8, "failed": 0 }`
- **Idempotency:** Atomic lock on `job_queue` preventing race conditions.
