import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService, DEFAULT_PIPELINE_STAGES } from '@/lib/crm/crmService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const CreatePipelineSchema = z.object({
  name: z.string().trim().min(2).max(80),
  pipelineType: z.enum(['sales', 'service', 'dual']).optional().default('dual'),
  stages: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        probability: z.number().int().min(0).max(100).default(25),
        is_won: z.boolean().optional().default(false),
        is_lost: z.boolean().optional().default(false),
      })
    )
    .min(2)
    .max(12)
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const pipelines = await CrmService.ensureDefaultPipeline(auth.session.organizationId);
    return NextResponse.json({ success: true, pipelines });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load CRM pipelines');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, auth.status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = CreatePipelineSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid pipeline payload');
    }

    const { organizationId } = auth.session;
    const { data: pipeline, error: pipeErr } = await supabaseAdmin
      .from('crm_pipelines')
      .insert({
        organization_id: organizationId,
        name: parsed.data.name,
        pipeline_type: parsed.data.pipelineType,
        is_default: false,
      })
      .select('*')
      .single();

    if (pipeErr || !pipeline) {
      throw pipeErr || new Error('Failed to create pipeline');
    }

    const stageDefs = parsed.data.stages
      ? parsed.data.stages.map((s, idx) => ({
          pipeline_id: pipeline.id,
          organization_id: organizationId,
          name: s.name,
          slug: `${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${idx}`,
          position: idx,
          probability: s.probability,
          color_token: s.is_won ? 'live' : s.is_lost ? 'muted' : 'emerald',
          is_won: Boolean(s.is_won),
          is_lost: Boolean(s.is_lost),
        }))
      : DEFAULT_PIPELINE_STAGES.map((s) => ({
          ...s,
          pipeline_id: pipeline.id,
          organization_id: organizationId,
        }));

    const { data: stages } = await supabaseAdmin.from('crm_stages').insert(stageDefs).select('*');
    return NextResponse.json(
      { success: true, pipeline: { ...pipeline, stages: stages || [] } },
      { status: 201 }
    );
  } catch (err) {
    return internalErrorResponse(err, 'Failed to create pipeline');
  }
}
