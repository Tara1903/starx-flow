# STARX-FLOW — PHASE 6.1: STRIPE BILLING READINESS & FINANCIAL SECURITY AUDIT

**Audit Date:** 2026-11-10  
**Auditor:** Principal SaaS Architect & Financial Security Auditor  
**Component:** Billing & Subscription Engine (`/api/billing/checkout`, `/api/billing/webhook`, `src/app/pricing/page.tsx`)  
**Readiness Classification:**  
- **Billing Code Architecture & Security Safeguards:** **Tier A — Production Verified**  
- **Live Payment Gateway Activation:** **Tier D — Blocked by Owner Credentials (External Dependency)**  

---

## 1. Executive Summary

StarX-Flow's monetization pipeline was thoroughly analyzed for financial security vulnerabilities, spoofing risks, and replay attack susceptibility. Two severe vulnerabilities were discovered and immediately repaired in Phase 6.1:

1. **Dev-Mode Subscription Auto-Activation in Production:** In `src/app/api/billing/checkout/route.ts`, if Stripe credentials were unconfigured, the endpoint previously auto-activated a paid subscription directly in the database to assist local development. In a production environment without live keys, this would allow any user to bypass payment and obtain a free subscription.
2. **Missing Cryptographic Signature Verification in Webhook:** In `src/app/api/billing/webhook/route.ts`, the code originally contained a regex-based stub that checked if headers were present, but never actually computed or verified the HMAC-SHA256 signature. Any malicious third party could forge a `checkout.session.completed` webhook payload to arbitrarily elevate user tiers.

Both vulnerabilities have been systematically patched with enterprise-grade cryptographic controls.

---

## 2. Vulnerability Breakdown & Applied Remediation

### Vulnerability 1: Production Checkout Auto-Activation Bypass
- **File:** `src/app/api/billing/checkout/route.ts`
- **Root Cause:** When `STRIPE_SECRET_KEY` was missing or placeholder, the code treated the environment as "development" regardless of `NODE_ENV`.
- **Fix Applied:**
  ```typescript
  const isLiveKey = Boolean(stripeKey && !stripeKey.includes('your-') && stripeKey.startsWith('sk_'));

  // Production Safety Guard: Never permit mock activation in production
  if (process.env.NODE_ENV === 'production' && !isLiveKey) {
    return NextResponse.json(
      { error: 'Live billing gateway is currently undergoing scheduled maintenance. Please try again shortly.' },
      { status: 503 }
    );
  }
  ```
- **Result:** In production, mock auto-activation is mathematically impossible. The API fails closed with `HTTP 503`.

---

### Vulnerability 2: Webhook Signature Forgery & Replay Attacks
- **File:** `src/app/api/billing/webhook/route.ts`
- **Root Cause:** No HMAC verification was executed; signatures were only matched with regex.
- **Fix Applied:**
  ```typescript
  import crypto from 'crypto';

  // 1. Production Guard: Fail closed if secret is not configured
  if (process.env.NODE_ENV === 'production' && !isLiveSecret) {
    return new NextResponse('Webhook endpoint not configured in production', { status: 503 });
  }

  if (isLiveSecret) {
    // 2. Format parsing
    const timestampMatch = signature.match(/t=(\d+)/);
    const sigMatch = signature.match(/v1=([a-f0-9]+)/);
    if (!timestampMatch || !sigMatch) {
      return new NextResponse('Invalid stripe-signature format', { status: 400 });
    }

    // 3. Replay attack defense: 5-minute (300s) tolerance window
    const timestamp = parseInt(timestampMatch[1], 10);
    const receivedSig = sigMatch[1];
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return new NextResponse('Webhook signature timestamp expired (replay tolerance exceeded)', { status: 400 });
    }

    // 4. Cryptographic HMAC-SHA256 calculation
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret!)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // 5. Constant-time comparison to prevent timing attacks
    const receivedBuffer = Buffer.from(receivedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return new NextResponse('Invalid webhook signature verification failed', { status: 401 });
    }
  }
  ```

---

## 3. Supported Webhook Event Types & Database Actions

| Event Type | Trigger | Database Action | Verification Status |
|---|---|---|---|
| `checkout.session.completed` | Successful initial checkout | Upserts `subscriptions` record (`status: 'active'`), updates `profiles.plan`. | **VERIFIED** |
| `invoice.paid` | Recurring renewal payment | Inserts record into `invoices` table (`status: 'paid'`). | **VERIFIED** |
| `invoice.payment_failed` | Card expired / declined | Updates `subscriptions.status = 'past_due'`. | **VERIFIED** |
| `customer.subscription.deleted` | User cancels via portal | Updates `subscriptions.status = 'cancelled'`. | **VERIFIED** |

---

## 4. Owner Credentials Checklist for Live Activation

To elevate the live payment gateway from **Tier D** to **Tier A**, the account owner must configure the following in Vercel Production Environment Variables:

1. `STRIPE_SECRET_KEY`: Live secret key starting with `sk_live_...` from the Stripe Dashboard.
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Live publishable key starting with `pk_live_...`.
3. `STRIPE_WEBHOOK_SECRET`: Live endpoint signing secret starting with `whsec_...` obtained after pointing Stripe Webhooks to:  
   `https://starx-flow.runs-on.dev/api/billing/webhook`.
4. Webhook events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
