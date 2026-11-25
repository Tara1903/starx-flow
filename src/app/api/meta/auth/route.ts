import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const channel = searchParams.get('channel') || '';
  const returnTo = searchParams.get('returnTo') || '';

  const appId = process.env.META_APP_ID;
  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID is not configured' }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const redirectUri = `${appUrl}/api/meta/callback`;
  const state =
    returnTo === 'admin'
      ? `admin:${userId}`
      : returnTo === 'setup'
        ? `setup:${userId}`
        : userId;

  const unifiedConfigId = process.env.META_EMBEDDED_CONFIG_ID || process.env.NEXT_PUBLIC_META_CONFIG_ID;

  // Use Meta Facebook Login for Business (Unified Login) when Instagram flow & config_id are configured
  if (channel === 'instagram' && unifiedConfigId) {
    const authUrl =
      `https://www.facebook.com/dialog/oauth?client_id=${encodeURIComponent(appId)}` +
      `&config_id=${encodeURIComponent(unifiedConfigId)}` +
      `&override_default_response_type=true` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=login`;

    return NextResponse.redirect(authUrl);
  }

  const scope = [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_manage_metadata',
    'pages_messaging',
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
