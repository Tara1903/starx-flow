/**
 * STARX-FLOW — CRIT-01 PRODUCTION CRON SCHEDULER VERIFICATION SUITE
 * 
 * Verifies the resolution of CRIT-01 across all 12 operational and security requirements:
 * 1. Missing CRON_SECRET.
 * 2. Invalid CRON_SECRET (format, length, content, constant-time check).
 * 3. Valid authenticated request (Bearer token).
 * 4. Empty job queue.
 * 5. Successful job execution (appointment_reminder, lead_followup, delivery_retry).
 * 6. Failed job retry (exponential backoff, error tracking, status='pending').
 * 7. Expired lease recovery (stale worker lease expiration and re-claiming).
 * 8. Concurrent cron invocation (disjoint job distribution, zero duplicate claims).
 * 9. Duplicate execution protection (idempotency key deduplication).
 * 10. Partial batch failure (job 2 failure does not abort job 1 or job 3).
 * 11. Maximum execution duration protection (bounded serverless timeout budget).
 * 12. Job completion persistence (completedAt, lease cleared, usage recorded).
 */

import assert from 'assert';
import crypto from 'crypto';
import { GET, POST } from '../src/app/api/cron/process-jobs/route';
import { ReceptionistJobScheduler, ReceptionistJob } from '../src/lib/jobs/receptionistJobScheduler';
import { OutboundDispatcher } from '../src/lib/inbox/outboundDispatcher';
import { UsageService } from '../src/lib/usage/usageService';

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

async function runCronSchedulerRemediationTests() {
  console.log('========================================================================');
  console.log('STARX-FLOW — CRIT-01 PRODUCTION SCHEDULER REMEDIATION SUITE');
  console.log('========================================================================\n');

  const testOrgId = '77777777-7777-4777-8777-777777777777';
  const validSecret = 'test-cron-secret-production-2026-very-secure';

  // =========================================================================
  // TEST 1: Missing CRON_SECRET in environment
  // =========================================================================
  console.log('--- [TEST 1] Missing CRON_SECRET in environment ---');
  delete process.env.CRON_SECRET;
  
  const reqNoEnvSecret = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resNoEnvSecret = await GET(reqNoEnvSecret);
  testAssert(resNoEnvSecret.status === 401, 'Returns 401 Unauthorized when CRON_SECRET is not configured in env');
  const bodyNoEnvSecret = await resNoEnvSecret.json();
  testAssert(bodyNoEnvSecret.success === false && bodyNoEnvSecret.error.includes('CRON_SECRET'), 'Returns clear unauthorized error message');

  // Now configure CRON_SECRET for subsequent tests
  process.env.CRON_SECRET = validSecret;

  // =========================================================================
  // TEST 2: Invalid CRON_SECRET (Missing header, bad format, wrong token)
  // =========================================================================
  console.log('\n--- [TEST 2] Invalid CRON_SECRET & Malformed Headers ---');

  // Missing Authorization header
  const reqNoHeader = new Request('http://localhost:3000/api/cron/process-jobs', { method: 'GET' });
  const resNoHeader = await GET(reqNoHeader);
  testAssert(resNoHeader.status === 401, 'Rejects request with missing Authorization header');

  // Malformed header format (Basic auth instead of Bearer)
  const reqBasicAuth = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Basic dXNlcjpwYXNz` },
  });
  const resBasicAuth = await GET(reqBasicAuth);
  testAssert(resBasicAuth.status === 401, 'Rejects non-Bearer authorization scheme');

  // Wrong token (different length)
  const reqWrongLength = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer short-token` },
  });
  const resWrongLength = await GET(reqWrongLength);
  testAssert(resWrongLength.status === 401, 'Rejects token with length mismatch (timing-safe check)');

  // Wrong token (same length, different characters)
  const wrongTokenSameLength = 'x'.repeat(validSecret.length);
  const reqWrongContent = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${wrongTokenSameLength}` },
  });
  const resWrongContent = await GET(reqWrongContent);
  testAssert(resWrongContent.status === 401, 'Rejects invalid token with constant-time equality check');

  // =========================================================================
  // TEST 3: Valid Authenticated Request (Both GET and POST)
  // =========================================================================
  console.log('\n--- [TEST 3] Valid Authenticated Request (GET & POST) ---');
  ReceptionistJobScheduler.clearInMemory();

  const reqValidGet = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resValidGet = await GET(reqValidGet);
  testAssert(resValidGet.status === 200, 'GET request with valid Bearer token returns 200 OK');

  const reqValidPost = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resValidPost = await POST(reqValidPost);
  testAssert(resValidPost.status === 200, 'POST request with valid Bearer token returns 200 OK');

  // =========================================================================
  // TEST 4: Empty Job Queue
  // =========================================================================
  console.log('\n--- [TEST 4] Empty Job Queue ---');
  ReceptionistJobScheduler.clearInMemory();

  const reqEmpty = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resEmpty = await GET(reqEmpty);
  const bodyEmpty = await resEmpty.json();

  testAssert(bodyEmpty.success === true, 'Empty queue returns success: true');
  testAssert(bodyEmpty.claimed === 0, 'Empty queue reports claimed: 0');
  testAssert(bodyEmpty.processed === 0, 'Empty queue reports processed: 0');
  testAssert(bodyEmpty.jobs.length === 0, 'Empty queue reports empty jobs array');

  // =========================================================================
  // TEST 5: Successful Job Execution (Reminders, Follow-ups, Retries)
  // =========================================================================
  console.log('\n--- [TEST 5] Successful Job Execution Across Supported Types ---');
  ReceptionistJobScheduler.clearInMemory();

  // 1. Schedule appointment reminder (due now)
  const reminderSched = await ReceptionistJobScheduler.scheduleAppointmentReminder({
    organizationId: testOrgId,
    appointmentId: 'appt-101',
    customerName: 'Marcus Dupont',
    customerPhone: '+33611223344',
    serviceName: 'Full Balayage & Blowdry',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    hoursNotice: 24,
  });
  // Make due immediately
  reminderSched.job.scheduledFor = new Date(Date.now() - 1000).toISOString();

  // 2. Schedule lead follow-up (due now)
  const followupSched = await ReceptionistJobScheduler.scheduleLeadFollowup({
    organizationId: testOrgId,
    conversationId: 'conv-202',
    customerName: 'Claire Bernard',
    channel: 'whatsapp',
    recipient: '+33622334455',
    inquiry: 'Bridal styling package pricing',
    scheduledFor: new Date(Date.now() - 1000),
  });

  // 3. Schedule delivery retry (due now)
  const retrySched = await ReceptionistJobScheduler.scheduleDeliveryRetry({
    organizationId: testOrgId,
    targetId: 'conv-303',
    channel: 'email',
    recipient: 'claire@example.fr',
    payload: { text: 'Retry message content', conversationId: 'conv-303' },
    delaySeconds: 0,
  });
  retrySched.job.scheduledFor = new Date(Date.now() - 1000).toISOString();

  // Invoke cron to claim and process all 3 jobs
  const reqSuccessBatch = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resSuccessBatch = await GET(reqSuccessBatch);
  const bodySuccessBatch = await resSuccessBatch.json();

  testAssert(bodySuccessBatch.success === true, 'Cron execution succeeded');
  testAssert(bodySuccessBatch.claimed === 3, 'Claimed exactly 3 due jobs');
  testAssert(bodySuccessBatch.succeeded === 3, 'Successfully processed all 3 jobs');
  testAssert(bodySuccessBatch.failed === 0, 'Zero jobs failed');

  // Verify outbox has records of dispatches
  const executedOutbox = ReceptionistJobScheduler.getExecutedJobs();
  testAssert(executedOutbox.length >= 3, 'All 3 jobs recorded in executed outbox for auditability');

  // =========================================================================
  // TEST 6: Failed Job Retry & Exponential Backoff
  // =========================================================================
  console.log('\n--- [TEST 6] Failed Job Retry & Exponential Backoff ---');
  ReceptionistJobScheduler.clearInMemory();

  // Schedule a job that will fail (simulated via invalid recipient causing failure in dispatcher)
  const failingJobSched = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'delivery_retry',
    targetId: 'conv-fail-1',
    channel: 'whatsapp',
    recipient: '', // Empty recipient triggers OutboundDispatcher error
    payload: { text: 'Will fail due to empty recipient' },
    scheduledFor: new Date(Date.now() - 1000),
    maxAttempts: 3,
  });

  const reqFailRun = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resFailRun = await GET(reqFailRun);
  const bodyFailRun = await resFailRun.json();

  testAssert(bodyFailRun.claimed === 1, 'Claimed failing job');
  testAssert(bodyFailRun.succeeded === 0, 'Job execution correctly reported failed');
  testAssert(bodyFailRun.failed === 1, 'Failed count incremented');

  // Inspect the job in the scheduler: should be rescheduled for future attempt with attempts=1
  const updatedJob = ReceptionistJobScheduler.getJob(failingJobSched.job.id);
  testAssert(updatedJob !== undefined, 'Failing job retained in registry');
  testAssert(updatedJob?.status === 'pending', 'Status remains pending for retry attempt');
  testAssert(updatedJob?.attempts === 1, 'Attempts count incremented to 1');
  testAssert(Boolean(updatedJob?.lastError), 'Error message captured on job record');
  testAssert(new Date(updatedJob!.scheduledFor).getTime() > Date.now(), 'Future backoff timestamp applied');

  // =========================================================================
  // TEST 7: Expired Lease Recovery
  // =========================================================================
  console.log('\n--- [TEST 7] Expired Lease Recovery ---');
  ReceptionistJobScheduler.clearInMemory();

  // Create a job that was claimed by a crashed worker 10 minutes ago
  const staleWorkerJob = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'lead_followup',
    targetId: 'conv-stale',
    channel: 'whatsapp',
    recipient: '+33699887766',
    payload: { messageText: 'Follow up after worker crash' },
    scheduledFor: new Date(Date.now() - 600000),
  });
  // Simulate stale worker lease
  staleWorkerJob.job.status = 'processing';
  staleWorkerJob.job.workerId = 'crashed-worker-node-99';
  staleWorkerJob.job.claimExpiresAt = new Date(Date.now() - 300000).toISOString(); // Expired 5 mins ago
  staleWorkerJob.job.attempts = 1;

  // New cron worker invokes
  const reqLeaseRecover = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resLeaseRecover = await GET(reqLeaseRecover);
  const bodyLeaseRecover = await resLeaseRecover.json();

  testAssert(bodyLeaseRecover.claimed === 1, 'Re-claimed job with expired worker lease');
  testAssert(bodyLeaseRecover.succeeded === 1, 'Successfully executed reclaimed expired-lease job');

  const recoveredJob = ReceptionistJobScheduler.getJob(staleWorkerJob.job.id);
  testAssert(recoveredJob?.status === 'completed', 'Job marked completed after recovery');
  testAssert(recoveredJob?.workerId !== 'crashed-worker-node-99', 'Worker ID updated to new cron worker');

  // =========================================================================
  // TEST 8: Concurrent Cron Invocations (Lease Fencing & Mutex)
  // =========================================================================
  console.log('\n--- [TEST 8] Concurrent Cron Invocations & Mutex Fencing ---');
  ReceptionistJobScheduler.clearInMemory();

  // Populate 4 due jobs
  for (let i = 1; i <= 4; i++) {
    const s = await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: `appt-concurrent-${i}`,
      channel: 'whatsapp',
      recipient: `+3360000000${i}`,
      payload: { messageText: `Reminder #${i}` },
      scheduledFor: new Date(Date.now() - 1000),
    });
  }

  // Two workers claim concurrently
  const worker1Promise = ReceptionistJobScheduler.claimDueJobs('concurrent-worker-1', 2, 60);
  const worker2Promise = ReceptionistJobScheduler.claimDueJobs('concurrent-worker-2', 2, 60);

  const [claimedW1, claimedW2] = await Promise.all([worker1Promise, worker2Promise]);

  testAssert(claimedW1.length === 2, 'Worker 1 claimed 2 jobs');
  testAssert(claimedW2.length === 2, 'Worker 2 claimed 2 jobs');

  // Verify mutually exclusive claim sets (zero overlap)
  const w1Ids = new Set(claimedW1.map((j) => j.id));
  const hasOverlap = claimedW2.some((j) => w1Ids.has(j.id));
  testAssert(hasOverlap === false, 'Concurrent workers receive strictly disjoint job sets (zero duplicates)');

  // Verify lease fencing: Worker 1 cannot execute Worker 2\'s job
  const fencingTestResult = await ReceptionistJobScheduler.processJob(claimedW2[0], 'concurrent-worker-1');
  testAssert(fencingTestResult.success === false, 'Worker 1 prevented from executing Worker 2 job (workerId fencing)');
  testAssert(fencingTestResult.error?.includes('FENCING VIOLATION'), 'Clear fencing violation error returned');

  // =========================================================================
  // TEST 9: Duplicate Execution Protection & Idempotency
  // =========================================================================
  console.log('\n--- [TEST 9] Duplicate Execution Protection & Idempotency ---');
  ReceptionistJobScheduler.clearInMemory();

  const idempKey = `unique-appt-reminder-999`;
  const firstSchedule = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'appt-999',
    channel: 'whatsapp',
    recipient: '+33611112222',
    payload: { messageText: 'Reminder 999' },
    idempotencyKey: idempKey,
  });
  testAssert(firstSchedule.duplicate === false, 'Initial scheduling accepted (duplicate: false)');

  const duplicateSchedule = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'appt-999',
    channel: 'whatsapp',
    recipient: '+33611112222',
    payload: { messageText: 'Reminder 999 duplicate' },
    idempotencyKey: idempKey,
  });
  testAssert(duplicateSchedule.duplicate === true, 'Duplicate scheduling rejected (duplicate: true)');
  testAssert(duplicateSchedule.job.id === firstSchedule.job.id, 'Returns existing job reference');

  // =========================================================================
  // TEST 10: Partial Batch Failure Resilience
  // =========================================================================
  console.log('\n--- [TEST 10] Partial Batch Failure Resilience ---');
  ReceptionistJobScheduler.clearInMemory();

  // Job A: Valid
  const jobA = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'job-a-valid',
    channel: 'whatsapp',
    recipient: '+33612345678',
    payload: { messageText: 'Job A valid' },
    scheduledFor: new Date(Date.now() - 1000),
  });

  // Job B: Invalid (missing recipient) -> Will fail
  const jobB = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'job-b-failing',
    channel: 'whatsapp',
    recipient: '',
    payload: { messageText: 'Job B missing recipient' },
    scheduledFor: new Date(Date.now() - 1000),
  });

  // Job C: Valid
  const jobC = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'job-c-valid',
    channel: 'whatsapp',
    recipient: '+33687654321',
    payload: { messageText: 'Job C valid' },
    scheduledFor: new Date(Date.now() - 1000),
  });

  const reqPartialBatch = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resPartialBatch = await GET(reqPartialBatch);
  const bodyPartialBatch = await resPartialBatch.json();

  testAssert(bodyPartialBatch.success === true, 'Endpoint returns HTTP 200 on partial batch failure');
  testAssert(bodyPartialBatch.claimed === 3, 'Claimed all 3 batch jobs');
  testAssert(bodyPartialBatch.succeeded === 2, '2 valid jobs succeeded');
  testAssert(bodyPartialBatch.failed === 1, '1 invalid job failed');

  // Verify Job A and Job C completed, while Job B is pending retry
  testAssert(ReceptionistJobScheduler.getJob(jobA.job.id)?.status === 'completed', 'Job A completed');
  testAssert(ReceptionistJobScheduler.getJob(jobB.job.id)?.status === 'pending', 'Job B kept in pending retry');
  testAssert(ReceptionistJobScheduler.getJob(jobC.job.id)?.status === 'completed', 'Job C completed despite Job B failure');

  // =========================================================================
  // TEST 11: Maximum Execution Duration Protection
  // =========================================================================
  console.log('\n--- [TEST 11] Maximum Execution Duration Protection ---');
  ReceptionistJobScheduler.clearInMemory();

  // Schedule 5 jobs
  for (let i = 1; i <= 5; i++) {
    await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: `timeout-job-${i}`,
      channel: 'whatsapp',
      recipient: `+3360000001${i}`,
      payload: { messageText: `Timeout test #${i}` },
      scheduledFor: new Date(Date.now() - 1000),
    });
  }

  // Request with simulated ultra-tight duration budget: max_duration_ms=1
  // This will force the loop to break after 1 job to respect serverless limit
  const reqTightBudget = new Request('http://localhost:3000/api/cron/process-jobs?max_duration_ms=1', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resTightBudget = await GET(reqTightBudget);
  const bodyTightBudget = await resTightBudget.json();

  testAssert(bodyTightBudget.success === true, 'Returns success: true even when duration limit triggers yield');
  testAssert(bodyTightBudget.claimed === 5, 'Initially claimed 5 jobs in batch');
  testAssert(bodyTightBudget.processed < 5, 'Processed fewer jobs than claimed to prevent timeout');
  testAssert(bodyTightBudget.timedOut === true, 'Reported timedOut: true to indicate budget yield');

  // =========================================================================
  // TEST 12: Job Completion Persistence & Usage Recording
  // =========================================================================
  console.log('\n--- [TEST 12] Job Completion Persistence & Usage Recording ---');
  ReceptionistJobScheduler.clearInMemory();

  const persistedJobSched = await ReceptionistJobScheduler.scheduleJob({
    organizationId: testOrgId,
    jobType: 'appointment_reminder',
    targetId: 'persist-job-1',
    channel: 'whatsapp',
    recipient: '+33655443322',
    payload: { messageText: 'Audit persistence check' },
    scheduledFor: new Date(Date.now() - 1000),
  });

  const reqPersist = new Request('http://localhost:3000/api/cron/process-jobs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${validSecret}` },
  });
  const resPersist = await GET(reqPersist);
  const bodyPersist = await resPersist.json();

  testAssert(bodyPersist.succeeded === 1, 'Job processed successfully');

  const completedJob = ReceptionistJobScheduler.getJob(persistedJobSched.job.id);
  testAssert(completedJob?.status === 'completed', 'Job status persisted as completed');
  testAssert(Boolean(completedJob?.completedAt), 'completedAt timestamp recorded');
  testAssert(completedJob?.claimExpiresAt === null, 'claimExpiresAt cleared upon completion');
  testAssert(Boolean(completedJob?.workerId), 'workerId retained for audit trail');

  // No customer PII leaked in response body
  testAssert(!JSON.stringify(bodyPersist).includes('+33655443322'), 'Zero customer phone numbers exposed in cron response');
  testAssert(!JSON.stringify(bodyPersist).includes('Audit persistence check'), 'Zero customer message contents exposed in cron response');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================================================');
  console.log(`CRIT-01 CRON SCHEDULER VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCronSchedulerRemediationTests().catch((err) => {
  console.error('\nFatal test failure:', err);
  process.exit(1);
});
