import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { CrmService } from '@/lib/crm/crmService';
import { apiErrorResponse, internalErrorResponse } from '@/lib/security/apiError';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return apiErrorResponse(auth.status, 'UNAUTHORIZED', auth.error);
    }

    const { id } = await params;
    const workspace = await CrmService.getLeadWorkspace360(
      auth.session.organizationId,
      auth.session.user.id,
      id
    );

    if (!workspace) {
      return apiErrorResponse(404, 'NOT_FOUND', 'CRM customer not found');
    }

    return NextResponse.json({ success: true, workspace });
  } catch (err) {
    return internalErrorResponse(err, 'Failed to load 360 customer workspace');
  }
}
