# STARX FLOW MOBILE — REPOSITORY AUDIT & BACKEND INTEGRATION REPORT
**Document Reference:** `docs/mobile/REPOSITORY_AUDIT.md`  
**Phase:** Phase 0 — Existing Repository Audit  
**Status:** COMPLETED  
**Architect:** Principal Kotlin Multiplatform & Senior Systems Architect  
**Date:** November 2026  

---

## 1. Executive Summary

StarX Flow is an enterprise-grade AI Business Operating System designed to automate customer communications, bookings, workflows, knowledge retrieval, and CRM for business owners. The web platform is built on Next.js 16 (React 19, Tailwind CSS v4, Motion, Zustand) and backed by Supabase (PostgreSQL 15+, Auth, Row-Level Security, pgvector RAG, Edge Functions) alongside Polar billing and multi-model AI (Google Gemini and NVIDIA NIM).

The purpose of this audit is to provide a complete, non-destructive blueprint for integrating the official cross-platform Kotlin Multiplatform (KMP) and Compose Multiplatform (CMP) mobile application directly into the existing repository without disturbing the live web application or breaking backend contracts.

---

## 2. Existing System Architecture

### 2.1 Monorepo Topography
The repository is currently structured as a Next.js full-stack repository with co-located Supabase backend artifacts:

```
starx-flow/
├── api/                       # Vercel serverless / webhook functions (WhatsApp, meta)
├── docs/                      # Technical documentation, architecture specs, audits
│   └── mobile/                # Mobile application documentation and roadmaps
├── public/                    # Static assets, branding, icons
├── scripts/                   # Auditing, secret scanners, SEO indexers
├── src/
│   ├── app/                   # Next.js 16 App Router (web pages & /api routes)
│   ├── components/            # React UI components (design system, Liquid Glass)
│   ├── hooks/                 # Web client React hooks
│   ├── lib/                   # Core business logic, adapters, security, RAG, auth
│   │   ├── ai/                # Multi-agent orchestrator, prompts, tool execution
│   │   ├── auth/              # Server auth validation & 8-digit OTP service
│   │   ├── crm/               # Identity resolution & customer merging
│   │   ├── inbox/             # Unified inbox service & outbound dispatcher
│   │   ├── ingestion/         # Omnichannel webhook gateways & adapters
│   │   ├── integrations/      # Google/Outlook Calendar, Resend Email, Instagram
│   │   ├── security/          # HMAC hashing, AES encryption, error sanitizer
│   │   └── usage/             # Metric meters & quota tracking
│   ├── screens/               # Dashboard feature screens (Agents, CRM, Calendar...)
│   ├── services/              # Analytics, consent logging, job queue
│   ├── store/                 # Zustand client state stores
│   └── types/                 # Database interfaces and domain models
└── supabase/
    ├── functions/             # Supabase Edge Functions (Deno/TypeScript)
    └── migrations/            # 001_initial_schema through 013_auth_otps
```

### 2.2 Environment & Runtime Configuration
- **Web Runtime:** Node.js 22+ with Next.js 16.2.7 App Router.
- **Database:** Supabase Cloud PostgreSQL (`https://iotuxpcqewdzvqzncpad.supabase.co`).
- **Authentication:** Dual-layer:
  1. StarX Flow Secure 8-digit numeric OTP engine via Resend (`/api/auth/otp/send` and `/api/auth/otp/verify`) storing HMAC-SHA256 hashes in `auth_otps`.
  2. Supabase GoTrue Auth (JWT issuance, session token refresh, user identities).
- **Security Protocols:**
  - Strict RLS on all database tables tied to `auth.uid() = user_id`.
  - Next.js API authorization via `authenticateStaffRequest` inspecting `Authorization: Bearer <supabase_jwt>`.
  - Service-role key isolated strictly to server environments (`supabaseAdmin.ts`). Mobile client NEVER receives service-role credentials.

---

## 3. Reusable Backend Endpoints

The mobile application can directly reuse the following established Next.js API endpoints and Supabase PostgREST endpoints using authenticated user JWT tokens:

### 3.1 Authentication & Session Management
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/otp/send` | Dispatches 8-digit numeric OTP to user email | No |
| `POST` | `/api/auth/otp/verify` | Verifies 8-digit OTP, creates/retrieves profile, returns Supabase `tokenHash` & `emailOtp` | No |
| `POST` | `https://<ref>.supabase.co/auth/v1/token?grant_type=refresh_token` | Refreshes Supabase session tokens | Yes (Refresh Token) |
| `POST` | `https://<ref>.supabase.co/auth/v1/logout` | Revokes active user session | Yes (Bearer JWT) |

### 3.2 Unified Communications (Inbox)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/conversations` | Lists conversations filtered by `channel`, `status`, `search`, `assignedTo` | Yes (Bearer JWT) |
| `POST` | `/api/conversations` | Initiates a new conversation thread | Yes (Bearer JWT) |
| `GET` | `/api/conversations/[id]` | Fetches single conversation metadata & state | Yes (Bearer JWT) |
| `PATCH` | `/api/conversations/[id]` | Updates status, assignment, AI/Human control mode, handoff reason | Yes (Bearer JWT) |
| `GET` | `/api/conversations/[id]/messages` | Retrieves message history with pagination limit | Yes (Bearer JWT) |
| `POST` | `/api/conversations/[id]/messages` | Dispatches outbound message to customer via provider adapter or internal note | Yes (Bearer JWT) |
| `POST` | `/api/conversations/[id]/presence` | Broadcasts staff typing or presence heartbeat | Yes (Bearer JWT) |

### 3.3 CRM & Customer Identity
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/crm/customers/identities` | Cross-channel customer identity lookup | Yes (Bearer JWT) |
| `POST` | `/api/crm/customers/merge` | Merges duplicate lead records | Yes (Bearer JWT) |
| Direct | Supabase PostgREST `leads` | Query, filter, create, update customer leads | Yes (Bearer JWT + RLS) |

### 3.4 Operations, Appointments & Orders
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/orders` | Retrieves workspace orders with pagination | Yes (Bearer JWT) |
| `POST` | `/api/orders` | Creates new order with idempotency key | Yes (Bearer JWT) |
| `PATCH` | `/api/orders` | Updates order status or payment status | Yes (Bearer JWT) |
| Direct | Supabase PostgREST `appointments` | Bookings list, calendar view, slot conflict validation | Yes (Bearer JWT + RLS) |
| Direct | Supabase PostgREST `working_hours` | Reads operating hours per day of week | Yes (Bearer JWT + RLS) |

### 3.5 AI Workforce & Receptionist
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/chat/config` | Retrieves public AI configuration and operating persona | No |
| `POST` | `/api/chat` | AI receptionist conversation completion with RAG tool execution | Yes / Public Token |
| `GET` | `/api/receptionist/settings` | Fetches agent settings, prompt tuning, voice options | Yes (Bearer JWT) |
| `POST` | `/api/receptionist/settings` | Saves agent behavior, operating schedules, knowledge bindings | Yes (Bearer JWT) |
| Direct | Supabase PostgREST `agents` | Reads AI agent directory, statuses, and performance logs | Yes (Bearer JWT + RLS) |

### 3.6 Automations & Workflows
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| Direct | Supabase PostgREST `workflows` | Reads user workflows, toggle `is_active`, edit trigger/action | Yes (Bearer JWT + RLS) |
| Direct | Supabase PostgREST `execution_logs` | Real-time execution logs and simulation history | Yes (Bearer JWT + RLS) |
| Direct | Supabase PostgREST `connected_channels`| Channel connectivity status (WhatsApp, Instagram, etc.) | Yes (Bearer JWT + RLS) |

---

## 4. Database Tables Relevant to Mobile

The mobile application directly interacts with the following Supabase tables via PostgREST and Next.js APIs, with full Row-Level Security enforcement:

| Table | Primary Keys & Indexes | Primary Mobile Use Case |
|---|---|---|
| `profiles` | `id uuid pk -> auth.users` | User profile, owner name, business details, plan, role |
| `organizations` | `id uuid pk, slug unique` | Multi-tenant organization boundaries and currency/timezone settings |
| `organization_members` | `(organization_id, user_id) unique` | Multi-user tenant switching and role assignment (`owner`, `admin`, `member`) |
| `leads` | `id uuid pk, user_id, phone, status` | CRM customer directory, lead scoring, tags, notes |
| `conversations` | `id uuid pk, user_id, channel, status` | Unified inbox thread list, unread indicators, AI/human takeover mode |
| `messages` | `id uuid pk, conversation_id, created_at` | Chat bubble transcript, outbound/inbound direction, delivery status |
| `appointments` | `id uuid pk, user_id, start_time, status` | Calendar view, appointment creation, conflict detection, rescheduling |
| `working_hours` | `(user_id, day_of_week) unique` | Business hours configuration |
| `orders` | `id uuid pk, user_id, order_number` | Mobile commerce transaction history, invoicing status |
| `tasks` | `id uuid pk, user_id, status` | Mobile task checklist, quick to-dos |
| `agents` | `id uuid pk, user_id` | AI agent workforce status, toggles, prompts |
| `agent_memories` | `(user_id, lead_id, key) unique` | Contextual memory items retained by agents |
| `workflows` | `id uuid pk, user_id` | Automation list, execution counts, saved hours |
| `workflow_executions` | `id uuid pk, organization_id` | Workflow run history and error traces |
| `connected_channels` | `(user_id, channel_key) unique` | Omnichannel connection statuses (WhatsApp, IG, Email, SMS) |
| `analytics_events` / `analytics_daily_rollups` | `organization_id, date, metric_name` | Mobile Command Center KPIs and chart trends |
| `auth_otps` | `email, expires_at` | 8-digit OTP security ledger |

---

## 5. Missing Mobile Endpoints & Recommended Strategy

While existing APIs cover core data flows, mobile applications benefit significantly from optimized aggregate endpoints to reduce mobile latency and network round-trips over cellular connections:

### 5.1 Mobile Aggregation Endpoints to Add:
1. `GET /api/mobile/v1/dashboard/summary`:
   - Returns aggregated Command Center metrics in one request:
     - Today's revenue, active leads count, pending bookings, active AI agents count.
     - 7-day revenue and lead acquisition chart series.
     - Top unread conversations.
     - Reduces 5 sequential queries to 1 low-latency round-trip.
2. `POST /api/mobile/v1/notifications/register`:
   - Registers device FCM token (Android) or APNs token (iOS) tied to authenticated `user_id` and `organization_id`.
   - Stores in a dedicated mobile device tokens table.

### 5.2 Direct PostgREST vs. Next.js API Policy
- **Simple CRUD (Leads, Appointments, Tasks):** Directly query Supabase PostgREST using the client SDK with the authenticated user JWT. RLS policies already guarantee strict tenant isolation.
- **Complex Orchestrations (OTP auth, message dispatch, order creation with idempotency, AI receptionist):** Always call the Next.js API routes (`/api/...`) which validate business rules, idempotency, and dispatch outbound provider webhooks safely.

---

## 6. Integration Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Disruption of Web App Builds** | High | Place mobile code in isolated root folder `mobile/` with dedicated Gradle configuration. Do not modify `apps/` or root `package.json` build scripts. |
| **Exposure of Service Role Secrets** | Critical | Mobile app strictly uses client anon key and Supabase user JWT. Zero service-role credentials in mobile code. |
| **8-Digit OTP Incompatibility** | Medium | The mobile auth client must specifically implement the 8-digit numeric OTP flow hitting `/api/auth/otp/send` and `/api/auth/otp/verify`. |
| **Cross-Tenant Data Leakage** | High | Every API request supplies user JWT; every PostgREST query leverages Supabase RLS. Local SQLDelight database partitions data by `tenant_id` and clears on logout. |
| **Cellular Latency & Offline State** | Medium | SQLDelight local cache with repository pattern; optimistic UI for task updates and message composition; offline banner. |
| **iOS Build Environment** | Low | Development machine is Windows 11 with JDK 17 and Android SDK 34/35/36. Android builds verify on-device/JVM; iOS Xcode framework integration is configured cleanly for macOS CI/CD without claiming false simulator passes. |

---

## 7. Recommended Mobile Implementation Strategy

1. **Scaffold Structure:**
   - Create root `mobile/` containing:
     - `composeApp/`: Android application shell and iOS shared entry points.
     - `shared/`: Clean Architecture modules (`core`, `domain`, `data`, `network`, `database`, `auth`, `designsystem`).
     - `iosApp/`: Native iOS Xcode project consuming shared KMP framework.
2. **Tech Stack Selection:**
   - **Kotlin:** 2.0.21 / Compose Multiplatform 1.7.0.
   - **DI:** Koin 3.5.6 (Multiplatform standard).
   - **Network:** Ktor 2.3.12 with ContentNegotiation & Kotlinx.Serialization.
   - **Persistence:** SQLDelight 2.0.2 with Android and Native drivers.
   - **Navigation:** Navigation Compose Multiplatform.
   - **UI:** Material 3 + Custom StarX Liquid Glass Design System.
3. **Execution Cadence:** Follow chronological phases (Phase 1 Monorepo Scaffold through Phase 17 Production Preparation) tracked in `docs/mobile/PROGRESS.md`.
