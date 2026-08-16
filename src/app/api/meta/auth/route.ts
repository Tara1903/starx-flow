import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const appId = process.env.META_APP_ID;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID is not configured' }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const redirectUri = `${appUrl}/api/meta/callback`;
  const scope = [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_manage_metadata',
    'pages_messaging'
  ].join(',');

  const state = userId;

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
