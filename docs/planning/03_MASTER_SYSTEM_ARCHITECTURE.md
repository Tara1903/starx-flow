# StarX-Flow — Phase 4B.1 Blueprint
# Document 03: Master System Architecture

**Document ID:** `SXF-SYS-03`  
**Classification:** System Architecture & Integration Specification  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Principal Software Architect & Systems Engineer  

---

## 1. High-Level System Architecture

StarX-Flow is architected as a high-performance, modular, multi-tenant platform designed to execute in European serverless environments. The system couples a **Next.js 16 App Router** frontend and API gateway with a **Supabase PostgreSQL** data tier, orchestrated by an **Autonomous AI Workforce** communicating with third-party providers via strict rate-limited and timeout-protected adapters.

### Master System Topology

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Client Interaction Layer"]
        WA["WhatsApp Client (Mobile)"]
        WEB["Website Visitor (Embed Widget)"]
        IG["Instagram User (DMs)"]
        TEL["Phone Caller (Telephony)"]
        DASH["Business Owner (Web Dashboard)"]
    end

    subgraph EdgeGateway ["2. Vercel Serverless & Edge API Gateway"]
        WH_WA["/api/whatsapp/webhook"]
        WH_WEB["/api/chat"]
        WH_IG["/api/instagram/webhook"]
        WH_VOICE["/api/voice/incoming"]
        API_AUTH["/api/auth/*"]
        API_BILLING["/api/billing/*"]
        API_GDPR["/api/gdpr/*"]
        API_KNOW["/api/knowledge/*"]
    end

    subgraph CoreEngine ["3. StarX-Flow Core Application Layer"]
        ORCH["AI Orchestrator (Intent Triage)"]
        PROV["AI Provider Abstraction (Gemini / NVIDIA)"]
        RAG["Knowledge Engine (Chunker & Retriever)"]
        ROUTER["Identity & Channel Normalizer"]
        WF_ENG["Workflow Execution Engine"]
        SEC_SHIELD["StarX Shield Bot & Safety Guard"]
    end

    subgraph DataStorage ["4. Data & Persistence Tier (Supabase EU Frankfurt)"]
        DB_AUTH["Supabase Auth (JWT & Sessions)"]
        DB_CORE["PostgreSQL Relational Storage (RLS Enabled)"]
        DB_VEC["pgvector (Knowledge Base Vector Chunks)"]
        DB_QUEUE["Job Queue & Telemetry Records"]
        REALTIME["Supabase Realtime (WebSocket CDC)"]
    end

    subgraph ExternalServices ["5. External SaaS & Service Providers"]
        META["Meta Graph API v19.0 (WhatsApp & IG)"]
        GEMINI["Google Gemini 2.0 Flash API"]
        NVIDIA["NVIDIA AI Inference Gateway"]
        STRIPE["Stripe European SEPA & Card Billing"]
        TWILIO["Twilio Voice & SMS Gateway"]
        GOOGLE_CAL["Google Calendar API"]
    end

    %% Client to Edge
    WA -->|HTTPS Webhook| WH_WA
    WEB -->|HTTPS POST| WH_WEB
    IG -->|HTTPS Webhook| WH_IG
    TEL -->|Voice SIP/WebRTC| WH_VOICE
    DASH -->|HTTPS / WSS| EdgeGateway

    %% Edge to Core
    WH_WA --> ROUTER
    WH_WEB --> ROUTER
    WH_IG --> ROUTER
    WH_VOICE --> ROUTER
    ROUTER --> ORCH

    %% Core Services
    ORCH --> RAG
    ORCH --> PROV
    ORCH --> WF_ENG
    PROV --> GEMINI
    PROV --> NVIDIA
    WF_ENG --> DB_QUEUE

    %% Core to Data
    ORCH --> DB_CORE
    RAG --> DB_VEC
    EdgeGateway --> DB_AUTH
    EdgeGateway --> DB_CORE
    DB_CORE --> REALTIME
    REALTIME -.->|Real-time Updates| DASH

    %% External Callouts
    WH_WA --> META
    API_BILLING --> STRIPE
    WH_VOICE --> TWILIO
    WF_ENG --> GOOGLE_CAL
```

---

## 2. Module Dependency Matrix

The following diagram defines the directional dependencies between StarX-Flow subsystems. Lower-tier foundation services must NEVER depend on upper-tier business modules.

```mermaid
flowchart TD
    subgraph Foundation ["Tier 0: Shared Infrastructure"]
        S_ADMIN["Supabase Admin Client"]
        S_TYPES["TypeScript Schema Types"]
        S_LOCALE["European Localization (EUR/Dates)"]
        S_SHIELD["Bot & Prompt Injection Shield"]
    end

    subgraph DataServices ["Tier 1: Data & Identity Services"]
        AUTH_STORE["Auth & Organization Store"]
        CRM_STORE["CRM & Contact Engine"]
        KNOW_ENG["Knowledge RAG Engine"]
    end

    subgraph AIEngine ["Tier 2: Intelligence & Workflow"]
        AI_PROV["Multi-Provider AI Gateway"]
        AI_ORCH["Central AI Orchestrator"]
        JOB_Q["Asynchronous Job Queue"]
        WF_RUNNER["Workflow Execution Runtime"]
    end

    subgraph ChannelAdapters ["Tier 3: Communication Adapters"]
        ADAPT_WA["WhatsApp Cloud Adapter"]
        ADAPT_WEB["Web Chat Widget Adapter"]
        ADAPT_IG["Instagram DM Adapter"]
        ADAPT_VOICE["Voice Telephony Adapter"]
        ADAPT_EMAIL["Email IMAP/SMTP Adapter"]
    end

    subgraph BusinessFeatures ["Tier 4: Business Workspaces"]
        FEAT_INBOX["Unified Inbox Screen"]
        FEAT_CAL["Calendar & Availability"]
        FEAT_ORDERS["Orders & Fulfillment"]
        FEAT_TASKS["Kanban Task Manager"]
        FEAT_BILLING["Stripe Subscription Manager"]
        FEAT_GDPR["GDPR Portability & Erasure"]
    end

    %% Dependency Links
    DataServices --> Foundation
    AIEngine --> DataServices
    ChannelAdapters --> AIEngine
    BusinessFeatures --> ChannelAdapters
    BusinessFeatures --> DataServices
```

---

## 3. Communication & Message Ingestion Data Flow

The sequence diagram below traces an incoming customer message across any channel through normalization, CRM identity resolution, vector RAG retrieval, AI inference, and auto-reply dispatch.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (WhatsApp / Web / IG)
    participant ChannelAPI as Channel Webhook (/api/*)
    participant Normalizer as Channel Normalizer
    participant SupabaseDB as Supabase Database (RLS)
    participant Orchestrator as AI Orchestrator
    participant RAG as Knowledge Engine
    participant AIProvider as AI Provider (Gemini/NVIDIA)
    participant Dashboard as Staff Unified Inbox

    Customer->>ChannelAPI: Inbound Customer Message Payload
    ChannelAPI->>ChannelAPI: Verify Webhook Signature / Secret
    ChannelAPI->>Normalizer: Normalize to InboundMessageEvent

    Normalizer->>SupabaseDB: Locate or Create CRM Lead (Phone/Email)
    SupabaseDB-->>Normalizer: Return lead_id
    Normalizer->>SupabaseDB: Locate or Create Conversation Thread
    SupabaseDB-->>Normalizer: Return conversation_id

    Normalizer->>SupabaseDB: Insert Customer Message (direction: inbound)
    Normalizer->>Orchestrator: Dispatch to handleInboundMessage()

    Orchestrator->>RAG: retrieveRelevantContext(userId, message, 3)
    RAG->>SupabaseDB: pgvector Cosine Search (isolated by user_id)
    SupabaseDB-->>RAG: Matching Knowledge Chunks
    RAG-->>Orchestrator: Verified Context Snippets

    Orchestrator->>AIProvider: executeAgent(role, message, history, context)
    AIProvider->>AIProvider: Encapsulate in <customer_message> prompt

    alt Provider Responding
        AIProvider->>AIProvider: Call Gemini 2.0 Flash (3.5s timeout)
    else Timeout or Error
        AIProvider->>AIProvider: Fallback to NVIDIA API or Rule Fallback
    end

    AIProvider-->>Orchestrator: AgentExecutionResult (replyText, handoffFlag)

    Orchestrator->>SupabaseDB: Insert AI Message (direction: outbound)
    Orchestrator->>SupabaseDB: Update Conversation State & Last Message
    Orchestrator->>SupabaseDB: Record Telemetry (usage_records, logs)

    par Send to Customer
        Orchestrator->>ChannelAPI: Transmit Outbound Message
        ChannelAPI->>Customer: Delivered via WhatsApp / Web Widget / IG
    and Notify Staff
        SupabaseDB-.->|Realtime CDC| Dashboard: Update Inbox Thread & Badge
    end
```

---

## 4. AI Orchestration & Tool Calling Flow

```mermaid
flowchart TD
    START["Inbound Message Received"] --> PARSE["Parse Intent & Sentiment"]
    PARSE --> CHECK_OVERRIDE{"Role Specified?"}

    CHECK_OVERRIDE -- Yes --> ROLE_SET["Use Specified Agent Role"]
    CHECK_OVERRIDE -- No --> INTENT_DETECT{"Detected Intent"}

    INTENT_DETECT -- "Book / Reschedule" --> ROLE_APT["Role: Appointment Agent"]
    INTENT_DETECT -- "Buy / Pricing / Catalog" --> ROLE_SALES["Role: Sales Agent"]
    INTENT_DETECT -- "Complaint / Dispute / Broken" --> ROLE_SUPP["Role: Customer Support"]
    INTENT_DETECT -- "General / Hours / Location" --> ROLE_RECEP["Role: AI Receptionist"]

    ROLE_SET --> RAG_FETCH["Fetch Relevant Knowledge Base Chunks"]
    ROLE_APT --> RAG_FETCH
    ROLE_SALES --> RAG_FETCH
    ROLE_SUPP --> RAG_FETCH
    ROLE_RECEP --> RAG_FETCH

    RAG_FETCH --> PROMPT_BUILD["Construct Prompt with Safety Guardrails"]
    PROMPT_BUILD --> INFERENCE["Model Inference (Gemini / NVIDIA)"]

    INFERENCE --> HANDOFF_CHECK{"Requires Human Takeover?"}

    HANDOFF_CHECK -- Yes --> ESCALATE["Flag status: needs_attention<br/>Notify Staff via Realtime"]
    HANDOFF_CHECK -- No --> OUTBOUND["Persist Message & Dispatch Auto-Reply"]

    ESCALATE --> OUTBOUND
    OUTBOUND --> LOG_METRICS["Log Tokens, Latency & Usage Counter"]
```

---

## 5. Workflow Execution Engine Architecture

```mermaid
flowchart TD
    TRIGGER_EVENT["Event Trigger Occurs<br/>(e.g., Appointment Completed, Review <= 3 Stars)"] --> MATCH_WF["Match Active Workflows for Tenant"]
    MATCH_WF --> LOAD_STEPS["Load JSON AST Step Sequence"]

    LOAD_STEPS --> EXEC_STEP["Execute Current Step"]
    EXEC_STEP --> STEP_TYPE{"Step Type"}

    STEP_TYPE -- "Condition" --> EVAL_COND{"Condition Met?"}
    EVAL_COND -- Yes --> NEXT_STEP["Advance to Next Step"]
    EVAL_COND -- No --> TERMINATE["Exit Workflow Run"]

    STEP_TYPE -- "Delay" --> ENQUEUE_DELAY["Enqueue Delayed Job in job_queue<br/>(scheduled_at = now + delay)"]
    ENQUEUE_DELAY --> PAUSE["Execution Suspended until Cron Wakeup"]

    STEP_TYPE -- "AI Node" --> RUN_AI["Invoke AI Agent with Parameters"]
    RUN_AI --> NEXT_STEP

    STEP_TYPE -- "Action (Message/Email)" --> DISPATCH_ACT["Execute Channel Delivery"]
    DISPATCH_ACT --> NEXT_STEP

    STEP_TYPE -- "Action (CRM/Task)" --> UPDATE_CRM["Create CRM Task or Update Lead"]
    UPDATE_CRM --> NEXT_STEP

    NEXT_STEP --> HAS_MORE{"More Steps?"}
    HAS_MORE -- Yes --> EXEC_STEP
    HAS_MORE -- No --> COMPLETE["Log Success in execution_logs"]
```

---

## 6. Subscription Billing & Usage Metering Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Owner
    participant WebApp as Dashboard UI
    participant CheckoutAPI as /api/billing/checkout
    participant Stripe as Stripe API & Checkout
    participant WebhookAPI as /api/billing/webhook
    participant Supabase as Supabase Database

    User->>WebApp: Select Plan (Starter €49 / Pro €97 / Enterprise €297)
    WebApp->>CheckoutAPI: POST { planId: 'pro' }
    CheckoutAPI->>Stripe: Create Stripe Checkout Session
    Stripe-->>CheckoutAPI: Session URL
    CheckoutAPI-->>WebApp: Redirect URL
    WebApp->>Stripe: Redirect User to Stripe Hosted Checkout

    User->>Stripe: Enter Card / SEPA & Submit Payment
    Stripe->>Stripe: Process Payment & Activate Subscription

    Stripe->>WebhookAPI: POST webhook event (checkout.session.completed)
    WebhookAPI->>WebhookAPI: Verify Stripe Signature (STRIPE_WEBHOOK_SECRET)
    WebhookAPI->>Supabase: Upsert subscriptions record (status: active, plan: pro)
    WebhookAPI->>Supabase: Insert invoice record

    Stripe-->>User: Redirect to /dashboard?checkout=success
    WebApp->>Supabase: Query subscription & unlock plan limits (5,000 AI convs)
```

---

## 7. Authentication & Authorization Flow

```mermaid
flowchart TD
    REQ["Incoming User Request"] --> AUTH_CHECK{"Session Cookie / JWT Present?"}

    AUTH_CHECK -- No --> PUBLIC_CHECK{"Is Route Public?<br/>(/, /chat, /pricing, /about)"}
    PUBLIC_CHECK -- Yes --> ALLOW_PUBLIC["Allow Anonymous Access"]
    PUBLIC_CHECK -- No --> REDIR_LOGIN["Redirect to /login"]

    AUTH_CHECK -- Yes --> VALIDATE_JWT["Validate JWT Signature via Supabase"]
    VALIDATE_JWT --> CHECK_ROLE{"Target Route"}

    CHECK_ROLE -- "/admin/*" --> ADMIN_GATE{"profile.role == 'admin'?"}
    ADMIN_GATE -- Yes --> ALLOW_ADMIN["Access Super Admin Dashboard"]
    ADMIN_GATE -- No --> FORBIDDEN["403 Forbidden / Redirect to /dashboard"]

    CHECK_ROLE -- "/dashboard/*" --> ORG_GATE{"User is Member of Organization?"}
    ORG_GATE -- Yes --> RLS_APPLY["Apply Postgres Row-Level Security<br/>(auth.uid() = user_id)"]
    ORG_GATE -- No --> ONBOARDING_CHECK{"onboarding_complete == true?"}
    ONBOARDING_CHECK -- No --> SETUP_WIZARD["Redirect to /setup/account"]
    ONBOARDING_CHECK -- Yes --> CREATE_ORG["Prompt Create Organization"]

    RLS_APPLY --> SERVE_APP["Render Dashboard Module"]
```

---

## 8. Error Handling & Dead-Letter Queue Architecture

```mermaid
flowchart TD
    INBOUND_ACTION["External Event or Scheduled Job"] --> TRY_BLOCK["Execute within Try/Catch Block"]

    TRY_BLOCK --> EXEC_RESULT{"Success?"}
    EXEC_RESULT -- Yes --> LOG_SUCCESS["Log Success & Update Counters"]

    EXEC_RESULT -- No --> CATCH_ERR["Catch Exception & Parse Error Type"]
    CATCH_ERR --> CLASSIFY{"Error Classification"}

    CLASSIFY -- "Transient Network / Provider Outage" --> RETRY_CHECK{"attempts < max_attempts?"}
    RETRY_CHECK -- Yes --> EXP_BACKOFF["Calculate Exponential Backoff<br/>(2^attempts * 15 seconds)"]
    EXP_BACKOFF --> RESCHEDULE["Update job_queue (status: pending, scheduled_at)"]
    RETRY_CHECK -- No --> DLQ["Move to Dead-Letter Queue<br/>status = 'failed'"]

    CLASSIFY -- "Non-recoverable / Invalid Credentials" --> DLQ
    CLASSIFY -- "AI Model Timeout (>3.5s)" --> FAILOVER["Activate Fallback Provider / Rule Engine"]
    FAILOVER --> LOG_FALLBACK["Log Fallback Execution & Continue Conversation"]

    DLQ --> ALERT_ADMIN["Record in execution_logs (type: error)"]
    ALERT_ADMIN --> NOTIFY_OPS["Stream to Super Admin Error Monitor"]
```

---

## 9. Shared Services Architecture

To eliminate duplicated logic across StarX-Flow modules, the following single-instance shared services are established:

| Shared Service Name | File Location | Responsibility | Consumers |
| :--- | :--- | :--- | :--- |
| **`SupabaseAdmin`** | [`src/lib/supabaseAdmin.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/supabaseAdmin.ts) | Privileged server-side database operations bypassing RLS safely | All API Route Handlers (`/api/*`) |
| **`AIProvider`** | [`src/lib/ai/provider.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/provider.ts) | Provider routing (Gemini, NVIDIA, Fallback), prompt safety, latency timeouts | `AIOrchestrator`, `AIChatTester`, Voice Engine |
| **`KnowledgeEngine`** | [`src/lib/ai/knowledgeEngine.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/ai/knowledgeEngine.ts) | Text chunking, token estimation, vector cosine retrieval | Ingestion API, `AIProvider`, RAG Inspector |
| **`LocaleUtils`** | [`src/lib/locale.ts`](file:///c:/Web%20Apps/starx-flow/src/lib/locale.ts) | Centralized Euro formatting (`formatEuro`), dates, timezones | Dashboard, Invoices, Orders, Analytics |
| **`ConsentService`** | [`src/services/consent.ts`](file:///c:/Web%20Apps/starx-flow/src/services/consent.ts) | Cookie and tracking consent evaluation | Analytics, Campaign Dispatcher, Web Widget |
| **`JobQueue`** | [`src/services/jobQueue.ts`](file:///c:/Web%20Apps/starx-flow/src/services/jobQueue.ts) | Asynchronous task scheduling and retry orchestration | Email Service, Campaign Follow-up, Webhooks |
