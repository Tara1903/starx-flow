import { NextRequest, NextResponse } from 'next/server';
import { IdentityResolver } from '@/lib/crm/identityResolver';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function POST(req: NextRequest) {
  try {
    // Merging customer records requires authenticated admin or owner role
    const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { targetLeadId, sourceLeadId } = body;

    if (!targetLeadId || !sourceLeadId) {
      return NextResponse.json(
        { error: 'Missing required parameters: targetLeadId, sourceLeadId' },
        { status: 400 }
      );
    }

    // Always use verified session identity, never untrusted request body claims
    const result = await IdentityResolver.mergeCustomers({
      userId: auth.session.user.id,
      organizationId: auth.session.organizationId,
      targetLeadId,
      sourceLeadId,
      actorId: auth.session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: `Customer ${sourceLeadId} successfully merged into ${targetLeadId}.`,
      result,
    });
  } catch (err: any) {
    console.error('[API /api/crm/customers/merge error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
