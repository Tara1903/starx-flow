/**
 * StarX-Flow QA Test Suite - Domains G & H: Email (Resend) and Human Handoff
 * Probes outbound email dispatch, internal note leakage prevention, subaddress routing,
 * thread resolution, human takeover auto-reply suppression, and AI hand-back lifecycle.
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

async function runDomainGHTests() {
  console.log('================================================================');
  console.log(' DOMAINS G & H: EMAIL (RESEND) & HUMAN HANDOFF TESTING');
  console.log('================================================================');

  const { ResendEmailAdapter } = await import('../src/lib/integrations/email/resendEmailAdapter');
  const { AIOrchestrator } = await import('../src/lib/ai/orchestrator');
  const { InboxService } = await import('../src/lib/inbox/inboxService');

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

  const testOrgId = `org-email-test-${Date.now()}`;
  ResendEmailAdapter.registerActiveOrganization(testOrgId, { status: 'active', inboxProvisioned: true });

  // -------------------------------------------------------------
  // Test 1: Outbound Email Dispatch
  // -------------------------------------------------------------
  {
    const adapter = new ResendEmailAdapter();
    const result = await adapter.sendEmail({
      organizationId: testOrgId,
      to: 'customer@client-domain.de',
      subject: 'Your StarX Appointment Confirmation',
      text: 'Your appointment is confirmed for Friday at 14:00.',
      html: '<p>Your appointment is confirmed for Friday at 14:00.</p>',
    });

    check('Outbound email dispatched successfully with messageId', result.success === true && Boolean(result.messageId));
  }

  // -------------------------------------------------------------
  // Test 2: Internal Notes Leakage Prevention
  // -------------------------------------------------------------
  {
    const adapter = new ResendEmailAdapter();
    let threw = false;
    let errorMsg = '';

    try {
      await adapter.sendEmail({
        organizationId: testOrgId,
        to: 'customer@client-domain.de',
        subject: 'Confidential Staff Note',
        text: 'Customer has payment dispute history.',
        isInternal: true,
      });
    } catch (err: any) {
      threw = true;
      errorMsg = err.message;
    }

    check(
      'Resend adapter strictly throws security violation on isInternal=true',
      threw && errorMsg.includes('SECURITY VIOLATION'),
      `Got error: "${errorMsg}"`
    );
  }

  // -------------------------------------------------------------
  // Test 3: Outbound Email Idempotency
  // -------------------------------------------------------------
  {
    const adapter = new ResendEmailAdapter();
    const idemKey = `idem-${Date.now()}-abc`;

    const firstSend = await adapter.sendEmail({
      organizationId: testOrgId,
      to: 'customer@client-domain.de',
      subject: 'Idempotency Test Email',
      text: 'First dispatch',
      idempotencyKey: idemKey,
    });

    const secondSend = await adapter.sendEmail({
      organizationId: testOrgId,
      to: 'customer@client-domain.de',
      subject: 'Idempotency Test Email',
      text: 'Second dispatch duplicate',
      idempotencyKey: idemKey,
    });

    check(
      'Re-sending with same idempotencyKey returns cached delivery result without duplicate send',
      firstSend.messageId === secondSend.messageId
    );
  }

  // -------------------------------------------------------------
  // Test 4: Inbound Email Thread Linking & Subaddress Routing
  // -------------------------------------------------------------
  {
    const adapter = new ResendEmailAdapter();
    const threadMessageId = `<msg-thread-${Date.now()}@starx-flow.com>`;

    // Record an active thread in memory
    const existingConvoId = `convo-email-${Date.now()}`;
    ResendEmailAdapter.recordThread(threadMessageId, {
      organizationId: testOrgId,
      conversationId: existingConvoId,
      leadId: `lead-email-${Date.now()}`,
      subject: 'Hair Treatment Booking',
      recipient: 'customer@client-domain.de',
    });

    // Inbound reply with inReplyTo matching the parent thread
    const inboundPayload = {
      event_id: `evt-inbound-${Date.now()}`,
      type: 'email.received',
      created_at: new Date().toISOString(),
      data: {
        id: `re-inbound-${Date.now()}`,
        from: 'customer@client-domain.de',
        to: [`receptionist+${testOrgId}@starx-flow.com`],
        subject: 'Re: Hair Treatment Booking',
        text: 'Thank you, can we move it to 15:00 instead?',
        headers: {
          'message-id': `<inbound-reply-${Date.now()}@client-domain.de>`,
          'in-reply-to': threadMessageId,
        },
      },
    };

    const webhookResult = await adapter.processInboundWebhook(inboundPayload);
    check(
      'Inbound email links to existing conversation via in-reply-to thread header',
      webhookResult.status === 'processed' && webhookResult.conversationId === existingConvoId,
      `Got status=${webhookResult.status}, convoId=${webhookResult.conversationId}`
    );
  }

  // -------------------------------------------------------------
  // Test 5: Human Handoff Lifecycle: AI Mode -> Human Takeover -> AI Hand-back
  // -------------------------------------------------------------
  {
    const customerPhone = '+491768889990';
    const testUser = `user-handoff-${Date.now()}`;

    // Step A: Inbound message under normal AI control mode
    const initialMsg = await AIOrchestrator.handleInboundMessage({
      userId: testUser,
      organizationId: testOrgId,
      channel: 'WhatsApp',
      senderName: 'Clara Oswald',
      senderPhone: customerPhone,
      messageText: 'What is your address?',
    });

    const convoId = initialMsg.conversationId;
    check('Initial inbound message generates active AI reply', Boolean(initialMsg.aiResponse.replyText));

    // Step B: Human staff takes over thread
    AIOrchestrator.setConversationControlMode(convoId, 'human', 'Staff agent taking over thread');

    // Step C: Customer sends follow-up while human staff is in control
    const humanControlledMsg = await AIOrchestrator.handleInboundMessage({
      userId: testUser,
      organizationId: testOrgId,
      channel: 'WhatsApp',
      senderName: 'Clara Oswald',
      senderPhone: customerPhone,
      messageText: 'Hello, are you still there?',
      conversationId: convoId,
    });

    check(
      'Inbound message under human takeover has AI auto-reply SUPPRESSED',
      humanControlledMsg.aiResponse.replyText === '' &&
        humanControlledMsg.aiResponse.model === 'human-control-suppression',
      `Got replyText="${humanControlledMsg.aiResponse.replyText}", model="${humanControlledMsg.aiResponse.model}"`
    );

    // Step D: Staff hands conversation back to AI
    AIOrchestrator.setConversationControlMode(convoId, 'ai', 'Staff resolved issue, returning to AI');

    // Step E: Customer sends new inquiry
    const resumedMsg = await AIOrchestrator.handleInboundMessage({
      userId: testUser,
      organizationId: testOrgId,
      channel: 'WhatsApp',
      senderName: 'Clara Oswald',
      senderPhone: customerPhone,
      messageText: 'What time do you open tomorrow?',
      conversationId: convoId,
    });

    check(
      'After hand-back to AI mode, automated receptionist response resumes immediately',
      Boolean(resumedMsg.aiResponse.replyText) && resumedMsg.aiResponse.model !== 'human-control-suppression',
      `Got reply="${resumedMsg.aiResponse.replyText}"`
    );
  }

  console.log('----------------------------------------------------------------');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`DOMAINS G & H RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDomainGHTests().catch((err) => {
  console.error('Fatal error running Domains G & H tests:', err);
  process.exit(1);
});
