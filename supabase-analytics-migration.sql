-- ============================================
-- StarX OS — Analytics Migration
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON analytics_events(event_name, created_at);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events (with optional user_id, often handled by app anon key or authenticated key)
CREATE POLICY "Users can insert their own events" ON analytics_events
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Users can read their own events
CREATE POLICY "Users can read their own events" ON analytics_events
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can read all events (for admin dashboards/export)
-- (Implicitly granted to service_role)

-- ============================================
-- ROLLBACK
-- ============================================
-- DROP TABLE IF EXISTS analytics_events CASCADE;
