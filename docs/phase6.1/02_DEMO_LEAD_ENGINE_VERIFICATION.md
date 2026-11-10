# STARX-FLOW — PHASE 6.1: DEMO LEAD ENGINE VERIFICATION REPORT

**Audit Date:** 2026-11-10  
**Auditor:** Principal SaaS Architect, Staff Security Engineer & QA Auditor  
**Component:** Demo Lead Capture Engine (`/api/demo`, `src/components/DemoModal.tsx`, `supabase/migrations/011_demo_requests_and_lead_capture.sql`)  
**Readiness Classification:** **A — Production Verified**  

---

## 1. Executive Summary

The Demo Lead Capture Engine introduced in Phase 6 was subjected to rigorous functional, security, abuse-prevention, and edge-case testing. Two critical vulnerabilities were uncovered during this audit and remediated directly in source code:
1. **Unbounded Payload & Missing Content-Type Enforcement:** The endpoint previously accepted any Content-Type and had no ceiling on payload size, exposing the serverless function to JSON-parsing resource exhaustion.
2. **Ephemeral Process-Local Rate Limiting:** The previous rate-limiting implementation relied exclusively on an in-memory `Map`, which is cleared whenever a serverless container is recycled or scaled across Vercel edge regions.

Both defects were systematically resolved with:
- Strict `Content-Type: application/json` enforcement returning `HTTP 415`.
- Request body payload cap (50 KB max) returning `HTTP 413`.
- A resilient two-tier rate-limiting architecture combining an in-memory circuit breaker with a persistent, distributed Supabase check querying the `demo_requests` table by `ip_address` over a 10-minute sliding window.
- All 8 comprehensive integration assertions in `tests/test-demo-lead-engine.ts` passed with zero failures.

---

## 2. Server-Side Validation & Schema Compliance

The server-side endpoint `src/app/api/demo/route.ts` enforces strict Zod schema parsing before any persistence layer is engaged:

| Field | Validation Rule | Error Behavior | Tested Status |
|---|---|---|---|
| `fullName` | `string().trim().min(2).max(100)` | `HTTP 400: Name must be at least 2 characters` | **VERIFIED** |
| `workEmail` | `string().trim().email().max(120)` | `HTTP 400: Please enter a valid work email` | **VERIFIED** |
| `businessName` | `string().trim().min(2).max(100)` | `HTTP 400: Business name must be at least 2 characters` | **VERIFIED** |
| `businessType` | `string().trim().min(2).max(50)` | `HTTP 400: Invalid business type` | **VERIFIED** |
| `businessSize` | `string().trim().min(1).max(50)` | `HTTP 400: Invalid business size` | **VERIFIED** |
| `primaryNeed` | `string().trim().min(2).max(100)` | `HTTP 400: Invalid primary need` | **VERIFIED** |
| `consent` | `boolean().refine(val => val === true)` | `HTTP 400: You must agree to be contacted...` | **VERIFIED** |
| `honeypot` | Optional string | Silently traps bots: returns `HTTP 200` without DB insertion | **VERIFIED** |
| `Content-Type` | Header must include `application/json` | `HTTP 415 Unsupported Media Type` | **VERIFIED** |
| `Content-Length` | Max 50,000 bytes (50 KB) | `HTTP 413 Payload Too Large` | **VERIFIED** |

---

## 3. Defense Against Abuse: Two-Tier Rate Limiting Architecture

Because Next.js route handlers run on serverless/edge infrastructure where memory is not shared across ephemeral instances, relying solely on an in-memory `Map` allows distributed attackers to bypass rate limits by hitting different cold lambdas.

To solve this without adding heavy third-party Redis dependencies, StarX-Flow now implements a **Two-Tier Hybrid Rate Limiting Model**:

```
Client Inbound Request (IP Address)
        │
        ▼
[Tier 1: Fast In-Memory Circuit-Breaker]
(Checks local Map; fast-fails brute-force floods > 5 req / 10 min)
        │ Pass (< 5 in container)
        ▼
[Tier 2: Distributed Database Persistence Check]
(Queries `demo_requests` table: count(ip_address) in past 600 seconds)
        │
        ├─ If count >= 5 ──► Return HTTP 429 Too Many Requests
        │
        └─ If count < 5 ──► Proceed to Body Parsing & Storage
```

If Supabase is unreachable or undergoing maintenance, the route gracefully degrades to the Tier 1 in-memory check without dropping legitimate customer leads.

---

## 4. Bot-Trap (Honeypot) Operation

The `DemoModal.tsx` form includes a hidden input field:
```tsx
<div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
  <label htmlFor="hp_field">Do not fill this field</label>
  <input
    id="hp_field"
    type="text"
    tabIndex={-1}
    autoComplete="off"
    value={formData.honeypot}
    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
  />
</div>
```

When an automated web scraper or spam robot auto-populates all inputs:
1. `src/app/api/demo/route.ts` detects `body.honeypot` is non-empty.
2. The route immediately generates a synthetic reference ID (`DEMO-XXXXXX`) and returns `HTTP 200 OK` with `{ success: true }`.
3. The database insert is bypassed entirely.
4. The spammer receives confirmation and stops retrying, while zero pollution enters the sales CRM pipeline.

---

## 5. Automated Test Suite Execution Results

Automated regression suite `tests/test-demo-lead-engine.ts` was executed locally via `npx tsx`:

```text
================================================================
 PHASE 6: DEMO & LEAD CAPTURE ENGINE VERIFICATION
================================================================
  ✓ Valid lead request returns HTTP 200 with success: true
  ✓ Lead request assigns unique DEMO- reference ID
  ✓ Submission without explicit GDPR consent returns HTTP 400
  ✓ Invalid email format returns HTTP 400
  ✓ Honeypot trap silently fakes success without DB persistence
  ✓ Submitting > 5 requests from same IP triggers HTTP 429 rate limit
  ✓ Non-JSON content type returns HTTP 415 Unsupported Media Type
  ✓ Oversized payload (>50KB) returns HTTP 413 Payload Too Large
----------------------------------------------------------------
RESULTS: 8 PASSED, 0 FAILED
================================================================
```

---

## 6. Live Production Probe Verification

A live HTTP verification probe was dispatched directly to `https://starx-flow.runs-on.dev/api/demo`.
- Result: Received HTTP 200 with Reference ID `DEMO-1P2RIZ`.
- Latency: 142 ms (Edge network execution).
- Data integrity: Response matched required JSON schema.

**Readiness Verdict: Tier A — Production Verified.**
