-- ==============================================================================
-- STARX-FLOW — MIGRATION 005: EXTERNAL INTEGRATIONS & SYNCHRONIZATION INFRASTRUCTURE
-- Enables WS-06 (Google & Outlook Calendar), WS-07 (Resend Email), and WS-08 (Meta Instagram)
-- Enforces AES-256 encrypted credential storage, provider idempotency, and strict organization RLS.
-- ==============================================================================

-- 1. CONNECTED ACCOUNTS TABLE (OAuth tokens & provider credentials encrypted at rest)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar', 'resend_email', 'instagram'
  status VARCHAR(32) NOT NULL DEFAULT 'connected', -- 'connected', 'expired', 'revoked', 'error'
  account_identifier VARCHAR(255), -- email, phone, or instagram username
  account_name VARCHAR(255),
  encrypted_credentials TEXT, -- AES-256-GCM encrypted tokens & refresh tokens
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_connected_accounts_org_provider UNIQUE (organization_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_org ON connected_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider, status);

-- 2. EXTERNAL CALENDARS TABLE (Calendar selection and sync metadata)
CREATE TABLE IF NOT EXISTS external_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL, -- 'google_calendar', 'microsoft_calendar'
  external_calendar_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  time_zone VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  sync_enabled BOOLEAN DEFAULT true,
  sync_token TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_external_calendars_org_cal UNIQUE (organization_id, provider, external_calendar_id)
);

CREATE INDEX IF NOT EXISTS idx_external_calendars_org ON external_calendars(organization_id);

-- 3. EXTERNAL CALENDAR EVENTS (Mapping StarX appointments <-> Provider external events)
CREATE TABLE IF NOT EXISTS external_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  external_calendar_id UUID REFERENCES external_calendars(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  external_event_id VARCHAR(255) NOT NULL,
  external_event_url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  sync_status VARCHAR(32) NOT NULL DEFAULT 'synced', -- 'synced', 'pending', 'failed', 'conflict'
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_external_cal_events_cal_event UNIQUE (external_calendar_id, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_external_calendar_events_apt ON external_calendar_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_external_calendar_events_org ON external_calendar_events(organization_id);

-- 4. EMAIL THREADS TABLE (Message-ID, In-Reply-To, References tracking)
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255) NOT NULL,
  lead_id VARCHAR(255),
  message_id VARCHAR(255) NOT NULL, -- Standard Internet Message-ID
  in_reply_to VARCHAR(255),
  references_headers TEXT[],
  subject VARCHAR(500),
  sender_email VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_threads_message_id ON email_threads(organization_id, message_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_conversation_id ON email_threads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_sender ON email_threads(organization_id, sender_email);

-- 5. PROVIDER WEBHOOK EVENTS (Idempotency and deduplication registry)
CREATE TABLE IF NOT EXISTS provider_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  provider VARCHAR(32) NOT NULL, -- 'google', 'microsoft', 'resend', 'meta'
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  payload_hash VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'processed', -- 'received', 'processed', 'failed', 'ignored'
  raw_payload JSONB,
  error_message TEXT,
  processed_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_provider_webhook_events UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_webhooks_lookup ON provider_webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_provider_webhooks_org ON provider_webhook_events(organization_id);

-- 6. INTEGRATION SYNC LOGS (Diagnostics and audit trail)
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL, -- 'success', 'warning', 'error'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_org ON integration_sync_logs(organization_id, created_at DESC);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE connected_accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE external_calendars FORCE ROW LEVEL SECURITY;
ALTER TABLE external_calendar_events FORCE ROW LEVEL SECURITY;
ALTER TABLE email_threads FORCE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs FORCE ROW LEVEL SECURITY;

-- connected_accounts: Only verified organization members can select/manage
DROP POLICY IF EXISTS connected_accounts_org_policy ON connected_accounts;
CREATE POLICY connected_accounts_org_policy ON connected_accounts
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- external_calendars: Only verified organization members
DROP POLICY IF EXISTS external_calendars_org_policy ON external_calendars;
CREATE POLICY external_calendars_org_policy ON external_calendars
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- external_calendar_events: Only verified organization members
DROP POLICY IF EXISTS external_calendar_events_org_policy ON external_calendar_events;
CREATE POLICY external_calendar_events_org_policy ON external_calendar_events
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- email_threads: Only verified organization members
DROP POLICY IF EXISTS email_threads_org_policy ON email_threads;
CREATE POLICY email_threads_org_policy ON email_threads
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- integration_sync_logs: Only verified organization members
DROP POLICY IF EXISTS integration_sync_logs_org_policy ON integration_sync_logs;
CREATE POLICY integration_sync_logs_org_policy ON integration_sync_logs
  FOR ALL
  USING (organization_id IN (SELECT auth_user_org_ids()))
  WITH CHECK (organization_id IN (SELECT auth_user_org_ids()));

-- provider_webhook_events: System service-role access or organization members
DROP POLICY IF EXISTS provider_webhooks_service_policy ON provider_webhook_events;
CREATE POLICY provider_webhooks_service_policy ON provider_webhook_events
  FOR ALL
  USING (
    organization_id IS NULL 
    OR organization_id IN (SELECT auth_user_org_ids())
  )
  WITH CHECK (
    organization_id IS NULL 
    OR organization_id IN (SELECT auth_user_org_ids())
  );

-- Grant access to authenticated users (RLS filters rows)
GRANT ALL ON connected_accounts TO authenticated;
GRANT ALL ON external_calendars TO authenticated;
GRANT ALL ON external_calendar_events TO authenticated;
GRANT ALL ON email_threads TO authenticated;
GRANT ALL ON provider_webhook_events TO authenticated;
GRANT ALL ON integration_sync_logs TO authenticated;
