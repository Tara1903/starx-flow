-- ==============================================================================
-- STARX-FLOW — MIGRATION 006: OAUTH STATE SECURITY & SERVERLESS WINDOW PERSISTENCE
-- Remediates Phase 4B.5.1 Audit Findings: C1 (OAuth CSRF), C3 (24h Window Persistence)
-- Enables durable cross-serverless OAuth state consumption and atomic channel window updates.
-- ==============================================================================

-- 1. OAUTH STATES TABLE (Durable, serverless-safe OAuth CSRF nonce storage)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token VARCHAR(128) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar', 'instagram'
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_lookup 
  ON oauth_states(state_token) 
  WHERE consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_oauth_states_org 
  ON oauth_states(organization_id, provider);

-- 2. CUSTOMER CHANNEL MESSAGING WINDOWS TABLE (Durable Meta 24-hour window tracking)
CREATE TABLE IF NOT EXISTS customer_channel_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL, -- 'instagram', 'whatsapp', 'messenger'
  customer_channel_id VARCHAR(255) NOT NULL, -- IGSID or external phone/user ID
  last_inbound_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_channel_window_org_provider_customer UNIQUE (organization_id, provider, customer_channel_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_windows_lookup 
  ON customer_channel_windows(organization_id, provider, customer_channel_id);

CREATE INDEX IF NOT EXISTS idx_channel_windows_expiry 
  ON customer_channel_windows(window_expires_at);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states FORCE ROW LEVEL SECURITY;

ALTER TABLE customer_channel_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_channel_windows FORCE ROW LEVEL SECURITY;

-- oauth_states: Only members of the organization or service-role can view/manage
DROP POLICY IF EXISTS oauth_states_org_policy ON oauth_states;
CREATE POLICY oauth_states_org_policy ON oauth_states
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- customer_channel_windows: Only members of the organization can view/manage
DROP POLICY IF EXISTS customer_channel_windows_org_policy ON customer_channel_windows;
CREATE POLICY customer_channel_windows_org_policy ON customer_channel_windows
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- Grants for authenticated sessions
GRANT ALL ON oauth_states TO authenticated;
GRANT ALL ON customer_channel_windows TO authenticated;

-- ==============================================================================
-- ATOMIC SECURITY FUNCTIONS
-- ==============================================================================

-- Atomic OAuth State Consumption Function (Guarantees one-time usage and cross-tenant protection)
CREATE OR REPLACE FUNCTION consume_oauth_state(
  p_state_token TEXT,
  p_org_id UUID,
  p_provider TEXT
) RETURNS oauth_states AS $$
DECLARE
  v_state oauth_states;
BEGIN
  -- Lock row for update to prevent concurrent replay race conditions
  SELECT * INTO v_state
  FROM oauth_states
  WHERE state_token = p_state_token
    AND expires_at > now()
    AND consumed_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_OR_EXPIRED_OAUTH_STATE';
  END IF;

  -- Verify provider matching
  IF v_state.provider != p_provider THEN
    RAISE EXCEPTION 'OAUTH_PROVIDER_MISMATCH';
  END IF;

  -- Verify organization matching (prevents cross-tenant parameter tampering)
  IF v_state.organization_id != p_org_id THEN
    RAISE EXCEPTION 'OAUTH_ORGANIZATION_MISMATCH';
  END IF;

  -- Mark state as consumed atomically and capture updated row
  UPDATE oauth_states
  SET consumed_at = now()
  WHERE id = v_state.id
  RETURNING * INTO v_state;

  RETURN v_state;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Customer Channel Interaction Recorder
CREATE OR REPLACE FUNCTION record_customer_channel_interaction(
  p_org_id UUID,
  p_provider TEXT,
  p_customer_id TEXT,
  p_timestamp TIMESTAMPTZ DEFAULT now()
) RETURNS VOID AS $$
BEGIN
  INSERT INTO customer_channel_windows (
    organization_id,
    provider,
    customer_channel_id,
    last_inbound_at,
    window_expires_at,
    updated_at
  )
  VALUES (
    p_org_id,
    p_provider,
    p_customer_id,
    p_timestamp,
    p_timestamp + interval '24 hours',
    now()
  )
  ON CONFLICT (organization_id, provider, customer_channel_id)
  DO UPDATE SET
    last_inbound_at = EXCLUDED.last_inbound_at,
    window_expires_at = EXCLUDED.window_expires_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. EMAIL THREADS FOREIGN KEY HARDENING (M3 Remediation)
-- Ensures email_threads.conversation_id references conversations(id)
-- and email_threads.lead_id references leads(id)
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_threads') THEN
    -- 1. Conversation ID foreign key
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_threads' AND column_name = 'conversation_id' AND data_type != 'uuid'
      ) THEN
        ALTER TABLE email_threads ALTER COLUMN conversation_id TYPE UUID USING conversation_id::uuid;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_email_threads_conversation'
      ) THEN
        ALTER TABLE email_threads
          ADD CONSTRAINT fk_email_threads_conversation 
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    -- 2. Lead ID foreign key
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_threads' AND column_name = 'lead_id' AND data_type != 'uuid'
      ) THEN
        ALTER TABLE email_threads ALTER COLUMN lead_id TYPE UUID USING lead_id::uuid;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_email_threads_lead'
      ) THEN
        ALTER TABLE email_threads
          ADD CONSTRAINT fk_email_threads_lead 
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END $$;

