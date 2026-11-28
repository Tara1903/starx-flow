import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { LeadFinderService } from '@/lib/crm/leadFinder';
import { CrmSequenceService } from '@/lib/crm/sequenceService';
import { extractIdempotencyKey } from '@/lib/idempotency';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const CandidateSchema = z.object({
  externalId: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(180),
  industry: z.string().trim().max(120).default('Business'),
  city: z.string().trim().max(120).default(''),
  country: z.string().trim().max(120).default(''),
  address: z.string().trim().max(300).nullable().default(null),
  phone: z.string().trim().max(50).nullable().default(null),
  website: z.string().trim().max(400).nullable().default(null),
  email: z.string().trim().email().nullable().default(null).or(z.literal('').transform(() => null)),
  instagramHandle: z.string().trim().max(100).nullable().default(null),
  whatsappNumber: z.string().trim().max(50).nullable().default(null),
  aiSummary: z.string().trim().max(600).nullable().default(null),
  fitScore: z.number().min(0).max(100).default(60),
  enrichmentStatus: z.enum(['raw', 'enriched', 'failed']).default('raw'),
  lat: z.number().nullable().default(null),
  lon: z.number().nullable().default(null),
  alreadyInCrm: z.boolean().default(false),
});

const ImportFinderSchema = z.object({
  candidates: z.array(CandidateSchema).min(1).max(100),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  defaultDealValue: z.number().min(0).max(10000000).optional(),
  listName: z.string().trim().max(120).optional(),
  queryMeta: z.record(z.string(), z.unknown()).optional(),
  sequenceId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = ImportFinderSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid lead finder import payload');
    }

    const input = parsed.data;
    const idempotencyKey = extractIdempotencyKey(req, body);

    const result = await LeadFinderService.importCandidates({
      organizationId: auth.session.organizationId,
      userId: auth.session.user.id,
      candidates: input.candidates,
      pipelineId: input.pipelineId,
      stageId: input.stageId,
      defaultDealValue: input.defaultDealValue,
      listName: input.listName,
      queryMeta: input.queryMeta,
    });

    let enrollmentResult: { enrolled: number; skipped: number; errors: string[] } | null = null;
    if (input.sequenceId && result.leadIds.length > 0) {
      enrollmentResult = await CrmSequenceService.enrollLeads({
        organizationId: auth.session.organizationId,
        actorId: auth.session.user.id,
        sequenceId: input.sequenceId,
        leadIds: result.leadIds,
        idempotencyKey: idempotencyKey ? `finder-enroll:${idempotencyKey}` : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
      enrollment: enrollmentResult,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to import leads from Lead Finder');
  }
}
