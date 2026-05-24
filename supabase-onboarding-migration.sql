-- =========================================================================
-- STARX FLOW ONBOARDING SYSTEM MIGRATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Step completion tracking
  is_complete BOOLEAN DEFAULT false,
  current_step TEXT DEFAULT 'account',
  completed_steps TEXT[] DEFAULT '{}',
  skipped_steps TEXT[] DEFAULT '{}',
  
  -- AI Configuration (collected during onboarding)
  ai_business_name TEXT,
  ai_tone TEXT DEFAULT 'Friendly',
  ai_faqs JSONB DEFAULT '[]'::jsonb,
  ai_response_style TEXT DEFAULT 'conversational',
  ai_business_hours JSONB DEFAULT '{"start":"09:00","end":"17:00","timezone":"UTC","days":["Mon","Tue","Wed","Thu","Fri"]}'::jsonb,
  ai_handoff_rules TEXT DEFAULT 'Transfer to human when customer is upset or requests a manager',
  
  -- Test results
  test_whatsapp_sent BOOLEAN DEFAULT false,
  test_instagram_sent BOOLEAN DEFAULT false,
  test_sms_sent BOOLEAN DEFAULT false,
  
  -- Readiness
  readiness_score INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_active_step TEXT DEFAULT 'account',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users select own onboarding" ON onboarding_progress;
CREATE POLICY "Users select own onboarding" ON onboarding_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own onboarding" ON onboarding_progress;
CREATE POLICY "Users insert own onboarding" ON onboarding_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own onboarding" ON onboarding_progress;
CREATE POLICY "Users update own onboarding" ON onboarding_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Auto-create onboarding record on profile creation
CREATE OR REPLACE FUNCTION public.create_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.onboarding_progress (user_id) 
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created_onboarding ON profiles;
CREATE TRIGGER on_profile_created_onboarding
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_onboarding_progress();

-- 5. Helper RPC to calculate readiness score
CREATE OR REPLACE FUNCTION public.calculate_readiness(uid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  channel_count INTEGER;
BEGIN
  -- Profile complete: +15
  IF EXISTS (SELECT 1 FROM profiles WHERE id = uid
    AND business_name != 'My Business' AND owner_name != 'Owner') THEN
    score := score + 15;
  END IF;
  
  -- Each connected channel: +20 (max 60)
  SELECT COUNT(*) INTO channel_count
    FROM connected_channels WHERE user_id = uid AND is_connected = true;
  score := score + LEAST(channel_count * 20, 60);
  
  -- AI configured: +15
  IF EXISTS (SELECT 1 FROM onboarding_progress
    WHERE user_id = uid AND ai_business_name IS NOT NULL AND ai_business_name != '') THEN
    score := score + 15;
  END IF;
  
  -- Test sent: +10
  IF EXISTS (SELECT 1 FROM onboarding_progress WHERE user_id = uid
    AND (test_whatsapp_sent OR test_instagram_sent OR test_sms_sent)) THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Insert onboarding records for existing users
INSERT INTO public.onboarding_progress (user_id, is_complete)
SELECT id, true FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Revoke public execution rights on function
REVOKE EXECUTE ON FUNCTION public.create_onboarding_progress() FROM PUBLIC;
