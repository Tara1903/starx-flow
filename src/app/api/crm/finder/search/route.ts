import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { LeadFinderService } from '@/lib/crm/leadFinder';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const FinderSearchSchema = z.object({
  niche: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().max(120).optional().default(''),
  limit: z.number().int().min(1).max(25).optional().default(12),
  enrichWebsites: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const body = await req.json().catch(() => null);
    const parsed = FinderSearchSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid lead finder search payload');
    }

    const input = parsed.data;
    const result = await LeadFinderService.searchProspects({
      organizationId: auth.session.organizationId,
      niche: input.niche,
      city: input.city,
      country: input.country,
      limit: input.limit,
      enrichWebsites: input.enrichWebsites,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    const message = String(err?.message || '');
    if (message.includes('Location lookup unavailable')) {
      return apiErrorResponse(503, 'PROSPECT_PROVIDER_UNAVAILABLE', message);
    }
    return internalErrorResponse(err, 'Lead finder search failed');
  }
}
