# STARX-FLOW — TEST COVERAGE MATRIX & AUDIT CHECKLIST

This document tracks test targets, executed scenarios, outcomes, and test types across the complete StarX-Flow system.

## Test Domain Overview

| Domain | Area | Status | Executed | Passed | Failed |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **A** | Authentication and Accounts | **VERIFIED** | 11 | 11 | 0 |
| **B** | Multi-Tenant Isolation | **VERIFIED** | 7 | 7 | 0 |
| **C** | AI Receptionist Core Workflows | **VERIFIED** | 9 | 9 | 0 |
| **D** | WhatsApp Channel | **VERIFIED** | 8 | 8 | 0 |
| **E** | Instagram & Facebook Messenger | **VERIFIED** | 7 | 7 | 0 |
| **F** | Website Chat Widget | **VERIFIED** | 8 | 8 | 0 |
| **G** | Email & Resend | **VERIFIED** | 4 | 4 | 0 |
| **H** | Human Handoff | **VERIFIED** | 3 | 3 | 0 |
| **I** | Leads & Customers CRM | **VERIFIED** | 18 | 18 | 0 |
| **J** | Appointments & Calendar | **VERIFIED** | 14 | 14 | 0 |
| **K** | Scheduler & Background Jobs | **VERIFIED** | 16 | 16 | 0 |
| **L** | Database & Migrations | **VERIFIED** | 22 | 22 | 0 |
| **M** | Frontend & UX | **VERIFIED** | 6 | 6 | 0 |
| **N** | Application Security | **VERIFIED** | 18 | 18 | 0 |
| **O** | Performance & Reliability | **VERIFIED** | 6 | 6 | 0 |

---

## Detailed Execution Log

### Domain A: Authentication and Accounts
- **Script:** `tests/qa-domain-a-auth.ts`
- **Scenarios Probed:** 11 scenarios (missing tokens, RBAC roles, lowercase bearer parsing, admin protections).
- **Defects Discovered & Fixed:** BUG-AUTH-001, BUG-AUTH-002, BUG-AUTH-003, BUG-AUTH-004.
- **Result:** 11/11 PASSED.

### Domain B: Multi-Tenant Isolation
- **Script:** `tests/qa-domain-b-multitenant.ts`
- **Scenarios Probed:** 7 scenarios (cross-tenant message reading, message injection, conversation patching, presence tracking, RAG isolation, order scoping).
- **Defects Discovered & Fixed:** BUG-SEC-001.
- **Result:** 7/7 PASSED.

### Domain C: AI Receptionist Core Workflows
- **Script:** `tests/qa-domain-c-receptionist.ts`
- **Scenarios Probed:** 9 scenarios (zero-hallucination catalog lookup, unlisted services, fallback handoff guarantee, prompt injection escaping, business hours/timezone evaluation, double-booking conflict detection).
- **Defects Discovered & Fixed:** BUG-AI-001, BUG-AI-002, BUG-AI-003, BUG-AI-004.
- **Result:** 9/9 PASSED.

### Domains D & E: WhatsApp, Instagram & Messenger Webhooks
- **Script:** `tests/qa-domain-de-webhooks.ts`
- **Scenarios Probed:** 15 checks across WhatsApp, Instagram, Messenger (hub challenge handshake, normalization, replay defense, 24h window, internal note leakage).
- **Result:** 15/15 PASSED.

### Domain F: Website Chat Widget
- **Script:** `tests/qa-domain-f-widget.ts`
- **Scenarios Probed:** 8 scenarios (widget script delivery, host resolution via currentScript.src, CORS preflight OPTIONS, POST CORS headers, conversation generation, rate limiting flood defense, public config secrecy).
- **Defects Discovered & Fixed:** BUG-WIDGET-001, BUG-WIDGET-002, BUG-INGEST-001.
- **Result:** 8/8 PASSED.

### Domains G & H: Email (Resend) & Human Handoff Lifecycle
- **Script:** `tests/qa-domain-gh-email-handoff.ts`
- **Scenarios Probed:** 7 scenarios (outbound email dispatch, internal note leakage prevention, stable idempotency duplicate suppression, inbound thread preservation, AI reply generation, human takeover suppression, AI handback).
- **Defects Discovered & Fixed:** BUG-AI-005.
- **Result:** 7/7 PASSED.

### Domain I: Leads & Customers CRM
- **Script:** `tests/qa-domain-i-crm.ts`
- **Scenarios Probed:** 18 scenarios (E.164 normalization across DE/FR/GB, anti-slicing validation, multi-channel identity linking, multi-tenant lead isolation, merge RBAC 401/403, self-merge rejection, cross-tenant merge rejection, attribute/tag merge, source archival).
- **Result:** 18/18 PASSED.

### Domain J: Appointments & Calendar Integrations
- **Script:** `tests/qa-domain-j-calendar.ts`
- **Scenarios Probed:** 14 scenarios (HMAC OAuth state signing, state consumption, anti-replay, cross-tenant rejection, Google watch token validation, Microsoft clientState validation, baseline slots, Google collision block, non-conflicting slot preservation, multi-tenant collision isolation).
- **Result:** 14/14 PASSED.

### Domain K: Scheduler & Background Jobs
- **Script:** `tests/qa-domain-k-scheduler.ts`
- **Scenarios Probed:** 16 scenarios (constant-time CRON_SECRET authentication, single claim per job, worker lease fencing, lease timeout reclamation, bounded batch sizing, partial batch resilience, retry backoff).
- **Result:** 16/16 PASSED.

### Domain L: Database & Migrations
- **Script:** `tests/qa-domain-l-database.ts`
- **Scenarios Probed:** 22 scenarios (PostgREST schema exposure of 45 tables, core tables existence, schema columns verification on conversations & receptionist_jobs, production connectivity).
- **Result:** 22/22 PASSED.

### Domain M: Frontend & UX
- **Script:** `tests/qa-domain-m-frontend.ts`
- **Scenarios Probed:** 6 scenarios (KnowledgeStore state, optimistic updates, OrderStore calculations, status transitions, clean typecheck).
- **Result:** 6/6 PASSED.

### Domain N: Application Security
- **Script:** `tests/qa-domain-n-security.ts`
- **Scenarios Probed:** 18 scenarios (SSRF defense across 12 vectors, script element sanitization, nested-quote inline event handlers, style tag sanitization, structural preservation, internal note leakage blocking).
- **Defects Discovered & Fixed:** BUG-SEC-002, BUG-SEC-003.
- **Result:** 18/18 PASSED.

### Domain O: Performance & Reliability
- **Script:** `tests/qa-domain-o-perf.ts`
- **Scenarios Probed:** 6 scenarios:
  1. Concurrency processing of multiple simultaneous inbound events.
  2. Zero-event-drop guarantee under burst load.
  3. Throughput within defined provider cascade SLA.
  4. Atomic idempotency race resolution under simultaneous duplicate dispatch.
  5. Graceful exception containment on fatal socket disconnect.
  6. Durable error tracing on failed background execution.
- **Result:** 6/6 PASSED.
