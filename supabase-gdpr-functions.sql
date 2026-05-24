-- ============================================
-- StarX OS — GDPR Data Functions
-- Supports: data export, account deletion
-- ============================================

-- Export all user data as JSON (called by edge function for GDPR data access requests)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verify the caller is the target user or an admin
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only export own data';
  END IF;

  SELECT jsonb_build_object(
    'exported_at', now(),
    'user_id', target_user_id,
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = target_user_id),
    'workflows', COALESCE((SELECT json_agg(row_to_json(w)) FROM workflows w WHERE w.user_id = target_user_id), '[]'::json),
    'leads', COALESCE((SELECT json_agg(row_to_json(l)) FROM leads l WHERE l.user_id = target_user_id), '[]'::json),
    'conversations', COALESCE((SELECT json_agg(row_to_json(c)) FROM conversations c WHERE c.user_id = target_user_id), '[]'::json),
    'bookings', COALESCE((SELECT json_agg(row_to_json(b)) FROM bookings b WHERE b.user_id = target_user_id), '[]'::json),
    'connected_channels', COALESCE((SELECT json_agg(row_to_json(ch)) FROM connected_channels ch WHERE ch.user_id = target_user_id), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- Delete all user data (called after 30-day grace period for GDPR erasure requests)
-- IMPORTANT: This is a DESTRUCTIVE operation. Only call after grace period.
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in dependency order (children before parents)
  DELETE FROM analytics_events WHERE user_id = target_user_id;
  DELETE FROM usage_records WHERE user_id = target_user_id;
  DELETE FROM invoices WHERE user_id = target_user_id;
  DELETE FROM subscriptions WHERE user_id = target_user_id;
  DELETE FROM execution_logs WHERE user_id = target_user_id;
  DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE user_id = target_user_id
  );
  DELETE FROM conversations WHERE user_id = target_user_id;
  DELETE FROM bookings WHERE user_id = target_user_id;
  DELETE FROM leads WHERE user_id = target_user_id;
  DELETE FROM workflows WHERE user_id = target_user_id;
  DELETE FROM connected_channels WHERE user_id = target_user_id;
  DELETE FROM agent_memories WHERE agent_id IN (
    SELECT id FROM agents WHERE user_id = target_user_id
  );
  DELETE FROM agents WHERE user_id = target_user_id;
  DELETE FROM business_memories WHERE user_id = target_user_id;
  DELETE FROM business_goals WHERE user_id = target_user_id;
  DELETE FROM calls WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id = target_user_id;
  -- Note: auth.users deletion must be done via Supabase Admin API (not SQL)
END;
$$;

-- ============================================
-- ROLLBACK
-- ============================================
-- DROP FUNCTION IF EXISTS export_user_data(UUID);
-- DROP FUNCTION IF EXISTS delete_user_data(UUID);
