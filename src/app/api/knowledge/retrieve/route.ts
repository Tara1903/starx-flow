import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { MultiTenantRAG } from '@/lib/rag/multiTenantRAG';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const RetrieveKnowledgeSchema = z.object({
  query: z.string().trim().min(2, 'Search query must be at least 2 characters').max(500),
  limit: z.number().int().min(1).max(15).optional().default(5),
  minScore: z.number().min(0).max(1).optional().default(0.18),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiErrorResponse(400, 'BAD_JSON', 'Invalid JSON request body');
    }

    const parsed = RetrieveKnowledgeSchema.safeParse(rawBody);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid knowledge search parameters');
    }

    const { query, limit, minScore } = parsed.data;
    const result = await MultiTenantRAG.retrieveContext({
      userId: auth.session.user.id,
      organizationId: auth.session.organizationId,
      query,
      limit,
      minScore,
    });

    return NextResponse.json({
      success: true,
      query,
      matches: result.matches,
      sourcesCited: result.sourcesCited,
      hasSufficientContext: result.hasSufficientContext,
      contextText: result.contextText,
    });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to retrieve knowledge context');
  }
}
