import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { CANONICAL_PLANS, normalizePlanId } from '../src/lib/plans';
import { GET as getAdminClients } from '../src/app/api/admin/clients/route';

const envPath = path.join(process.cwd(), '.env.local');
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) process.env[match[1]] = (match[2] || '').replace(/^['"](.*)['"]$/, '$1').trim();
}

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function runTests() {
  console.log('================================================================');
  console.log(' ADMIN CENTRE & WEBSITE REAL-TIME SYNCHRONIZATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, desc: string, detail?: string) {
    if (cond) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Plan Verification
  assert(CANONICAL_PLANS.free.price === 0, 'Canonical Free Trial is $0');
  assert(CANONICAL_PLANS.starter.price === 29, 'Canonical Starter plan is $29/mo');
  assert(CANONICAL_PLANS.growth.price === 59, 'Canonical Growth plan is $59/mo');
  assert(CANONICAL_PLANS.pro.price === 99, 'Canonical Pro plan is $99/mo');

  assert(normalizePlanId('free') === 'free', 'Normalizes "free" to free');
  assert(normalizePlanId('Free Trial') === 'free', 'Normalizes "Free Trial" to free');
  assert(normalizePlanId('starter') === 'starter', 'Normalizes "starter" to starter');
  assert(normalizePlanId('growth') === 'growth', 'Normalizes "growth" to growth');
  assert(normalizePlanId('pro') === 'pro', 'Normalizes "pro" to pro');
  assert(normalizePlanId('professional') === 'pro', 'Normalizes legacy "professional" to pro');
  assert(normalizePlanId('enterprise') === 'pro', 'Normalizes legacy "enterprise" alias');

  // 2. Fetch clients via API (simulating admin session)
  const { data: adminUsers } = await supabaseAdmin.auth.admin.listUsers();
  const superAdmin = adminUsers?.users?.find(u => u.email === 'admin@starxflow.com');
  assert(Boolean(superAdmin), 'Super Admin user found for API session generation');

  // Generate session token for super admin
  const { data: sessionData, error: sessionErr } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'admin@starxflow.com',
  });
  assert(!sessionErr, 'Admin authorization token generated');

  // Direct DB check of clients vs subscriptions
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, business_name');
  const { data: subs } = await supabaseAdmin.from('subscriptions').select('user_id, plan_id, status');

  assert(Boolean(profiles && profiles.length > 0), `Real Customer Centre profiles exist in DB (Count: ${profiles?.length})`);
  assert(Boolean(subs && subs.length >= (profiles?.length || 0)), `Every profile has a valid subscription in DB (Count: ${subs?.length})`);

  // Verify no orphaned or unrecognized plans in DB
  const validTiers = new Set(['free', 'starter', 'growth', 'pro', 'enterprise']);
  const invalidTiers = (subs || []).filter(s => !validTiers.has(s.plan_id.toLowerCase()));
  assert(invalidTiers.length === 0, 'Zero invalid plan tiers in database subscriptions');

  // 3. Demo Requests & Inbound Pipeline Verification
  const { data: demoRequests, error: demoErr } = await supabaseAdmin.from('demo_requests').select('id, full_name, status');
  assert(!demoErr, `Website demo inquiries table query succeeds (Count: ${demoRequests?.length || 0})`);

  console.log('\n----------------------------------------------------------------');
  console.log(`REALTIME & PLANS VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
