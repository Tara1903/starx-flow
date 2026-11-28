import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmSequenceService } from '@/lib/crm/sequenceService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const SequenceStepSchema = z.object({
  dayOffset: z.number().int().min(0).max(90),
  channel: z.enum(['whatsapp', 'email', 'instagram']),
  subject: z.string().trim().max(160).optional(),
  messageTemplate: z.string().trim().min(3).max(2000),
});

const CreateSequenceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(400).nullable().optional(),
  triggerType: z.enum(['manual', 'new_lead', 'stage_qualified', 'finder_import']).default('manual'),
  channel: z.enum(['whatsapp', 'email', 'instagram', 'multi']).default('multi'),
  isActive: z.boolean().default(true),
  steps: z.array(SequenceStepSchema).min(1).max(12),
});

const PatchSequenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(400).nullable().optional(),
  triggerType: z.enum(['manual', 'new_lead', 'stage_qualified', 'finder_import']).optional(),
  channel: z.enum(['whatsapp', 'email', 'instagram', 'multi']).optional(),
  isActive: z.boolean().optional(),
  steps: z.array(SequenceStepSchema).min(1).max(12).optional(),
  enrollmentId: z.string().uuid().optional(),
  enrollmentStatus: z.enum(['active', 'paused', 'stopped']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const result = await CrmSequenceService.listSequences(auth.session.organizationId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to list CRM sequences');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateSequenceSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid sequence payload');
    }

    const input = parsed.data;
    const sortedSteps = [...input.steps].sort((a, b) => a.dayOffset - b.dayOffset);

    const { data: sequence, error } = await supabaseAdmin
      .from('crm_sequences')
      .insert({
        organization_id: auth.session.organizationId,
        name: input.name,
        description: input.description || null,
        trigger_type: input.triggerType,
        channel: input.channel,
        is_active: input.isActive,
        steps: sortedSteps,
      })
      .select('*')
      .single();

    if (error || !sequence) throw error || new Error('Failed to create sequence');
    return NextResponse.json({ success: true, sequence: { ...sequence, activeEnrollmentsCount: 0 } }, { status: 201 });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to create CRM sequence');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = PatchSequenceSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid sequence update payload');
    }

    const input = parsed.data;
    const now = new Date().toISOString();

    if (input.enrollmentId && input.enrollmentStatus) {
      const { data: enrollment, error } = await supabaseAdmin
        .from('crm_sequence_enrollments')
        .update({
          status: input.enrollmentStatus,
          next_run_at: input.enrollmentStatus === 'stopped' ? null : undefined,
          updated_at: now,
        })
        .eq('id', input.enrollmentId)
        .eq('organization_id', auth.session.organizationId)
        .select('*')
        .maybeSingle();

      if (error || !enrollment) {
        return apiErrorResponse(404, 'NOT_FOUND', 'Sequence enrollment not found');
      }
      return NextResponse.json({ success: true, enrollment });
    }

    const updates: Record<string, any> = { updated_at: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.triggerType !== undefined) updates.trigger_type = input.triggerType;
    if (input.channel !== undefined) updates.channel = input.channel;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    if (input.steps !== undefined) updates.steps = [...input.steps].sort((a, b) => a.dayOffset - b.dayOffset);

    const { data: updated, error } = await supabaseAdmin
      .from('crm_sequences')
      .update(updates)
      .eq('id', input.id)
      .eq('organization_id', auth.session.organizationId)
      .select('*')
      .maybeSingle();

    if (error || !updated) {
      return apiErrorResponse(404, 'NOT_FOUND', 'Sequence not found');
    }
    return NextResponse.json({ success: true, sequence: updated });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to update CRM sequence');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id || !z.string().uuid().safeParse(id).success) {
      return apiErrorResponse(400, 'INVALID_ID', 'Valid sequence id query parameter is required');
    }

    const { error } = await supabaseAdmin
      .from('crm_sequences')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.session.organizationId);

    if (error) throw error;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to delete CRM sequence');
  }
}
