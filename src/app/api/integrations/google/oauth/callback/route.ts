import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaffRequest } from '@/lib/auth/serverAuth';
import { GoogleCalendarAdapter } from '@/lib/integrations/calendar/googleCalendarAdapter';
import { CalendarSyncService } from '@/lib/integrations/calendar/calendarSyncService';
import { OAuthStateManager } from '@/lib/security/oauthState';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/integrations/google/oauth/callback`;

  if (error || !code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=google_oauth_denied', req.url));
  }

  if (!state) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=missing_oauth_state', req.url));
  }

  // 1. Reauthenticate staff user and verify active organization session (C1 Remediation)
  const auth = await authenticateStaffRequest(req);
  if (!auth.authenticated) {
    console.error('[Google OAuth Callback Auth Error]:', auth.error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=oauth_unauthenticated_session_required', req.url)
    );
  }

  const { organizationId, user } = auth.session;
  const cookieName = OAuthStateManager.getCookieName('google_calendar', state);
  const sessionBindingSecret = req.cookies.get(cookieName)?.value;

  // 2. Cryptographically verify, check session binding, and atomically consume OAuth state
  let verifiedState;
  try {
    verifiedState = await OAuthStateManager.verifyAndConsumeState({
      stateParam: state,
      expectedProvider: 'google_calendar',
      expectedOrgId: organizationId,
      expectedUserId: user.id,
      sessionBindingSecret,
      expectedRedirectUri: redirectUri,
    });
  } catch (stateErr: any) {
    console.error('[Google OAuth State Violation]:', stateErr.message);
    const errRes = NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent('oauth_security_violation: ' + stateErr.message)}`, req.url)
    );
    // Clear session binding cookie on terminal failure
    errRes.cookies.delete(cookieName);
    return errRes;
  }

  try {
    const adapter = new GoogleCalendarAdapter();
    const tokens = await adapter.exchangeCode(code, redirectUri);

    // List available calendars to select primary
    const calendars = await adapter.listCalendars(tokens.accessToken);
    const primaryCal = calendars.find((c) => c.isPrimary) || calendars[0] || {
      id: 'primary',
      name: 'Primary Calendar',
      isPrimary: true,
      timeZone: 'Europe/Berlin',
    };

    // Register connected account with encrypted tokens
    await CalendarSyncService.registerConnection({
      id: `conn-${Date.now()}`,
      organizationId,
      provider: 'google_calendar',
      accountIdentifier: tokens.accountIdentifier,
      accountName: tokens.accountName,
      externalCalendarId: primaryCal.id,
      calendarName: primaryCal.name,
      syncEnabled: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
    });

    const successRes = NextResponse.redirect(new URL('/dashboard/settings?connected=google_calendar', req.url));
    // Clear temporary session binding cookie
    successRes.cookies.delete(cookieName);
    return successRes;
  } catch (err: any) {
    console.error('[Google OAuth Callback Error]:', err);
    const failRes = NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(err.message || 'google_connection_failed')}`, req.url)
    );
    failRes.cookies.delete(cookieName);
    return failRes;
  }
}
