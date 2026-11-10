# STARX-FLOW — PHASE 0
# HUMAN ACTION & CREDENTIALS CHECKLIST

**Document ID:** P0-REP-16  
**Project:** StarX-Flow  
**Initiative:** Universal Search & AI Discoverability  
**Phase:** 0 — Production System Discovery  
**Target Recipient:** Founder & Product Owner  
**Author / Execution Agent:** Antigravity  
**Audit Mode:** STRICT READ-ONLY

---

## 1. PURPOSE & SECURITY PROTOCOL

To achieve global discoverability without violating production boundaries or attempting unauthorized automated actions, specific external platform registrations must be performed manually by the Founder.

> [!IMPORTANT]
> **Zero Credential Exposure Rule:** Never share raw account passwords or sensitive master logins in chat or repository files. For webmaster tools and analytics, only the public verification meta tags (e.g., `<meta name="google-site-verification" content="..." />`) or public measurement IDs (`G-XXXXXXXX`) are required.

---

## 2. FOUNDER ACTION CHECKLIST

### PRIORITY 1: Search Engine Verification (Required for Phase 1 & 5)

- [ ] **Action 1.1: Google Search Console Property Setup**
  - **Portal:** [Google Search Console](https://search.google.com/search-console)
  - **Method:** Add Property -> Choose **URL prefix** -> Enter `https://starx-flow.runs-on.dev/`
  - **Verification Option:** Choose **HTML tag** (do not choose file upload).
  - **What to Copy:** Copy only the `content` string from `<meta name="google-site-verification" content="COPIED_TOKEN_HERE" />`.
  - **Destination:** Deliver token for injection into `src/app/layout.tsx`.

- [ ] **Action 1.2: Microsoft Bing Webmaster Tools Setup**
  - **Portal:** [Bing Webmaster Tools](https://www.bing.com/webmasters)
  - **Method:** Sign in -> Import from Google Search Console (Instant) OR Add Site manually.
  - **Verification Option:** Choose **HTML Meta Tag**.
  - **What to Copy:** Copy the `content` string from `<meta name="msvalidate.01" content="COPIED_TOKEN_HERE" />`.
  - **Destination:** Deliver token for injection into `src/app/layout.tsx`.

---

### PRIORITY 2: Social & Brand Entity Verification (Required for Phase 2)

- [ ] **Action 2.1: Claim Official X (Twitter) Handle**
  - **Portal:** [x.com](https://x.com)
  - **Target Handle:** `@starxflow` (or closest available variant if claimed, e.g. `@starx_flow`).
  - **Profile Details:** Website link: `https://starx-flow.runs-on.dev/`, Bio: *"AI Receptionist for WhatsApp. Automating bookings and front-desk care for local service businesses."*

- [ ] **Action 2.2: Create LinkedIn Company Page**
  - **Portal:** [LinkedIn Company Pages](https://www.linkedin.com/company/setup/new/)
  - **Page Name:** `StarX-Flow`
  - **Industry:** Software Development / AI Automation
  - **Website:** `https://starx-flow.runs-on.dev/`

- [ ] **Action 2.3: Set Up YouTube Brand Channel**
  - **Portal:** [YouTube Studio](https://studio.youtube.com/)
  - **Channel Name:** `StarX-Flow`
  - **Immediate Asset:** Upload a simple 60-second screen capture showing a WhatsApp conversation booking a slot in real time.

---

### PRIORITY 3: B2B Software Directories (Required for Phase 4 & 5)

- [ ] **Action 3.1: Claim G2 Software Listing**
  - **Portal:** [G2 Vendor Solutions](https://sell.g2.com/)
  - **Category:** Appointment Scheduling Software, AI Chatbots
  - **Product Name:** StarX-Flow

- [ ] **Action 3.2: Submit to Capterra / Gartner Digital Markets**
  - **Portal:** [Capterra Vendor Portal](https://www.capterra.com/vendors/)
  - **Listing Tier:** Free Basic Listing

- [ ] **Action 3.3: Submit to AlternativeTo.net**
  - **Portal:** [AlternativeTo](https://alternativeto.net/)
  - **Tag Alternatives:** Alternative to `Mindbody`, `Vagaro`, `Calendly`, `Wati`.
  - **License:** Commercial SaaS ($29/mo).

- [ ] **Action 3.4: Product Hunt Upcoming Launch Page**
  - **Portal:** [Product Hunt](https://www.producthunt.com/)
  - **Format:** Schedule a launch teaser under AI & Productivity.

---

### PRIORITY 4: Customer E-E-A-T Verification (Required for Phase 4)

- [ ] **Action 4.1: Customer Testimonial Approval**
  - Contact 2–3 early business users (e.g. gym, salon, clinic) who have tested StarX-Flow.
  - Obtain permission to use their real first name, business name, and a 1-sentence quote with an optional link to their website or Google Maps listing.
  - *Fallback:* If early users prefer anonymity, approve transitioning copy to *"Verified Beta Cohort Benchmarks"* to ensure 100% compliance with search rating guidelines.
