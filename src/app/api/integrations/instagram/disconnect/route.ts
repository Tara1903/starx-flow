import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';

/**
 * Disconnects an Instagram Business Account for an Organization (WS-08 / M2 Remediation).
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;

  if (isSupabaseAdminConfigured) {
    try {
      await supabaseAdmin
        .from('connected_accounts')
        .delete()
        .eq('organization_id', organizationId)
        .eq('provider', 'instagram');
    } catch (err: any) {
      console.warn('[InstagramDisconnect] DB delete failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Instagram account disconnected successfully.',
  });
}
