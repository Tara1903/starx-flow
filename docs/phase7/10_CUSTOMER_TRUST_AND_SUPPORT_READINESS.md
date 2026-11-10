# STARX-FLOW — PHASE 7: CUSTOMER TRUST & SUPPORT READINESS

**Document Date:** 2026-11-10  
**Milestone:** Phase 7 — Stage J  
**Author:** Chief Product Officer & Customer Success Lead  
**Canonical Production Domain:** `https://starx-flow.runs-on.dev/`  
**Billing Provider:** Polar (Merchant of Record)  

---

## 1. Trust, Compliance & Legal Disclosure Audit

### 1.1 Merchant of Record Disclosure (Polar)
In strict compliance with consumer protection and payment processing standards:
- All pricing, checkout, and terms pages explicitly disclose that payments are processed by **Polar** as the Merchant of Record:
  > *"StarX-Flow partners with Polar Payments Inc. (Merchant of Record) to provide secure global checkout, local sales tax calculation, and compliant VAT handling. Charges on your credit card statement will appear as POLAR* STARXFLOW."*
- Customers have 24/7 access to view, download, and update their payment methods and official VAT tax invoices via the self-service **Customer Billing Portal** (`/api/billing/portal`).

### 1.2 Legal & Compliance Assets (Reviewed in Code)
- **Privacy Policy ([`/privacy`](https://starx-flow.runs-on.dev/privacy)):** Explicitly documents GDPR compliance, data controller/processor boundaries, database encryption, retention rules, and user rights to access or delete personal information.
- **Terms of Service ([`/terms`](https://starx-flow.runs-on.dev/terms)):** Outlines subscription cadences, cancellation terms, fair usage limits, and disclaimers regarding AI conversational suggestions.
- **Security & Data Isolation ([`/security`](https://starx-flow.runs-on.dev/security)):** Documents Supabase PostgreSQL Row Level Security (RLS), tenant cryptographic boundaries, and zero data-sharing policies.
- **Refund Policy:** Subscriptions can be canceled at any time with access continuing through the end of the paid billing period. If a customer is unsatisfied within their first 14 days of paid subscription, full refunds are issued via the Polar dashboard.

---

## 2. Customer Support Architecture & Service Level Agreements (SLAs)

### 2.1 Support Communication Channels
- **In-App Direct Support:** "Help & Support" button in Settings linking to `mailto:support@starx-flow.runs-on.dev`.
- **Inbound Support Routing:** The MX and email routing for `support@starx-flow.runs-on.dev` forwards directly to the founder's mobile device, ensuring zero dropped communications during the launch phase.

### 2.2 Issue Classification & Severity Levels

| Severity Tier | Definition / Examples | Target First Response | Target Resolution | Escalation Lead |
|---|---|:---:|:---:|---|
| **P1 - Critical** | Platform down, checkout failing, live AI sending broken/corrupt messages | **< 30 minutes** | < 2 hours | Founder / Lead Engineer |
| **P2 - High** | Calendar integration disconnect, inbound chat webhook delayed, login errors | **< 2 hours** | < 8 hours | Lead Engineer |
| **P3 - Medium** | FAQ tuning questions, tone adjustment assistance, billing portal query | **< 6 hours** | < 24 hours | Customer Success Lead |
| **P4 - Low** | Feature requests, minor UI cosmetic suggestions | **< 24 hours** | Next sprint | Product Manager |

### 2.3 Incident Response Protocol
In the event of an unplanned service disruption or AI generation anomaly:
1. **Immediate Circuit Breaker:** Admin can switch any channel into "Staff Only" or "Manual Mode" directly from the dashboard, pausing automated AI responses.
2. **Transparent Status Communication:** Proactive notification sent to affected pilot users with expected restoration time.
3. **Post-Mortem Root Cause Analysis:** Authored in repository documentation before incident is marked resolved.
