/**
 * StarX-Flow Stage 1: Comprehensive Billing Entitlement & Canonical Plan Test Suite
 * Validates single source of truth across canonical plans, public pricing,
 * Polar product IDs, store consistency, server-authoritative entitlements,
 * and legacy tier normalization.
 */

import fs from 'fs';
import path from 'path';

// Load .env keys safely into process.env for local test runner
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

import {
  CANONICAL_PLANS,
  POLAR_PRODUCT_IDS,
  normalizePlanId,
  getPlanById,
  getPlanByPolarProductId,
  isPaidPlan,
  formatPlanPrice,
} from '@/lib/plans';
import { POLAR_PLANS, POLAR_PRODUCT_TO_PLAN } from '@/lib/polar';
import { PLANS as BILLING_STORE_PLANS } from '@/store/billingStore';
import { CONFIGURABLE_PLANS, UsageService } from '@/lib/usage/usageService';
import { POST as checkoutPOST } from '@/app/api/billing/checkout/route';

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

async function runBillingTests() {
  console.log('================================================================');
  console.log(' STARX FLOW: BILLING ENTITLEMENTS & CANONICAL PLAN SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Canonical Plan Resolutions & Pricing Integrity
  // -------------------------------------------------------------
  console.log('--- Domain 1: Canonical Plans & Pricing Integrity ---');

  const starterPlan = getPlanById('starter');
  assert(
    starterPlan.id === 'starter' &&
    starterPlan.name === 'Starter' &&
    starterPlan.price === 29 &&
    starterPlan.priceInCents === 2900 &&
    starterPlan.currency === 'USD',
    'Starter plan resolves to $29/mo (2900 cents USD)'
  );

  const growthPlan = getPlanById('growth');
  assert(
    growthPlan.id === 'growth' &&
    growthPlan.name === 'Growth' &&
    growthPlan.price === 59 &&
    growthPlan.priceInCents === 5900 &&
    growthPlan.currency === 'USD',
    'Growth plan resolves to $59/mo (5900 cents USD)'
  );

  const proPlan = getPlanById('pro');
  assert(
    proPlan.id === 'pro' &&
    proPlan.name === 'Pro' &&
    proPlan.price === 99 &&
    proPlan.priceInCents === 9900 &&
    proPlan.currency === 'USD',
    'Pro plan resolves to $99/mo (9900 cents USD)'
  );

  const freePlan = getPlanById('free');
  assert(
    freePlan.id === 'free' &&
    freePlan.price === 0 &&
    freePlan.priceInCents === 0,
    'Free trial plan resolves to $0/mo'
  );

  // -------------------------------------------------------------
  // Test 2: Polar Product Mapping Alignment
  // -------------------------------------------------------------
  console.log('\n--- Domain 2: Polar Product Mapping Alignment ---');

  assert(
    POLAR_PLANS.starter.priceAmount === 29 &&
    POLAR_PLANS.growth.priceAmount === 59 &&
    POLAR_PLANS.pro.priceAmount === 99,
    'POLAR_PLANS matches canonical pricing amounts ($29, $59, $99)'
  );

  assert(
    POLAR_PRODUCT_TO_PLAN[POLAR_PRODUCT_IDS.starter] === 'starter',
    'Polar Starter product UUID resolves to starter plan key'
  );

  assert(
    POLAR_PRODUCT_TO_PLAN[POLAR_PRODUCT_IDS.growth] === 'growth',
    'Polar Growth product UUID resolves to growth plan key'
  );

  assert(
    POLAR_PRODUCT_TO_PLAN[POLAR_PRODUCT_IDS.pro] === 'pro',
    'Polar Pro product UUID resolves to pro plan key'
  );

  // -------------------------------------------------------------
  // Test 3: Billing Store Consistency
  // -------------------------------------------------------------
  console.log('\n--- Domain 3: Billing Store Consistency ---');

  assert(
    BILLING_STORE_PLANS.starter.price === 29 &&
    BILLING_STORE_PLANS.growth.price === 59 &&
    BILLING_STORE_PLANS.pro.price === 99,
    'billingStore.ts PLANS matches canonical prices ($29, $59, $99), eliminating legacy $47/$97'
  );

  assert(
    BILLING_STORE_PLANS.starter.limits.contacts === 1000 &&
    BILLING_STORE_PLANS.growth.limits.contacts === 5000 &&
    BILLING_STORE_PLANS.pro.limits.contacts === 25000,
    'billingStore.ts contact limits match canonical quotas'
  );

  // -------------------------------------------------------------
  // Test 4: Server-Side Entitlement Metering Consistency
  // -------------------------------------------------------------
  console.log('\n--- Domain 4: UsageService & Entitlement Quotas ---');

  assert(
    CONFIGURABLE_PLANS.starter.priceEur === 29 &&
    CONFIGURABLE_PLANS.growth.priceEur === 59 &&
    CONFIGURABLE_PLANS.pro.priceEur === 99,
    'usageService CONFIGURABLE_PLANS prices match canonical prices'
  );

  assert(
    CONFIGURABLE_PLANS.starter.limits.ai_requests === 1000 &&
    CONFIGURABLE_PLANS.growth.limits.ai_requests === 5000 &&
    CONFIGURABLE_PLANS.pro.limits.ai_requests === 25000,
    'usageService ai_requests quotas match canonical tier limits'
  );

  // -------------------------------------------------------------
  // Test 5: Legacy Plan Alias & Normalization Safety
  // -------------------------------------------------------------
  console.log('\n--- Domain 5: Normalization & Legacy Compatibility ---');

  assert(normalizePlanId('STARTER') === 'starter', 'Case-insensitive normalization handles uppercase');
  assert(normalizePlanId(' growth ') === 'growth', 'Trimming whitespace normalization handles growth');
  assert(normalizePlanId('enterprise') === 'pro', 'Legacy enterprise identifier normalizes safely to pro');
  assert(normalizePlanId('free') === 'free', 'Free normalizes to free');
  assert(normalizePlanId('unknown_tier_xyz') === 'free', 'Unknown tier safely defaults to free, never elevating privilege');

  assert(isPaidPlan('starter') === true, 'Starter is classified as paid plan');
  assert(isPaidPlan('growth') === true, 'Growth is classified as paid plan');
  assert(isPaidPlan('pro') === true, 'Pro is classified as paid plan');
  assert(isPaidPlan('free') === false, 'Free is classified as non-paid plan');
  assert(isPaidPlan('unknown_garbage') === false, 'Unknown inputs are classified as non-paid');

  // -------------------------------------------------------------
  // Test 6: Server-Authoritative Entitlement Enforcement
  // -------------------------------------------------------------
  console.log('\n--- Domain 6: Server-Authoritative Quota Enforcement ---');

  // Test entitlement check when under quota
  const checkWithin = await UsageService.checkEntitlement('test_user_free', 'ai_requests', 1, null, 'free');
  assert(checkWithin.allowed === true && !checkWithin.quotaExceeded, 'User within free quota is allowed access');

  // Test entitlement check when exceeding quota
  const checkExceeded = await UsageService.checkEntitlement('test_user_free', 'ai_requests', 99999, null, 'free');
  assert(checkExceeded.allowed === false && checkExceeded.quotaExceeded, 'User exceeding quota is blocked by server-authoritative check');

  // Test unlimited tier allowance
  const checkUnlimited = await UsageService.checkEntitlement('test_user_pro', 'workflows', 1000, null, 'pro');
  assert(checkUnlimited.allowed === true, 'Unlimited tier quota (-1) allows operations without limit');

  // -------------------------------------------------------------
  // Test 7: Checkout Route Plan Validation
  // -------------------------------------------------------------
  console.log('\n--- Domain 7: Checkout Route Plan Gating ---');

  // Unauthenticated checkout is rejected
  const unauthCheckout = await checkoutPOST(new Request('http://localhost:3000/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: 'growth' }),
  }));
  assert(unauthCheckout.status === 401, 'Checkout endpoint rejects unauthenticated request with 401');

  // -------------------------------------------------------------
  // Test 8: Price Formatting & Integer Units
  // -------------------------------------------------------------
  console.log('\n--- Domain 8: Currency and Price Formatting ---');

  assert(formatPlanPrice('starter') === '$29/month', 'Starter formatted price is $29/month');
  assert(formatPlanPrice('growth') === '$59/month', 'Growth formatted price is $59/month');
  assert(formatPlanPrice('pro') === '$99/month', 'Pro formatted price is $99/month');

  console.log('\n----------------------------------------------------------------');
  console.log(`BILLING TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runBillingTests().catch((err) => {
  console.error('Fatal billing test error:', err);
  process.exit(1);
});
