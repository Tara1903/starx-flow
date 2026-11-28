import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService, computeLeadScore } from '@/lib/crm/crmService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { extractIdempotencyKey } from '@/lib/idempotency';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const LeadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']);
const LeadSourceSchema = z.enum([
  'whatsapp',
  'instagram',
  'sms',
  'web_chat',
  'manual',
  'csv_import',
  'outbound_finder',
  'email',
  'demo_request',
]);

const SingleLeadInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(140),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email('Valid email required').nullable().optional().or(z.literal('')),
  status: LeadStatusSchema.optional().default('new'),
  source: LeadSourceSchema.optional().default('manual'),
  score: z.number().int().min(0).max(100).optional(),
  tags: z.array(z.string().trim().max(40)).max(20).optional().default([]),
  notes: z.string().trim().max(4000).nullable().optional(),
  companyName: z.string().trim().max(140).nullable().optional(),
  jobTitle: z.string().trim().max(100).nullable().optional(),
  website: z.string().trim().max(240).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  industry: z.string().trim().max(100).nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  dealValue: z.number().min(0).max(10000000).optional().default(0),
  currency: z.string().trim().max(8).optional().default('EUR'),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  createDeal: z.boolean().optional(),
  dealTitle: z.string().trim().max(160).optional(),
});

const BulkImportSchema = z.object({
  items: z.array(SingleLeadInputSchema).min(1).max(250),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { searchParams } = new URL(req.url);
    const snapshot = await CrmService.listSnapshot({
      organizationId: auth.session.organizationId,
      userId: auth.session.user.id,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
    });

    return NextResponse.json({ success: true, ...snapshot });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load CRM snapshot');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return apiErrorResponse(400, 'BAD_REQUEST', 'JSON body is required');
    }

    const { organizationId, user } = auth.session;
    const pipelines = await CrmService.ensureDefaultPipeline(organizationId);
    const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];

    // Bulk CSV import mode
    if (Array.isArray((body as any).items)) {
      const parsedBulk = BulkImportSchema.safeParse(body);
      if (!parsedBulk.success) {
        return zodValidationError(parsedBulk.error, 'Invalid CSV bulk import payload');
      }

      const defaultStage = defaultPipeline?.stages?.[0];
      const rows = parsedBulk.data.items.map((item) => ({
        user_id: user.id,
        organization_id: organizationId,
        owner_id: item.ownerId || user.id,
        name: item.name,
        phone: item.phone || null,
        email: item.email ? item.email : null,
        status: item.status,
        source: item.source || 'csv_import',
        score: item.score ?? computeLeadScore({ ...item, company_name: item.companyName }),
        tags: item.tags,
        notes: item.notes || null,
        company_name: item.companyName || null,
        job_title: item.jobTitle || null,
        website: item.website || null,
        city: item.city || null,
        country: item.country || null,
        industry: item.industry || null,
        deal_value: item.dealValue || 0,
        currency: item.currency || 'EUR',
        pipeline_id: item.pipelineId || defaultPipeline?.id || null,
        stage_id: item.stageId || defaultStage?.id || null,
        last_contact_at: new Date().toISOString(),
      }));

      const { data: inserted, error } = await supabaseAdmin.from('leads').insert(rows).select('*');
      if (error) throw error;

      return NextResponse.json(
        { success: true, imported: inserted?.length || 0, leads: inserted || [] },
        { status: 201 }
      );
    }

    // Single lead creation with optional Idempotency-Key support
    const parsedSingle = SingleLeadInputSchema.safeParse(body);
    if (!parsedSingle.success) {
      return zodValidationError(parsedSingle.error, 'Invalid lead payload');
    }

    const input = parsedSingle.data;
    const idempotencyKey = extractIdempotencyKey(req, body);

    if (idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true, lead: existing, deduplicated: true });
      }
    }

    const pipeline = pipelines.find((p) => p.id === input.pipelineId) || defaultPipeline;
    const targetStage =
      pipeline?.stages?.find((s) => s.id === input.stageId) ||
      pipeline?.stages?.find((s) => s.slug === input.status) ||
      pipeline?.stages?.[0];

    const computedScore =
      input.score ??
      computeLeadScore({
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        company_name: input.companyName || null,
        status: input.status,
      });

    const { data: createdLead, error: createErr } = await supabaseAdmin
      .from('leads')
      .insert({
        user_id: user.id,
        organization_id: organizationId,
        owner_id: input.ownerId || user.id,
        name: input.name,
        phone: input.phone || null,
        email: input.email ? input.email : null,
        status: input.status,
        source: input.source,
        score: computedScore,
        tags: input.tags,
        notes: input.notes || null,
        company_name: input.companyName || null,
        job_title: input.jobTitle || null,
        website: input.website || null,
        city: input.city || null,
        country: input.country || null,
        industry: input.industry || null,
        deal_value: input.dealValue || 0,
        currency: input.currency || 'EUR',
        pipeline_id: pipeline?.id || null,
        stage_id: targetStage?.id || null,
        idempotency_key: idempotencyKey,
        last_contact_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (createErr || !createdLead) {
      throw createErr || new Error('Failed to create lead');
    }

    let createdDeal: any = null;
    if ((input.createDeal || input.dealValue > 0) && pipeline && targetStage) {
      const { data: deal } = await supabaseAdmin
        .from('crm_deals')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          pipeline_id: pipeline.id,
          stage_id: targetStage.id,
          lead_id: createdLead.id,
          owner_id: input.ownerId || user.id,
          title: input.dealTitle || `${input.companyName || input.name} — Deal`,
          value: input.dealValue || 0,
          currency: input.currency || 'EUR',
          probability: targetStage.probability,
          status: targetStage.is_won ? 'won' : targetStage.is_lost ? 'lost' : 'open',
        })
        .select('*')
        .maybeSingle();
      createdDeal = deal;
    }

    await CrmService.recordActivity({
      organizationId,
      leadId: createdLead.id,
      dealId: createdDeal?.id || null,
      actorId: user.id,
      activityType: 'note',
      title: `Created CRM contact (${input.source.replace('_', ' ')})`,
      body: input.notes || null,
    });

    return NextResponse.json({ success: true, lead: createdLead, deal: createdDeal }, { status: 201 });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to create lead');
  }
}
