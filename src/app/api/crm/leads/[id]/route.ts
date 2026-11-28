import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService, mapStageToLeadStatus } from '@/lib/crm/crmService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const PatchLeadSchema = z.object({
  name: z.string().trim().min(1).max(140).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email().nullable().optional().or(z.literal('')),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  companyName: z.string().trim().max(140).nullable().optional(),
  jobTitle: z.string().trim().max(100).nullable().optional(),
  website: z.string().trim().max(240).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  industry: z.string().trim().max(100).nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  dealValue: z.number().min(0).max(10000000).optional(),
  stageId: z.string().uuid().optional(),
  nextFollowUpAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = PatchLeadSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid lead update payload');
    }

    const { organizationId, user } = auth.session;
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .or(`organization_id.eq.${organizationId},user_id.eq.${user.id}`)
      .maybeSingle();

    if (!existing) {
      return apiErrorResponse(404, 'NOT_FOUND', 'Lead not found');
    }

    const v = parsed.data;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (v.name !== undefined) updates.name = v.name;
    if (v.phone !== undefined) updates.phone = v.phone;
    if (v.email !== undefined) updates.email = v.email || null;
    if (v.status !== undefined) updates.status = v.status;
    if (v.score !== undefined) updates.score = v.score;
    if (v.tags !== undefined) updates.tags = v.tags;
    if (v.notes !== undefined) updates.notes = v.notes;
    if (v.companyName !== undefined) updates.company_name = v.companyName;
    if (v.jobTitle !== undefined) updates.job_title = v.jobTitle;
    if (v.website !== undefined) updates.website = v.website;
    if (v.city !== undefined) updates.city = v.city;
    if (v.country !== undefined) updates.country = v.country;
    if (v.industry !== undefined) updates.industry = v.industry;
    if (v.ownerId !== undefined) updates.owner_id = v.ownerId;
    if (v.dealValue !== undefined) updates.deal_value = v.dealValue;
    if (v.nextFollowUpAt !== undefined) updates.next_follow_up_at = v.nextFollowUpAt;

    let stageLabel: string | null = null;
    if (v.stageId) {
      const { data: stage } = await supabaseAdmin
        .from('crm_stages')
        .select('*')
        .eq('id', v.stageId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (!stage) {
        return apiErrorResponse(404, 'STAGE_NOT_FOUND', 'Stage not found in organization');
      }
      updates.stage_id = stage.id;
      updates.pipeline_id = stage.pipeline_id;
      updates.status = mapStageToLeadStatus(stage);
      stageLabel = stage.name;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      throw error || new Error('Failed to update lead');
    }

    if (v.status !== undefined && v.status !== existing.status || v.stageId) {
      await CrmService.recordActivity({
        organizationId,
        leadId: id,
        actorId: user.id,
        activityType: 'stage_change',
        title: `Moved stage to ${stageLabel || updated.status}`,
        metadata: { fromStatus: existing.status, toStatus: updated.status },
      });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to update lead');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id } = await params;
    const { organizationId, user } = auth.session;

    await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', id)
      .or(`organization_id.eq.${organizationId},user_id.eq.${user.id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to delete lead');
  }
}
