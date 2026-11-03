# StarX-Flow — Phase 4B.1 Blueprint
# Document 09: Testing & Acceptance Plan

**Document ID:** `SXF-TEST-09`  
**Classification:** Quality Assurance & Acceptance Specification  
**Status:** Approved for Planning Baseline  
**Date:** November 1, 2026  
**Author:** Lead QA Architect & Systems Verification Engineer  

---

## 1. Testing Philosophy & Verification Standards

To guarantee enterprise-grade reliability and avoid production outages, StarX-Flow enforces a **Strict Multi-Layer Testing Pyramid**:

```
        / \
       / E2E \       Level 4: End-to-End User Journeys (Live Sandbox & Channels)
      /-------\
     /  Integ  \     Level 3: API & External Provider Integration Tests
    /-----------\
   / DB / RLS    \   Level 2: PostgreSQL Row-Level Security & Isolation Tests
  /---------------\
 /   Unit Tests    \ Level 1: Chunker, Parser, Locale & Validation Logic
/-------------------\
```

### Fundamental Testing Rules
1. **No False Confidence:** A green unit test passing with mocked responses is NEVER accepted as proof of a functioning third-party integration (e.g. WhatsApp, Stripe, or Google Calendar). Live sandbox credentials must be tested for production sign-off.
2. **Deterministic Assertions:** Tests must make unambiguous boolean assertions on database records, status codes, and response payloads.
3. **Automated Regression Gate:** Every commit must pass `npm run typecheck` and `npx tsx tests/verify-journeys.ts` with zero warnings before deployment.

---

## 2. Test Suites by Architectural Layer

### Level 1: Unit Test Suite
- **Scope:** Pure functions and isolated helper algorithms.
- **Key Test Cases:**
  - `KnowledgeEngine.chunkText()`: Validates sentence boundary detection, sliding window token overlap, empty string handling, and token count approximation.
  - `LocaleUtils.formatEuro()`: Validates correct German/European formatting (`145,00 €`), zero values (`0,00 €`), and decimal rounding.
  - `StarXShield.getScore()`: Validates that robotic mouse velocities and headless Chrome user agents trigger bot penalty scores (<25).

### Level 2: Database & Multi-Tenant RLS Test Suite
- **Scope:** PostgreSQL policies and cross-tenant leakage prevention.
- **Key Test Cases:**
  - `testTenantIsolation()`:
    1. Tenant A inserts a lead, a conversation, and an order.
    2. Tenant B authenticates via Supabase Auth.
    3. Tenant B executes `select * from leads where id = [Tenant A Lead]`.
    4. **Assertion:** Returned dataset MUST be empty (`rows.length === 0`).
  - `testCascadeErasure()`:
    1. Tenant creates records across all 14 tables.
    2. Trigger `/api/gdpr/delete`.
    3. **Assertion:** Querying any table for `user_id = [Tenant]` returns 0 records.

### Level 3: API & Provider Integration Test Suite
- **Scope:** Route handlers, webhook verification, and provider fallback resilience.
- **Key Test Cases:**
  - `testWhatsAppWebhookVerification()`: GET request with valid `hub.verify_token` returns challenge with HTTP 200. Invalid token returns HTTP 403.
  - `testStripeWebhookSignature()`: POST request with invalid signature header returns HTTP 400 Bad Request.
  - `testAIFailoverCircuitBreaker()`: Simulate Gemini endpoint returning HTTP 504 Gateway Timeout.
    - **Assertion:** System completes fallback to NVIDIA API or Rule Engine in < 3,500ms; response arrives with `requiresHumanHandoff: false`.

### Level 4: End-to-End Journey Test Suite (`tests/verify-journeys.ts`)
- StarX-Flow enforces 6 mandatory end-to-end user journeys:
  - **Journey 1:** New Business Onboarding, AI Configuration, Knowledge Base Ingestion & Web Chat Triage.
  - **Journey 2:** Inbound WhatsApp Message, AI Knowledge Retrieval, Lead Creation & Manager Handoff Escalation.
  - **Journey 3:** Appointments, Calendar Availability Checking & Overlap Conflict Detection.
  - **Journey 4:** Automation Engine, Workflow Conditions & Execution Logging.
  - **Journey 5:** Subscription Activation, Plan Limit Verification & Stripe Webhook Ingestion.
  - **Journey 6:** Strict Multi-Tenant Data Isolation Verification.

---

## 3. Detailed Acceptance Criteria for All 20 Capabilities

| # | Capability | Exact Acceptance Criteria for Production Sign-off |
| :---: | :--- | :--- |
| **01** | AI Receptionist | Inbound inquiry receives contextually accurate response in < 3.5s citing business facts; escalates to manager when asked. |
| **02** | WhatsApp Integration | Real WhatsApp message received via Meta Webhook, processed by AI, and reply delivered to mobile phone within 3s. |
| **03** | Web Chat Widget | Standalone `<script>` embed renders glassmorphic widget on external domain; streams visitor conversation smoothly. |
| **04** | Unified Inbox | Messages across WhatsApp and Web Chat appear in real-time under consolidated customer thread; staff can take over. |
| **05** | AI Knowledge Base | Uploaded service FAQ PDF chunked into vector embeddings; AI cites exact pricing in subsequent chat without hallucination. |
| **06** | CRM Management | Inbound contact auto-creates lead; staff can edit, tag, filter, search, import CSV, and export CSV. |
| **07** | Lead Scoring | High-intent booking inquiries automatically boost lead score from 50 to 85+ and trigger priority status. |
| **08** | Follow-up Engine | Completed appointment automatically enqueues a review request dispatched via WhatsApp/SMS exactly 2 hours later. |
| **09** | Appointments | Booking a slot locks time in calendar; double-booking the same slot is rejected with HTTP 409 conflict error. |
| **10** | Orders & Operations | Staff creates order with dynamic line items; total calculated in Euro (€); generates valid Stripe payment link. |
| **11** | Workflow Builder | Visual editor saves valid JSON AST; test execution triggers multi-step sequence with execution log entry. |
| **12** | Voice Telephony | Live inbound telephone call connects to AI Voice Receptionist; holds spoken dialogue in German/English; logs call audio and transcript. |
| **13** | Email Integration | Customer email received at business inbox; AI drafts reply; staff approves and outbound email reaches customer. |
| **14** | Instagram DMs | Direct message sent to Instagram Business Page triggers AI reply via Meta Graph API within 24-hr window. |
| **15** | Analytics & Reporting | Dashboard displays real KPI totals (Revenue in €, AI resolution rate, bookings) computed from live events. |
| **16** | Multi-Tenant Isolation | Tenant A cannot read, query, update, or delete any record belonging to Tenant B across all 24 tables. |
| **17** | Subscription Billing | Upgrading to Pro via Stripe Checkout updates subscription to `active` and unlocks 5,000 AI conversations limit. |
| **18** | Onboarding Wizard | Completing 10-step wizard persists profile data, sets `onboarding_complete = true`, and unlocks Command Center. |
| **19** | Admin Dashboard | Super Admin can inspect all platform organizations, change client plans, and view system error stream. |
| **20** | Support & Reliability | Outage of primary AI provider triggers fallback in < 3.5s with zero dropped customer communications. |

---

## 4. Performance & Latency Benchmarks

| Metric / Operation | Maximum Acceptable Threshold | Target Ideal Performance |
| :--- | :---: | :---: |
| **RAG Vector Cosine Similarity Query** | `< 250ms` | `< 45ms` |
| **Total Inbound Webhook Roundtrip (WhatsApp/Web)** | `< 3,500ms` | `< 1,800ms` |
| **Voice Audio Pipeline Latency (STT + LLM + TTS)** | `< 1,500ms` | `< 850ms` |
| **Dashboard Route SSR & Hydration (Turbopack)** | `< 800ms` | `< 350ms` |
| **GDPR Data Export Archive Generation** | `< 5,000ms` | `< 1,200ms` |
