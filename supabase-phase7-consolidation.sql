-- ─────────────────────────────────────────────────────────────
-- STARX OS PHASE 7 — DATABASE HARDENING & INDEXING CONSOLIDATION
-- ─────────────────────────────────────────────────────────────

-- 1. Indexing Strategy for Tenant Isolation & Speedups
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_user_id ON execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_channels_user_id ON connected_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id ON business_goals(user_id);

-- 2. Data Archival & Cleanup Jobs Function
CREATE OR REPLACE FUNCTION delete_old_execution_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM execution_logs WHERE created_at < NOW() - INTERVAL '60 days';
  DELETE FROM calls WHERE status = 'missed' AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Administrative Audit Trails Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_id TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User Policies for Audit Logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users read own audit logs'
  ) THEN
    CREATE POLICY "Users read own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 4. Inbound Telephony Webhook Rate Limiting Structure
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_phone_created ON rate_limits(phone_number, created_at);

-- Sliding Window Rate Limiter function
CREATE OR REPLACE FUNCTION check_rate_limit(phone TEXT, limit_window INTERVAL, max_reqs INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  req_count INTEGER;
BEGIN
  -- Insert current attempt
  INSERT INTO rate_limits (phone_number) VALUES (phone);
  
  -- Count requests in window
  SELECT COUNT(*) INTO req_count FROM rate_limits 
  WHERE phone_number = phone AND created_at > NOW() - limit_window;
  
  -- Clean up old rate limit entries (housekeeping)
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Return true if within limit, false otherwise
  RETURN req_count <= max_reqs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
