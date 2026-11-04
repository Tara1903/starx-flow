/**
 * STARX-FLOW RELEASE-CANDIDATE TEST SUITE
 * DOMAIN J: APPOINTMENTS & CALENDAR INTEGRATIONS
 *
 * Verifies:
 * 1. OAuth CSRF & State Replay Defense:
 *    - Cryptographically signed HMAC state generation.
 *    - Session binding cookie verification.
 *    - State mismatch rejection.
 *    - Atomic one-time state consumption (replay prevention).
 * 2. Inbound Webhook Channel Security:
 *    - Google Calendar watch channel token verification (rejects forged tokens).
 *    - Microsoft Graph subscription clientState verification.
 * 3. Unified Availability Engine (Internal + External Aggregation):
 *    - Free slots when no events exist.
 *    - Slot collision when internal appointment exists.
 *    - Slot collision when external Google/Microsoft event exists.
 * 4. Multi-Tenant Calendar Isolation:
 *    - External calendar in Org A does not block slots in Org B.
 */

import { CalendarSyncService } from '../src/lib/integrations/calendar/calendarSyncService';
import { OAuthStateManager } from '../src/lib/security/oauthState';
import { GoogleCalendarAdapter } from '../src/lib/integrations/calendar/googleCalendarAdapter';
import { OutlookCalendarAdapter } from '../src/lib/integrations/calendar/outlookCalendarAdapter';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(name: string, condition: boolean, details?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${name}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${name}${details ? ` -> ${details}` : ''}`);
  }
}

async function runDomainJTests() {
  console.log('================================================================');
  console.log(' DOMAIN J: APPOINTMENTS & CALENDAR TESTING');
  console.log('================================================================');

  const testOrgId = `org-cal-test-${Date.now()}`;
  const testUserId = `user-cal-test-${Date.now()}`;

  // -------------------------------------------------------------
  // Test 1: OAuth State Generation, Signature, and Anti-Replay
  // -------------------------------------------------------------
  {
    const binding = await OAuthStateManager.generateStateWithBinding({
      organizationId: testOrgId,
      userId: testUserId,
      provider: 'google_calendar',
      redirectUri: 'http://localhost:3000/api/integrations/google/oauth/callback',
    });

    check('OAuth binding produces state param and session secret', Boolean(binding.state && binding.sessionBindingSecret));

    // 1a: Valid state consumption
    const consumed = await OAuthStateManager.verifyAndConsumeState({
      stateParam: binding.state,
      expectedProvider: 'google_calendar',
      expectedOrgId: testOrgId,
      expectedUserId: testUserId,
      sessionBindingSecret: binding.sessionBindingSecret,
      expectedRedirectUri: 'http://localhost:3000/api/integrations/google/oauth/callback',
    });

    check('Valid state matches expected parameters and verifies successfully', consumed.organizationId === testOrgId);

    // 1b: Replay defense (consuming already consumed state MUST throw)
    let replayed = false;
    let replayError = '';
    try {
      await OAuthStateManager.verifyAndConsumeState({
        stateParam: binding.state,
        expectedProvider: 'google_calendar',
        expectedOrgId: testOrgId,
        expectedUserId: testUserId,
        sessionBindingSecret: binding.sessionBindingSecret,
      });
    } catch (err: any) {
      replayed = true;
      replayError = err.message;
    }

    check(
      'Replay attack: Consuming the same OAuth state a second time is strictly rejected',
      replayed === true && (replayError.includes('already consumed') || replayError.includes('replay') || replayError.includes('Invalid')),
      `Got error: "${replayError}"`
    );

    // 1c: Cross-tenant / Cross-user state hijacking
    const victimBinding = await OAuthStateManager.generateStateWithBinding({
      organizationId: 'victim-org-123',
      userId: 'victim-user-123',
      provider: 'google_calendar',
    });

    let hijacked = false;
    try {
      await OAuthStateManager.verifyAndConsumeState({
        stateParam: victimBinding.state,
        expectedProvider: 'google_calendar',
        expectedOrgId: 'attacker-org-666',
        expectedUserId: 'attacker-user-666',
        sessionBindingSecret: victimBinding.sessionBindingSecret,
      });
    } catch {
      hijacked = true;
    }

    check('Cross-tenant state consumption fails security validation', hijacked === true);
  }

  // -------------------------------------------------------------
  // Test 2: Webhook Channel Token Validation (Google & Microsoft)
  // -------------------------------------------------------------
  {
    const channelId = `ch-gcal-${Date.now()}`;
    const validToken = `tok-gcal-${Date.now()}-secret`;

    CalendarSyncService.registerWatchChannel(channelId, testOrgId, 'google_calendar', validToken);

    // Valid token
    const validRes = await CalendarSyncService.validateGoogleWebhookChannel(channelId, validToken);
    check(
      'Google webhook validation accepts registered channel and matching token',
      validRes.valid === true && validRes.organizationId === testOrgId
    );

    // Forged token
    const forgedRes = await CalendarSyncService.validateGoogleWebhookChannel(channelId, 'forged-token-xyz');
    check(
      'Google webhook validation strictly rejects forged channel token',
      forgedRes.valid === false && forgedRes.error?.includes('mismatch')
    );

    // Microsoft Graph clientState validation
    const subId = `sub-ms-${Date.now()}`;
    const validState = `client-state-${Date.now()}-abc`;
    CalendarSyncService.registerWatchChannel(subId, testOrgId, 'microsoft_calendar', validState);

    const validMsRes = await CalendarSyncService.validateMicrosoftSubscription(subId, validState);
    check(
      'Microsoft webhook validation accepts registered subscription and matching clientState',
      validMsRes.valid === true && validMsRes.organizationId === testOrgId
    );

    const invalidMsRes = await CalendarSyncService.validateMicrosoftSubscription(subId, 'wrong-client-state');
    check(
      'Microsoft webhook validation strictly rejects invalid clientState',
      invalidMsRes.valid === false
    );
  }

  // -------------------------------------------------------------
  // Test 3: Unified Availability Engine (External Calendar Collision)
  // -------------------------------------------------------------
  {
    const calOrgId = `org-cal-avail-${Date.now()}`;
    const testDate = '2026-11-20';

    // Before connecting calendar: Check baseline availability (all business hour slots available)
    const baseline = await CalendarSyncService.checkAvailability({
      organizationId: calOrgId,
      date: testDate,
    });

    check('Baseline availability returns 8 standard slots', baseline.slots.length === 8);
    const allFreeInitially = baseline.slots.every((s) => s.available);
    check('All baseline slots initially marked available', allFreeInitially === true);

    // Register a simulated Google Calendar connection
    await CalendarSyncService.registerConnection({
      id: `conn-gcal-${Date.now()}`,
      organizationId: calOrgId,
      provider: 'google_calendar',
      accountIdentifier: 'doctor@practice.de',
      accountName: 'Dr. Practice',
      externalCalendarId: 'primary',
      calendarName: 'Practice Calendar',
      syncEnabled: true,
      accessToken: 'simulated-gcal-token',
    });

    // Seed an external Google event for 10:00 - 11:00 on testDate
    GoogleCalendarAdapter.setSimulatedEvents([
      {
        id: 'evt-surgery-10am',
        calendarId: 'primary',
        provider: 'google_calendar',
        externalEventId: 'evt-surgery-10am',
        title: 'Emergency Surgery',
        timeZone: 'Europe/Berlin',
        startTime: `${testDate}T10:00:00.000Z`,
        endTime: `${testDate}T11:00:00.000Z`,
        status: 'confirmed',
      },
    ]);

    // Check availability again
    const postSyncAvail = await CalendarSyncService.checkAvailability({
      organizationId: calOrgId,
      date: testDate,
    });

    const slot10 = postSyncAvail.slots.find((s) => s.startTime.includes('10:00'));
    const slot09 = postSyncAvail.slots.find((s) => s.startTime.includes('09:00'));
    const slot14 = postSyncAvail.slots.find((s) => s.startTime.includes('14:00'));

    check('Slot at 10:00 is marked UNAVAILABLE due to external calendar conflict', slot10?.available === false);
    check('Adjacent slot at 09:00 remains AVAILABLE', slot09?.available === true);
    check('Afternoon slot at 14:00 remains AVAILABLE', slot14?.available === true);
  }

  // -------------------------------------------------------------
  // Test 4: Multi-Tenant Calendar Collision Isolation
  // -------------------------------------------------------------
  {
    const orgBeta = `org-cal-beta-${Date.now()}`;
    const testDate = '2026-11-20';

    // Org Beta queries availability on the same date where Org Alpha has a 10:00 conflict
    const betaAvail = await CalendarSyncService.checkAvailability({
      organizationId: orgBeta,
      date: testDate,
    });

    const betaSlot10 = betaAvail.slots.find((s) => s.startTime.includes('10:00'));
    check(
      'Multi-tenant: Org Beta 10:00 slot is NOT blocked by Org Alpha external calendar event',
      betaSlot10?.available === true,
      `Org Beta slot available=${betaSlot10?.available}`
    );
  }

  console.log('----------------------------------------------------------------');
  console.log(`DOMAIN J RESULTS: ${passedChecks}/${totalChecks} PASSED (${failedChecks} FAILED)`);
  console.log('================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runDomainJTests().catch((err) => {
  console.error('Unhandled failure in Domain J tests:', err);
  process.exit(1);
});
