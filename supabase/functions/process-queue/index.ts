import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Only process POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Poll for 1 pending job
  const { data: jobs, error: fetchError } = await supabase
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  if (fetchError || !jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ message: 'No pending jobs' }), { status: 200 });
  }

  const job = jobs[0];

  // Claim job (Optimistic locking conceptually, or simple state transition)
  const { error: claimError } = await supabase
    .from('job_queue')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', job.id)
    .eq('status', 'pending');

  if (claimError) {
    // Another worker grabbed it
    return new Response(JSON.stringify({ message: 'Job already claimed' }), { status: 200 });
  }

  try {
    // Route job based on type
    if (job.job_type === 'email') {
      // Invoke send-email edge function securely
      const { error: invokeError } = await supabase.functions.invoke('send-email', {
        body: job.payload
      });
      if (invokeError) throw new Error(invokeError.message || 'Email invocation failed');
    } else {
      // Stub for other job types
      console.log(`[JobQueue] Processed job ${job.id} of type ${job.job_type}`);
    }

    // Mark completed
    await supabase.from('job_queue').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', job.id);

    return new Response(JSON.stringify({ message: 'Job processed successfully', jobId: job.id }), { status: 200 });

  } catch (error: any) {
    console.error(`[JobQueue] Job ${job.id} failed:`, error);
    
    const newAttempts = job.attempts + 1;
    let newStatus = 'pending';
    let newScheduledAt = new Date();

    if (newAttempts >= job.max_attempts) {
      newStatus = 'failed';
    } else {
      // Exponential backoff: 5s, 15s, 45s
      const delayMs = Math.pow(3, newAttempts) * 5000;
      newScheduledAt = new Date(Date.now() + delayMs);
    }

    await supabase.from('job_queue').update({
      status: newStatus,
      attempts: newAttempts,
      error: error.message || 'Unknown error',
      scheduled_at: newScheduledAt.toISOString(),
    }).eq('id', job.id);

    return new Response(JSON.stringify({ message: 'Job failed', error: error.message }), { status: 500 });
  }
});
