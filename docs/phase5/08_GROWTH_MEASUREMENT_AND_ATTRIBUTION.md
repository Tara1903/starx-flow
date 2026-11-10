# STARX-FLOW — GROWTH MEASUREMENT & PRIVACY-PRESERVING ATTRIBUTION
**Phase:** 5 — Global Keyword Intelligence & Customer Acquisition Engine  
**Document ID:** `docs/phase5/08_GROWTH_MEASUREMENT_AND_ATTRIBUTION.md`  
**Target Domain:** `https://starx-flow.runs-on.dev`  
**Git Branch:** `main`  
**Status:** Canonical Analytics, Funnel Telemetry & Privacy Governance  

---

## 1. PRIVACY-PRESERVING ANALYTICS PRINCIPLES

StarX-Flow adheres to strict data privacy principles (EU GDPR, ePrivacy Directive, UK Data Protection Act 2018):

1. **Zero Unnecessary PII Collection:** Analytics telemetry tracks user actions and anonymous session pathways. IP addresses are truncated, and personally identifiable information (passwords, customer message contents, credit card numbers) is strictly excluded from telemetry payloads.
2. **Cookie-Less & Lightweight First:** Avoid bloated third-party tracking scripts that degrade Core Web Vitals (Largest Contentful Paint) or inject third-party surveillance cookies.
3. **Transparent Consent Alignment:** Any client-side analytics or tracking tools must respect user consent preferences before writing persistent browser identifiers.

---

## 2. STANDARDIZED CONVERSION EVENT TAXONOMY

The user acquisition journey is instrumented across seven distinct milestones:

| Event Name | Trigger Condition | Technical Payload Parameters | Primary Business Significance |
| :--- | :--- | :--- | :--- |
| **`signup_initiation`** | User clicks "Start 14-Day Free Trial" or "Get Started" from any public landing page | `source_route`, `button_tier`, `device_category` | Inbound commercial intent indicator |
| **`signup_completion`** | New tenant account created via Supabase Auth (`auth.users`) | `user_id` (hashed), `auth_provider` (email/google), `signup_timestamp` | Successful top-of-funnel conversion |
| **`product_activation`** | First external service successfully connected (Google Calendar, Outlook, WhatsApp, or Instagram) | `integration_type`, `time_to_activate_seconds` | Product-led activation milestone (retention predictor) |
| **`booking_test_success`** | First successful test reservation completed via interactive dashboard chat | `channel_tested`, `execution_time_ms` | User experience validation ("Aha!" moment) |
| **`demo_request`** | Enterprise / clinic lead submits contact form requesting an architecture walkthrough | `industry_vertical`, `provider_count_bracket` | High-value commercial lead generation |
| **`subscription_start`** | Stripe webhook confirms initial checkout (`customer.subscription.created`) | `plan_id` (starter/growth/pro), `currency` (EUR/USD/GBP), `billing_interval` | Revenue conversion |
| **`subscription_renewal`** | Stripe webhook logs recurring payment (`invoice.payment_succeeded`) | `subscription_id`, `mrr_contribution` | Net revenue retention & LTV tracking |

---

## 3. MULTI-TOUCH ATTRIBUTION & AI REFERRAL TRACKING

### 3.1 Tracking Inbound Acquisition Channels
Inbound traffic is attributed to its origin using privacy-safe URL parameters and HTTP headers:
- **`utm_source` / `utm_medium`:** Standard UTM parameter capture for external directories (e.g. `g2`, `capterra`, `producthunt`, `linkedin`).
- **HTTP `Referer` Header Analysis:** Server-side inspection of incoming document requests to identify referring domains:
  - `search.google.com` / `google.com` -> Google Organic Search
  - `bing.com` -> Bing Organic Search
  - `chatgpt.com` -> ChatGPT Search Referral
  - `perplexity.ai` -> Perplexity Answer Engine Citation
  - `claude.ai` / `anthropic.com` -> Claude AI Referral

### 3.2 Key Acquisition Performance Indicators (KPIs)
1. **Landing-Page Conversion Rate (LP-CVR):**
   $$\text{LP-CVR} = \frac{\text{Unique Signups Initiated}}{\text{Unique Landing Page Visitors}} \times 100$$
   - *Target Benchmark:* 4.5%–8.0% for high-intent industry pages; 2.5%–4.0% for top-of-funnel informational guides.
2. **Visitor-to-Activated-User Rate (V-to-A):**
   $$\text{V-to-A} = \frac{\text{Tenants with Connected Calendar}}{\text{Total Signups}} \times 100$$
   - *Target Benchmark:* >60% within 48 hours of signup.
3. **Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV):**
   - *Target Benchmark:* LTV:CAC ratio > 4:1 driven by organic search and zero-paid acquisition spend in initial growth phases.
