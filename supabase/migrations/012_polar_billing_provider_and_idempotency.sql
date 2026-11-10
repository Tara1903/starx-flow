-- ==============================================================================
-- Migration 012: Polar Merchant of Record Billing Provider & Webhook Idempotency
-- Preserves existing Stripe historical columns while establishing Polar as active provider
-- ==============================================================================

-- 1. Upgrade subscriptions table to support Polar identifiers and provider tracking
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'polar',
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_product_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_price_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Indexes for performant lookup during Polar webhook ingestion
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_customer
  ON subscriptions(polar_customer_id)
  WHERE polar_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_sub
  ON subscriptions(polar_subscription_id)
  WHERE polar_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_provider
  ON subscriptions(billing_provider);

-- 2. Upgrade invoices table to support Polar orders and invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'polar',
  ADD COLUMN IF NOT EXISTS polar_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_polar_order
  ON invoices(polar_order_id)
  WHERE polar_order_id IS NOT NULL;

-- 3. Dedicated Webhook Idempotency Table
CREATE TABLE IF NOT EXISTS polar_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Index on event_id for sub-millisecond deduplication checks
CREATE INDEX IF NOT EXISTS idx_polar_webhook_events_lookup
  ON polar_webhook_events(event_id);

CREATE INDEX IF NOT EXISTS idx_polar_webhook_events_status
  ON polar_webhook_events(status);

-- 4. Enable Row Level Security (RLS) on polar_webhook_events
ALTER TABLE polar_webhook_events ENABLE ROW LEVEL SECURITY;

-- Deny public and standard authenticated access; service_role only
DROP POLICY IF EXISTS "Service role has exclusive access to polar_webhook_events" ON polar_webhook_events;
CREATE POLICY "Service role has exclusive access to polar_webhook_events"
  ON polar_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure platform administrators can audit webhook delivery status
DROP POLICY IF EXISTS "Platform admins can view polar webhook events" ON polar_webhook_events;
CREATE POLICY "Platform admins can view polar webhook events"
  ON polar_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
