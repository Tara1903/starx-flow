# STARX-FLOW — WORKSTREAM E
# LEAD GENERATION AND DEMO SYSTEM

**Project:** StarX-Flow  
**Phase:** 6 — Global Market Activation & Customer Acquisition Engine  
**Canonical Domain:** `https://starx-flow.runs-on.dev/`  
**Components Created:** `src/app/api/demo/route.ts`, `src/components/modals/DemoModal.tsx`, `supabase/migrations/011_demo_requests_and_lead_capture.sql`  
**Test Suite:** `tests/test-demo-lead-engine.ts` (6/6 tests passing)  

---

## 1. System Motivation & Problem Solved

Prior to Phase 6, StarX-Flow had a critical acquisition flaw:
When prospective enterprise or clinic buyers clicked *"Book a Demo"* on `/product` or landing pages, the button triggered `openSignup()`, opening the self-serve magic link login modal. 

High-value mid-market decision makers (e.g., clinic directors, multi-location salon owners) do not want to immediately self-configure integrations; they require a guided architecture demonstration, SLA confirmation, and consultative evaluation before committing their team.

In Phase 6, StarX-Flow engineered and deployed an enterprise-grade **Lead Generation & Architecture Demo Capture Engine**.

---

## 2. Technical Architecture & Data Flow

```
  Prospective Buyer
         │
         ▼
  [Clicks "Book Demo" or "Request Demo"]
         │
         ▼
  `DemoModal.tsx` (Interactive Form)
    - Full Name, Work Email, Phone
    - Business Name, Industry Vertical
    - Business Size (Solo, 2–10, 11–50, 50+)
    - Primary Automation Goal
    - Preferred Contact (Email / WhatsApp / Phone)
    - GDPR Consent Checkbox (Mandatory)
    - Honeypot Bot Trap (Hidden)
         │
         ▼ POST /api/demo
  `src/app/api/demo/route.ts`
    1. Sliding-Window Rate Limiter (Max 5 submissions / 10 min per IP)
    2. Honeypot Evaluation (Silent drop if filled)
    3. Server-side Zod Validation
    4. Supabase Admin Insertion into `demo_requests`
    5. Returns unique reference ID (`DEMO-XXXXXX`)
         │
         ▼
  Success State in UI (Instant confirmation + reference ID)
```

---

## 3. Database Schema (`011_demo_requests_and_lead_capture.sql`)

```sql
create table if not exists demo_requests (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  work_email text not null,
  phone text,
  business_name text not null,
  business_type text not null,
  business_size text not null,
  primary_need text not null,
  preferred_contact text default 'email' check (preferred_contact in ('email', 'whatsapp', 'phone')),
  website text,
  notes text,
  ip_address text,
  status text default 'new' check (status in ('new', 'contacted', 'scheduled', 'completed', 'disqualified', 'converted')),
  consent_given boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security
alter table demo_requests enable row level security;

-- Public can insert with valid non-empty fields
create policy "Anyone can submit a demo request"
  on demo_requests for insert to anon, authenticated
  with check (
    length(full_name) >= 2 and
    length(work_email) >= 5 and
    length(business_name) >= 2 and
    consent_given = true
  );

-- Only authenticated organization owners and admins can view leads
create policy "Admins can view demo requests"
  on demo_requests for select to authenticated
  using (
    exists (
      select 1 from organization_members
      where organization_members.user_id = (select auth.uid())
      and organization_members.role in ('owner', 'admin')
    )
  );
```

---

## 4. Security & Abuse Prevention Features

1. **Sliding-Window IP Rate Limiter:** An in-memory sliding window tracks IP submission velocity, allowing at most 5 requests per 10 minutes from any individual IP. Excessive requests receive an `HTTP 429 Too Many Requests`.
2. **Invisible Honeypot Bot Trap:** Includes a hidden input (`style={{ display: 'none' }}`) labeled `honeypot`. Legitimate users leave it empty; automated scraping bots populate it. The API silently returns a fake success response without storing the spam lead in the database.
3. **Strict GDPR Consent Gating:** Zod strictly rejects any submission where `consent: false` with an `HTTP 400 Bad Request`.
4. **Data Isolation & Admin Protection:** The table is protected by Row Level Security (RLS). Public users can only insert; they cannot select, enumerate, or access other submissions.

---

## 5. Lead Lifecycle & Qualification Workflow

Every inbound demo request progresses through a 6-stage lifecycle:

```
  [1. NEW]           Lead captured via /api/demo. Stored with status 'new' and timestamp.
       │
       ▼
  [2. CONTACTED]     Solutions architect reaches out via preferred channel (Email/WhatsApp) within 4 hours.
       │
       ▼
  [3. SCHEDULED]     Calendar invite confirmed for 30-min tailored architecture walkthrough.
       │
       ▼
  [4. COMPLETED]     Demonstration delivered. Custom FAQ and calendar sync demonstrated live.
       │
       ▼
  [5. CONVERTED]     Merchant initiates 14-day trial or signs annual Growth/Pro contract.
```

---

## 6. Automated Verification Results

The test suite in [`tests/test-demo-lead-engine.ts`](file:///c:/Web%20Apps/starx-flow/tests/test-demo-lead-engine.ts) verifies the complete engine:
- ✓ Valid lead request returns HTTP 200 with `success: true`.
- ✓ Lead request assigns unique `DEMO-XXXXXX` reference ID.
- ✓ Submission without explicit GDPR consent returns HTTP 400.
- ✓ Invalid email format returns HTTP 400.
- ✓ Honeypot trap silently fakes success without DB persistence.
- ✓ Submitting > 5 requests from same IP triggers HTTP 429 rate limit.

**Test Verdict: 6/6 PASSED (0 FAILED).**
