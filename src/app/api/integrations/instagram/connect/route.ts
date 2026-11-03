import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { CredentialEncryption } from '@/lib/security/encryption';
import { InstagramAdapter } from '@/lib/integrations/instagram/instagramAdapter';

/**
 * Connects an Instagram Business Page for an Organization (WS-08 / M2 Remediation).
 * Encrypts credentials with AES-256-GCM and binds to organization.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const body = await req.json().catch(() => ({}));
  const { pageId, pageAccessToken, pageName } = body;

  if (!pageId || !pageAccessToken) {
    return NextResponse.json({ error: 'pageId and pageAccessToken are required' }, { status: 400 });
  }

  // Register in-memory for immediate sandbox & runtime execution
  InstagramAdapter.registerConnectedAccount({
    organizationId,
    accountIdentifier: pageId,
    accountName: pageName || `Instagram @${pageId}`,
    pageAccessToken,
  });

  // Persist to connected_accounts table with AES-256 encryption
  if (isSupabaseAdminConfigured) {
    try {
      const encrypted = CredentialEncryption.encrypt({ pageAccessToken });
      await supabaseAdmin.from('connected_accounts').upsert(
        {
          organization_id: organizationId,
          user_id: organizationId,
          provider: 'instagram',
          status: 'connected',
          account_identifier: pageId,
          account_name: pageName || `Instagram @${pageId}`,
          encrypted_credentials: encrypted,
          metadata: { pageId, connectedAt: new Date().toISOString() },
        },
        { onConflict: 'organization_id,provider' }
      );
    } catch (err: any) {
      console.warn('[InstagramConnect] DB persist failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    pageId,
    pageName: pageName || `Instagram @${pageId}`,
    status: 'connected',
  });
}
