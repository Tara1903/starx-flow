-- ============================================================
-- StarX OS — Billing Migration
-- Tables: subscriptions, invoices, usage_records
-- Generated: 2026-05-23
-- ============================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. SUBSCRIPTIONS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  plan_id               TEXT NOT NULL DEFAULT 'free',
  status                TEXT NOT NULL DEFAULT 'trialing'
                          CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused')),
  billing_cycle         TEXT DEFAULT 'monthly',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  cancel_at             TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT,
  amount                NUMERIC(10,2) DEFAULT 0,
  currency              TEXT DEFAULT 'usd',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);

-- Unique constraint: one active/trialing subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON subscriptions(user_id)
  WHERE status IN ('trialing', 'active', 'past_due', 'paused');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
-- 2. INVOICES
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id     UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id   TEXT,
  amount              NUMERIC(10,2),
  currency            TEXT DEFAULT 'usd',
  status              TEXT CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  hosted_invoice_url  TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);

-- ──────────────────────────────────────────────
-- 3. USAGE RECORDS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type   TEXT NOT NULL,
  quantity        INTEGER DEFAULT 1,
  period_start    TIMESTAMPTZ,
  period_end      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_resource_user
  ON usage_records(resource_type, user_id);

-- ──────────────────────────────────────────────
-- 4. ROW-LEVEL SECURITY
-- ──────────────────────────────────────────────

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.role() = 'service_role');

-- Invoices RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update invoices"
  ON invoices FOR UPDATE
  USING (auth.role() = 'service_role');

-- Usage Records RLS
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage records"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage records"
  ON usage_records FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update usage records"
  ON usage_records FOR UPDATE
  USING (auth.role() = 'service_role');


-- ============================================================
-- ROLLBACK
-- ============================================================
-- To undo this migration, run the following:
--
-- DROP POLICY IF EXISTS "Users can read own usage records" ON usage_records;
-- DROP POLICY IF EXISTS "Service role can insert usage records" ON usage_records;
-- DROP POLICY IF EXISTS "Service role can update usage records" ON usage_records;
-- DROP POLICY IF EXISTS "Users can read own invoices" ON invoices;
-- DROP POLICY IF EXISTS "Service role can insert invoices" ON invoices;
-- DROP POLICY IF EXISTS "Service role can update invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Service role can insert subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Service role can update subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Service role can delete subscriptions" ON subscriptions;
--
-- DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
--
-- DROP TABLE IF EXISTS usage_records;
-- DROP TABLE IF EXISTS invoices;
-- DROP TABLE IF EXISTS subscriptions;
