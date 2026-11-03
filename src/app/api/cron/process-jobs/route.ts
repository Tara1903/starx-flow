/**
 * StarX-Flow Production Vercel Cron Job Invoker
 * Route: /api/cron/process-jobs
 * 
 * Invoked periodically (default: * * * * *) by Vercel Cron or an authenticated external runner
 * to atomically claim and execute due background jobs in bounded batches.
 * 
 * Architecture & Guarantees:
 * 1. Authenticates incoming requests using constant-time CRON_SECRET comparison.
 * 2. Enforces serverless execution budgets to prevent function timeout abortion.
 * 3. Uses PostgreSQL FOR UPDATE SKIP LOCKED and worker lease fencing to prevent duplicate executions.
 * 4. Dispatches outbound messages (reminders, follow-ups, delivery retries) via OutboundDispatcher.
 * 5. Handles partial batch failures: individual job errors do not abort the entire batch.
 * 6. Never exposes secrets or customer PII in logs or HTTP responses.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ReceptionistJobScheduler, ReceptionistJob } from '@/lib/jobs/receptionistJobScheduler';
import { OutboundDispatcher } from '@/lib/inbox/outboundDispatcher';

// Maximum execution budget for serverless invocation (default 25s, leaving margin for Vercel limits)
const DEFAULT_MAX_DURATION_MS = 25000;
// Bounded batch size per cron execution to keep memory and execution bounded
const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 50;
// Worker lease time in seconds
const DEFAULT_LEASE_SECONDS = 60;

/**
 * Constant-time comparison of the incoming Authorization Bearer token against CRON_SECRET.
 * Ensures protection against timing attacks.
 * Does NOT log secret values or tokens.
 */
function verifyCronSecret(request: Request): { authorized: boolean; reason?: string } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.trim().length === 0) {
    return { authorized: false, reason: 'CRON_SECRET environment variable is not configured' };
  }

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return { authorized: false, reason: 'Missing Authorization header' };
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return { authorized: false, reason: 'Invalid Authorization header format. Expected "Bearer <token>"' };
  }

  const token = parts[1];
  const expectedBuffer = Buffer.from(cronSecret, 'utf-8');
  const actualBuffer = Buffer.from(token, 'utf-8');

  if (expectedBuffer.length !== actualBuffer.length) {
    return { authorized: false, reason: 'Invalid authorization token' };
  }

  const isMatch = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  if (!isMatch) {
    return { authorized: false, reason: 'Invalid authorization token' };
  }

  return { authorized: true };
}

interface ProcessedJobOutcome {
  jobId: string;
  jobType: string;
  status: 'completed' | 'failed';
  error?: string;
}

/**
 * Core Cron execution handler shared by GET and POST requests.
 */
async function handleCronExecution(request: Request): Promise<NextResponse> {
  const startTime = Date.now();

  // 1. Authenticate Request
  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.reason || 'Unauthorized',
      },
      { status: 401 }
    );
  }

  // 2. Parse query parameters with strict bounds
  const url = new URL(request.url);
  const requestedBatchSize = parseInt(url.searchParams.get('batch_size') || '0', 10);
  const batchSize = requestedBatchSize > 0 ? Math.min(requestedBatchSize, MAX_BATCH_SIZE) : DEFAULT_BATCH_SIZE;

  const requestedMaxDuration = parseInt(url.searchParams.get('max_duration_ms') || '0', 10);
  const maxDurationMs = requestedMaxDuration > 0 ? Math.min(requestedMaxDuration, DEFAULT_MAX_DURATION_MS) : DEFAULT_MAX_DURATION_MS;

  // 3. Generate unique worker identifier for this cron run
  const workerId = `cron-worker-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  try {
    // 4. Atomically claim due jobs using PostgreSQL lease fencing & SKIP LOCKED
    const claimedJobs = await ReceptionistJobScheduler.claimDueJobs(workerId, batchSize, DEFAULT_LEASE_SECONDS);

    if (!claimedJobs || claimedJobs.length === 0) {
      return NextResponse.json(
        {
          success: true,
          workerId,
          claimed: 0,
          processed: 0,
          succeeded: 0,
          failed: 0,
          timedOut: false,
          durationMs: Date.now() - startTime,
          jobs: [],
        },
        { status: 200 }
      );
    }

    // 5. Process claimed jobs individually to ensure partial batch fault tolerance
    const results: ProcessedJobOutcome[] = [];
    let succeeded = 0;
    let failed = 0;
    let timedOut = false;

    for (let i = 0; i < claimedJobs.length; i++) {
      const job = claimedJobs[i];

      // Guardrail: Check remaining execution budget to prevent Vercel hard termination
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxDurationMs) {
        timedOut = true;
        // Remaining claimed jobs will be reclaimed when their lease expires
        break;
      }

      try {
        // Execute job via existing scheduler with OutboundDispatcher as external side-effect executor
        const processResult = await ReceptionistJobScheduler.processJob(
          job,
          workerId,
          async (channel: string, recipient: string, payload: any) => {
            // For outbound messaging jobs, deliver through OutboundDispatcher
            if (['appointment_reminder', 'lead_followup', 'delivery_retry'].includes(job.jobType)) {
              const text = payload.messageText || payload.text || payload.content || 'Update from receptionist';
              const channelMapped = (channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase()) as any;
              
              const dispatchResult = await OutboundDispatcher.dispatch({
                organizationId: job.organizationId,
                conversationId: payload.conversationId || job.targetId || `cron-${job.id}`,
                channel: channelMapped,
                recipient,
                text,
                subject: payload.subject,
              });

              return {
                success: dispatchResult.success,
                messageId: dispatchResult.externalMessageId,
                error: dispatchResult.error,
              };
            }

            // Other job types (e.g. internal maintenance / sync) complete successfully
            return { success: true };
          }
        );

        if (processResult.success && processResult.completed) {
          succeeded++;
          results.push({
            jobId: job.id,
            jobType: job.jobType,
            status: 'completed',
          });
        } else {
          failed++;
          results.push({
            jobId: job.id,
            jobType: job.jobType,
            status: 'failed',
            error: processResult.error || 'Job execution failed',
          });
        }
      } catch (jobErr: any) {
        failed++;
        results.push({
          jobId: job.id,
          jobType: job.jobType,
          status: 'failed',
          error: jobErr?.message || 'Unexpected job processing exception',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        workerId,
        claimed: claimedJobs.length,
        processed: results.length,
        succeeded,
        failed,
        timedOut,
        durationMs: Date.now() - startTime,
        jobs: results,
      },
      { status: 200 }
    );
  } catch (fatalErr: any) {
    return NextResponse.json(
      {
        success: false,
        workerId,
        error: 'Fatal scheduler processing error',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * HTTP GET handler (standard trigger for Vercel Cron jobs)
 */
export async function GET(request: Request): Promise<NextResponse> {
  return handleCronExecution(request);
}

/**
 * HTTP POST handler (for manual invocation, webhooks, or external schedulers)
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCronExecution(request);
}
