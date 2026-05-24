import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type JobType = 'email' | 'webhook' | 'agent_job' | 'voice' | 'automation' | 'analytics';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EnqueueOptions {
  maxAttempts?: number;
  scheduledAt?: Date;
}

class JobQueue {
  /**
   * Enqueue a new background job.
   */
  async enqueue(jobType: JobType, payload: Record<string, any>, options?: EnqueueOptions) {
    if (!isSupabaseConfigured) {
      console.warn('[JobQueue] Supabase not configured. Job dropped:', jobType);
      return { data: null, error: 'Supabase not configured' };
    }

    const maxAttempts = options?.maxAttempts ?? 3;
    const scheduledAt = options?.scheduledAt ? options.scheduledAt.toISOString() : new Date().toISOString();

    return supabase.from('job_queue').insert({
      job_type: jobType,
      payload,
      status: 'pending',
      attempts: 0,
      max_attempts: maxAttempts,
      scheduled_at: scheduledAt,
    });
  }
}

export const jobQueue = new JobQueue();
