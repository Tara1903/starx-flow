-- ==============================================================================
-- StarX-Flow: Promote or Create Super Admin User via Direct SQL
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

DO $$
DECLARE
  target_email TEXT := 'admin@starxflow.com';
  target_user_id UUID;
  target_org_id UUID;
BEGIN
  -- 1. Check if user exists in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User % does not exist in auth.users yet. Please sign up first via /signup or run scripts/create-super-admin.ts.', target_email;
  ELSE
    -- 2. Update auth metadata
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin"}'::jsonb,
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = target_user_id;

    -- 3. Upsert profile with super_admin role
    INSERT INTO public.profiles (
      id,
      email,
      owner_name,
      business_name,
      business_type,
      role,
      onboarding_complete
    ) VALUES (
      target_user_id,
      target_email,
      'Super Admin',
      'StarX Flow Command',
      'Platform Administration',
      'super_admin',
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'super_admin',
      onboarding_complete = true;

    -- 4. Upsert pro subscription
    INSERT INTO public.subscriptions (
      user_id,
      billing_provider,
      plan_id,
      status,
      billing_cycle,
      amount,
      currency,
      current_period_start,
      current_period_end
    ) VALUES (
      target_user_id,
      'polar',
      'pro',
      'active',
      'monthly',
      99,
      'USD',
      now(),
      now() + interval '1 year'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan_id = 'pro',
      status = 'active';

    -- 4. Ensure organization exists
    SELECT id INTO target_org_id
    FROM public.organizations
    WHERE created_by = target_user_id
    LIMIT 1;

    IF target_org_id IS NULL THEN
      INSERT INTO public.organizations (
        name,
        created_by,
        plan
      ) VALUES (
        'StarX Flow Platform Command',
        target_user_id,
        'pro'
      )
      RETURNING id INTO target_org_id;
    END IF;

    -- 5. Ensure owner membership
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role
    ) VALUES (
      target_org_id,
      target_user_id,
      'owner'
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = 'owner';

    RAISE NOTICE 'User % successfully promoted to super_admin (User ID: %).', target_email, target_user_id;
  END IF;
END $$;
