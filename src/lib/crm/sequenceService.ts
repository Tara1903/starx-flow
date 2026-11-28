import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { ReceptionistJobScheduler, type ReceptionistJob } from '../jobs/receptionistJobScheduler';
import { CrmService } from './crmService';
import type { CrmSequence, CrmSequenceEnrollment, CrmSequenceStep } from '@/types/crm';

export function interpolateSequenceTemplate(
  template: string,
  lead: { name?: string | null; company_name?: string | null; city?: string | null; industry?: string | null }
): string {
  const fullName = (lead.name || 'there').trim();
  const firstName = fullName.split(/\s+/)[0] || fullName;
  const company = (lead.company_name || fullName).trim();
  const city = (lead.city || 'your area').trim();
  const industry = (lead.industry || 'service').trim();

  return template
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*company\s*\}\}/gi, company)
    .replace(/\{\{\s*city\s*\}\}/gi, city)
    .replace(/\{\{\s*industry\s*\}\}/gi, industry);
}

function resolveRecipientForStep(
  step: CrmSequenceStep,
  lead: { phone?: string | null; email?: string | null; enrichment_data?: Record<string, any> | null }
): string | null {
  if (step.channel === 'email') return lead.email || null;
  if (step.channel === 'whatsapp') {
    const wa = lead.enrichment_data?.whatsappNumber as string | undefined;
    return wa || lead.phone || null;
  }
  if (step.channel === 'instagram') {
    const ig = lead.enrichment_data?.instagramIgsid as string | undefined;
    return ig || null;
  }
  return null;
}

export class CrmSequenceService {
  static async listSequences(organizationId: string): Promise<{
    sequences: CrmSequence[];
    enrollments: CrmSequenceEnrollment[];
  }> {
    if (!isSupabaseAdminConfigured || !organizationId) {
      return { sequences: [], enrollments: [] };
    }

    const [{ data: seqData }, { data: enrollData }] = await Promise.all([
      supabaseAdmin
        .from('crm_sequences')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('crm_sequence_enrollments')
        .select('*, lead:leads(id, name, email, phone, company_name), sequence:crm_sequences(id, name, channel, steps)')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(200),
    ]);

    const enrollments = (enrollData || []) as CrmSequenceEnrollment[];
    const countMap = new Map<string, number>();
    for (const e of enrollments) {
      if (e.status === 'active') {
        countMap.set(e.sequence_id, (countMap.get(e.sequence_id) || 0) + 1);
      }
    }

    const sequences = ((seqData || []) as CrmSequence[]).map((s) => ({
      ...s,
      steps: Array.isArray(s.steps) ? s.steps : [],
      activeEnrollmentsCount: countMap.get(s.id) || 0,
    }));

    return { sequences, enrollments };
  }

  static async scheduleEnrollmentStep(params: {
    organizationId: string;
    enrollmentId: string;
    sequence: CrmSequence;
    lead: { id: string; name: string; email?: string | null; phone?: string | null; company_name?: string | null; city?: string | null; industry?: string | null; enrichment_data?: Record<string, any> | null };
    stepIndex: number;
  }): Promise<{ scheduled: boolean; error?: string }> {
    const step = params.sequence.steps[params.stepIndex];
    if (!step) {
      await supabaseAdmin
        .from('crm_sequence_enrollments')
        .update({ status: 'completed', next_run_at: null, updated_at: new Date().toISOString() })
        .eq('id', params.enrollmentId);
      return { scheduled: false };
    }

    const recipient = resolveRecipientForStep(step, params.lead);
    if (!recipient) {
      const msg = `No valid ${step.channel} recipient on lead ${params.lead.name}`;
      await supabaseAdmin
        .from('crm_sequence_enrollments')
        .update({ status: 'paused', last_error: msg, updated_at: new Date().toISOString() })
        .eq('id', params.enrollmentId);
      return { scheduled: false, error: msg };
    }

    const prevOffset = params.stepIndex > 0 ? params.sequence.steps[params.stepIndex - 1]?.dayOffset || 0 : 0;
    const deltaDays = Math.max(0, Number(step.dayOffset || 0) - prevOffset);
    const runAt = new Date(Date.now() + deltaDays * 24 * 60 * 60 * 1000);

    const renderedText = interpolateSequenceTemplate(step.messageTemplate, params.lead);
    const renderedSubject = step.subject ? interpolateSequenceTemplate(step.subject, params.lead) : undefined;

    await ReceptionistJobScheduler.scheduleJob({
      organizationId: params.organizationId,
      jobType: 'lead_followup',
      targetId: params.lead.id,
      channel: step.channel,
      recipient,
      scheduledFor: runAt,
      idempotencyKey: `seq:${params.enrollmentId}:step:${params.stepIndex}`,
      payload: {
        enrollmentId: params.enrollmentId,
        sequenceId: params.sequence.id,
        sequenceName: params.sequence.name,
        stepIndex: params.stepIndex,
        leadId: params.lead.id,
        messageText: renderedText,
        subject: renderedSubject,
      },
    });

    await supabaseAdmin
      .from('crm_sequence_enrollments')
      .update({
        current_step: params.stepIndex,
        next_run_at: runAt.toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.enrollmentId);

    return { scheduled: true };
  }

  static async enrollLeads(params: {
    organizationId: string;
    actorId: string;
    sequenceId: string;
    leadIds: string[];
    idempotencyKey?: string | null;
  }): Promise<{ enrolled: number; skipped: number; errors: string[] }> {
    const { data: sequence } = await supabaseAdmin
      .from('crm_sequences')
      .select('*')
      .eq('id', params.sequenceId)
      .eq('organization_id', params.organizationId)
      .maybeSingle();

    if (!sequence) {
      throw new Error('Sequence not found in organization');
    }

    const typedSeq = sequence as CrmSequence;
    if (!Array.isArray(typedSeq.steps) || typedSeq.steps.length === 0) {
      throw new Error('Sequence has no configured steps');
    }

    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('id, name, email, phone, company_name, city, industry, enrichment_data')
      .eq('organization_id', params.organizationId)
      .in('id', params.leadIds);

    let enrolled = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const lead of leads || []) {
      const idemKey = params.idempotencyKey ? `${params.idempotencyKey}:${lead.id}` : null;
      const { data: enrollment, error: enrErr } = await supabaseAdmin
        .from('crm_sequence_enrollments')
        .insert({
          organization_id: params.organizationId,
          sequence_id: params.sequenceId,
          lead_id: lead.id,
          current_step: 0,
          status: 'active',
          idempotency_key: idemKey,
        })
        .select('*')
        .maybeSingle();

      if (enrErr || !enrollment) {
        skipped++;
        continue;
      }

      const sched = await this.scheduleEnrollmentStep({
        organizationId: params.organizationId,
        enrollmentId: enrollment.id,
        sequence: typedSeq,
        lead,
        stepIndex: 0,
      });

      if (sched.scheduled) {
        enrolled++;
        await CrmService.recordActivity({
          organizationId: params.organizationId,
          leadId: lead.id,
          actorId: params.actorId,
          activityType: 'sequence',
          title: `Enrolled in "${typedSeq.name}"`,
          body: `Step 1 (${typedSeq.steps[0].channel}) scheduled.`,
          metadata: { sequenceId: typedSeq.id, enrollmentId: enrollment.id },
        });
      } else if (sched.error) {
        errors.push(sched.error);
      }
    }

    return { enrolled, skipped, errors };
  }

  /**
   * Advances or completes a sequence enrollment when `/api/cron/process-jobs` finishes a `lead_followup` step.
   */
  static async onSequenceJobOutcome(
    job: ReceptionistJob,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const enrollmentId = job.payload?.enrollmentId as string | undefined;
    if (!enrollmentId || !isSupabaseAdminConfigured) return;

    try {
      const { data: enrollment } = await supabaseAdmin
        .from('crm_sequence_enrollments')
        .select('*, sequence:crm_sequences(*), lead:leads(id, name, email, phone, company_name, city, industry, enrichment_data, status)')
        .eq('id', enrollmentId)
        .maybeSingle();

      if (!enrollment || enrollment.status !== 'active') return;

      const lead = enrollment.lead as any;
      const sequence = enrollment.sequence as CrmSequence | undefined;
      if (!lead || !sequence) return;

      if (!success) {
        await supabaseAdmin
          .from('crm_sequence_enrollments')
          .update({
            status: 'paused',
            last_error: errorMessage || 'Sequence step dispatch failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollmentId);
        return;
      }

      await CrmService.recordActivity({
        organizationId: job.organizationId,
        leadId: lead.id,
        activityType: 'sequence',
        title: `Sent "${sequence.name}" step ${(job.payload?.stepIndex ?? 0) + 1} (${job.channel})`,
        body: typeof job.payload?.messageText === 'string' ? job.payload.messageText.slice(0, 240) : null,
        metadata: { sequenceId: sequence.id, enrollmentId, channel: job.channel },
      });

      // Auto-stop if lead converted or marked lost while sequence was running
      if (lead.status === 'converted' || lead.status === 'lost') {
        await supabaseAdmin
          .from('crm_sequence_enrollments')
          .update({ status: 'stopped', next_run_at: null, updated_at: new Date().toISOString() })
          .eq('id', enrollmentId);
        return;
      }

      const nextStepIdx = Number(job.payload?.stepIndex ?? enrollment.current_step ?? 0) + 1;
      await this.scheduleEnrollmentStep({
        organizationId: job.organizationId,
        enrollmentId,
        sequence,
        lead,
        stepIndex: nextStepIdx,
      });
    } catch (err) {
      console.warn('[CrmSequenceService] onSequenceJobOutcome warning:', err);
    }
  }
}
