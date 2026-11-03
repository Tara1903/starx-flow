import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { OutlookCalendarAdapter } from '@/lib/integrations/calendar/outlookCalendarAdapter';
import { OAuthStateManager } from '@/lib/security/oauthState';

export async function GET(req: NextRequest) {
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { organizationId, user } = auth.session;
  const adapter = new OutlookCalendarAdapter();

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/integrations/microsoft/oauth/callback`;

  // Cryptographically signed, session-bound OAuth state (C1 remediation)
  const binding = await OAuthStateManager.generateStateWithBinding({
    organizationId,
    userId: user.id,
    provider: 'microsoft_calendar',
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
