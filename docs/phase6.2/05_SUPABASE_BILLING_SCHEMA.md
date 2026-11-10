# STARX-FLOW — PHASE 6.2: SUPABASE BILLING DATA MODEL & MIGRATION SPECIFICATION

**Audit Date:** 2026-11-10  
**Milestone:** Phase 6.2 — Stage E  
**Auditor:** Principal PostgreSQL Security Engineer & Backend Architect  
**Migration Target:** `supabase/migrations/012_polar_billing_provider_and_idempotency.sql`  

---

## 1. Schema Design Principles

The billing schema migration adheres to strict architectural standards:
1. **Preserve Historical Stripe Data:** No columns (`stripe_customer_id`, `stripe_subscription_id`, `stripe_invoice_id`) or existing rows are altered or deleted.
2. **Provider-Aware Subscription Tracking:** Adds `billing_provider` (`'polar' | 'stripe'`) to explicitly track subscription authority.
3. **Database-Enforced Idempotency:** Creates `polar_webhook_events` with a unique constraint on `event_id` to prevent duplicate billing processing or race conditions caused by network retries.
4. **Tenant Isolation & RLS Security:** Webhook event records are strictly restricted to the backend `service_role` and platform administrators. End-users cannot query or manipulate billing event tables.

---

## 2. Table Schemas After Migration 012

### 2.1 `subscriptions` Table

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key |
| `user_id` | `UUID` | No | None | FK to `auth.users(id)` (UNIQUE) |
| `billing_provider` | `TEXT` | Yes | `'polar'` | Provider: `'polar'` or `'stripe'` |
| `polar_customer_id` | `TEXT` | Yes | NULL | Polar Customer UUID (`cst_...`) |
| `polar_subscription_id`| `TEXT` | Yes | NULL | Polar Subscription UUID (`sub_...`) |
| `polar_product_id` | `TEXT` | Yes | NULL | Polar Product UUID |
| `polar_price_id` | `TEXT` | Yes | NULL | Polar Price UUID |
| `plan_id` | `TEXT` | Yes | NULL | Internal Plan (`starter`, `pro`, `enterprise`) |
| `status` | `TEXT` | Yes | NULL | Subscription Status (`active`, `past_due`, `cancelled`) |
| `billing_cycle` | `TEXT` | Yes | `'monthly'` | Billing Interval (`monthly`, `annual`) |
| `amount` | `NUMERIC` | Yes | NULL | Subscription Price in major currency units |
| `currency` | `TEXT` | Yes | `'usd'` | Three-letter ISO currency code |
| `current_period_start`| `TIMESTAMPTZ`| Yes | NULL | Current Billing Window Start |
| `current_period_end` | `TIMESTAMPTZ`| Yes | NULL | Current Billing Window End |
| `cancel_at` | `TIMESTAMPTZ`| Yes | NULL | Scheduled cancellation timestamp |
| `cancelled_at` | `TIMESTAMPTZ`| Yes | NULL | Timestamp cancellation took effect |
| `updated_at` | `TIMESTAMPTZ`| Yes | `now()` | Last modification timestamp |
| `created_at` | `TIMESTAMPTZ`| Yes | `now()` | Row creation timestamp |
| *(Historical)* `stripe_customer_id` | `TEXT` | Yes | NULL | Preserved legacy Stripe customer |
| *(Historical)* `stripe_subscription_id` | `TEXT` | Yes | NULL | Preserved legacy Stripe subscription |

---

### 2.2 `polar_webhook_events` Table (Idempotency Engine)

| Column Name | Data Type | Constraints | Purpose |
|---|---|---|---|
| `id` | `UUID` | Primary Key | Internal row identifier |
| `event_id` | `TEXT` | `NOT NULL UNIQUE` | Polar `webhook-id` or event UUID |
| `event_type` | `TEXT` | `NOT NULL` | e.g. `order.paid`, `subscription.active` |
| `status` | `TEXT` | `CHECK (status IN ('processing', 'processed', 'failed'))` | Atomic lifecycle state |
| `error_message` | `TEXT` | NULL | Captured diagnostic string if handler fails |
| `received_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Inbound receipt timestamp |
| `processed_at` | `TIMESTAMPTZ`| NULL | Timestamp completion was acknowledged |

---

## 3. RLS Policies & Security Controls

```sql
-- Deny public and standard authenticated access; service_role only
CREATE POLICY "Service role has exclusive access to polar_webhook_events"
  ON polar_webhook_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Platform admins read-only for support auditing
CREATE POLICY "Platform admins can view polar webhook events"
  ON polar_webhook_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

- **Zero Client-Side Pollution:** The table is unreadable by regular client sessions, preventing any exposure of internal billing event streams.
