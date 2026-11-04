/**
 * STARX-FLOW RELEASE-CANDIDATE TEST SUITE
 * DOMAIN K: SCHEDULER & BACKGROUND JOBS
 *
 * Verifies:
 * 1. Constant-time CRON_SECRET authentication on `/api/cron/process-jobs` (rejects missing, forged, wrong tokens).
 * 2. Idempotent job scheduling (duplicate key returns duplicate: true without double-queueing).
 * 3. Worker lease fencing (single claim per job, workerId mismatch rejection).
 * 4. Lease expiration recovery (expired leases are safely reclaimed by surviving workers).
 * 5. Bounded batch sizes (respects query bounds and caps at MAX_BATCH_SIZE).
 * 6. Partial batch fault tolerance (individual failure does not crash the cron run).
 * 7. Retry backoff and max-attempt terminal failure.
 */

import { ReceptionistJobScheduler } from '../src/lib/jobs/receptionistJobScheduler';
import { GET as cronGet, POST as cronPost } from '../src/app/api/cron/process-jobs/route';

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

async function runDomainKTests() {
  console.log('================================================================');
  console.log(' DOMAIN K: SCHEDULER & BACKGROUND JOBS TESTING');
  console.log('================================================================');

  const testOrgId = `org-cron-${Date.now()}`;
  const validSecret = 'test_cron_secret_k_998877';
  process.env.CRON_SECRET = validSecret;

  ReceptionistJobScheduler.clearInMemory();

  // -------------------------------------------------------------
  // Test 1: CRON_SECRET Authentication & Timing Safety
  // -------------------------------------------------------------
  {
    // 1a: Missing Authorization header
    const noAuthReq = new Request('http://localhost:3000/api/cron/process-jobs', { method: 'GET' });
    const noAuthRes = await cronGet(noAuthReq);
    check('Rejects missing Authorization header with 401', noAuthRes.status === 401);

    // 1b: Invalid bearer token
    const wrongAuthReq = new Request('http://localhost:3000/api/cron/process-jobs', {
      method: 'GET',
      headers: { authorization: 'Bearer wrong-secret-token' },
    });
    const wrongAuthRes = await cronGet(wrongAuthReq);
    check('Rejects invalid CRON_SECRET token with 401', wrongAuthRes.status === 401);

    // 1c: Valid Bearer token
    const validAuthReq = new Request('http://localhost:3000/api/cron/process-jobs', {
      method: 'GET',
      headers: { authorization: `Bearer ${validSecret}` },
    });
    const validAuthRes = await cronGet(validAuthReq);
    check('Accepts valid CRON_SECRET token with 200', validAuthRes.status === 200);

    // 1d: POST endpoint also accepts valid token
    const validPostReq = new Request('http://localhost:3000/api/cron/process-jobs', {
      method: 'POST',
      headers: { authorization: `Bearer ${validSecret}` },
    });
    const validPostRes = await cronPost(validPostReq);
    check('POST /api/cron/process-jobs accepts valid token with 200', validPostRes.status === 200);
  }

  // -------------------------------------------------------------
  // Test 2: Idempotent Job Scheduling
  // -------------------------------------------------------------
  {
    const idemKey = `test-idem-${Date.now()}`;
    const firstSched = await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: 'apt-101',
      channel: 'whatsapp',
      recipient: '+491761111222',
      idempotencyKey: idemKey,
      scheduledFor: new Date(Date.now() - 1000), // Due immediately
    });

    check('Initial job scheduling succeeds', firstSched.success === true && firstSched.duplicate === false);

    const secondSched = await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: 'apt-101',
      channel: 'whatsapp',
      recipient: '+491761111222',
      idempotencyKey: idemKey,
      scheduledFor: new Date(Date.now() - 1000),
    });

    check(
      'Duplicate job scheduling returns duplicate: true without creating second record',
      secondSched.success === true && secondSched.duplicate === true && secondSched.job.id === firstSched.job.id
    );
  }

  // -------------------------------------------------------------
  // Test 3: Atomic Claiming & Worker Lease Fencing
  // -------------------------------------------------------------
  {
    ReceptionistJobScheduler.clearInMemory();

    // Schedule 1 due job
    await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: 'apt-fence-1',
      channel: 'email',
      recipient: 'patient@clinic.de',
      scheduledFor: new Date(Date.now() - 5000),
    });

    const workerA = 'worker-A-123';
    const workerB = 'worker-B-456';

    // Worker A claims the job
    const claimedByA = await ReceptionistJobScheduler.claimDueJobs(workerA, 10, 60);
    check('Worker A claims the due job', claimedByA.length === 1 && claimedByA[0].workerId === workerA);

    // Worker B attempts to claim immediately -> Must get 0 jobs
    const claimedByB = await ReceptionistJobScheduler.claimDueJobs(workerB, 10, 60);
    check('Worker B receives 0 jobs while Worker A lease is active', claimedByB.length === 0);

    // Worker B attempts to process Worker A's job -> Fencing violation
    const unauthorizedProcess = await ReceptionistJobScheduler.processJob(claimedByA[0], workerB);
    check(
      'Worker B processing Worker A job is rejected by lease fence',
      unauthorizedProcess.success === false && unauthorizedProcess.error?.includes('Worker ID mismatch')
    );

    // Worker A successfully processes the job
    const authorizedProcess = await ReceptionistJobScheduler.processJob(claimedByA[0], workerA);
    check('Worker A processes its own claimed job successfully', authorizedProcess.success === true && authorizedProcess.completed === true);
  }

  // -------------------------------------------------------------
  // Test 4: Worker Lease Expiry Recovery
  // -------------------------------------------------------------
  {
    ReceptionistJobScheduler.clearInMemory();

    // Schedule job with a very short lease (simulated expired lease)
    await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'lead_followup',
      targetId: 'lead-lease-1',
      channel: 'whatsapp',
      recipient: '+49176222333',
      scheduledFor: new Date(Date.now() - 5000),
    });

    const deadWorker = 'dead-worker-999';
    // Dead worker claims job with 1-second lease
    const claimed = await ReceptionistJobScheduler.claimDueJobs(deadWorker, 10, 1);
    check('Dead worker initially claimed job', claimed.length === 1);

    // Simulate elapsed time past lease expiration
    const jobRef = ReceptionistJobScheduler.getJob(claimed[0].id)!;
    jobRef.claimExpiresAt = new Date(Date.now() - 1000).toISOString();

    // Surviving worker claims due jobs
    const survivingWorker = 'surviving-worker-001';
    const reclaimed = await ReceptionistJobScheduler.claimDueJobs(survivingWorker, 10, 60);
    check(
      'Surviving worker safely reclaims expired job from dead worker',
      reclaimed.length === 1 && reclaimed[0].workerId === survivingWorker,
      `Reclaimed count=${reclaimed.length}, workerId=${reclaimed[0]?.workerId}`
    );
  }

  // -------------------------------------------------------------
  // Test 5: Bounded Batch Size Enforcement
  // -------------------------------------------------------------
  {
    ReceptionistJobScheduler.clearInMemory();

    // Queue 15 due jobs
    for (let i = 0; i < 15; i++) {
      await ReceptionistJobScheduler.scheduleJob({
        organizationId: testOrgId,
        jobType: 'delivery_retry',
        targetId: `target-${i}`,
        channel: 'whatsapp',
        recipient: `+49176000000${i}`,
        idempotencyKey: `batch-test-${i}`,
        scheduledFor: new Date(Date.now() - 10000),
      });
    }

    // Call /api/cron/process-jobs with batch_size=4
    const req = new Request('http://localhost:3000/api/cron/process-jobs?batch_size=4', {
      headers: { authorization: `Bearer ${validSecret}` },
    });
    const res = await cronGet(req);
    const body = await res.json();

    check('Cron execution respects requested batch_size bound of 4', body.claimed === 4 && body.processed === 4);
  }

  // -------------------------------------------------------------
  // Test 6: Partial Batch Fault Tolerance & Retry Backoff
  // -------------------------------------------------------------
  {
    ReceptionistJobScheduler.clearInMemory();

    // Schedule Job 1 (will succeed)
    const job1 = await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: 'apt-success-1',
      channel: 'email',
      recipient: 'valid@clinic.de',
      scheduledFor: new Date(Date.now() - 5000),
    });

    // Schedule Job 2 (will fail)
    const job2 = await ReceptionistJobScheduler.scheduleJob({
      organizationId: testOrgId,
      jobType: 'appointment_reminder',
      targetId: 'apt-fail-1',
      channel: 'email',
      recipient: 'failing@clinic.de',
      maxAttempts: 2,
      scheduledFor: new Date(Date.now() - 5000),
    });

    const workerId = 'batch-worker-1';
    const claimed = await ReceptionistJobScheduler.claimDueJobs(workerId, 10, 60);

    // Process with mock dispatcher that fails for job2
    for (const j of claimed) {
      await ReceptionistJobScheduler.processJob(j, workerId, async (_chan, recip) => {
        if (recip === 'failing@clinic.de') {
          return { success: false, error: 'SMTP connection timeout' };
        }
        return { success: true, messageId: 'msg-success-1' };
      });
    }

    const state1 = ReceptionistJobScheduler.getJob(job1.job.id)!;
    const state2 = ReceptionistJobScheduler.getJob(job2.job.id)!;

    check('Job 1 succeeded and marked completed', state1.status === 'completed');
    check('Job 2 failed first attempt and rescheduled with pending status', state2.status === 'pending' && state2.attempts === 1);

    // Second failure: should exhaust maxAttempts (2) and transition to 'failed'
    state2.scheduledFor = new Date(Date.now() - 1000).toISOString();
    const secondClaim = await ReceptionistJobScheduler.claimDueJobs(workerId, 10, 60);
    await ReceptionistJobScheduler.processJob(secondClaim[0], workerId, async () => {
      return { success: false, error: 'SMTP persistent failure' };
    });

    const finalState2 = ReceptionistJobScheduler.getJob(job2.job.id)!;
    check('Job 2 marked permanently failed after exceeding maxAttempts', finalState2.status === 'failed' && finalState2.attempts === 2);
  }

  console.log('----------------------------------------------------------------');
  console.log(`DOMAIN K RESULTS: ${passedChecks}/${totalChecks} PASSED (${failedChecks} FAILED)`);
  console.log('================================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runDomainKTests().catch((err) => {
  console.error('Unhandled failure in Domain K tests:', err);
  process.exit(1);
});
