/**
 * StarX-Flow Phase 4B.5.4 Comprehensive Security Remediation Verification Suite
 * Tests all unresolved Critical, High, and Medium findings from Phase 4B.5.3 audit:
 *
 * 1. C1: OAuth Authenticated-Session Binding & Cookie Nonce Affinity
 * 2. H2: Atomic Resend Webhook Idempotency (20-Worker Concurrency Stress Test)
 * 3. C2: Email Subaddress Tenant Validation & Cross-Tenant Conflict Isolation
 * 4. Connected Account Identifier Collision Prevention
 * 5. C3: Legacy One-Argument Fallback Complete Removal
 */

import assert from 'assert';
import crypto from 'crypto';
import { OAuthStateManager } from '../src/lib/security/oauthState';
import { ResendEmailAdapter } from '../src/lib/integrations/email/resendEmailAdapter';
import { InstagramAdapter } from '../src/lib/integrations/instagram/instagramAdapter';
import { ToolExecutor } from '../src/lib/ai/tools';

async function runPhase4B54SecurityTests() {
  console.log('========================================================================');
  console.log('STARX-FLOW PHASE 4B.5.4 — TARGETED SECURITY REMEDIATION VERIFICATION');
  console.log('========================================================================');

  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const testOrgA = '11111111-1111-4111-8111-111111111111';
  const testOrgB = '22222222-2222-4222-8222-222222222222';
  const testUserA = 'user-auth-alpha-001';
  const testUserB = 'user-auth-beta-002';

  // =========================================================================
  // 1. C1: OAUTH AUTHENTICATED-SESSION BINDING TESTS
  // =========================================================================
  console.log('\n--- [TEST SUITE 1] C1: OAuth Authenticated-Session Binding ---');

  // 1.1 Correct session binding succeeds
  const bindingA = await OAuthStateManager.generateStateWithBinding({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });

  const verifiedSessionA = await OAuthStateManager.verifyAndConsumeState({
    stateParam: bindingA.state,
    expectedProvider: 'google_calendar',
    expectedOrgId: testOrgA,
    expectedUserId: testUserA,
    sessionBindingSecret: bindingA.sessionBindingSecret,
    expectedRedirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  testAssert(verifiedSessionA.organizationId === testOrgA, 'Correct session with authentic cookie consumes OAuth state');

  // 1.2 Different browser session (missing cookie) is strictly blocked
  const bindingMissingCookie = await OAuthStateManager.generateStateWithBinding({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  let missingCookieBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: bindingMissingCookie.state,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgA,
      expectedUserId: testUserA,
      sessionBindingSecret: undefined, // Missing cookie in different browser session
    });
  } catch (err: any) {
    missingCookieBlocked = err.message.includes('Missing session binding cookie');
  }
  testAssert(missingCookieBlocked, 'Missing session binding cookie in foreign browser session is blocked');

  // 1.3 Tampered / mismatched session cookie is strictly blocked
  let tamperedCookieBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: bindingMissingCookie.state,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgA,
      expectedUserId: testUserA,
      sessionBindingSecret: 'forged_session_binding_secret_attacker',
    });
  } catch (err: any) {
    tamperedCookieBlocked = err.message.includes('session binding mismatch');
  }
  testAssert(tamperedCookieBlocked, 'Forged / mismatched session binding cookie is blocked');

  // 1.4 Different authenticated user (initiator User A, callback User B) is blocked
  const bindingUserCheck = await OAuthStateManager.generateStateWithBinding({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  let crossUserBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: bindingUserCheck.state,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgA,
      expectedUserId: testUserB, // Different user logged in at callback
      sessionBindingSecret: bindingUserCheck.sessionBindingSecret,
    });
  } catch (err: any) {
    crossUserBlocked = err.message.includes('Cross-user OAuth state consumption rejected');
  }
  testAssert(crossUserBlocked, 'Cross-user OAuth state consumption rejected');

  // 1.5 Cross-organization membership switch / tampering is blocked
  let crossOrgBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: bindingUserCheck.state,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgB, // Org Beta trying to consume Org Alpha's state
      expectedUserId: testUserA,
      sessionBindingSecret: bindingUserCheck.sessionBindingSecret,
    });
  } catch (err: any) {
    crossOrgBlocked = err.message.includes('Cross-organization OAuth state substitution rejected');
  }
  testAssert(crossOrgBlocked, 'Cross-organization OAuth state substitution rejected');

  // 1.6 Tampered HMAC signature on state token is blocked
  const tamperedState = bindingUserCheck.state.substring(0, bindingUserCheck.state.length - 4) + 'abcd';
  let tamperedSigBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: tamperedState,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgA,
      expectedUserId: testUserA,
      sessionBindingSecret: bindingUserCheck.sessionBindingSecret,
    });
  } catch (err: any) {
    tamperedSigBlocked = err.message.includes('signature mismatch');
  }
  testAssert(tamperedSigBlocked, 'Cryptographic signature mismatch on altered state rejected');

  // 1.7 Simultaneous OAuth flows in same browser get independent cookies
  const flowGoogle = await OAuthStateManager.generateStateWithBinding({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  const flowMicrosoft = await OAuthStateManager.generateStateWithBinding({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'microsoft_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/microsoft/oauth/callback',
  });

  testAssert(flowGoogle.cookieName !== flowMicrosoft.cookieName, 'Simultaneous Google & Microsoft flows have independent cookie names');
  testAssert(flowGoogle.cookieName.startsWith('starx_oauth_google_calendar_'), 'Google cookie correctly namespaced with provider & nonce prefix');
  testAssert(flowMicrosoft.cookieName.startsWith('starx_oauth_microsoft_calendar_'), 'Microsoft cookie correctly namespaced with provider & nonce prefix');

  // Both simultaneous flows consume independently without collision
  const consumedGoogle = await OAuthStateManager.verifyAndConsumeState({
    stateParam: flowGoogle.state,
    expectedProvider: 'google_calendar',
    expectedOrgId: testOrgA,
    expectedUserId: testUserA,
    sessionBindingSecret: flowGoogle.sessionBindingSecret,
  });
  const consumedMs = await OAuthStateManager.verifyAndConsumeState({
    stateParam: flowMicrosoft.state,
    expectedProvider: 'microsoft_calendar',
    expectedOrgId: testOrgA,
    expectedUserId: testUserA,
    sessionBindingSecret: flowMicrosoft.sessionBindingSecret,
  });
  testAssert(consumedGoogle.provider === 'google_calendar', 'Simultaneous Google flow consumes without collision');
  testAssert(consumedMs.provider === 'microsoft_calendar', 'Simultaneous Microsoft flow consumes without collision');

  // =========================================================================
  // 2. H2: ATOMIC WEBHOOK IDEMPOTENCY & 20-WORKER CONCURRENCY STRESS TEST
  // =========================================================================
  console.log('\n--- [TEST SUITE 2] H2: Atomic Webhook Idempotency & 20-Worker Concurrency ---');

  ResendEmailAdapter.clearSimulated();
  ResendEmailAdapter.registerActiveOrganization(testOrgA);
  const emailAdapter = new ResendEmailAdapter();

  const concurrentEventId = `<unique-concurrent-msg-${Date.now()}@corporate.de>`;
  const concurrentPayload = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_race_${Date.now()}`,
      message_id: concurrentEventId,
      from: 'alex.mueller@corporate.de',
      to: [`inbox+${testOrgA}@starx-flow.com`],
      subject: 'Urgent Consultation Scheduling',
      text: 'Can we book a strategy session for Friday at 15:00?',
    },
  };

  // Launch 20 simultaneous concurrent deliveries of the EXACT same webhook event
  const CONCURRENCY_COUNT = 20;
  const deliveryPromises = Array.from({ length: CONCURRENCY_COUNT }).map(() =>
    emailAdapter.processInboundWebhook(concurrentPayload as any)
  );

  const deliveryResults = await Promise.all(deliveryPromises);

  const processedCount = deliveryResults.filter((r) => r.status === 'processed' && r.processed === true).length;
  const ignoredCount = deliveryResults.filter((r) => r.status === 'duplicate_ignored' && r.processed === false).length;

  testAssert(processedCount === 1, `Exactly ONE delivery claimed and processed among ${CONCURRENCY_COUNT} concurrent requests`);
  testAssert(ignoredCount === CONCURRENCY_COUNT - 1, `Exactly ${CONCURRENCY_COUNT - 1} concurrent duplicates safely ignored without processing`);

  const sentReplies = ResendEmailAdapter.getSentEmails();
  testAssert(sentReplies.length === 1, 'Exactly ONE customer-facing auto-reply dispatched across all concurrent requests');

  // 2.2 Concurrent deliveries with DIFFERENT event IDs do not block each other
  const distinctEventPromises = Array.from({ length: 5 }).map((_, idx) => {
    const distinctId = `<distinct-msg-${idx}-${Date.now()}@firm.de>`;
    return emailAdapter.processInboundWebhook({
      type: 'email.received',
      created_at: new Date().toISOString(),
      data: {
        email_id: `email_distinct_${idx}_${Date.now()}`,
        message_id: distinctId,
        from: `client-${idx}@firm.de`,
        to: [`inbox+${testOrgA}@starx-flow.com`],
        subject: `Distinct Inquiry ${idx}`,
        text: `Hello ${idx}`,
      },
    } as any);
  });

  const distinctResults = await Promise.all(distinctEventPromises);
  const distinctProcessed = distinctResults.filter((r) => r.status === 'processed' && r.processed === true).length;
  testAssert(distinctProcessed === 5, '5 concurrent distinct event IDs all successfully claimed and processed');

  // =========================================================================
  // 3. C2: EMAIL SUBADDRESS TENANT VALIDATION & CONFLICT ISOLATION
  // =========================================================================
  console.log('\n--- [TEST SUITE 3] C2: Email Subaddress Tenant Validation & Conflict Isolation ---');

  // Register active organization A, disabled organization B, and unprovisioned organization C
  const disabledOrg = '33333333-3333-4333-8333-333333333333';
  const unprovisionedOrg = '44444444-4444-4444-8444-444444444444';
  ResendEmailAdapter.registerActiveOrganization(disabledOrg, { status: 'disabled', inboxProvisioned: true });
  ResendEmailAdapter.registerActiveOrganization(unprovisionedOrg, { status: 'active', inboxProvisioned: false });

  // 3.1 Nonexistent organization UUID in subaddress is quarantined
  const nonexistentOrgId = '99999999-9999-4999-8999-999999999999';
  const nonexistentEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_nonexistent_${Date.now()}`,
      from: 'hacker@adversary.com',
      to: [`inbox+${nonexistentOrgId}@starx-flow.com`],
      subject: 'Injection Probe',
      text: 'Trying to inject non-existent organization',
    },
  };
  const nonexistentRes = await emailAdapter.processInboundWebhook(nonexistentEmail as any);
  testAssert(nonexistentRes.quarantined === true, 'Subaddress with nonexistent organization UUID is quarantined');

  // 3.2 Malformed organization string in subaddress is quarantined
  const malformedEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_malformed_${Date.now()}`,
      from: 'spammer@random.com',
      to: ['inbox+../../etc/passwd@starx-flow.com'],
      subject: 'Path Traversal Probe',
      text: 'Traversal attempt',
    },
  };
  const malformedRes = await emailAdapter.processInboundWebhook(malformedEmail as any);
  testAssert(malformedRes.quarantined === true, 'Subaddress with malformed organization string is quarantined');

  // 3.3 Disabled organization in subaddress is quarantined
  const disabledEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_disabled_${Date.now()}`,
      from: 'customer@client.de',
      to: [`inbox+${disabledOrg}@starx-flow.com`],
      subject: 'Inquiry to Closed Business',
      text: 'Hello?',
    },
  };
  const disabledRes = await emailAdapter.processInboundWebhook(disabledEmail as any);
  testAssert(disabledRes.quarantined === true, 'Subaddress targeting disabled organization is quarantined');

  // 3.4 Unprovisioned inbox in subaddress is quarantined
  const unprovisionedEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_unprovisioned_${Date.now()}`,
      from: 'customer@client.de',
      to: [`inbox+${unprovisionedOrg}@starx-flow.com`],
      subject: 'Inquiry to Unprovisioned Org',
      text: 'Are you open?',
    },
  };
  const unprovisionedRes = await emailAdapter.processInboundWebhook(unprovisionedEmail as any);
  testAssert(unprovisionedRes.quarantined === true, 'Subaddress targeting unprovisioned inbox is quarantined');

  // 3.5 Cross-tenant conflict: In-Reply-To belongs to Org A, but subaddress is Org B
  const threadMsgId = `<thread-alpha-exclusive-${Date.now()}@starx-flow.com>`;
  ResendEmailAdapter.recordThread(threadMsgId, {
    organizationId: testOrgA,
    conversationId: 'convo-alpha-exclusive',
    leadId: 'lead-alpha-exclusive',
    subject: 'Alpha Consulting',
  });
  ResendEmailAdapter.registerActiveOrganization(testOrgB, { status: 'active', inboxProvisioned: true });

  const crossTenantConflictEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_conflict_${Date.now()}`,
      from: 'customer@client.de',
      to: [`inbox+${testOrgB}@starx-flow.com`], // Addressed to Org B
      in_reply_to: threadMsgId, // But thread belongs to Org A!
      subject: 'Re: Alpha Consulting',
      text: 'Conflicting cross-tenant headers',
    },
  };
  const conflictRes = await emailAdapter.processInboundWebhook(crossTenantConflictEmail as any);
  testAssert(conflictRes.quarantined === true, 'Cross-tenant In-Reply-To vs Subaddress conflict is strictly quarantined');

  // =========================================================================
  // 4. CONNECTED ACCOUNT IDENTIFIER COLLISION PREVENTION
  // =========================================================================
  console.log('\n--- [TEST SUITE 4] Connected Account Identifier Collision Prevention ---');

  const pageIdCollisionTest = '178414000000998877';
  InstagramAdapter.registerConnectedAccount({
    organizationId: testOrgA,
    accountIdentifier: pageIdCollisionTest,
    pageAccessToken: 'EAA_token_org_a_exclusive',
  });

  let collisionBlocked = false;
  try {
    // Org Beta attempts to register the exact same Meta Page ID
    InstagramAdapter.registerConnectedAccount({
      organizationId: testOrgB,
      accountIdentifier: pageIdCollisionTest,
      pageAccessToken: 'EAA_token_org_b_rogue',
    });
  } catch (err: any) {
    collisionBlocked = err.message.includes('INTEGRATION CONFLICT') || err.message.includes('already connected');
  }
  testAssert(collisionBlocked, 'Attempt to register identical Meta Page ID across different organizations is blocked');

  // =========================================================================
  // 5. C3: LEGACY ONE-ARGUMENT FALLBACK COMPLETE REMOVAL
  // =========================================================================
  console.log('\n--- [TEST SUITE 5] C3: Legacy One-Argument Fallback Removal ---');

  const igAdapter = new InstagramAdapter();

  // Missing organizationId MUST throw Security Violation
  let missingOrgThrown = false;
  try {
    await (igAdapter as any).isWithin24HourWindow(undefined, 'customer_igsid_test');
  } catch (err: any) {
    missingOrgThrown = err.message.includes('SECURITY VIOLATION') || err.message.includes('requires organizationId');
  }
  testAssert(missingOrgThrown, 'isWithin24HourWindow with missing organizationId throws SECURITY VIOLATION');

  // Missing recipientIgsid MUST throw Security Violation
  let missingIgsidThrown = false;
  try {
    await (igAdapter as any).isWithin24HourWindow(testOrgA, undefined);
  } catch (err: any) {
    missingIgsidThrown = err.message.includes('SECURITY VIOLATION') || err.message.includes('requires organizationId');
  }
  testAssert(missingIgsidThrown, 'isWithin24HourWindow with missing recipientIgsid throws SECURITY VIOLATION');

  // Valid organization and recipient within window returns true
  await InstagramAdapter.recordCustomerInteraction(testOrgA, 'customer_alpha_valid_24h');
  const validWindowCheck = await igAdapter.isWithin24HourWindow(testOrgA, 'customer_alpha_valid_24h');
  testAssert(validWindowCheck === true, 'Tenant-scoped customer window returns true for active interaction');

  // Org B cannot access Org A's window
  const crossTenantWindowCheck = await igAdapter.isWithin24HourWindow(testOrgB, 'customer_alpha_valid_24h');
  testAssert(crossTenantWindowCheck === false, 'Tenant-scoped window strictly isolates between Org A and Org B');

  console.log('\n========================================================================');
  console.log(`PHASE 4B.5.4 REMEDIATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4B54SecurityTests().catch((err) => {
  console.error('[Phase 4B.5.4 Test Runner Error]:', err);
  process.exit(1);
});
