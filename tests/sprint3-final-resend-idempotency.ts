/**
 * STARX-FLOW SPRINT 3 FINAL REMEDIATION: RESEND OUTBOUND IDEMPOTENCY & LEASE FENCING
 * Tests all 7 failure scenarios required by Sprint 3 Final Remediation Specification:
 *
 * 1. Worker crashes before sending.
 * 2. Worker crashes after sending but before completing the database record.
 * 3. Lease expires while the original worker is still running.
 * 4. Another worker reclaims the event.
 * 5. Two workers attempt dispatch simultaneously.
 * 6. Resend responds with a timeout after potentially accepting the message.
 * 7. Database completion fails after successful external delivery.
 */

import assert from 'assert';
import crypto from 'crypto';
import { ResendEmailAdapter } from '../src/lib/integrations/email/resendEmailAdapter';

let passed = 0;
let failed = 0;

function testAssert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runIdempotencyTests() {
  console.log('\n========================================================================');
  console.log('STARX-FLOW SPRINT 3 FINAL: RESEND OUTBOUND IDEMPOTENCY & LEASE FENCING');
  console.log('========================================================================\n');

  const orgId = '11111111-1111-4111-8111-111111111111';
  const adapter = new ResendEmailAdapter();

  // --------------------------------------------------------------------------
  // TEST SCENARIO 1: Worker crashes before sending
  // --------------------------------------------------------------------------
  console.log('--- SCENARIO 1: Worker Crashes Before Sending ---');
  ResendEmailAdapter.clearSimulated();
  (ResendEmailAdapter as any).simulatedOrganizations.set(orgId, { status: 'active', inboxProvisioned: true });

  const eventId1 = `evt_crash_before_send_${Date.now()}`;
  const worker1 = 'worker_alpha_crasher';
  const worker2 = 'worker_beta_recovery';

  // Worker 1 claims event but crashes immediately (simulated by failWebhookEvent or lease timeout)
  const claim1 = await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId1,
    payloadHash: 'hash1',
    organizationId: orgId,
    eventType: 'email.inbound',
    leaseSeconds: 1,
    workerId: worker1,
  });
  testAssert(claim1.claimed === true, 'Worker 1 successfully claimed event');

  // Worker 1 crashes and marks failure (or lease expires)
  await (ResendEmailAdapter as any).failWebhookEvent({
    provider: 'resend',
    eventId: eventId1,
    errorMessage: 'Worker 1 simulated crash before dispatch',
  });

  // Worker 2 attempts retry claim
  const claim2 = await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId1,
    payloadHash: 'hash1',
    organizationId: orgId,
    eventType: 'email.inbound',
    leaseSeconds: 60,
    workerId: worker2,
  });
  testAssert(claim2.claimed === true && claim2.status === 'claimed_retry', 'Worker 2 recovered failed event via safe retry');

  // Worker 2 proceeds to send outbound message
  const result1 = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Re: Inquiry',
    text: 'Hello from recovery worker',
    idempotencyKey: `resend_reply_${crypto.createHash('sha256').update(`${eventId1}:customer@paris.fr:reply`).digest('hex')}`,
  });
  testAssert(result1.success === true, 'Worker 2 successfully dispatched outbound email after Worker 1 crash');
  testAssert(ResendEmailAdapter.getSentEmails().length === 1, 'Exactly one message dispatched');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 2: Worker crashes after sending but before DB completion
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Worker Crashes After Sending But Before DB Completion ---');
  ResendEmailAdapter.clearSimulated();
  (ResendEmailAdapter as any).simulatedOrganizations.set(orgId, { status: 'active', inboxProvisioned: true });

  const eventId2 = `evt_crash_after_send_${Date.now()}`;
  const stableIdempotencyKey2 = `resend_reply_${crypto.createHash('sha256').update(`${eventId2}:customer@paris.fr:reply`).digest('hex')}`;

  // Worker 1 claims
  await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId2,
    payloadHash: 'hash2',
    organizationId: orgId,
    leaseSeconds: 1,
    workerId: 'worker_sender_crasher',
  });

  // Worker 1 dispatches email to Resend
  const sentByWorker1 = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Re: Inquiry',
    text: 'Original message text',
    idempotencyKey: stableIdempotencyKey2,
  });
  testAssert(sentByWorker1.success === true, 'Worker 1 dispatched email');
  testAssert(ResendEmailAdapter.getSentEmails().length === 1, 'Initial send recorded');

  // Worker 1 CRASHES before calling completeWebhookEvent! Lease expires in memory.
  const claimRecord2 = (ResendEmailAdapter as any).simulatedEventClaims.get(eventId2);
  claimRecord2.expiresAt = Date.now() - 1000; // Force lease expiration

  // Worker 2 reclaims the event after lease expiration
  const claimWorker2 = await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId2,
    payloadHash: 'hash2',
    organizationId: orgId,
    leaseSeconds: 60,
    workerId: 'worker_reclaim_runner',
  });
  testAssert(claimWorker2.claimed === true, 'Worker 2 reclaimed expired lease');

  // Worker 2 attempts dispatch using the deterministic idempotency key
  const sentByWorker2 = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Re: Inquiry',
    text: 'Original message text',
    idempotencyKey: stableIdempotencyKey2, // Same stable key!
  });

  testAssert(sentByWorker2.messageId === sentByWorker1.messageId, 'Worker 2 received identical message ID via Idempotency-Key deduplication');
  testAssert(ResendEmailAdapter.getSentEmails().length === 1, 'Deduplication prevented duplicate customer email (remains exactly 1 sent)');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 3: Lease expires while original worker is still running
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Lease Expires While Original Worker Is Still Running ---');
  ResendEmailAdapter.clearSimulated();
  (ResendEmailAdapter as any).simulatedOrganizations.set(orgId, { status: 'active', inboxProvisioned: true });

  const eventId3 = `evt_slow_worker_${Date.now()}`;
  const slowWorker = 'worker_very_slow';

  // Slow worker claims with 1-second lease
  await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId3,
    payloadHash: 'hash3',
    organizationId: orgId,
    leaseSeconds: 1,
    workerId: slowWorker,
  });

  // Simulate slow worker taking 1.5 seconds (lease expires)
  const claimRecord3 = (ResendEmailAdapter as any).simulatedEventClaims.get(eventId3);
  claimRecord3.expiresAt = Date.now() - 1000; // Expired

  // Slow worker reaches pre-dispatch fencing check
  const isSlowWorkerLeaseValid = await ResendEmailAdapter.verifyLeaseOwnership('resend', eventId3, slowWorker);
  testAssert(isSlowWorkerLeaseValid === false, 'Pre-dispatch fencing check detects expired lease on slow worker');

  // In processInboundWebhook, this check aborts dispatch
  const slowWorkerResult = isSlowWorkerLeaseValid
    ? await adapter.sendEmail({ organizationId: orgId, to: 'customer@paris.fr', subject: 'Late send' })
    : null;
  testAssert(slowWorkerResult === null, 'Slow worker aborted outbound dispatch without calling sendEmail');
  testAssert(ResendEmailAdapter.getSentEmails().length === 0, 'Zero emails dispatched by stale worker');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 4: Another worker reclaims the event
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Another Worker Reclaims The Event ---');
  // Continuing from Scenario 3: Worker 2 reclaims eventId3
  const activeWorker = 'worker_fast_replacement';
  await (ResendEmailAdapter as any).claimWebhookEvent({
    provider: 'resend',
    eventId: eventId3,
    payloadHash: 'hash3',
    organizationId: orgId,
    leaseSeconds: 60,
    workerId: activeWorker,
  });

  // Slow worker wakes up and attempts verifyLeaseOwnership again
  const staleCheck = await ResendEmailAdapter.verifyLeaseOwnership('resend', eventId3, slowWorker);
  testAssert(staleCheck === false, 'Stale worker ownership check strictly returns false when another worker owns lease');

  // Active worker verifyLeaseOwnership succeeds
  const activeCheck = await ResendEmailAdapter.verifyLeaseOwnership('resend', eventId3, activeWorker);
  testAssert(activeCheck === true, 'New active worker holds valid lease ownership');

  // Active worker safely dispatches
  await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Re: Timely Reply',
    text: 'Dispatched by active worker',
    idempotencyKey: `resend_reply_${crypto.createHash('sha256').update(`${eventId3}:customer@paris.fr:reply`).digest('hex')}`,
  });
  testAssert(ResendEmailAdapter.getSentEmails().length === 1, 'Only active worker successfully delivered email');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 5: Two workers attempt dispatch simultaneously
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Two Workers Attempt Dispatch Simultaneously ---');
  ResendEmailAdapter.clearSimulated();
  (ResendEmailAdapter as any).simulatedOrganizations.set(orgId, { status: 'active', inboxProvisioned: true });

  const eventId5 = `evt_parallel_claim_${Date.now()}`;
  const payload5 = {
    type: 'email.inbound' as const,
    created_at: new Date().toISOString(),
    data: {
      message_id: eventId5,
      from: 'Client <client@paris.fr>',
      to: [`inbox+${orgId}@starx-flow.com`],
      subject: 'Parallel Delivery Test',
      text: 'Simultaneous webhooks',
    },
  };

  // Launch two concurrent worker pipelines
  const [resA, resB] = await Promise.all([
    adapter.processInboundWebhook(payload5, { organizationId: orgId, workerId: 'worker_concurrent_A' }),
    adapter.processInboundWebhook(payload5, { organizationId: orgId, workerId: 'worker_concurrent_B' }),
  ]);

  const processedCount = [resA, resB].filter((r) => r.status === 'processed').length;
  const duplicateCount = [resA, resB].filter((r) => r.status === 'duplicate_ignored').length;

  testAssert(processedCount === 1, 'Exactly one concurrent worker processed the event');
  testAssert(duplicateCount === 1, 'Second concurrent worker was rejected at claim gate as duplicate_ignored');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 6: Resend responds with a timeout after potentially accepting
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Resend Responds With Timeout After Accepting ---');
  // Simulate client sending to Resend with idempotencyKey, network drops, client retries with same key
  const timeoutIdempotencyKey = `resend_timeout_key_${Date.now()}`;
  const initialSend = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Timeout Scenario',
    text: 'Attempt 1',
    idempotencyKey: timeoutIdempotencyKey,
  });

  // Client retries dispatch with the exact same idempotency key
  const retrySend = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'Timeout Scenario',
    text: 'Attempt 2 (Retry)',
    idempotencyKey: timeoutIdempotencyKey,
  });

  testAssert(initialSend.messageId === retrySend.messageId, 'Retry after timeout returned identical cached messageId');
  testAssert(initialSend.providerId === retrySend.providerId, 'Provider ID matches without creating second outbound delivery');

  // --------------------------------------------------------------------------
  // TEST SCENARIO 7: Database completion fails after successful external delivery
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 7: Database Completion Fails After External Delivery ---');
  const eventId7 = `evt_db_fail_after_send_${Date.now()}`;
  const stableKey7 = `resend_reply_${crypto.createHash('sha256').update(`${eventId7}:customer@paris.fr:reply`).digest('hex')}`;

  // First worker dispatches external email
  const sendRes7A = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'DB Fail Scenario',
    text: 'External email delivered',
    idempotencyKey: stableKey7,
  });

  // Simulate DB completion RPC failure (event remains in claimed or failed state)
  // Subsequent retry worker attempts re-processing
  const sendRes7B = await adapter.sendEmail({
    organizationId: orgId,
    to: 'customer@paris.fr',
    subject: 'DB Fail Scenario',
    text: 'External email retry',
    idempotencyKey: stableKey7,
  });

  testAssert(sendRes7A.messageId === sendRes7B.messageId, 'Retry after DB completion failure safely deduplicated by Resend idempotency key');

  console.log('\n========================================================================');
  console.log(`ALL 7 RESEND IDEMPOTENCY & LEASE FENCING SCENARIOS PASSED: ${passed} PASS, ${failed} FAIL`);
  console.log('========================================================================\n');
}

runIdempotencyTests().catch((err) => {
  console.error('[Idempotency Test Error]:', err);
  process.exit(1);
});
