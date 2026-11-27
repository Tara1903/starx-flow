import { NextRequest, NextResponse } from 'next/server';
import { CredentialEncryption } from '@/lib/security/encryption';
import { isValidUuid, resolveValidOrganizationId } from '@/lib/crm/organizationHelper';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { OAuthStateManager } from '@/lib/security/oauthState';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const rawState = searchParams.get('state') || '';

  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const redirectUri = `${appUrl}/api/meta/callback`;
  const cookieName = rawState ? OAuthStateManager.getCookieName('meta', rawState) : '';

  const clearCookieAndRedirect = (destUrl: string) => {
    const res = NextResponse.redirect(destUrl);
    if (cookieName) {
      res.cookies.delete(cookieName);
    }
    return res;
  };

  if (error) {
    console.error('Meta OAuth error:', searchParams.get('error_description'));
    return clearCookieAndRedirect(`${appUrl}/dashboard?error=meta_auth_failed`);
  }

  if (!code || !rawState) {
    return clearCookieAndRedirect(`${appUrl}/dashboard?error=invalid_request`);
  }

  // 1. Authenticate active staff session
  const auth = await authenticateStaffRequest(request);
  if (!auth.authenticated) {
    return clearCookieAndRedirect(`${appUrl}/login?error=oauth_session_required`);
  }

  // 2. Cryptographically verify HMAC signature, session binding cookie, and single-use DB consumption
  const sessionBindingSecret = cookieName ? request.cookies.get(cookieName)?.value : undefined;
  let verifiedState;
  try {
    verifiedState = await OAuthStateManager.verifyAndConsumeState({
      stateParam: rawState,
      expectedProvider: 'meta',
      sessionBindingSecret,
      expectedRedirectUri: redirectUri,
    });
  } catch (stateErr: any) {
    console.error('[Meta OAuth State Violation]:', stateErr?.message);
    return clearCookieAndRedirect(`${appUrl}/dashboard?error=oauth_security_violation`);
  }

  const returnTo = verifiedState.metadata?.returnTo;
  const returnPath =
    returnTo === 'admin'
      ? '/admin'
      : returnTo === 'setup'
        ? '/setup/instagram'
        : '/dashboard';

  // 3. Verify authenticated caller owns the state (or is platform admin for admin support flow)
  const initiatedBy = verifiedState.metadata?.initiatedByUserId || verifiedState.userId;
  if (returnTo === 'admin') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', auth.session.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return clearCookieAndRedirect(`${appUrl}/dashboard?error=forbidden`);
    }
  } else if (initiatedBy !== auth.session.user.id) {
    return clearCookieAndRedirect(`${appUrl}/dashboard?error=oauth_user_mismatch`);
  }

  const userId = verifiedState.userId;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('Meta App credentials not configured.');
    return clearCookieAndRedirect(`${appUrl}${returnPath}?error=config_missing`);
  }

  try {
    // 4. Exchange code for short-lived access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(code)}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // 5. Exchange for long-lived access token
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`
    );
    const longLivedData = await longLivedRes.json();

    const accessToken = longLivedData.access_token || shortLivedToken;

    // 6. Fetch user's pages and connected Instagram Business / WhatsApp accounts
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`
    );
    const pagesData = await pagesRes.json();

    let igAccountId: string | null = null;
    let igPageId: string | null = null;
    let igPageName: string | null = null;
    let igUsername: string | null = null;
    let igPageToken: string = accessToken;
    let waPhoneNumberId: string | null = null;

    if (pagesData.data && pagesData.data.length > 0) {
      const igPage = pagesData.data.find((p: any) => p.instagram_business_account);
      if (igPage) {
        igAccountId = igPage.instagram_business_account.id;
        igUsername = igPage.instagram_business_account.username || null;
        igPageId = igPage.id || null;
        igPageName = igPage.name || null;
        igPageToken = igPage.access_token || accessToken;
      }
    }

    // Fetch businesses for WhatsApp (and Unified Login Instagram assets if no Facebook Page was returned)
    const businessesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{display_phone_number,id}},owned_instagram_accounts{id,username}&access_token=${encodeURIComponent(accessToken)}`
    );
    const businessesData = await businessesRes.json();

    if (businessesData.data) {
      for (const business of businessesData.data) {
        if (!waPhoneNumberId) {
          const waba = business.owned_whatsapp_business_accounts?.data?.[0];
          if (waba && waba.phone_numbers?.data?.[0]) {
            waPhoneNumberId = waba.phone_numbers.data[0].id;
          }
        }
        if (!igAccountId && business.owned_instagram_accounts?.data?.[0]) {
          igAccountId = business.owned_instagram_accounts.data[0].id;
          igUsername = business.owned_instagram_accounts.data[0].username || null;
        }
      }
    }

    // Unified Login SUAT discovery via debug_token granular_scopes when no Page was returned
    if (!igAccountId) {
      try {
        const debugRes = await fetch(
          `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`
        );
        const debugData = await debugRes.json();
        const scopes = Array.isArray(debugData?.data?.granular_scopes)
          ? debugData.data.granular_scopes
          : [];
        const igScope = scopes.find(
          (s: any) =>
            typeof s?.scope === 'string' &&
            s.scope.startsWith('instagram_') &&
            Array.isArray(s.target_ids) &&
            s.target_ids.length > 0
        );
        const candidateId = igScope?.target_ids?.[0];
        if (candidateId) {
          igAccountId = String(candidateId);
          try {
            const profileRes = await fetch(
              `https://graph.facebook.com/v19.0/${encodeURIComponent(igAccountId)}?fields=id,username,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`
            );
            const profileJson = await profileRes.json();
            if (profileJson?.instagram_business_account?.id) {
              igPageId = igAccountId;
              igAccountId = String(profileJson.instagram_business_account.id);
              igUsername = profileJson.instagram_business_account.username || igUsername;
            } else if (profileJson?.username) {
              igUsername = String(profileJson.username);
            }
          } catch {
            // Keep candidateId as igAccountId
          }
        }
      } catch (dbgErr) {
        console.warn('[MetaCallback] Unified debug_token discovery warning:', dbgErr);
      }
    }

    // 7. Save to database (connected_channels + connected_accounts) using verified tenant identity
    if (igAccountId) {
      await supabaseAdmin.from('connected_channels').upsert(
        {
          user_id: userId,
          channel_key: 'Instagram',
          is_connected: true,
          credentials: {
            access_token: igPageToken,
            ig_account_id: igAccountId,
            page_id: igPageId,
            page_name: igPageName,
            username: igUsername,
          },
          last_synced: new Date().toISOString(),
        },
        { onConflict: 'user_id, channel_key' }
      );

      const resolvedOrgId =
        verifiedState.organizationId ||
        (isValidUuid(userId) ? (await resolveValidOrganizationId(userId)) || userId : userId);

      try {
        const encrypted = CredentialEncryption.encrypt({
          pageAccessToken: igPageToken,
          pageId: igPageId,
          igAccountId,
        });
        await supabaseAdmin.from('connected_accounts').upsert(
          {
            organization_id: resolvedOrgId,
            user_id: userId,
            provider: 'instagram',
            status: 'connected',
            account_identifier: igAccountId,
            account_name: igUsername ? `@${igUsername}` : igPageName || `Instagram @${igAccountId}`,
            encrypted_credentials: encrypted,
            metadata: {
              pageId: igPageId,
              igAccountId,
              username: igUsername,
              connectedAt: new Date().toISOString(),
            },
          },
          { onConflict: 'organization_id,provider' }
        );
      } catch (accErr) {
        console.warn('[MetaCallback] connected_accounts sync warning:', accErr);
      }
    }

    if (waPhoneNumberId) {
      await supabaseAdmin.from('connected_channels').upsert(
        {
          user_id: userId,
          channel_key: 'WhatsApp',
          is_connected: true,
          credentials: { access_token: accessToken, phone_number_id: waPhoneNumberId },
          last_synced: new Date().toISOString(),
        },
        { onConflict: 'user_id, channel_key' }
      );
    }

    return clearCookieAndRedirect(`${appUrl}${returnPath}?connected=meta`);
  } catch (err: any) {
    console.error('Meta callback error:', err);
    return clearCookieAndRedirect(`${appUrl}${returnPath}?error=meta_callback_failed`);
  }
}
