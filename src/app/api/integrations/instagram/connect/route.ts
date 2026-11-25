import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { CredentialEncryption } from '@/lib/security/encryption';
import { InstagramAdapter } from '@/lib/integrations/instagram/instagramAdapter';
import { isValidUuid } from '@/lib/crm/organizationHelper';

/**
 * Connects an Instagram Business Page for an Organization (WS-08 / M2 Remediation).
 * Encrypts credentials with AES-256-GCM and binds to organization + connected_channels.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateStaffRequest(req, { requiredRole: 'admin' });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId } = auth.session;
  const userId = auth.session.user.id;
  const body = await req.json().catch(() => ({}));
  const { pageId, pageAccessToken, pageName, igAccountId, username } = body;
  const primaryAccountId = String(igAccountId || pageId || '').trim();

  if (!primaryAccountId || !pageAccessToken) {
    return NextResponse.json(
      { error: 'igAccountId (or pageId) and pageAccessToken are required' },
      { status: 400 }
    );
  }

  const resolvedName = pageName || (username ? `@${String(username).replace(/^@/, '')}` : `Instagram @${primaryAccountId}`);

  // Register in-memory for immediate sandbox & runtime execution
  InstagramAdapter.registerConnectedAccount({
    organizationId,
    accountIdentifier: primaryAccountId,
    accountName: resolvedName,
    pageAccessToken,
  });

  // Persist to connected_accounts (AES-256 encrypted) and connected_channels
  if (isSupabaseAdminConfigured) {
    try {
      const encrypted = CredentialEncryption.encrypt({
        pageAccessToken,
        pageId: pageId || null,
        igAccountId: igAccountId || null,
      });
      await supabaseAdmin.from('connected_accounts').upsert(
        {
          organization_id: organizationId,
          user_id: isValidUuid(userId) ? userId : organizationId,
          provider: 'instagram',
          status: 'connected',
          account_identifier: primaryAccountId,
          account_name: resolvedName,
          encrypted_credentials: encrypted,
          metadata: {
            pageId: pageId || null,
            igAccountId: igAccountId || primaryAccountId,
            username: username || null,
            connectedAt: new Date().toISOString(),
          },
        },
        { onConflict: 'organization_id,provider' }
      );

      if (isValidUuid(userId)) {
        await supabaseAdmin.from('connected_channels').upsert(
          {
            user_id: userId,
            channel_key: 'Instagram',
            is_connected: true,
            credentials: {
              access_token: pageAccessToken,
              ig_account_id: igAccountId || primaryAccountId,
              page_id: pageId || null,
              username: username || null,
              updated_at: new Date().toISOString(),
            },
            last_synced: new Date().toISOString(),
          },
          { onConflict: 'user_id, channel_key' }
        );
      }
    } catch (err: any) {
      console.warn('[InstagramConnect] DB persist failed:', err);
    }
  }

  return NextResponse.json({
    success: true,
    pageId: pageId || primaryAccountId,
    igAccountId: igAccountId || primaryAccountId,
    pageName: resolvedName,
    status: 'connected',
  });
}
