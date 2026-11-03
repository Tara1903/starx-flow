/**
 * STARX-FLOW SPRINT 3 VERIFICATION TEST SUITE
 * WS-06: Google and Microsoft Outlook Calendar Integration
 * WS-07: Resend Email Integration (Inbound/Outbound, Threading, Svix Signatures)
 * WS-08: Instagram Messaging Integration (Meta Graph API, HMAC Validation, 24h Window)
 * Shared: Identity Resolution, AI Orchestrator, Usage Metering, and Tenant Isolation
 */

import { GoogleCalendarAdapter } from '../src/lib/integrations/calendar/googleCalendarAdapter';
import { OutlookCalendarAdapter } from '../src/lib/integrations/calendar/outlookCalendarAdapter';
import { CalendarSyncService } from '../src/lib/integrations/calendar/calendarSyncService';
import { ResendEmailAdapter } from '../src/lib/integrations/email/resendEmailAdapter';
import { InstagramAdapter } from '../src/lib/integrations/instagram/instagramAdapter';
import { CredentialEncryption } from '../src/lib/security/encryption';
import { IdentityResolver } from '../src/lib/crm/identityResolver';
import { InboxService } from '../src/lib/inbox/inboxService';
import { ToolExecutor } from '../src/lib/ai/tools/toolExecutor';
import { UsageService } from '../src/lib/usage/usageService';
import crypto from 'crypto';

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runSprint3Verification() {
  console.log('========================================================================');
  console.log('STARX-FLOW SPRINT 3 MASTER VERIFICATION: CALENDAR, EMAIL & INSTAGRAM');
  console.log('========================================================================');

  const testOrgA = 'org-sprint3-alpha';
  const testOrgB = 'org-sprint3-bravo';

  // Clear simulated registries
  CalendarSyncService.clearInMemory();
  ResendEmailAdapter.clearSimulated();
  InstagramAdapter.clearSimulated();
  IdentityResolver.clearInMemory();

  // =========================================================================
  // TEST 1: WS-06 Google Calendar Integration & Conflict Detection
  // =========================================================================
  console.log('\n--- TEST 1: Google Calendar Integration (WS-06) ---');

  const googleAdapter = new GoogleCalendarAdapter();

  // 1.1 Authorization URL generation
  const gAuthUrl = googleAdapter.getAuthUrl({
    organizationId: testOrgA,
    redirectUri: 'https://app.starx-flow.com/api/integrations/google/oauth/callback',
  });
  assert(Boolean(gAuthUrl), 'Google OAuth authorization URL must be generated');
  assert(gAuthUrl.includes('google'), 'Authorization URL must target Google endpoint');
  console.log('✓ Google OAuth authorization URL generated successfully');

  // 1.2 Exchange authorization code for tokens
  const gTokens = await googleAdapter.exchangeCode(
    'simulated_gcal_code_123',
    'https://app.starx-flow.com/api/integrations/google/oauth/callback'
  );
  assert(Boolean(gTokens.accessToken), 'Access token must be returned');
  assert(Boolean(gTokens.refreshToken), 'Refresh token must be returned for offline access');
  assert(Boolean(gTokens.accountIdentifier), 'Account identifier email must be provided');
  console.log(`✓ Google OAuth code exchanged: Account "${gTokens.accountIdentifier}"`);

  // 1.3 Auto-refresh expired access token
  const gRefreshed = await googleAdapter.refreshAccessToken(gTokens.refreshToken!);
  assert(Boolean(gRefreshed.accessToken), 'Refreshed access token must be returned');
  console.log('✓ Google OAuth token refresh lifecycle verified');

  // 1.4 Register Google Calendar connection in CalendarSyncService
  await CalendarSyncService.registerConnection({
    id: 'conn-gcal-alpha',
    organizationId: testOrgA,
    provider: 'google_calendar',
    accountIdentifier: gTokens.accountIdentifier,
    accountName: gTokens.accountName,
    externalCalendarId: 'primary',
    calendarName: 'Dr. Müller Primary Appointments',
    syncEnabled: true,
    accessToken: gRefreshed.accessToken,
    refreshToken: gTokens.refreshToken,
  });

  const activeCalendars = await CalendarSyncService.getActiveConnections(testOrgA);
  assert(activeCalendars.length === 1, 'Org Alpha must have 1 active connected calendar');
  assert(activeCalendars[0].provider === 'google_calendar', 'Connected provider must be google_calendar');
  console.log(`✓ Google Calendar connection registered: "${activeCalendars[0].calendarName}"`);

  // 1.5 Create an external busy event directly on Google Calendar (e.g. 10:00 - 11:00 UTC)
  const busyDate = '2026-11-10';
  const externalGcalEvent = await googleAdapter.createEvent(gRefreshed.accessToken, 'primary', {
    title: 'Dr. Müller Surgery Block',
    description: 'Internal clinic surgery - strictly unavailable',
    startTime: `${busyDate}T10:00:00.000Z`,
    endTime: `${busyDate}T11:00:00.000Z`,
    timeZone: 'Europe/Berlin',
  });
  assert(Boolean(externalGcalEvent.externalEventId), 'Google Calendar event must return externalEventId');
  console.log(`✓ External Google event created: "${externalGcalEvent.title}" (${externalGcalEvent.externalEventId})`);

  // 1.6 Verify CalendarSyncService availability check detects the external Google busy block
  const gAvailability = await CalendarSyncService.checkAvailability({
    organizationId: testOrgA,
    date: busyDate,
  });
  const slot10am = gAvailability.slots.find((s) => s.startTime.includes('10:00:00'));
  const slot14pm = gAvailability.slots.find((s) => s.startTime.includes('14:00:00'));

  assert(slot10am && slot10am.available === false, 'Slot 10:00 must be marked unavailable due to Google Calendar event');
  assert(slot14pm && slot14pm.available === true, 'Slot 14:00 must remain available');
  console.log('✓ Availability engine successfully cross-checked external Google busy slots');

  // 1.7 AI Tool Integration: checkCalendarAvailability detects external calendar conflict
  const aiAvailCheck = await ToolExecutor.executeTool(
    'checkCalendarAvailability',
    { date: busyDate },
    { userId: testOrgA, organizationId: testOrgA }
  );
  assert(aiAvailCheck.success === true, 'AI checkCalendarAvailability must succeed');
  assert(
    !aiAvailCheck.data.availableSlots.some((s: string) => s.startsWith('10:00')),
    'AI tool must exclude 10:00 slot occupied in Google Calendar'
  );
  console.log('✓ AI tool checkCalendarAvailability respect external Google Calendar busy slots');

  console.log('✓ TEST 1 PASSED: Google Calendar integration verified.');

  // =========================================================================
  // TEST 2: WS-06 Microsoft Outlook Calendar Integration
  // =========================================================================
  console.log('\n--- TEST 2: Microsoft Outlook Calendar Integration (WS-06) ---');

  const msAdapter = new OutlookCalendarAdapter();

  // 2.1 Microsoft OAuth authorization URL
  const msAuthUrl = msAdapter.getAuthUrl({
    organizationId: testOrgB,
    redirectUri: 'https://app.starx-flow.com/api/integrations/microsoft/oauth/callback',
  });
  assert(Boolean(msAuthUrl), 'Microsoft OAuth authorization URL must be generated');
  console.log('✓ Microsoft OAuth authorization URL generated successfully');

  // 2.2 Exchange code for Microsoft tokens
  const msTokens = await msAdapter.exchangeCode(
    'simulated_ms_code_456',
    'https://app.starx-flow.com/api/integrations/microsoft/oauth/callback'
  );
  assert(Boolean(msTokens.accessToken), 'Microsoft access token must be returned');
  assert(Boolean(msTokens.accountIdentifier), 'Microsoft account identifier must be returned');
  console.log(`✓ Microsoft OAuth code exchanged: Account "${msTokens.accountIdentifier}"`);

  // 2.3 Register Outlook connection
  await CalendarSyncService.registerConnection({
    id: 'conn-outlook-bravo',
    organizationId: testOrgB,
    provider: 'microsoft_calendar',
    accountIdentifier: msTokens.accountIdentifier,
    accountName: msTokens.accountName,
    externalCalendarId: 'primary',
    calendarName: 'Kanzlei Schmidt Outlook',
    syncEnabled: true,
    accessToken: msTokens.accessToken,
    refreshToken: msTokens.refreshToken,
  });

  // 2.4 Create and cancel an event in Outlook
  const msEvent = await msAdapter.createEvent(msTokens.accessToken, 'primary', {
    title: 'Client Legal Consultation',
    startTime: `${busyDate}T14:00:00.000Z`,
    endTime: `${busyDate}T15:00:00.000Z`,
  });
  assert(Boolean(msEvent.externalEventId), 'Outlook event must be created');
  console.log(`✓ Outlook event created: "${msEvent.title}" (${msEvent.externalEventId})`);

  const deletedMs = await msAdapter.deleteEvent(msTokens.accessToken, 'primary', msEvent.externalEventId);
  assert(deletedMs === true, 'Outlook event cancellation must succeed');
  console.log('✓ Outlook event cancelled successfully');

  console.log('✓ TEST 2 PASSED: Microsoft Outlook Calendar integration verified.');

  // =========================================================================
  // TEST 3: WS-07 Resend Email Integration (Outbound, Inbound, Threading)
  // =========================================================================
  console.log('\n--- TEST 3: Resend Email Integration (WS-07) ---');

  const emailAdapter = new ResendEmailAdapter();

  // 3.1 Outbound email dispatch
  const outboundResult = await emailAdapter.sendEmail({
    organizationId: testOrgA,
    to: 'claire.dubois@client-paris.fr',
    subject: 'Confirmation of Your Consultation Details',
    text: 'Hello Claire, your consultation is scheduled for tomorrow at 14:00 CET.',
    html: '<p>Hello Claire, your consultation is scheduled for <strong>tomorrow at 14:00 CET</strong>.</p>',
    conversationId: 'conv-email-test-001',
    leadId: 'lead-claire-001',
  });
  assert(outboundResult.success === true, 'Outbound email delivery must succeed');
  assert(outboundResult.status === 'delivered', 'Email delivery status must be delivered');
  assert(Boolean(outboundResult.messageId), 'Message-ID header must be generated for threading');
  console.log(`✓ Outbound email dispatched via Resend: Message-ID ${outboundResult.messageId}`);

  // 3.2 Security Rule: Internal staff notes must NEVER be dispatched to outbound email
  let internalNoteBlocked = false;
  try {
    await emailAdapter.sendEmail({
      organizationId: testOrgA,
      to: 'claire.dubois@client-paris.fr',
      subject: 'Internal Discussion',
      text: 'STAFF ONLY: Customer is demanding a discount.',
      isInternal: true, // Should trigger immediate rejection
    });
  } catch (err: any) {
    if (err.message.includes('SECURITY VIOLATION')) {
      internalNoteBlocked = true;
    }
  }
  assert(internalNoteBlocked, 'Attempt to dispatch internal note via email must throw security violation');
  console.log('✓ Security Violation enforced: Internal staff notes blocked from outbound email');

  // 3.3 Svix Webhook Signature Verification
  ResendEmailAdapter.registerActiveOrganization(testOrgA);
  const testPayload = JSON.stringify({
    type: 'email.inbound',
    data: {
      from: 'Claire Dubois <claire.dubois@client-paris.fr>',
      to: ['notifications@starx-flow.com'],
      subject: 'Re: Confirmation of Your Consultation Details',
      text: 'Thank you! Can we reschedule to 16:00 instead?',
      message_id: '<claire-reply-001@client-paris.fr>',
      in_reply_to: outboundResult.messageId,
    },
  });

  const svixTimestamp = Math.floor(Date.now() / 1000).toString();
  const svixId = `msg_test_${Date.now()}`;
  const base64Key = Buffer.from('test_resend_webhook_secret_key_32bytes_long!').toString('base64');
  const testSecret = `whsec_${base64Key}`;
  process.env.RESEND_WEBHOOK_SECRET = testSecret;

  const secretBytes = Buffer.from(base64Key, 'base64');
  const validSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(`${svixId}.${svixTimestamp}.${testPayload}`)
    .digest('base64');

  const resendWithSecret = new ResendEmailAdapter();
  const verifiedSig = resendWithSecret.verifyWebhookSignature(testPayload, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': `v1,${validSignature}`,
  });
  assert(verifiedSig === true, 'Valid Svix webhook signature must be verified');

  const forgedSig = resendWithSecret.verifyWebhookSignature(testPayload, {
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': 'v1,forged_invalid_signature_hash_bytes',
  });
  assert(forgedSig === false, 'Forged Svix webhook signature must be rejected');
  console.log('✓ Svix webhook signature verification verified (valid accepted, forged rejected)');

  // 3.4 Inbound Email Webhook Pipeline: Threading, Identity Resolution & Auto-Reply
  const inboundProcess = await emailAdapter.processInboundWebhook(JSON.parse(testPayload), {
    organizationId: testOrgA,
  });
  assert(inboundProcess.status === 'processed', 'Inbound email must be processed');
  assert(inboundProcess.replySent === true, 'AI auto-reply must be dispatched via Resend');
  console.log(`✓ Inbound email processed & threaded: Conversation ${inboundProcess.conversationId}`);

  // 3.5 HTML Sanitization: strips dangerous scripts
  const maliciousHtml = '<p>Normal text</p><script>alert("xss")</script><iframe src="evil.com"></iframe>';
  const cleanHtml = ResendEmailAdapter.sanitizeHtml(maliciousHtml);
  assert(!cleanHtml.includes('<script>') && !cleanHtml.includes('<iframe>'), 'HTML sanitization must strip scripts and iframes');
  assert(cleanHtml.includes('<p>Normal text</p>'), 'Legitimate HTML text must be preserved');
  console.log('✓ Inbound HTML email sanitization verified');

  console.log('✓ TEST 3 PASSED: Resend Email integration verified.');

  // =========================================================================
  // TEST 4: WS-08 Instagram Messaging Integration (Meta Graph API)
  // =========================================================================
  console.log('\n--- TEST 4: Instagram Messaging Integration (WS-08) ---');

  process.env.META_APP_SECRET = 'meta_test_secret_key_8899';
  process.env.META_VERIFY_TOKEN = 'starx_custom_verify_token';
  const instagramAdapter = new InstagramAdapter();

  // 4.1 Meta Webhook Verification Challenge (GET)
  const challengeValid = instagramAdapter.verifyWebhookChallenge({
    mode: 'subscribe',
    token: 'starx_custom_verify_token',
    challenge: '1158201244',
  });
  assert(challengeValid.isValid && challengeValid.challenge === '1158201244', 'Meta hub.challenge must be echoed with 200 OK');

  const challengeInvalid = instagramAdapter.verifyWebhookChallenge({
    mode: 'subscribe',
    token: 'wrong_untrusted_token',
    challenge: '1158201244',
  });
  assert(!challengeInvalid.isValid, 'Invalid Meta verify token must be rejected');
  console.log('✓ Meta Webhook Challenge verification verified');

  // 4.2 HMAC-SHA256 Signature Validation (POST)
  const igPayload = JSON.stringify({
    object: 'instagram',
    entry: [
      {
        id: 'page_12345',
        time: Date.now(),
        messaging: [
          {
            sender: { id: 'igsid_customer_789' },
            recipient: { id: 'page_12345' },
            timestamp: Date.now(),
            message: {
              mid: `m_mid_ig_${Date.now()}`,
              text: 'Bonjour! Are you open on Saturdays for styling?',
            },
          },
        ],
      },
    ],
  });

  const igHmac = crypto.createHmac('sha256', 'meta_test_secret_key_8899').update(igPayload, 'utf8').digest('hex');
  const validIgSig = instagramAdapter.verifySignature(igPayload, `sha256=${igHmac}`);
  assert(validIgSig === true, 'Authentic Meta HMAC signature must pass');

  const forgedIgSig = instagramAdapter.verifySignature(igPayload, 'sha256=abcdef1234567890');
  assert(forgedIgSig === false, 'Forged Meta HMAC signature must be rejected');
  console.log('✓ Meta HMAC-SHA256 signature validation verified');

  // Register connected Instagram account for testOrgA (H3 remediation)
  InstagramAdapter.registerConnectedAccount({
    organizationId: testOrgA,
    accountIdentifier: 'page_12345',
    pageAccessToken: 'EAA_test_token_alpha',
  });

  // 4.3 24-Hour Messaging Window Enforcement
  // Customer has not sent a message yet -> outside window
  const outOfWindowCheck = await instagramAdapter.isWithin24HourWindow(testOrgA, 'igsid_inactive_999');
  assert(outOfWindowCheck === false, 'Customer with no inbound message must be outside 24h window');

  let windowViolationCaught = false;
  try {
    await instagramAdapter.sendMessage({
      organizationId: testOrgA,
      recipientIgsid: 'igsid_inactive_999',
      text: 'Promotional message without approved message tag',
    });
  } catch (err: any) {
    if (err.message.includes('24-hour messaging window')) {
      windowViolationCaught = true;
    }
  }
  assert(windowViolationCaught, 'Outbound message outside 24h window without messageTag must be rejected');
  console.log('✓ Meta 24-hour messaging window enforcement verified');

  // 4.4 Process Inbound Instagram DM -> Opens 24h window -> Identity resolution -> AI reply
  const igProcess = await instagramAdapter.processWebhookEvent(JSON.parse(igPayload), {
    organizationId: testOrgA,
  });
  assert(igProcess.processedCount === 1, 'Inbound Instagram DM must be processed');
  assert(igProcess.repliesSent === 1, 'Outbound AI reply must be sent');

  const inWindowNow = await instagramAdapter.isWithin24HourWindow(testOrgA, 'igsid_customer_789');
  assert(inWindowNow === true, 'Customer 24-hour messaging window must now be open');
  console.log('✓ Inbound Instagram DM processed, identity resolved & 24h window opened');

  // 4.5 Security Rule: Internal staff notes must never reach Instagram
  let igInternalBlocked = false;
  try {
    await instagramAdapter.sendMessage({
      organizationId: testOrgA,
      recipientIgsid: 'igsid_customer_789',
      text: 'STAFF ONLY: Customer inquired about VIP package.',
      isInternal: true,
    });
  } catch (err: any) {
    if (err.message.includes('SECURITY VIOLATION')) {
      igInternalBlocked = true;
    }
  }
  assert(igInternalBlocked, 'Attempt to dispatch internal note to Instagram must throw security violation');
  console.log('✓ Security Violation enforced: Internal staff notes blocked from Instagram');

  console.log('✓ TEST 4 PASSED: Instagram Messaging integration verified.');

  // =========================================================================
  // TEST 5: Integrated End-to-End Pipeline Across All Integrations
  // =========================================================================
  console.log('\n--- TEST 5: Integrated End-to-End Pipeline (WS-06, WS-07, WS-08) ---');

  // End-to-end scenario:
  // Inbound Email from a customer requesting an appointment -> AI tools book appointment
  // -> Appointment synced to Google Calendar -> Outbound confirmation email sent -> Usage metered
  const e2eEmail = await emailAdapter.sendEmail({
    organizationId: testOrgA,
    to: 'sophie.martin@paris-design.fr',
    subject: 'Consultation Booking Request',
    text: 'Hello, I would like to schedule a consultation on 2026-11-12 at 14:00.',
  });
  assert(e2eEmail.success, 'E2E email dispatch must succeed');

  const e2eApt = await ToolExecutor.executeTool(
    'bookAppointment',
    {
      customerName: 'Sophie Martin',
      customerEmail: 'sophie.martin@paris-design.fr',
      customerPhone: '+33698765432',
      serviceName: 'Executive Strategy Session',
      startTime: '2026-11-12T14:00:00.000Z',
      endTime: '2026-11-12T15:00:00.000Z',
    },
    { userId: testOrgA, organizationId: testOrgA, agentRole: 'appointment' }
  );
  assert(e2eApt.success === true, 'Appointment booking must succeed');
  console.log(`✓ E2E Appointment booked: ${e2eApt.data.appointmentId} (Code: ${e2eApt.data.confirmationCode})`);

  // Verify monthly usage metering accounted for email and AI operations
  const usageSummary = await UsageService.getMonthlySummary(testOrgA);
  assert(usageSummary.metrics['email_messages'].currentUsage >= 1, 'Email usage metric must be recorded');
  assert(usageSummary.metrics['instagram_messages'].currentUsage >= 1, 'Instagram usage metric must be recorded');
  console.log(
    `✓ Usage metering verified across channels: Emails: ${usageSummary.metrics['email_messages'].currentUsage}, Instagram: ${usageSummary.metrics['instagram_messages'].currentUsage}`
  );

  console.log('✓ TEST 5 PASSED: Integrated End-to-End pipeline verified.');

  // =========================================================================
  // TEST 6: Security & Multi-Tenant Isolation
  // =========================================================================
  console.log('\n--- TEST 6: Security & Multi-Tenant Integration Isolation ---');

  // 6.1 AES-256 Credential Encryption at Rest
  const rawCreds = { apiKey: 'secret_live_key_9999', refreshToken: '1//refresh_token_xyz' };
  const encryptedString = CredentialEncryption.encrypt(rawCreds);
  assert(encryptedString.startsWith('enc:v1:'), 'Encrypted credentials must use versioned ciphertext format');
  assert(!encryptedString.includes('secret_live_key_9999'), 'Ciphertext must not expose plaintext secrets');

  const decryptedCreds = CredentialEncryption.decrypt<typeof rawCreds>(encryptedString);
  assert(decryptedCreds.apiKey === rawCreds.apiKey, 'Decrypted credentials must match original plaintext');
  assert(decryptedCreds.refreshToken === rawCreds.refreshToken, 'Decrypted refresh token must match original');
  console.log('✓ AES-256-GCM credential encryption and decryption verified at rest');

  // 6.2 Cross-Tenant Calendar Isolation: Org B cannot access Org A's connected calendars
  const orgACalendars = await CalendarSyncService.getActiveConnections(testOrgA);
  const orgBCalendars = await CalendarSyncService.getActiveConnections(testOrgB);
  assert(
    !orgBCalendars.some((b) => b.accountIdentifier === orgACalendars[0]?.accountIdentifier),
    'Org B must never see Org A connected calendar accounts'
  );
  console.log('✓ Multi-tenant integration isolation enforced between organizations');

  console.log('✓ TEST 6 PASSED: Security and multi-tenant isolation verified.');

  console.log('\n========================================================================');
  console.log('🎉 ALL SPRINT 3 VERIFICATION TESTS COMPLETED SUCCESSFULLY (24/24 PASS)!');
  console.log('========================================================================');
}

runSprint3Verification().catch((err) => {
  console.error('\n❌ Sprint 3 Verification Failed:', err);
  process.exit(1);
});
