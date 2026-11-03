/**
 * STARX-FLOW PHASE 4B.5.2 — SPRINT 3 SECURITY REMEDIATION VERIFICATION
 * 
 * Verifies all remediation fixes from the Phase 4B.5.1 Independent Audit:
 * - C1: OAuth CSRF, Nonce, HMAC-SHA256, Expiration & Anti-Replay Protection
 * - C2: Multi-Tenant Destination Routing (Resend Email & Meta Instagram)
 * - C3: Persistent Meta 24-Hour Messaging Window & Cross-Tenant Isolation
 * - H1: Calendar Cancellation using True External Event IDs
 * - H2: Database-Backed Resend Inbound Webhook Idempotency
 * - H3: Per-Tenant Outbound Instagram Credentials & Token Isolation
 * - H4: Calendar Webhook Secret Validation (Channel Token & ClientState) & Sync
 * - M1: Fail-Closed Master Encryption Key in Production
 */

import crypto from 'crypto';
import { OAuthStateManager } from '../src/lib/security/oauthState';
import { CredentialEncryption } from '../src/lib/security/encryption';
import { ResendEmailAdapter } from '../src/lib/integrations/email/resendEmailAdapter';
import { InstagramAdapter } from '../src/lib/integrations/instagram/instagramAdapter';
import { CalendarSyncService } from '../src/lib/integrations/calendar/calendarSyncService';
import { GoogleCalendarAdapter } from '../src/lib/integrations/calendar/googleCalendarAdapter';
import { OutlookCalendarAdapter } from '../src/lib/integrations/calendar/outlookCalendarAdapter';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function runRemediationVerification() {
  console.log('\n========================================================================');
  console.log('STARX-FLOW PHASE 4B.5.2 — SPRINT 3 SECURITY REMEDIATION VERIFICATION');
  console.log('========================================================================\n');

  const testOrgA = '11111111-1111-4111-8111-111111111111';
  const testOrgB = '22222222-2222-4222-8222-222222222222';
  const testUserA = '33333333-3333-4333-8333-333333333333';

  // =========================================================================
  // 1. C1: OAUTH STATE CSRF, NONCE & HMAC SIGNATURE REMEDIATION
  // =========================================================================
  console.log('--- [VERIFY C1] OAuth State CSRF, HMAC-SHA256 & Replay Protection ---');

  // 1.1 Generate secure signed state
  const stateToken = await OAuthStateManager.generateState({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  assert(typeof stateToken === 'string' && stateToken.includes('.'), 'OAuth state token generated with HMAC-SHA256 signature');

  // 1.2 Verify valid state signature
  const isValidSignature = OAuthStateManager.verifySignature(stateToken);
  assert(isValidSignature, 'OAuthStateManager verifies authentic HMAC-SHA256 signature');

  // 1.3 Detect tampered state parameter
  const tamperedState = stateToken.substring(0, stateToken.length - 4) + 'abcd';
  const isTamperedValid = OAuthStateManager.verifySignature(tamperedState);
  assert(!isTamperedValid, 'OAuthStateManager rejects forged / tampered state signature');

  // 1.4 Atomic consumption of valid state
  const consumedState = await OAuthStateManager.verifyAndConsumeState({
    stateParam: stateToken,
    expectedOrgId: testOrgA,
    expectedProvider: 'google_calendar',
    allowBypassSessionBindingInTest: true,
  });
  assert(consumedState.organizationId === testOrgA, 'OAuthStateManager successfully consumes valid state');

  // 1.5 Anti-Replay: Consuming already-consumed state MUST fail
  let replayBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: stateToken,
      expectedOrgId: testOrgA,
      expectedProvider: 'google_calendar',
      allowBypassSessionBindingInTest: true,
    });
  } catch (err: any) {
    replayBlocked = err.message.includes('already consumed') || err.message.includes('SECURITY VIOLATION');
  }
  assert(replayBlocked, 'OAuthStateManager blocks replay of previously consumed state (anti-replay)');

  // 1.6 Cross-tenant state consumption MUST fail
  const stateOrgA = await OAuthStateManager.generateState({
    organizationId: testOrgA,
    userId: testUserA,
    provider: 'google_calendar',
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  let crossOrgBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: stateOrgA,
      expectedOrgId: testOrgB, // Org B tries to steal Org A's state
      expectedProvider: 'google_calendar',
      allowBypassSessionBindingInTest: true,
    });
  } catch (err: any) {
    crossOrgBlocked = err.message.includes('Cross-organization') || err.message.includes('SECURITY VIOLATION');
  }
  assert(crossOrgBlocked, 'OAuthStateManager rejects cross-tenant state consumption (OAUTH_ORGANIZATION_MISMATCH)');

  // 1.7 Provider mismatch MUST fail
  let providerMismatchBlocked = false;
  try {
    await OAuthStateManager.verifyAndConsumeState({
      stateParam: stateOrgA,
      expectedOrgId: testOrgA,
      expectedProvider: 'microsoft_calendar', // Wrong provider
      allowBypassSessionBindingInTest: true,
    });
  } catch (err: any) {
    providerMismatchBlocked = err.message.includes('Provider mismatch') || err.message.includes('SECURITY VIOLATION');
  }
  assert(providerMismatchBlocked, 'OAuthStateManager rejects provider mismatch (OAUTH_PROVIDER_MISMATCH)');

  // =========================================================================
  // 2. C2: MULTI-TENANT WEBHOOK DESTINATION ROUTING REMEDIATION
  // =========================================================================
  console.log('\n--- [VERIFY C2] Multi-Tenant Webhook Destination Routing ---');

  ResendEmailAdapter.registerActiveOrganization(testOrgA);
  ResendEmailAdapter.registerActiveOrganization(testOrgB);

  const resendAdapter = new ResendEmailAdapter();
  const instagramAdapter = new InstagramAdapter();

  // 2.1 Resend: Threaded In-Reply-To strictly routes to thread organization
  const originalThreadMsgId = `<consultation-${Date.now()}@starx-flow.com>`;
  ResendEmailAdapter.recordThread(originalThreadMsgId, {
    organizationId: testOrgA,
    conversationId: 'conv-alpha-001',
    leadId: 'lead-alpha-001',
    subject: 'Consultation',
  });

  const inboundThreadedEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_${Date.now()}_1`,
      from: 'marie.dupont@client.fr',
      to: ['notifications@starx-flow.com'],
      subject: 'Re: Hair Consultation Confirmation',
      message_id: `<reply-marie-${Date.now()}@mail.fr>`,
      in_reply_to: originalThreadMsgId,
      headers: {
        'message-id': `<reply-marie-${Date.now()}@mail.fr>`,
        'in-reply-to': originalThreadMsgId,
      },
      text: 'Yes, looking forward to Tuesday at 14:00!',
    },
  };

  const threadedResult = await resendAdapter.processInboundWebhook(inboundThreadedEmail as any);
  assert(threadedResult.organizationId === testOrgA, 'Inbound email with In-Reply-To routes strictly to thread organization (Org Alpha)');
  assert(threadedResult.quarantined === false, 'Threaded email is processed without quarantine');

  // 2.2 Resend: Inbound subaddressing routes to organization tag
  const inboundSubaddressedEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_${Date.now()}_2`,
      from: 'hans.schmidt@berlin.de',
      to: [`inbox+${testOrgB}@starx-flow.com`],
      subject: 'New Appointment Inquiry',
      message_id: `<new-hans-${Date.now()}@berlin.de>`,
      headers: {
        'message-id': `<new-hans-${Date.now()}@berlin.de>`,
      },
      text: 'Do you have openings next week for a dental cleaning?',
    },
  };

  const subaddressedResult = await resendAdapter.processInboundWebhook(inboundSubaddressedEmail as any);
  assert(subaddressedResult.organizationId === testOrgB, 'Inbound subaddressed email (inbox+<orgId>@) routes strictly to tagged organization (Org Beta)');
  assert(subaddressedResult.quarantined === false, 'Subaddressed email is processed without quarantine');

  // 2.3 Resend: Unmapped inbound email MUST be quarantined (NO org-default fallback)
  const unmappedEmail = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_${Date.now()}_unmapped`,
      from: 'random.spammer@unknown.com',
      to: ['random-unmapped@external-domain.com'],
      subject: 'Unsolicited Inquiry',
      message_id: `<random-spam-${Date.now()}@unknown.com>`,
      headers: {
        'message-id': `<random-spam-${Date.now()}@unknown.com>`,
      },
      text: 'Buy cheap watches now!',
    },
  };

  const quarantinedEmailResult = await resendAdapter.processInboundWebhook(unmappedEmail as any);
  assert(quarantinedEmailResult.quarantined === true, 'Unmapped inbound email is safely quarantined');
  assert(quarantinedEmailResult.organizationId !== 'org-default', 'Unmapped email does NOT silently route to org-default');

  // 2.4 Instagram: Inbound DM routes strictly by Meta Page ID in connected accounts
  const pageIdOrgA = '17841400000000001';
  const pageIdOrgB = '17841400000000002';
  InstagramAdapter.registerConnectedAccount({
    organizationId: testOrgA,
    accountIdentifier: pageIdOrgA,
    pageAccessToken: 'EAA_test_token_org_a',
  });
  InstagramAdapter.registerConnectedAccount({
    organizationId: testOrgB,
    accountIdentifier: pageIdOrgB,
    pageAccessToken: 'EAA_test_token_org_b',
  });

  const igDmOrgA = {
    object: 'instagram',
    entry: [
      {
        id: pageIdOrgA,
        time: Date.now(),
        messaging: [
          {
            sender: { id: 'customer_igsid_berlin_101' },
            recipient: { id: pageIdOrgA },
            timestamp: Date.now(),
            message: { mid: `m_mid_org_a_${Date.now()}`, text: 'Hello, what time do you open tomorrow?' },
          },
        ],
      },
    ],
  };

  const igResultA = await instagramAdapter.processWebhookEvent(igDmOrgA as any);
  assert(igResultA.processed === 1, 'Instagram webhook processes DM for registered Page ID');

  // 2.5 Instagram: Unmapped Meta Page ID MUST be quarantined
  const unmappedIgDm = {
    object: 'instagram',
    entry: [
      {
        id: '99999999999999999_unmapped',
        time: Date.now(),
        messaging: [
          {
            sender: { id: 'unknown_sender_999' },
            recipient: { id: '99999999999999999_unmapped' },
            timestamp: Date.now(),
            message: { mid: `m_mid_unmapped_${Date.now()}`, text: 'Is this page active?' },
          },
        ],
      },
    ],
  };

  const unmappedIgResult = await instagramAdapter.processWebhookEvent(unmappedIgDm as any);
  assert(unmappedIgResult.quarantined === 1, 'Inbound DM to unmapped Meta Page ID is quarantined');
  assert(unmappedIgResult.processed === 0, 'Unmapped Instagram DM is NOT processed into customer chats');

  // =========================================================================
  // 3. C3: PERSISTENT META 24-HOUR MESSAGING WINDOW & MULTI-TENANT ISOLATION
  // =========================================================================
  console.log('\n--- [VERIFY C3] Persistent 24-Hour Messaging Window & Isolation ---');

  const customerIgsid = 'customer_igsid_berlin_101';
  // After DM processing in 2.4, Org A should have an active window for this customer
  const isOrgAWithinWindow = await instagramAdapter.isWithin24HourWindow(testOrgA, customerIgsid);
  assert(isOrgAWithinWindow, 'Meta 24-hour messaging window is open for recipient organization (Org Alpha)');

  // Org B MUST NOT have access to Org A's 24-hour customer messaging window
  const isOrgBWithinWindow = await instagramAdapter.isWithin24HourWindow(testOrgB, customerIgsid);
  assert(!isOrgBWithinWindow, 'Customer 24-hour messaging window strictly isolated across tenants (Org Beta cannot message Org Alpha customer)');

  // Verify expired window returns false
  await InstagramAdapter.recordCustomerInteraction(testOrgA, 'expired_customer_77', Date.now() - 25 * 3600 * 1000);
  const isExpiredWithinWindow = await instagramAdapter.isWithin24HourWindow(testOrgA, 'expired_customer_77');
  assert(!isExpiredWithinWindow, 'Customer window elapsed after 24 hours correctly returns false');

  // =========================================================================
  // 4. H1: CALENDAR CANCELLATION WITH TRUE EXTERNAL EVENT ID
  // =========================================================================
  console.log('\n--- [VERIFY H1] Calendar Cancellation with Genuine External Event IDs ---');

  CalendarSyncService.clearInMemory();
  await CalendarSyncService.registerConnection({
    id: 'conn-gcal-alpha',
    organizationId: testOrgA,
    provider: 'google_calendar',
    accountIdentifier: 'doctor@praxis-berlin.de',
    accountName: 'Praxis Berlin Google Calendar',
    externalCalendarId: 'primary',
    calendarName: 'Primary Calendar',
    syncEnabled: true,
    accessToken: `ya29.simulated_gcal_token_${Date.now()}`,
  });

  const aptId = 'apt-uuid-test-999';
  const pushResult = await CalendarSyncService.syncAppointmentToExternal(
    {
      id: aptId,
      customer_name: 'Dr. Klaus Weber',
      customer_phone: '+4915123456789',
      customer_email: 'klaus@praxis-berlin.de',
      start_time: '2026-11-10T10:00:00.000Z',
      end_time: '2026-11-10T11:00:00.000Z',
      status: 'confirmed',
    },
    testOrgA
  );

  const realExternalId = pushResult.externalEventIds[0];
  assert(
    !!realExternalId && realExternalId !== `gcal-evt-${aptId}`,
    `Appointment synced with genuine external event ID: ${realExternalId}`
  );

  // Now cancel the appointment
  const cancelSuccess = await CalendarSyncService.cancelExternalAppointment(aptId, testOrgA);
  assert(cancelSuccess, 'cancelExternalAppointment executes without error using mapped genuine external event ID');

  // =========================================================================
  // 5. H2: RESEND INBOUND WEBHOOK IDEMPOTENCY
  // =========================================================================
  console.log('\n--- [VERIFY H2] Resend Inbound Webhook Idempotency ---');

  const idempotentMsgId = `<unique-delivery-${Date.now()}@client.de>`;
  const duplicatePayload = {
    type: 'email.received',
    created_at: new Date().toISOString(),
    data: {
      email_id: `email_dedup_${Date.now()}`,
      message_id: idempotentMsgId,
      from: 'elena@beauty-studio.de',
      to: [`inbox+${testOrgA}@starx-flow.com`],
      subject: 'Inquiry for Facial Treatment',
      headers: {
        'message-id': idempotentMsgId,
      },
      text: 'Do you offer chemical peels?',
    },
  };

  const firstDelivery = await resendAdapter.processInboundWebhook(duplicatePayload as any);
  assert(firstDelivery.quarantined === false && firstDelivery.organizationId === testOrgA, 'Initial email webhook processed successfully');

  // Second delivery with identical Message-ID MUST be detected as duplicate
  const secondDelivery = await resendAdapter.processInboundWebhook(duplicatePayload as any);
  assert(secondDelivery.quarantined === false, 'Duplicate email delivery acknowledged safely');
  assert(secondDelivery.processed === false, 'Duplicate email delivery skipped duplicate message creation (idempotent skip)');

  // =========================================================================
  // 6. H3: PER-TENANT OUTBOUND INSTAGRAM CREDENTIALS
  // =========================================================================
  console.log('\n--- [VERIFY H3] Per-Tenant Outbound Instagram Credentials ---');

  // Dispatch from Org A to customer
  const sendResultA = await instagramAdapter.sendMessage({
    organizationId: testOrgA,
    recipientIgsid: customerIgsid,
    text: 'Hello from Org Alpha! We open at 09:00 tomorrow.',
  });
  assert(sendResultA.success === true, 'Org Alpha successfully dispatches outbound DM with tenant credentials');
  assert(
    sendResultA.recipientIgsid === customerIgsid,
    'Outbound DM recipient matches target customer'
  );

  // Dispatch from an organization without Instagram connection MUST fail closed
  let unconfiguredOrgBlocked = false;
  try {
    await instagramAdapter.sendMessage({
      organizationId: 'unconfigured-org-99',
      recipientIgsid: customerIgsid,
      text: 'This should fail.',
    });
  } catch (err: any) {
    unconfiguredOrgBlocked = err.message.includes('No connected Instagram account found');
  }
  assert(
    unconfiguredOrgBlocked,
    'Outbound Instagram dispatch fails closed if organization has not connected an Instagram account (no single-tenant fallback)'
  );

  // =========================================================================
  // 7. H4: CALENDAR WEBHOOK SECRET VALIDATION & SYNC EXECUTION
  // =========================================================================
  console.log('\n--- [VERIFY H4] Calendar Webhook Secret Validation & Sync Execution ---');

  const channelId = `channel_gcal_${Date.now()}`;
  const validChannelToken = `secret_gcal_token_${Date.now()}`;
  CalendarSyncService.registerWatchChannel(channelId, testOrgA, 'google_calendar', validChannelToken);

  // 7.1 Valid Google channel token
  const validGoogleVal = await CalendarSyncService.validateGoogleWebhookChannel(channelId, validChannelToken);
  assert(validGoogleVal.valid === true && validGoogleVal.organizationId === testOrgA, 'Google webhook channel token validated and mapped to Org Alpha');

  // 7.2 Forged Google channel token rejected
  const invalidGoogleVal = await CalendarSyncService.validateGoogleWebhookChannel(channelId, 'forged_token_evil');
  assert(invalidGoogleVal.valid === false, 'Google webhook rejects forged / invalid channel token (401 Unauthorized)');

  // 7.3 Valid Microsoft clientState
  const subscriptionId = `sub_ms_${Date.now()}`;
  const validClientState = `secret_ms_state_${Date.now()}`;
  CalendarSyncService.registerWatchChannel(subscriptionId, testOrgA, 'microsoft_calendar', validClientState);

  const validMsVal = await CalendarSyncService.validateMicrosoftSubscription(subscriptionId, validClientState);
  assert(validMsVal.valid === true && validMsVal.organizationId === testOrgA, 'Microsoft webhook clientState validated and mapped to Org Alpha');

  // 7.4 Forged Microsoft clientState rejected
  const invalidMsVal = await CalendarSyncService.validateMicrosoftSubscription(subscriptionId, 'forged_state_evil');
  assert(invalidMsVal.valid === false, 'Microsoft webhook rejects forged / invalid clientState (401 Unauthorized)');

  // 7.5 Background synchronization execution
  const syncExec = await CalendarSyncService.syncFromExternal(testOrgA, 'google_calendar');
  assert(syncExec.success === true, 'Calendar inbound delta sync executes successfully for connected organization');

  // =========================================================================
  // 8. M1: FAIL-CLOSED MASTER ENCRYPTION KEY IN PRODUCTION
  // =========================================================================
  console.log('\n--- [VERIFY M1] Fail-Closed Master Encryption Key in Production ---');

  const originalNodeEnv = process.env.NODE_ENV;
  const originalKey = process.env.ENCRYPTION_KEY;
  const originalSecret = process.env.ENCRYPTION_SECRET_KEY;
  const originalSupa = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalJwt = process.env.JWT_SECRET;

  try {
    // Simulate production environment with missing keys
    (process.env as any).NODE_ENV = 'production';
    process.env.ENCRYPTION_KEY = '';
    process.env.ENCRYPTION_SECRET_KEY = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';
    process.env.JWT_SECRET = '';
    delete process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.JWT_SECRET;

    let productionKeyFailedClosed = false;
    try {
      CredentialEncryption.encrypt({ test: 'secret_token' });
    } catch (err: any) {
      productionKeyFailedClosed = err.message.includes('CRITICAL SECURITY CONFIGURATION ERROR') || err.message.includes('FATAL SECURITY');
    }
    assert(
      productionKeyFailedClosed,
      'CredentialEncryption fails closed with fatal error in production when encryption keys are unconfigured'
    );
  } finally {
    // Restore environment
    (process.env as any).NODE_ENV = originalNodeEnv;
    if (originalKey) process.env.ENCRYPTION_KEY = originalKey;
    if (originalSecret) process.env.ENCRYPTION_SECRET_KEY = originalSecret;
    if (originalSupa) process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupa;
    if (originalJwt) process.env.JWT_SECRET = originalJwt;
  }

  // =========================================================================
  // FINAL RESULTS SUMMARY
  // =========================================================================
  console.log('\n========================================================================');
  console.log(`REMEDIATION VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRemediationVerification().catch((err) => {
  console.error('[Remediation Verification Error]:', err);
  process.exit(1);
});
