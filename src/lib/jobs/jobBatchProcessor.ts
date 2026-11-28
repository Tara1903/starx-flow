import crypto from 'crypto';
import { ReceptionistJobScheduler } from './receptionistJobScheduler';
import { OutboundDispatcher } from '../inbox/outboundDispatcher';
import { CrmSequenceService } from '../crm/sequenceService';

export const DEFAULT_MAX_DURATION_MS = 25000;
export const DEFAULT_BATCH_SIZE = 25;
export const MAX_BATCH_SIZE = 50;
export const DEFAULT_LEASE_SECONDS = 60;

export interface ProcessedJobOutcome {
  jobId: string;
  jobType: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface JobBatchResult {
  success: boolean;
  workerId: string;
  claimed: number;
  processed: number;
  succeeded: number;
  failed: number;
  timedOut: boolean;
  durationMs: number;
  jobs: ProcessedJobOutcome[];
}

/**
 * Shared atomic job batch processor invoked by both scheduled cron (/api/cron/process-jobs)
 * and authenticated staff trigger (/api/jobs/run).
 */
export async function processDueJobBatch(options?: {
  batchSize?: number;
  maxDurationMs?: number;
  workerPrefix?: string;
}): Promise<JobBatchResult> {
  const startTime = Date.now();
  const batchSize =
    options?.batchSize && options.batchSize > 0
      ? Math.min(options.batchSize, MAX_BATCH_SIZE)
      : DEFAULT_BATCH_SIZE;
  const maxDurationMs =
    options?.maxDurationMs && options.maxDurationMs > 0
      ? Math.min(options.maxDurationMs, DEFAULT_MAX_DURATION_MS)
      : DEFAULT_MAX_DURATION_MS;
  const workerId = `${options?.workerPrefix || 'cron-worker'}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const claimedJobs = await ReceptionistJobScheduler.claimDueJobs(
    workerId,
    batchSize,
    DEFAULT_LEASE_SECONDS
  );

  if (!claimedJobs || claimedJobs.length === 0) {
    return {
      success: true,
      workerId,
      claimed: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      timedOut: false,
      durationMs: Date.now() - startTime,
      jobs: [],
    };
  }

  const results: ProcessedJobOutcome[] = [];
  let succeeded = 0;
  let failed = 0;
  let timedOut = false;

  for (const job of claimedJobs) {
    if (Date.now() - startTime >= maxDurationMs) {
      timedOut = true;
      break;
    }

    try {
      const processResult = await ReceptionistJobScheduler.processJob(
        job,
        workerId,
        async (channel: string, recipient: string, payload: any) => {
          if (['appointment_reminder', 'lead_followup', 'delivery_retry'].includes(job.jobType)) {
            const text =
              payload.messageText || payload.text || payload.content || 'Update from receptionist';
            const channelMapped = (channel.charAt(0).toUpperCase() +
              channel.slice(1).toLowerCase()) as any;

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

          return { success: true };
        }
      );

      if (job.jobType === 'lead_followup' && job.payload?.enrollmentId) {
        await CrmSequenceService.onSequenceJobOutcome(
          job,
          Boolean(processResult.success && processResult.completed),
          processResult.error
        );
      }

      if (processResult.success && processResult.completed) {
        succeeded++;
        results.push({ jobId: job.id, jobType: job.jobType, status: 'completed' });
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

  return {
    success: true,
    workerId,
    claimed: claimedJobs.length,
    processed: results.length,
    succeeded,
    failed,
    timedOut,
    durationMs: Date.now() - startTime,
    jobs: results,
  };
}
