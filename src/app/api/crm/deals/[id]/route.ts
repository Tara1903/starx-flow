import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService, mapStageToLeadStatus } from '@/lib/crm/crmService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const PatchDealSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  value: z.number().min(0).max(50000000).optional(),
  currency: z.string().trim().max(8).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  expectedCloseAt: z.string().datetime().nullable().optional(),
  lostReason: z.string().trim().max(500).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return apiErrorResponse(400, 'INVALID_ID', 'Invalid deal identifier');
    }

    const body = await req.json().catch(() => null);
    const parsed = PatchDealSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid deal update payload');
    }

    const { organizationId, user } = auth.session;
    const { data: existing } = await supabaseAdmin
      .from('crm_deals')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (!existing) {
      return apiErrorResponse(404, 'NOT_FOUND', 'Deal not found in organization');
    }

    const input = parsed.data;
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = { updated_at: now };

    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.ownerId !== undefined) updatePayload.owner_id = input.ownerId;
    if (input.value !== undefined) updatePayload.value = input.value;
    if (input.currency !== undefined) updatePayload.currency = input.currency;
    if (input.expectedCloseAt !== undefined) updatePayload.expected_close_at = input.expectedCloseAt;
    if (input.lostReason !== undefined) updatePayload.lost_reason = input.lostReason;

    let resolvedStage: {
      id: string;
      name: string;
      slug: string;
      pipeline_id: string;
      probability: number;
      is_won: boolean;
      is_lost: boolean;
    } | null = null;

    if (input.stageId) {
      const { data: stageRow } = await supabaseAdmin
        .from('crm_stages')
        .select('*')
        .eq('id', input.stageId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (!stageRow) {
        return apiErrorResponse(404, 'STAGE_NOT_FOUND', 'Target pipeline stage does not exist');
      }

      resolvedStage = stageRow;
      updatePayload.stage_id = stageRow.id;
      updatePayload.pipeline_id = input.pipelineId || stageRow.pipeline_id;
      updatePayload.probability = input.probability ?? stageRow.probability;
      updatePayload.status = input.status ?? (stageRow.is_won ? 'won' : stageRow.is_lost ? 'lost' : 'open');
    } else {
      if (input.pipelineId !== undefined) updatePayload.pipeline_id = input.pipelineId;
      if (input.probability !== undefined) updatePayload.probability = input.probability;
      if (input.status !== undefined) updatePayload.status = input.status;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('crm_deals')
      .update(updatePayload)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select('*, lead:leads(id, name, email, phone, company_name, score, source)')
      .single();

    if (error || !updated) {
      throw error || new Error('Failed to update deal');
    }

    // Keep linked lead synchronized with deal stage, value, owner, and status
    const leadSync: Record<string, any> = { updated_at: now };
    if (resolvedStage) {
      leadSync.pipeline_id = resolvedStage.pipeline_id;
      leadSync.stage_id = resolvedStage.id;
      leadSync.status = mapStageToLeadStatus(resolvedStage);
    } else if (input.status === 'won') {
      leadSync.status = 'converted';
    } else if (input.status === 'lost') {
      leadSync.status = 'lost';
    }
    if (input.value !== undefined) leadSync.deal_value = input.value;
    if (input.ownerId !== undefined) leadSync.owner_id = input.ownerId;

    if (Object.keys(leadSync).length > 1) {
      await supabaseAdmin
        .from('leads')
        .update(leadSync)
        .eq('id', existing.lead_id)
        .eq('organization_id', organizationId);
    }

    // Stop active outreach sequences automatically when a deal closes (won or lost)
    const finalStatus = updated.status;
    if (finalStatus === 'won' || finalStatus === 'lost') {
      await supabaseAdmin
        .from('crm_sequence_enrollments')
        .update({ status: 'stopped', next_run_at: null, updated_at: now })
        .eq('organization_id', organizationId)
        .eq('lead_id', existing.lead_id)
        .eq('status', 'active');
    }

    if (resolvedStage && resolvedStage.id !== existing.stage_id) {
      await CrmService.recordActivity({
        organizationId,
        leadId: existing.lead_id,
        dealId: updated.id,
        actorId: user.id,
        activityType: 'stage_change',
        title: `Deal "${updated.title}" moved to ${resolvedStage.name}`,
        body: input.lostReason ? `Reason: ${input.lostReason}` : null,
        metadata: {
          fromStageId: existing.stage_id,
          toStageId: resolvedStage.id,
          stageName: resolvedStage.name,
          value: updated.value,
        },
      });
    }

    return NextResponse.json({ success: true, deal: updated });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to update deal');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) {
      return apiErrorResponse(400, 'INVALID_ID', 'Invalid deal identifier');
    }

    const { error } = await supabaseAdmin
      .from('crm_deals')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.session.organizationId);

    if (error) throw error;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to delete deal');
  }
}
