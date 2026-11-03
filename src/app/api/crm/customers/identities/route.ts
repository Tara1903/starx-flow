import { NextRequest, NextResponse } from 'next/server';
import { IdentityResolver } from '@/lib/crm/identityResolver';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateStaffRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: leadId' },
        { status: 400 }
      );
    }

    const [identities, duplicates] = await Promise.all([
      IdentityResolver.getCustomerIdentities(auth.session.user.id, leadId, auth.session.organizationId),
      IdentityResolver.detectPotentialDuplicates(auth.session.user.id, leadId, auth.session.organizationId),
    ]);

    return NextResponse.json({
      success: true,
      leadId,
      identities,
      duplicates,
    });
  } catch (err: any) {
    console.error('[API /api/crm/customers/identities GET error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
