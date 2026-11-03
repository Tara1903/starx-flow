/**
 * StarX-Flow Durable Receptionist Job Scheduler (24/7 Operations)
 * Handles durable background jobs for:
 *   - Scheduled appointment reminders (24h / 2h before confirmed slot)
 *   - Lead follow-ups (unconverted client inquiries)
 *   - Outbound delivery retries with exponential backoff & lease fencing
 */

import crypto from 'crypto';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { supabase } from '../supabase';
import { UsageService } from '../usage/usageService';

export type ReceptionistJobType = 
  | 'appointment_reminder' 
  | 'lead_followup' 
  | 'delivery_retry' 
  | 'delayed_notification';

export type ReceptionistChannel = 
  | 'whatsapp' 
  | 'instagram' 
  | 'messenger' 
  | 'email' 
  | 'web';

export type ReceptionistJobStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface ReceptionistJob {
  id: string;
  organizationId: string;
  jobType: ReceptionistJobType;
  targetId: string;
  channel: ReceptionistChannel;
  recipient: string;
  payload: Record<string, any>;
  status: ReceptionistJobStatus;
  scheduledFor: string;
  claimExpiresAt?: string | null;
  workerId?: string | null;
  idempotencyKey?: string | null;
  attempts: number;
  maxAttempts: number;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface ScheduleJobOptions {
  organizationId: string;
  jobType: ReceptionistJobType;
  targetId: string;
  channel: ReceptionistChannel;
  recipient: string;
  payload?: Record<string, any>;
  scheduledFor?: Date | string;
  idempotencyKey?: string;
  maxAttempts?: number;
}

export class ReceptionistJobScheduler {
  // In-memory job registry for sandbox & offline test execution
  private static inMemoryJobs = new Map<string, ReceptionistJob>();
  private static executedJobOutbox: Array<{ jobId: string; channel: string; recipient: string; payload: any; sentAt: string }> = [];

  static clearInMemory(): void {
    this.inMemoryJobs.clear();
    this.executedJobOutbox = [];
  }

  static getInMemoryJobs(): ReceptionistJob[] {
    return Array.from(this.inMemoryJobs.values());
  }

  static getJob(id: string): ReceptionistJob | undefined {
    return this.inMemoryJobs.get(id);
  }

  static getExecutedOutbox(): Array<{ jobId: string; channel: string; recipient: string; payload: any; sentAt: string }> {
    return this.executedJobOutbox;
  }

  static getExecutedJobs(): typeof ReceptionistJobScheduler.executedJobOutbox {
    return [...this.executedJobOutbox];
  }

  /**
   * Schedules a new background job with strict tenant isolation and idempotency.
   */
  static async scheduleJob(options: ScheduleJobOptions): Promise<{ success: boolean; job: ReceptionistJob; duplicate?: boolean }> {
    const {
      organizationId,
      jobType,
      targetId,
      channel,
      recipient,
      payload = {},
      scheduledFor = new Date(),
      idempotencyKey,
      maxAttempts = 3,
    } = options;

    if (!organizationId) {
      throw new Error('SECURITY VIOLATION: organizationId is required to schedule a background job.');
    }

    const scheduledDate = typeof scheduledFor === 'string' ? new Date(scheduledFor) : scheduledFor;
    const nowIso = new Date().toISOString();
    const jobId = `job-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Derive or use provided idempotency key
    const effectiveKey = idempotencyKey || `${organizationId}:${jobType}:${targetId}:${recipient}`;

    // 1. Check in-memory registry for duplicates
    for (const job of this.inMemoryJobs.values()) {
      if (job.organizationId === organizationId && job.idempotencyKey === effectiveKey) {
        return { success: true, job, duplicate: true };
      }
    }

    const newJob: ReceptionistJob = {
      id: jobId,
      organizationId,
      jobType,
      targetId,
      channel,
      recipient,
      payload,
      status: 'pending',
      scheduledFor: scheduledDate.toISOString(),
      attempts: 0,
      maxAttempts,
      idempotencyKey: effectiveKey,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 2. Persist to PostgreSQL if configured
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data, error } = await client
          .from('receptionist_jobs')
          .insert({
            organization_id: organizationId,
            job_type: jobType,
            target_id: targetId,
            channel,
            recipient,
            payload,
            status: 'pending',
            scheduled_for: scheduledDate.toISOString(),
            idempotency_key: effectiveKey,
            max_attempts: maxAttempts,
          })
          .select('*')
          .maybeSingle();

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation on idempotency key
            const { data: existing } = await client
              .from('receptionist_jobs')
              .select('*')
              .eq('organization_id', organizationId)
              .eq('idempotency_key', effectiveKey)
              .single();

            if (existing) {
              return { success: true, job: this.mapDbRowToJob(existing), duplicate: true };
            }
          }
        } else if (data) {
          const persisted = this.mapDbRowToJob(data);
          this.inMemoryJobs.set(persisted.id, persisted);
          return { success: true, job: persisted, duplicate: false };
        }
      } catch {
        // Fall back to memory
      }
    }

    this.inMemoryJobs.set(jobId, newJob);
    return { success: true, job: newJob, duplicate: false };
  }

  /**
   * Schedules an automated appointment reminder (e.g. 24 hours prior to appointment time).
   */
  static async scheduleAppointmentReminder(params: {
    organizationId: string;
    appointmentId: string;
    customerName: string;
    customerPhone?: string | null;
    customerEmail?: string | null;
    serviceName: string;
    startTime: string;
    channel?: ReceptionistChannel;
    hoursNotice?: number;
  }): Promise<{ success: boolean; job: ReceptionistJob; duplicate?: boolean }> {
    const {
      organizationId,
      appointmentId,
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      startTime,
      channel = customerPhone ? 'whatsapp' : 'email',
      hoursNotice = 24,
    } = params;

    const recipient = (channel === 'email' ? customerEmail : customerPhone) || customerPhone || customerEmail || customerName;
    if (!recipient) {
      throw new Error(`Cannot schedule reminder: Missing recipient address for channel "${channel}".`);
    }

    const apptDate = new Date(startTime);
    const reminderTime = new Date(apptDate.getTime() - hoursNotice * 60 * 60 * 1000);
    // If appointment is sooner than notice window, schedule immediately (in 1 minute)
    const effectiveScheduledFor = reminderTime.getTime() > Date.now() ? reminderTime : new Date(Date.now() + 60000);

    const idempotencyKey = `reminder:${appointmentId}:${hoursNotice}h:${recipient}`;

    return await this.scheduleJob({
      organizationId,
      jobType: 'appointment_reminder',
      targetId: appointmentId,
      channel,
      recipient,
      scheduledFor: effectiveScheduledFor,
      idempotencyKey,
      payload: {
        appointmentId,
        customerName,
        serviceName,
        startTime,
        hoursNotice,
        messageText: `Friendly reminder: Your appointment for ${serviceName} is scheduled for ${apptDate.toLocaleDateString()} at ${apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Reply YES to confirm or RESCHEDULE if needed.`,
      },
    });
  }

  /**
   * Schedules an automated lead follow-up job (e.g. following after-hours inquiry).
   */
  static async scheduleLeadFollowup(params: {
    organizationId: string;
    conversationId: string;
    customerName: string;
    channel: ReceptionistChannel;
    recipient: string;
    inquiry: string;
    scheduledFor?: Date | string;
    payload?: Record<string, any>;
  }): Promise<{ success: boolean; job: ReceptionistJob; duplicate?: boolean }> {
    const {
      organizationId,
      conversationId,
      customerName,
      channel,
      recipient,
      inquiry,
      scheduledFor = new Date(Date.now() + 3600000),
      payload = {},
    } = params;

    const idempotencyKey = `followup:${conversationId}:${recipient}`;

    return await this.scheduleJob({
      organizationId,
      jobType: 'lead_followup',
      targetId: conversationId,
      channel,
      recipient,
      scheduledFor,
      idempotencyKey,
      payload: {
        conversationId,
        customerName,
        inquiry,
        messageText: payload.messageText || `Hello ${customerName}, following up on your inquiry about ${inquiry}. How can we assist you further?`,
        ...payload,
      },
    });
  }

  /**
   * Schedules a delivery retry job following an outbound failure.
   */
  static async scheduleDeliveryRetry(params: {
    organizationId: string;
    targetId: string;
    channel: ReceptionistChannel;
    recipient: string;
    payload: Record<string, any>;
    delaySeconds?: number;
  }): Promise<{ success: boolean; job: ReceptionistJob; duplicate?: boolean }> {
    const {
      organizationId,
      targetId,
      channel,
      recipient,
      payload,
      delaySeconds = 60,
    } = params;

    return await this.scheduleJob({
      organizationId,
      jobType: 'delivery_retry',
      targetId,
      channel,
      recipient,
      scheduledFor: new Date(Date.now() + delaySeconds * 1000),
      idempotencyKey: `retry:${targetId}:${Date.now()}`,
      payload,
    });
  }

  /**
   * Atomically claims due background jobs using database lease fencing.
   */
  static async claimDueJobs(workerId: string, batchSize = 10, leaseSeconds = 60): Promise<ReceptionistJob[]> {
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data, error } = await client.rpc('claim_receptionist_jobs', {
          p_worker_id: workerId,
          p_batch_size: batchSize,
          p_lease_seconds: leaseSeconds,
        });

        if (!error && Array.isArray(data)) {
          return data.map((row) => this.mapDbRowToJob(row));
        }
      } catch {
        // Fallback to in-memory claiming
      }
    }

    // In-memory claiming logic with lease check
    const claimed: ReceptionistJob[] = [];
    const now = Date.now();

    for (const job of this.inMemoryJobs.values()) {
      if (claimed.length >= batchSize) break;

      const isDue = new Date(job.scheduledFor).getTime() <= now;
      const isExpired = job.status === 'processing' && job.claimExpiresAt && new Date(job.claimExpiresAt).getTime() < now;
      const isClaimable = (job.status === 'pending' && isDue) || (isExpired && job.attempts < job.maxAttempts);

      if (isClaimable) {
        job.status = 'processing';
        job.workerId = workerId;
        job.attempts += 1;
        job.claimExpiresAt = new Date(now + leaseSeconds * 1000).toISOString();
        job.updatedAt = new Date(now).toISOString();
        claimed.push({ ...job });
      }
    }

    return claimed;
  }

  /**
   * Processes a claimed background job, executing external side effects and recording completion.
   */
  static async processJob(
    job: ReceptionistJob,
    workerId: string = job.workerId || 'default-worker',
    dispatcher?: (channel: string, recipient: string, payload: any) => Promise<{ success: boolean; messageId?: string; error?: string }>
  ): Promise<{ success: boolean; completed: boolean; error?: string }> {
    // 1. Verify lease ownership prior to dispatch (Lease Fencing)
    const now = Date.now();
    if (job.workerId !== workerId) {
      return { success: false, completed: false, error: 'FENCING VIOLATION: Worker ID mismatch' };
    }
    if (job.claimExpiresAt && new Date(job.claimExpiresAt).getTime() < now) {
      return { success: false, completed: false, error: 'FENCING VIOLATION: Lease expired before dispatch' };
    }

    try {
      // 2. Execute side effect
      if (dispatcher) {
        const dispatchRes = await dispatcher(job.channel, job.recipient, job.payload);
        if (!dispatchRes.success) {
          throw new Error(dispatchRes.error || 'Outbound dispatch failed');
        }
      }

      this.executedJobOutbox.push({
        jobId: job.id,
        channel: job.channel,
        recipient: job.recipient,
        payload: job.payload,
        sentAt: new Date().toISOString(),
      });

      // 3. Mark completed atomically
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.claimExpiresAt = null;
      job.updatedAt = new Date().toISOString();
      this.inMemoryJobs.set(job.id, { ...job });

      if (isSupabaseAdminConfigured) {
        try {
          const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
          await client.rpc('complete_receptionist_job', {
            p_job_id: job.id,
            p_worker_id: workerId,
          });
        } catch {
          // Handled
        }
      }

      // Record usage
      await UsageService.recordUsage({
        userId: job.organizationId,
        organizationId: job.organizationId,
        metricType: 'workflow_executions',
        quantity: 1,
        idempotencyKey: `usage:job:${job.id}`,
      });

      return { success: true, completed: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Job execution failed';
      job.lastError = errorMsg;
      job.claimExpiresAt = null;

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
      } else {
        job.status = 'pending';
        // Exponential backoff: 30s * 2^(attempts-1)
        const delaySeconds = 30 * Math.pow(2, job.attempts - 1);
        job.scheduledFor = new Date(Date.now() + delaySeconds * 1000).toISOString();
      }
      this.inMemoryJobs.set(job.id, { ...job });

      if (isSupabaseAdminConfigured) {
        try {
          const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
          await client.rpc('fail_receptionist_job', {
            p_job_id: job.id,
            p_worker_id: workerId,
            p_error: errorMsg,
            p_retry_delay_seconds: 60,
          });
        } catch {
          // Handled
        }
      }

      return { success: false, completed: false, error: errorMsg };
    }
  }

  private static mapDbRowToJob(row: any): ReceptionistJob {
    return {
      id: row.id,
      organizationId: row.organization_id,
      jobType: row.job_type,
      targetId: row.target_id,
      channel: row.channel,
      recipient: row.recipient,
      payload: row.payload || {},
      status: row.status,
      scheduledFor: row.scheduled_for,
      claimExpiresAt: row.claim_expires_at,
      workerId: row.worker_id,
      idempotencyKey: row.idempotency_key,
      attempts: row.attempts || 0,
      maxAttempts: row.max_attempts || 3,
      lastError: row.last_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    };
  }
}
