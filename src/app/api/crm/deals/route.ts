import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService, mapStageToLeadStatus } from '@/lib/crm/crmService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { extractIdempotencyKey } from '@/lib/idempotency';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const CreateDealSchema = z.object({
  leadId: z.string().uuid(),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(160),
  value: z.number().min(0).max(50000000).default(0),
  currency: z.string().trim().max(8).optional().default('EUR'),
  expectedCloseAt: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { data: deals, error } = await supabaseAdmin
      .from('crm_deals')
      .select('*, lead:leads(id, name, email, phone, company_name, score, source)')
      .eq('organization_id', auth.session.organizationId)
      .order('updated_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    return NextResponse.json({ success: true, deals: deals || [] });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to list deals');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateDealSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid deal payload');
    }

    const { organizationId, user } = auth.session;
    const input = parsed.data;
    const idempotencyKey = extractIdempotencyKey(req, body);

    if (idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from('crm_deals')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: true, deal: existing, deduplicated: true });
      }
    }

    const [{ data: lead }, pipelines] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('id, name, organization_id, deal_value')
        .eq('id', input.leadId)
        .or(`organization_id.eq.${organizationId},user_id.eq.${user.id}`)
        .maybeSingle(),
      CrmService.ensureDefaultPipeline(organizationId),
    ]);

    if (!lead) {
      return apiErrorResponse(404, 'NOT_FOUND', 'Lead not found in organization');
    }

    const pipeline = pipelines.find((p) => p.id === input.pipelineId) || pipelines.find((p) => p.is_default) || pipelines[0];
    const stage = pipeline?.stages?.find((s) => s.id === input.stageId) || pipeline?.stages?.[0];
    if (!pipeline || !stage) {
      return apiErrorResponse(500, 'PIPELINE_MISSING', 'Organization has no active pipeline stages');
    }

    const { data: created, error } = await supabaseAdmin
      .from('crm_deals')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        pipeline_id: pipeline.id,
        stage_id: stage.id,
        lead_id: lead.id,
        owner_id: input.ownerId || user.id,
        title: input.title,
        value: input.value,
        currency: input.currency,
        probability: stage.probability,
        expected_close_at: input.expectedCloseAt || null,
        status: stage.is_won ? 'won' : stage.is_lost ? 'lost' : 'open',
        idempotency_key: idempotencyKey,
      })
      .select('*')
      .single();

    if (error || !created) throw error || new Error('Failed to create deal');

    // Sync lead value & stage
    await supabaseAdmin
      .from('leads')
      .update({
        deal_value: Math.max(Number(lead.deal_value || 0), input.value),
        pipeline_id: pipeline.id,
        stage_id: stage.id,
        status: mapStageToLeadStatus(stage),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id);

    await CrmService.recordActivity({
      organizationId,
      leadId: lead.id,
      dealId: created.id,
      actorId: user.id,
      activityType: 'note',
      title: `Created deal "${input.title}" (€${input.value})`,
      metadata: { stageName: stage.name },
    });

    return NextResponse.json({ success: true, deal: created }, { status: 201 });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to create deal');
  }
}
