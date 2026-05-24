-- =========================================================================
-- STARX FLOW PHASE 3 — WORKFLOW ENGINE MIGRATION
-- Additive migration for advanced workflow configurations
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. Add config JSONB column to workflows table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'workflows' AND column_name = 'config'
  ) THEN
    ALTER TABLE workflows ADD COLUMN config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
