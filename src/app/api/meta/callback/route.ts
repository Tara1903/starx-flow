import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CredentialEncryption } from '@/lib/security/encryption';
import { isValidUuid, resolveValidOrganizationId } from '@/lib/crm/organizationHelper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const userId = searchParams.get('state');

  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  
  if (error) {
    console.error('Meta OAuth error:', searchParams.get('error_description'));
    return NextResponse.redirect(`${appUrl}/dashboard?error=meta_auth_failed`);
  }

  if (!code || !userId) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=invalid_request`);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${appUrl}/api/meta/callback`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!appId || !appSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Meta App or Supabase credentials not configured.');
    return NextResponse.redirect(`${appUrl}/dashboard?error=config_missing`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Exchange code for short-lived access token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }
    
    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived access token
    const longLivedRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`);
    const longLivedData = await longLivedRes.json();
    
    const accessToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch user's pages and connected Instagram Business / WhatsApp accounts
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

    // 5. Save to database (connected_channels + connected_accounts)
    if (igAccountId) {
      await supabase.from('connected_channels').upsert(
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

      const resolvedOrgId = isValidUuid(userId) ? (await resolveValidOrganizationId(userId)) || userId : userId;
      try {
        const encrypted = CredentialEncryption.encrypt({
          pageAccessToken: igPageToken,
          pageId: igPageId,
          igAccountId,
        });
        await supabase.from('connected_accounts').upsert(
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
      await supabase.from('connected_channels').upsert(
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

    // 6. Redirect back to dashboard integrations
    return NextResponse.redirect(`${appUrl}/dashboard?connected=meta`);

  } catch (err: any) {
    console.error('Meta callback error:', err);
    return NextResponse.redirect(`${appUrl}/dashboard?error=meta_callback_failed`);
  }
}
