/**
 * StarX-Flow Super Admin Verification Test Suite
 * Validates super admin authorization, profile role, permissions, and database records.
 */

import fs from 'fs';
import path from 'path';

// 1. Load environment variables
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          val = val.replace(/^["'](.*)["']$/, '$1').trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runSuperAdminTests() {
  console.log('================================================================');
  console.log(' STARX FLOW: SUPER ADMIN USER VERIFICATION SUITE');
  console.log('================================================================\n');

  const targetEmail = 'admin@starxflow.com';

  // 1. Check auth.users
  const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  assert(!listErr && Boolean(userList?.users), 'Supabase Auth Admin listUsers succeeds');

  const authUser = userList?.users?.find((u) => u.email?.toLowerCase() === targetEmail);
  assert(Boolean(authUser), `Super admin user ${targetEmail} exists in auth.users`);
  assert(Boolean(authUser?.email_confirmed_at), 'Super admin email is confirmed');

  if (!authUser) {
    console.error('Fatal: Cannot continue tests without auth user');
    process.exit(1);
  }

  // 2. Check profiles record
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  assert(!profileErr && Boolean(profile), 'Super admin profile record exists in public.profiles');
  assert(profile?.role === 'super_admin', 'Profile role is explicitly set to super_admin');
  assert(profile?.business_name === 'StarX Flow Command', 'Profile business name is StarX Flow Command');
  assert(profile?.onboarding_complete === true, 'Onboarding is marked complete for super admin');

  // 3. Check subscriptions record
  const { data: sub, error: subErr } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', authUser.id)
    .single();

  assert(!subErr && Boolean(sub), 'Super admin has an active platform subscription');
  assert(sub?.plan_id === 'pro', 'Subscription tier is Pro');
  assert(sub?.status === 'active', 'Subscription status is active');

  // 4. Check organization membership
  const { data: memberships, error: memberErr } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', authUser.id);

  assert(!memberErr && Boolean(memberships && memberships.length > 0), 'Super admin is assigned to platform organization');
  assert(memberships?.[0]?.role === 'owner', 'Organization membership role is owner');

  console.log('\n----------------------------------------------------------------');
  console.log(`SUPER ADMIN VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuperAdminTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
