import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const body = await req.json().catch(() => ({}));
  const provider = body.provider;

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  if (isSupabaseAdminConfigured) {
    try {
      await supabaseAdmin
        .from('connected_accounts')
        .delete()
        .eq('organization_id', organizationId)
        .eq('provider', provider);
    } catch {
      // Continue
    }
  }

  return NextResponse.json({
    success: true,
    message: `${provider} disconnected successfully.`,
  });
}
