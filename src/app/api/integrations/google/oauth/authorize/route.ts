import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { GoogleCalendarAdapter } from '@/lib/integrations/calendar/googleCalendarAdapter';
import { OAuthStateManager } from '@/lib/security/oauthState';

export async function GET(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId, user } = auth.session;
  const adapter = new GoogleCalendarAdapter();

  const configuredAppUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
  const host = req.headers.get('host') || 'localhost:3000';
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  const protocol = isLocalHost ? 'http' : 'https';
  const baseUrl = configuredAppUrl || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/integrations/google/oauth/callback`;

  // Cryptographically signed, session-bound OAuth state (C1 remediation)
  const binding = await OAuthStateManager.generateStateWithBinding({
    organizationId,
    userId: user.id,
    provider: 'google_calendar',
    redirectUri,
  });

  const authUrl = adapter.getAuthUrl({
    organizationId,
    redirectUri,
    state: binding.state,
  });

  const response = NextResponse.json({
    authUrl,
    isConfigured: adapter.isConfigured,
  });

  // Set secure, HttpOnly, SameSite=Lax session binding cookie
  const isSecure = process.env.NODE_ENV === 'production' || protocol === 'https';
  response.cookies.set(binding.cookieName, binding.sessionBindingSecret, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/api/integrations',
    maxAge: 600, // 10 minutes TTL
  });

  return response;
}
