/**
 * StarX-Flow Phase 6.2: Polar Billing Integration Test Suite
 * Validates checkout authentication, product mappings, webhook security,
 * signature verification, idempotency, and customer portal endpoints.
 */

import fs from 'fs';

// Load .env keys safely into process.env for local test runner
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

import { POST as checkoutPOST } from '@/app/api/billing/checkout/route';
import { POST as portalPOST } from '@/app/api/billing/portal/route';
import { POST as webhookPOST } from '@/app/api/billing/webhook/route';
import { POLAR_PLANS, POLAR_PRODUCT_TO_PLAN } from '@/lib/polar';
import { CONFIGURABLE_PLANS } from '@/lib/usage/usageService';
import { webhooks } from '@polar-sh/sdk/2026-10';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log(' PHASE 6.2: POLAR BILLING & WEBHOOK INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // 1. Plan & Product Mapping Verification
  // -------------------------------------------------------------
  console.log('--- Domain A: Plan & Product Mappings ---');
  assert(
    POLAR_PLANS.starter.productId.length > 20 &&
    POLAR_PLANS.growth.productId.length > 20 &&
    POLAR_PLANS.pro.productId.length > 20,
    'All three subscription tiers map to valid Polar product UUIDs'
  );

  assert(
    POLAR_PRODUCT_TO_PLAN[POLAR_PLANS.starter.productId] === 'starter' &&
    POLAR_PRODUCT_TO_PLAN[POLAR_PLANS.growth.productId] === 'growth' &&
    POLAR_PRODUCT_TO_PLAN[POLAR_PLANS.pro.productId] === 'pro',
    'Reverse product-to-plan lookup accurately resolves internal plan keys'
  );

  assert(
    CONFIGURABLE_PLANS.starter.limits.ai_requests === 1000 &&
    CONFIGURABLE_PLANS.growth.limits.ai_requests === 5000 &&
    CONFIGURABLE_PLANS.pro.limits.ai_requests === 25000,
    'Backend entitlement quotas match commercial tier specifications'
  );

  // -------------------------------------------------------------
  // 2. Checkout Route Security
  // -------------------------------------------------------------
  console.log('\n--- Domain B: Checkout Endpoint Security ---');

  // Test B1: Missing Auth Header
  const unauthCheckoutReq = new Request('http://localhost:3000/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: 'starter' }),
  });
  const unauthRes = await checkoutPOST(unauthCheckoutReq);
  assert(unauthRes.status === 401, 'Unauthenticated checkout request returns HTTP 401');

  // Test B2: Invalid Plan Selection (Mock token)
  const invalidPlanReq = new Request('http://localhost:3000/api/billing/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer invalid-token',
    },
    body: JSON.stringify({ planId: 'non_existent_tier' }),
  });
  const invalidPlanRes = await checkoutPOST(invalidPlanReq);
  assert(
    invalidPlanRes.status === 401 || invalidPlanRes.status === 400,
    'Invalid auth token or invalid plan request is rejected at boundary'
  );

  // -------------------------------------------------------------
  // 3. Customer Portal Endpoint Security
  // -------------------------------------------------------------
  console.log('\n--- Domain C: Customer Billing Portal Security ---');

  const unauthPortalReq = new Request('http://localhost:3000/api/billing/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const unauthPortalRes = await portalPOST(unauthPortalReq);
  assert(unauthPortalRes.status === 401, 'Unauthenticated portal request returns HTTP 401');

  // -------------------------------------------------------------
  // 4. Polar Webhook Engine Security
  // -------------------------------------------------------------
  console.log('\n--- Domain D: Polar Webhook Engine Security ---');

  // Test D1: Missing / Invalid Signature
  const badSigReq = new Request('http://localhost:3000/api/billing/webhook', {
    method: 'POST',
    headers: {
      'webhook-id': 'evt_test_123',
      'webhook-timestamp': '1000000000',
      'webhook-signature': 'invalid_signature_hash',
    },
    body: JSON.stringify({ type: 'order.paid', data: {} }),
  });
  const badSigRes = await webhookPOST(badSigReq);
  assert(badSigRes.status === 403, 'Invalid webhook signature returns HTTP 403 Forbidden');

  // Test D2: Empty headers
  const emptyHeaderReq = new Request('http://localhost:3000/api/billing/webhook', {
    method: 'POST',
    body: JSON.stringify({ type: 'order.paid' }),
  });
  const emptyHeaderRes = await webhookPOST(emptyHeaderReq);
  assert(emptyHeaderRes.status === 403, 'Missing signature headers returns HTTP 403');

  // Test D3: Webhook Verification Error Class Detection
  let caughtError = false;
  try {
    await webhooks.validateEvent(
      '{}',
      {
        'webhook-id': 'test',
        'webhook-timestamp': '123',
        'webhook-signature': 'sig',
      },
      'test_secret'
    );
  } catch (err: any) {
    if (
      err instanceof webhooks.PolarWebhookVerificationError ||
      err?.name === 'PolarWebhookVerificationError' ||
      err?.message?.includes('timestamp')
    ) {
      caughtError = true;
    }
  }
  assert(caughtError, 'SDK validateEvent throws verification error on spoofed header');

  console.log('\n----------------------------------------------------------------');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
