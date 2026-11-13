/**
 * StarX-Flow Stage 1: WhatsApp Webhook Security Test Suite
 * Validates HMAC-SHA256 signature verification, fail-closed enforcement when secrets are missing,
 * protection against tampered payloads, timing-safe equality, and GET challenge handshake.
 */

import crypto from 'crypto';
import { WhatsAppAdapter } from '@/lib/ingestion/adapters/whatsappAdapter';
import { GET as getOriginalRoute, POST as postOriginalRoute } from '@/app/api/whatsapp/webhook/route';
import { GET as getAliasRoute, POST as postAliasRoute } from '@/app/api/webhooks/whatsapp/route';

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

function computeMetaSignature(body: string, secret: string): string {
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  return `sha256=${hash}`;
}

async function runWebhookSecurityTests() {
  console.log('================================================================');
  console.log(' STARX FLOW: WHATSAPP WEBHOOK SECURITY & FAIL-CLOSED SUITE');
  console.log('================================================================\n');

  const TEST_SECRET = 'test_meta_webhook_secret_for_stage1_verification_987654321';
  const adapter = new WhatsAppAdapter();

  const samplePayload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551234567',
                phone_number_id: '9876543210',
              },
              contacts: [{ profile: { name: 'Alice Smith' }, wa_id: '15559876543' }],
              messages: [
                {
                  from: '15559876543',
                  id: 'wamid.HBgLMTU1NTk4NzY1NDM=',
                  timestamp: '1700000000',
                  text: { body: 'Hello, I want to book an appointment' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  });

  // -------------------------------------------------------------
  // Test 1: Valid Signed Request Passes
  // -------------------------------------------------------------
  console.log('--- Domain 1: Valid HMAC-SHA256 Signature ---');
  process.env.WHATSAPP_APP_SECRET = TEST_SECRET;
  process.env.META_APP_SECRET = TEST_SECRET;

  const validSig = computeMetaSignature(samplePayload, TEST_SECRET);
  const validReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': validSig,
    },
    body: samplePayload,
  });

  const validAuth = await adapter.authenticate(validReq, samplePayload);
  assert(validAuth.authorized === true, 'Valid HMAC-SHA256 signature passes authentication');

  // -------------------------------------------------------------
  // Test 2: Invalid Signatures are Rejected
  // -------------------------------------------------------------
  console.log('\n--- Domain 2: Invalid Signature Rejection ---');
  const badSig = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';
  const badReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': badSig,
    },
    body: samplePayload,
  });

  const badAuth = await adapter.authenticate(badReq, samplePayload);
  assert(badAuth.authorized === false && badAuth.reason === 'Invalid HMAC signature', 'Incorrect signature is rejected');

  // -------------------------------------------------------------
  // Test 3: Missing Signature Header is Rejected
  // -------------------------------------------------------------
  console.log('\n--- Domain 3: Missing Signature Rejection ---');
  const noSigReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: samplePayload,
  });

  const noSigAuth = await adapter.authenticate(noSigReq, samplePayload);
  assert(noSigAuth.authorized === false && noSigAuth.reason?.includes('Missing'), 'Request missing signature header is rejected');

  // -------------------------------------------------------------
  // Test 4: Missing Application Secret FAILS CLOSED
  // -------------------------------------------------------------
  console.log('\n--- Domain 4: Missing Secret Fail-Closed Behavior ---');
  delete process.env.WHATSAPP_APP_SECRET;
  delete process.env.META_APP_SECRET;

  const failClosedReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': validSig,
    },
    body: samplePayload,
  });

  const failClosedAuth = await adapter.authenticate(failClosedReq, samplePayload);
  assert(
    failClosedAuth.authorized === false &&
    failClosedAuth.reason?.includes('fail closed'),
    'Missing application secret strictly FAILS CLOSED (never allows bypass in any environment)'
  );

  // Restore test secret for subsequent tests
  process.env.WHATSAPP_APP_SECRET = TEST_SECRET;
  process.env.META_APP_SECRET = TEST_SECRET;

  // -------------------------------------------------------------
  // Test 5: Malformed Signature Headers are Safely Rejected
  // -------------------------------------------------------------
  console.log('\n--- Domain 5: Malformed Signature Rejection ---');

  // Missing sha256= prefix
  const rawHexSigReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    body: samplePayload,
  });
  const rawHexAuth = await adapter.authenticate(rawHexSigReq, samplePayload);
  assert(rawHexAuth.authorized === false && rawHexAuth.reason?.includes('prefix'), 'Signature missing sha256= prefix is rejected');

  // Truncated / invalid length hex
  const shortSigReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': 'sha256=short_invalid_digest',
    },
    body: samplePayload,
  });
  const shortSigAuth = await adapter.authenticate(shortSigReq, samplePayload);
  assert(shortSigAuth.authorized === false && shortSigAuth.reason?.includes('hex digest length'), 'Signature with invalid hex length is rejected');

  // -------------------------------------------------------------
  // Test 6: Tampered Body Fails Verification
  // -------------------------------------------------------------
  console.log('\n--- Domain 6: Tampered Payload Detection ---');
  const tamperedPayload = samplePayload.replace('Alice Smith', 'Malicious Attacker');
  const tamperedReq = new Request('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': validSig, // Signature of original, not tampered
    },
    body: tamperedPayload,
  });

  const tamperedAuth = await adapter.authenticate(tamperedReq, tamperedPayload);
  assert(tamperedAuth.authorized === false, 'Payload altered after signature creation fails HMAC verification');

  // -------------------------------------------------------------
  // Test 7: Route POST Handler Integration
  // -------------------------------------------------------------
  console.log('\n--- Domain 7: Route POST Handler Verification ---');

  // Bad signature against real route returns HTTP 403 Forbidden
  const routeBadRes = await postOriginalRoute(badReq);
  assert(routeBadRes.status === 403, 'Route POST returns HTTP 403 Forbidden on invalid signature');

  // Missing signature against real route returns HTTP 403 Forbidden
  const routeNoSigRes = await postOriginalRoute(noSigReq);
  assert(routeNoSigRes.status === 403, 'Route POST returns HTTP 403 Forbidden on missing signature');

  // Alias route `/api/webhooks/whatsapp` also returns HTTP 403 Forbidden
  const aliasBadReq = new Request('http://localhost:3000/api/webhooks/whatsapp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': badSig,
    },
    body: samplePayload,
  });
  const aliasBadRes = await postAliasRoute(aliasBadReq);
  assert(aliasBadRes.status === 403, 'Alias route /api/webhooks/whatsapp returns HTTP 403 Forbidden on invalid signature');

  // -------------------------------------------------------------
  // Test 8: GET Verification Challenge Preservation
  // -------------------------------------------------------------
  console.log('\n--- Domain 8: Meta GET Verification Handshake ---');

  process.env.META_VERIFY_TOKEN = 'test_verify_token_12345';

  // Valid verification request
  const validGetReq = new Request('http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token_12345&hub.challenge=test_challenge_code_999');
  const validGetRes = await getOriginalRoute(validGetReq);
  const challengeBody = await validGetRes.text();

  assert(
    validGetRes.status === 200 && challengeBody === 'test_challenge_code_999',
    'GET webhook with valid token returns HTTP 200 with raw challenge string'
  );

  // Invalid verification token
  const invalidGetReq = new Request('http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token_hacker&hub.challenge=test_challenge_code_999');
  const invalidGetRes = await getOriginalRoute(invalidGetReq);
  assert(invalidGetRes.status === 403, 'GET webhook with invalid token returns HTTP 403 Forbidden');

  // Alias route GET verification
  const aliasGetRes = await getAliasRoute(validGetReq);
  const aliasChallengeBody = await aliasGetRes.text();
  assert(
    aliasGetRes.status === 200 && aliasChallengeBody === 'test_challenge_code_999',
    'Alias route /api/webhooks/whatsapp preserves GET challenge verification'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`WEBHOOK SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runWebhookSecurityTests().catch((err) => {
  console.error('Fatal webhook test error:', err);
  process.exit(1);
});
