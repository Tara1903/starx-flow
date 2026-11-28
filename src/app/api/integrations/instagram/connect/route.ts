import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabaseAdmin';
import { CredentialEncryption } from '@/lib/security/encryption';
import { InstagramAdapter } from '@/lib/integrations/instagram/instagramAdapter';
import { isValidUuid } from '@/lib/crm/organizationHelper';

/**
 * Returns active Instagram Business connection status for the authenticated organization.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId, user } = auth.session;
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ connected: false });
  }

  const { data: account } = await supabaseAdmin
    .from('connected_accounts')
    .select('account_identifier, account_name, metadata, status')
    .eq('organization_id', organizationId)
    .eq('provider', 'instagram')
    .eq('status', 'connected')
    .maybeSingle();

  if (account) {
    const pageId = (account.metadata?.pageId as string | undefined) || account.account_identifier;
    const igAccountId = (account.metadata?.igAccountId as string | undefined) || account.account_identifier;
    const username = (account.metadata?.username as string | undefined) || null;
    return NextResponse.json({
      connected: true,
      pageId,
      igAccountId,
      accountName: account.account_name,
      username,
    });
  }

  if (isValidUuid(user.id)) {
    const { data: channel } = await supabaseAdmin
      .from('connected_channels')
      .select('is_connected, credentials')
      .eq('user_id', user.id)
      .eq('channel_key', 'Instagram')
      .eq('is_connected', true)
      .maybeSingle();

    if (channel?.is_connected) {
      const creds = (channel.credentials || {}) as Record<string, any>;
      return NextResponse.json({
        connected: true,
        pageId: creds.page_id || creds.ig_account_id || creds.username || 'connected',
        igAccountId: creds.ig_account_id || creds.page_id || null,
        accountName: creds.username ? `@${creds.username}` : creds.page_name || 'Instagram',
        username: creds.username || null,
      });
    }
  }

  return NextResponse.json({ connected: false });
}

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

  // Persist to connected_accounts (AES-256 encrypted) and connected_channels BEFORE activating in-memory
  if (isSupabaseAdminConfigured) {
    const encrypted = CredentialEncryption.encrypt({
      pageAccessToken,
      pageId: pageId || null,
      igAccountId: igAccountId || null,
    });
    const { error: accountErr } = await supabaseAdmin.from('connected_accounts').upsert(
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

    if (accountErr) {
      if (accountErr.code === '23505') {
        return NextResponse.json(
          { error: 'This Instagram account is already connected to another organization' },
          { status: 409 }
        );
      }
      console.error('[InstagramConnect] connected_accounts persist failed:', accountErr);
      return NextResponse.json({ error: 'Failed to persist Instagram account connection' }, { status: 500 });
    }

    if (isValidUuid(userId)) {
      const { error: channelErr } = await supabaseAdmin.from('connected_channels').upsert(
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
      if (channelErr) {
        console.error('[InstagramConnect] connected_channels persist failed:', channelErr);
        return NextResponse.json({ error: 'Failed to persist Instagram channel state' }, { status: 500 });
      }
    }
  }

  // Register in-memory for immediate sandbox & runtime execution after DB commit succeeds
  InstagramAdapter.registerConnectedAccount({
    organizationId,
    accountIdentifier: primaryAccountId,
    accountName: resolvedName,
    pageAccessToken,
  });

  return NextResponse.json({
    success: true,
    pageId: pageId || primaryAccountId,
    igAccountId: igAccountId || primaryAccountId,
    pageName: resolvedName,
    status: 'connected',
  });
}
