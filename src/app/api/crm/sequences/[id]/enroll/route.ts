import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmSequenceService } from '@/lib/crm/sequenceService';
import { extractIdempotencyKey } from '@/lib/idempotency';
import { apiErrorResponse, internalErrorResponse, zodValidationError } from '@/lib/security/apiError';

const EnrollLeadsSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1).max(200),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id: sequenceId } = await params;
    if (!z.string().uuid().safeParse(sequenceId).success) {
      return apiErrorResponse(400, 'INVALID_ID', 'Invalid sequence identifier');
    }

    const body = await req.json().catch(() => null);
    const parsed = EnrollLeadsSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError(parsed.error, 'Invalid enrollment payload');
    }

    const idempotencyKey = extractIdempotencyKey(req, body);
    try {
      const result = await CrmSequenceService.enrollLeads({
        organizationId: auth.session.organizationId,
        actorId: auth.session.user.id,
        sequenceId,
        leadIds: parsed.data.leadIds,
        idempotencyKey,
      });

      return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('not found')) {
        return apiErrorResponse(404, 'NOT_FOUND', msg);
      }
      if (msg.includes('no configured steps')) {
        return apiErrorResponse(400, 'EMPTY_SEQUENCE', msg);
      }
      throw err;
    }
  } catch (err) {
    return internalErrorResponse(err, 'Failed to enroll leads into sequence');
  }
}
