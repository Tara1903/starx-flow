import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const userId = searchParams.get('state');

  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
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

    // 3. Fetch user's pages and connected accounts
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`);
    const pagesData = await pagesRes.json();

    let igAccountId = null;
    let waPhoneNumberId = null;

    if (pagesData.data && pagesData.data.length > 0) {
      // Find the first page with an IG business account
      const igPage = pagesData.data.find((p: any) => p.instagram_business_account);
      if (igPage) {
        igAccountId = igPage.instagram_business_account.id;
      }

      // 4. Fetch WhatsApp Business Accounts associated with the user's businesses
      const businessesRes = await fetch(`https://graph.facebook.com/v19.0/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{display_phone_number,id}}&access_token=${accessToken}`);
      const businessesData = await businessesRes.json();
      
      if (businessesData.data) {
        for (const business of businessesData.data) {
          const waba = business.owned_whatsapp_business_accounts?.data?.[0];
          if (waba && waba.phone_numbers?.data?.[0]) {
            waPhoneNumberId = waba.phone_numbers.data[0].id;
            break;
          }
        }
      }
    }

    // 5. Save to database
    if (igAccountId) {
      await supabase.from('connected_channels').upsert({
        user_id: userId,
        channel_key: 'Instagram',
        is_connected: true,
        credentials: { access_token: accessToken, ig_account_id: igAccountId },
        last_synced: new Date().toISOString()
      }, { onConflict: 'user_id, channel_key' });
    }

    if (waPhoneNumberId) {
      await supabase.from('connected_channels').upsert({
        user_id: userId,
        channel_key: 'WhatsApp',
        is_connected: true,
        credentials: { access_token: accessToken, phone_number_id: waPhoneNumberId },
        last_synced: new Date().toISOString()
      }, { onConflict: 'user_id, channel_key' });
    }

    // 6. Redirect back to dashboard integrations
    return NextResponse.redirect(`${appUrl}/dashboard?connected=meta`);

  } catch (err: any) {
    console.error('Meta callback error:', err);
    return NextResponse.redirect(`${appUrl}/dashboard?error=meta_callback_failed`);
  }
}
