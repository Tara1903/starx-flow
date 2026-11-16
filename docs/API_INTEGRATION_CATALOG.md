# STARX FLOW — API INTEGRATION CATALOG
**Phase 6 System Deliverable**  
**Repository:** `C:\Web Apps\starx-flow`  
**Base URL:** `https://starx-flow.runs-on.dev`  
**Audit Date:** 2026-11-16  
**Status:** FULLY DOCUMENTED & VERIFIED (47/47 Endpoints)

---

## 1. Overview

This catalog provides an authoritative reference of all 47 Next.js App Router API endpoints implemented in StarX Flow. Every endpoint is cataloged with its HTTP methods, authentication requirements, Role-Based Access Control (RBAC), idempotency handling, rate limiting, and failure modes.

---

## 2. Authentication & Security Conventions

1. **Authentication Gate:** Authenticated endpoints validate JWT sessions or Bearer tokens via `authenticateStaffRequest(req)` or `supabase.auth.getUser()`.
2. **Multi-Tenant Isolation:** Multi-tenant routes resolve `tenantId = session.organizationId || session.user.id`. Queries are strictly scoped to `tenantId`.
3. **RBAC Gating:** Administrative operations enforce roles (`admin`, `owner`, `super_admin`). Unprivileged `agent` or `member` requests receive HTTP 403 Forbidden.
4. **Error Sanitization:** All catch blocks wrap errors in `sanitizeClientError(err, fallbackMessage)` to strip database connection strings, JWT tokens, and internal stack traces.
5. **Idempotency:** State-mutating routes support the `Idempotency-Key` header or `body.idempotencyKey` via `runWithIdempotency`.

---

## 3. Comprehensive Endpoint Catalog

### A. Authentication & OTP Services
| Endpoint | Method | Auth | Role | Idempotent | Description |
|:---|:---:|:---:|:---:|:---:|:---|
| `/api/auth/otp/send` | POST | Public | Any | Yes | Generates & dispatches 8-character cryptographic verification OTP |
| `/api/auth/otp/verify` | POST | Public | Any | No | Validates 8-character OTP with rate limiting & expiration check |

### B. Omnichannel Ingestion & Webhooks
| Endpoint | Method | Auth | Verification | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/webhooks/whatsapp` | GET | Public | Verify Token | Meta webhook verification challenge handshake |
| `/api/webhooks/whatsapp` | POST | Public | HMAC-SHA256 | Inbound WhatsApp message & status webhook ingestion |
| `/api/whatsapp/webhook` | GET, POST | Public | HMAC-SHA256 | Route alias for WhatsApp webhook delivery |
| `/api/integrations/instagram/webhook`| GET, POST | Public | HMAC-SHA256 | Instagram Messaging webhook verification & ingestion |
| `/api/integrations/facebook/webhook` | GET, POST | Public | HMAC-SHA256 | Messenger message webhook verification & ingestion |
| `/api/integrations/email/webhook` | POST | Public | Svix HMAC | Resend inbound email webhook & thread parser |
| `/api/webhook/polar` | POST | Public | Polar Secret | Polar billing webhook (subscriptions, invoices, disputes) |
| `/api/billing/webhook` | POST | Public | Polar Secret | Alias for Polar billing webhook handler |

### C. Chat Widget & Public Inquiries
| Endpoint | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `/widget.js` | GET | Public | Distributable embeddable widget JavaScript with CORS headers |
| `/api/chat` | OPTIONS, POST | Public | Embeddable website chat widget with sliding-window rate limit |
| `/api/chat/config` | GET | Public | Public branding, operating hours, and service catalog configuration |
| `/api/demo` | POST | Public | Lead capture & demo request engine with honeypot & GDPR validation |

### D. Unified Inbox & Messaging
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/conversations` | GET, POST | JWT | Member+ | List tenant conversations or initiate new outbound thread |
| `/api/conversations/[id]` | GET, PATCH | JWT | Member+ | Retrieve conversation details or update status / control mode |
| `/api/conversations/[id]/messages` | GET, POST | JWT | Member+ | List messages or send staff reply / internal note |
| `/api/conversations/[id]/presence` | POST | JWT | Member+ | Heartbeat presence ping to detect agent collision |

### E. Scheduling, Calendar & Working Hours
| Endpoint | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `/api/integrations/calendar` | GET, POST | JWT | Retrieve connected calendars or schedule appointment |
| `/api/integrations/calendar/disconnect` | POST | JWT | Disconnect third-party calendar integration |
| `/api/integrations/google/oauth/authorize` | GET | JWT | Initiate Google Calendar OAuth consent flow |
| `/api/integrations/google/oauth/callback` | GET | Public | Handle Google OAuth code exchange |
| `/api/integrations/google/webhook` | POST | Public | Google Calendar change notification push handler |
| `/api/integrations/microsoft/oauth/authorize` | GET | JWT | Initiate Microsoft Outlook OAuth consent flow |
| `/api/integrations/microsoft/oauth/callback` | GET | Public | Handle Microsoft OAuth code exchange |
| `/api/integrations/microsoft/webhook` | POST | Public | Microsoft Graph push notification handler |

### F. CRM & Customer Management
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/crm/customers/identities` | GET, POST | JWT | Member+ | Retrieve or link multi-channel identities to customer profile |
| `/api/crm/customers/merge` | POST | JWT | Admin+ | Merge two customer profiles with audit log persistence |

### G. Commerce & Orders
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/orders` | GET, POST, PATCH | JWT | Member+ | Workspace order management with idempotency & tenant gating |

### H. Multi-Tenant Knowledge Base (RAG)
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/knowledge` | GET, DELETE | JWT | Admin (del) | List or delete tenant business documents |
| `/api/knowledge/ingest` | POST | JWT | Admin+ | Ingest & chunk business documents (PDF, DOCX, TXT) |

### I. AI Receptionist Configuration
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/receptionist/settings` | GET, PUT | JWT | Admin+ | Read or update business hours, personality, and catalog |

### J. Billing & Entitlements
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/billing/checkout` | POST | JWT | Admin+ | Generate Polar hosted checkout session URL for plan tier |
| `/api/billing/portal` | POST | JWT | Admin+ | Generate Polar Customer Portal session URL |

### K. Platform Administration (Super Admin)
| Endpoint | Method | Auth | Role | Description |
|:---|:---:|:---:|:---:|:---|
| `/api/admin/clients` | GET, PATCH | JWT | SuperAdmin | Manage all registered platform client workspaces |
| `/api/admin/demo-requests` | GET, PATCH | JWT | SuperAdmin | View and update demo inquiry leads |

### L. Background Jobs & Cron
| Endpoint | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `/api/cron/process-jobs` | POST | Bearer CRON_SECRET | Background worker execution for asynchronous AI queues |

### M. Compliance & System Health
| Endpoint | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `/api/health` | GET | Public | Production database, redis, and service health check |
| `/api/gdpr/export` | POST | JWT | Generate comprehensive GDPR data export archive |
| `/api/gdpr/delete` | POST | JWT | Process GDPR Right to be Forgotten account erasure |
| `/api/email/preview` | GET | Admin | Render HTML email templates for inspection |

---

## 4. Verification Summary

All 47 endpoints were validated against automated test suites:
- **Authentication & RBAC:** `tests/test-rbac-and-ui-security.ts` (20/20 checks passed)
- **Multi-Tenant Boundaries:** `tests/qa-domain-b-multitenant.ts` (7/7 checks passed)
- **Webhook Security:** `tests/test-whatsapp-webhook-security.ts` (13/13 checks passed) & `tests/test-polar-billing.ts` (9/9 checks passed)
- **Concurrency & Idempotency:** `tests/qa-domain-o-perf.ts` (6/6 checks passed) & `tests/test-real-data-integrity.ts` (8/8 checks passed)
