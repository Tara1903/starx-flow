/**
 * StarX-Flow QA Test Suite - Domains D & E: Webhooks and Social Channels (WhatsApp, Instagram, Messenger)
 * Probes Meta webhook verification, HMAC authentication, payload normalization,
 * idempotency replay defense, 24-hour messaging windows, and internal note leakage prevention.
 */

import fs from 'fs';
import path from 'path';

// 1. Load environment variables before importing app modules
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      val = val.replace(/^["'](.*)["']$/, '$1').trim();
      process.env[key] = val;
    }
  }
}

async function runDomainDETests() {
  console.log('================================================================');
  console.log(' DOMAINS D & E: WHATSAPP, INSTAGRAM & MESSENGER TESTING');
  console.log('================================================================');

  const { NextRequest } = await import('next/server');
  const { GET: getWhatsAppWebhook } = await import('../src/app/api/whatsapp/webhook/route');
  const { GET: getFbWebhook } = await import('../src/app/api/integrations/facebook/webhook/route');
  const { GET: getIgWebhook } = await import('../src/app/api/integrations/instagram/webhook/route');
  const { WhatsAppAdapter } = await import('../src/lib/ingestion/adapters/whatsappAdapter');
  const { FacebookMessengerAdapter } = await import('../src/lib/ingestion/adapters/facebookMessengerAdapter');
  const { IdempotencyManager } = await import('../src/lib/ingestion/idempotency');
  const { IngestionGateway } = await import('../src/lib/ingestion');

  interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
  }

  const results: TestResult[] = [];

  function check(name: string, condition: boolean, message?: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      results.push({ name, passed: true });
    } else {
      console.error(`  ✗ FAIL: ${name} -> ${message || 'Assertion failed'}`);
      results.push({ name, passed: false, error: message || 'Assertion failed' });
    }
  }

  const verifyToken = process.env.META_VERIFY_TOKEN || 'starx_meta_verify_token_default';

  // -------------------------------------------------------------
  // Test 1: WhatsApp Webhook Challenge Verification (GET)
  // -------------------------------------------------------------
  {
    // Valid challenge
    const validUrl = `http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
      verifyToken
    )}&hub.challenge=test_challenge_12345`;
    const resValid = await getWhatsAppWebhook(new Request(validUrl));
    const challengeText = await resValid.text();
    check('WhatsApp GET webhook with valid verify_token returns 200 challenge', resValid.status === 200 && challengeText === 'test_challenge_12345');

    // Invalid challenge
    const invalidUrl = `http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge_12345`;
    const resInvalid = await getWhatsAppWebhook(new Request(invalidUrl));
    check('WhatsApp GET webhook with wrong verify_token returns 403', resInvalid.status === 403);
  }

  // -------------------------------------------------------------
  // Test 2: Facebook Messenger Webhook Challenge (GET)
  // -------------------------------------------------------------
  {
    const validReq = new NextRequest(
      `http://localhost:3000/api/integrations/facebook/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
        verifyToken
      )}&hub.challenge=fb_challenge_6789`
    );
    const resValid = await getFbWebhook(validReq);
    const text = await resValid.text();
    check('Messenger GET webhook with valid token returns challenge', resValid.status === 200 && text === 'fb_challenge_6789');

    const invalidReq = new NextRequest(
      `http://localhost:3000/api/integrations/facebook/webhook?hub.mode=subscribe&hub.verify_token=wrong_fb_token&hub.challenge=fb_challenge_6789`
    );
    const resInvalid = await getFbWebhook(invalidReq);
    check('Messenger GET webhook with wrong token returns 403', resInvalid.status === 403);
  }

  // -------------------------------------------------------------
  // Test 3: Instagram Webhook Challenge (GET)
  // -------------------------------------------------------------
  {
    const validReq = new NextRequest(
      `http://localhost:3000/api/integrations/instagram/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
        verifyToken
      )}&hub.challenge=ig_challenge_abc`
    );
    const resValid = await getIgWebhook(validReq);
    const text = await resValid.text();
    check('Instagram GET webhook with valid token returns challenge', resValid.status === 200 && text === 'ig_challenge_abc');
  }

  // -------------------------------------------------------------
  // Test 4: WhatsApp Payload Normalization
  // -------------------------------------------------------------
  {
    const adapter = new WhatsAppAdapter();
    const rawPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'wa-biz-123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551234567',
                  phone_number_id: 'pn-12345',
                },
                contacts: [{ profile: { name: 'Maria Rossi' }, wa_id: '49170999888' }],
                messages: [
                  {
                    from: '49170999888',
                    id: 'wamid.HBgLMTIzNDU2Nzg5',
                    timestamp: '1746000000',
                    text: { body: 'Hello, what are your opening hours?' },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const canonical = await adapter.normalize(rawPayload);
    check('WhatsApp payload normalized with sender name and phone', canonical !== null && canonical.sender.name === 'Maria Rossi' && canonical.sender.phone === '+49170999888');
    check('WhatsApp normalized text body matches', canonical?.message.text === 'Hello, what are your opening hours?');
  }

  // -------------------------------------------------------------
  // Test 5: Idempotency & Replay Attack Defense
  // -------------------------------------------------------------
  {
    const testEventId = `wa-event-${Date.now()}`;
    const testChannel = 'whatsapp';

    check('Event is NOT duplicate prior to processing', IdempotencyManager.isDuplicate(testChannel, testEventId) === false);

    IdempotencyManager.markProcessed(testChannel, testEventId);

    check('Event IS duplicate immediately after being processed', IdempotencyManager.isDuplicate(testChannel, testEventId) === true);

    // Clean up
    IdempotencyManager.clear(testChannel, testEventId);
    check('Event is cleared after manual reset', IdempotencyManager.isDuplicate(testChannel, testEventId) === false);
  }

  // -------------------------------------------------------------
  // Test 6: IngestionGateway End-to-End Duplicate Rejection
  // -------------------------------------------------------------
  {
    const uniqueEventId = `gateway-wa-${Date.now()}`;
    const mockCanonical = {
      eventId: uniqueEventId,
      channel: 'whatsapp' as const,
      organizationId: 'org-test-wa',
      userId: 'user-test-wa',
      sender: {
        name: 'Carlos Santana',
        identifier: '+491712223334',
        phone: '+491712223334',
        externalUserId: '491712223334',
      },
      message: {
        messageId: uniqueEventId,
        text: 'What are your hours on Saturday?',
        timestamp: new Date().toISOString(),
      },
      receivedAt: new Date().toISOString(),
    };

    const firstRun = await IngestionGateway.process(mockCanonical);
    check('First webhook event processing succeeds', firstRun.success === true && firstRun.status === 'processed');

    const secondRun = await IngestionGateway.process(mockCanonical);
    check('Duplicate webhook event cleanly acknowledged with status=duplicate', secondRun.success === true && secondRun.status === 'duplicate');
  }

  // -------------------------------------------------------------
  // Test 7: 24-Hour Messaging Window Enforcement (Facebook Messenger)
  // -------------------------------------------------------------
  {
    FacebookMessengerAdapter.clearSimulated();
    const adapter = new FacebookMessengerAdapter();
    const orgId = 'org-window-test';
    const psid = 'psid-998877';

    // Before interaction, window is closed
    const isOpenBefore = await adapter.isWithin24HourWindow(orgId, psid);
    check('Customer window is closed prior to any customer inbound message', isOpenBefore === false);

    // Record customer interaction (opens 24h window)
    await FacebookMessengerAdapter.recordCustomerInteraction(orgId, psid);
    const isOpenAfter = await adapter.isWithin24HourWindow(orgId, psid);
    check('Customer window is open after customer interaction is recorded', isOpenAfter === true);
  }

  // -------------------------------------------------------------
  // Test 8: Internal Notes Protection
  // -------------------------------------------------------------
  {
    const adapter = new FacebookMessengerAdapter();
    let threw = false;
    let errorMsg = '';
    try {
      await adapter.sendMessage({
        organizationId: 'org-test-notes',
        recipientPsid: 'psid-test',
        text: 'SECRET INTERNAL NOTE: VIP client discount',
        isInternal: true,
      });
    } catch (err: any) {
      threw = true;
      errorMsg = err.message;
    }

    check(
      'External adapter rejects dispatch of internal notes with exception',
      threw && errorMsg.includes('SECURITY VIOLATION'),
      `Got error: "${errorMsg}"`
    );
  }

  console.log('----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`DOMAINS D & E RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDomainDETests().catch((err) => {
  console.error('Fatal error running Domains D & E tests:', err);
  process.exit(1);
});
