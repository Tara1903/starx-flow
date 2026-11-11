-- ==============================================================================
-- Migration 013: 8-Character OTP Verification and Security Ledger
-- Replaces magic link authentication with strictly 8-character OTP codes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS auth_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for speedy queries on active unconsumed OTPs
CREATE INDEX IF NOT EXISTS idx_auth_otps_email_active
  ON auth_otps(email, expires_at)
  WHERE consumed_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE auth_otps ENABLE ROW LEVEL SECURITY;

-- Server-only access: only service_role key can read/write OTP records
DROP POLICY IF EXISTS "Service role manages all auth otps" ON auth_otps;
CREATE POLICY "Service role manages all auth otps"
  ON auth_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
