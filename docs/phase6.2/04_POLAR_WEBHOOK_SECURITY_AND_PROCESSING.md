# STARX-FLOW — PHASE 6.2: POLAR WEBHOOK SECURITY & EVENT PROCESSING ENGINE

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage D  
**Lead Engineer:** Principal PostgreSQL Security Engineer & Backend Architect  
**Components:** `src/lib/polarWebhookHandler.ts`, `src/app/api/billing/webhook/route.ts`, `src/app/api/webhook/polar/route.ts`  

---

## 1. Executive Summary

StarX-Flow's webhook architecture establishes an enterprise-grade, cryptographically verified, and fully idempotent event ingestion pipeline for Polar. By delegating signature verification to the official `@polar-sh/sdk/2026-10` `validateEvent` utility over the raw request payload, the system guarantees zero payload tampering while rejecting unauthorized or replayed requests.

Both `/api/billing/webhook` and `/api/webhook/polar` are served by this unified, hardened processing engine.

---

## 2. Cryptographic Signature Verification Standard

Polar webhooks are signed using HMAC-SHA256 according to Standard Webhooks conventions.

### Verified Headers:
1. `webhook-id`: Unique delivery identifier used for database-level idempotency deduplication.
2. `webhook-timestamp`: Unix timestamp of dispatch. Polar rejects deliveries older than 5 minutes.
3. `webhook-signature`: Base64/Hex HMAC signature computed over `${webhook_id}.${webhook_timestamp}.${raw_body}`.

```typescript
let event: any;
try {
  event = await webhooks.validateEvent(rawBody, headers, webhookSecret);
} catch (error: any) {
  if (error instanceof webhooks.PolarWebhookVerificationError) {
    return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 403 });
  }
  if (error instanceof webhooks.PolarWebhookUnknownTypeError) {
    // Signed payload with an unpinned future event type; acknowledge so Polar doesn't retry
    return NextResponse.json({ received: true, note: 'Unknown event type acknowledged' }, { status: 202 });
  }
  return NextResponse.json({ received: false, error: error.message }, { status: 400 });
}
```

---

## 3. Database Idempotency Engine (`polar_webhook_events`)

To prevent duplicate execution when Polar retries deliveries during transient network delays:

```sql
CREATE TABLE IF NOT EXISTS polar_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
```

### Ingestion Flow:
1. Look up `polar_webhook_events` by `event_id`.
2. If record exists with `status = 'processed'`:
   - Immediately return `HTTP 200 OK` with `{ received: true, duplicate: true }`.
   - Skip database mutations.
3. If record does not exist:
   - Insert row with `status = 'processing'`.
   - Execute subscription and entitlement mutations.
   - Update row with `status = 'processed'` and timestamp.
4. If an error occurs:
   - Update row with `status = 'failed'` and captured `error_message`.
   - Return `HTTP 500` to trigger Polar's exponential retry schedule.

---

## 4. Supported Events & State Transitions

| Polar Event Type | Trigger Condition | System State Transition |
|---|---|---|
| **`order.paid`** | One-time or first recurring order payment succeeds | Upserts `subscriptions` row (`status: 'active'`), sets `profiles.plan = planId`, inserts record into `invoices` (`status: 'paid'`). |
| **`subscription.created`** | New subscription created on Polar | Syncs `polar_subscription_id`, `polar_product_id`, and initial billing window. |
| **`subscription.active`** | Subscription becomes active | Sets `subscriptions.status = 'active'`, updates `profiles.plan = planId`. Entitlements unlocked. |
| **`subscription.updated`** | Customer changes plan or billing period | Updates `polar_product_id`, `plan_id`, and recalculates resource quotas in `profiles`. |
| **`subscription.canceled`** | Customer cancels renewal | If `cancel_at_period_end = true`, sets `cancel_at = current_period_end`. Access continues until period end. |
| **`subscription.revoked`** | Subscription immediately terminated / revoked | Sets `subscriptions.status = 'cancelled'`, reverts `profiles.plan = 'free'`. |
