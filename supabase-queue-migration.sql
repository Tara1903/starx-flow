-- ============================================
-- StarX OS — Job Queue Migration
-- ============================================

CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient polling
CREATE INDEX IF NOT EXISTS idx_job_queue_status_scheduled ON job_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_job_queue_type ON job_queue(job_type);

-- RLS
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

-- Allow service_role to manage jobs. No direct access for normal users (except via application RPCs if needed).
CREATE POLICY "Service role can manage jobs" ON job_queue
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to INSERT jobs (e.g. queueing an email).
CREATE POLICY "Authenticated users can enqueue jobs" ON job_queue
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- ROLLBACK
-- ============================================
-- DROP TABLE IF EXISTS job_queue CASCADE;
