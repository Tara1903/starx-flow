import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { OAuthStateManager } from '@/lib/security/oauthState';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ADMIN_SUPPORT_ORG_ID = '215ae89e-80bc-40f8-89e4-5dfd1254ddbe';
const ADMIN_SUPPORT_OWNER_ID = '230a2984-8c0b-489f-abda-b31fbcddf742';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || '';
  const requestedReturnTo = searchParams.get('returnTo') || '';

  const appId = process.env.META_APP_ID;
  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID is not configured' }, { status: 500 });
  }

  // Require an authenticated staff session; never accept arbitrary userId query params
  const auth = await authenticateStaffRequest(request);
  if (!auth.authenticated) {
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      return NextResponse.redirect(new URL('/login?error=session_required', appUrl));
    }
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let targetUserId = auth.session.user.id;
  let targetOrgId = auth.session.organizationId || auth.session.user.id;
  let returnTo: 'admin' | 'setup' | 'dashboard' =
    requestedReturnTo === 'setup' ? 'setup' : 'dashboard';

  if (requestedReturnTo === 'admin') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', auth.session.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden: platform administrator privileges required' },
        { status: 403 }
      );
    }

    targetUserId = ADMIN_SUPPORT_OWNER_ID;
    targetOrgId = ADMIN_SUPPORT_ORG_ID;
    returnTo = 'admin';
  }

  const redirectUri = `${appUrl}/api/meta/callback`;
  const binding = await OAuthStateManager.generateStateWithBinding({
    organizationId: targetOrgId,
    userId: targetUserId,
    provider: 'meta',
    redirectUri,
    metadata: {
      returnTo,
      initiatedByUserId: auth.session.user.id,
    },
  });

  const unifiedConfigId = process.env.META_EMBEDDED_CONFIG_ID || process.env.NEXT_PUBLIC_META_CONFIG_ID;

  let authUrl: string;
  if (channel === 'instagram' && unifiedConfigId) {
    authUrl =
      `https://www.facebook.com/dialog/oauth?client_id=${encodeURIComponent(appId)}` +
      `&config_id=${encodeURIComponent(unifiedConfigId)}` +
      `&override_default_response_type=true` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(binding.state)}` +
      `&prompt=login`;
  } else {
    const scope = [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_manage_metadata',
      'pages_messaging',
    ].join(',');

    authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(binding.state)}&response_type=code`;
  }

  const response = NextResponse.redirect(authUrl);
  const isSecure = process.env.NODE_ENV === 'production' || appUrl.startsWith('https://');
  response.cookies.set(binding.cookieName, binding.sessionBindingSecret, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/api/meta',
    maxAge: 600,
  });

  return response;
}
