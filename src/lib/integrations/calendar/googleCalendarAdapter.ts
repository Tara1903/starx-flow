/**
 * StarX-Flow Google Calendar Provider Adapter (WS-06)
 * Supports Google OAuth 2.0, token refresh lifecycle, event creation/updates/cancellation,
 * incremental sync, and simulated sandbox mode when running without live API credentials.
 */

import {
  CalendarProviderAdapter,
  CalendarProvider,
  OAuthTokens,
  CalendarSummary,
  NormalizedCalendarEvent,
  CreateCalendarEventInput,
} from './types';

export class GoogleCalendarAdapter implements CalendarProviderAdapter {
  readonly provider: CalendarProvider = 'google_calendar';

  private clientId: string;
  private clientSecret: string;
  private isLiveConfigured: boolean;

  // In-memory simulator registry for sandbox testing & offline test suites
  private static simulatedEvents = new Map<string, NormalizedCalendarEvent>();

  constructor() {
    this.clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
    this.isLiveConfigured = Boolean(this.clientId && this.clientSecret && !this.clientId.includes('placeholder'));
  }

  get isConfigured(): boolean {
    return this.isLiveConfigured;
  }

  /**
   * Generates Google OAuth 2.0 Consent URL.
   */
  getAuthUrl(options: { organizationId: string; redirectUri: string; state?: string }): string {
    const { organizationId, redirectUri, state } = options;
    const effectiveState = state || Buffer.from(JSON.stringify({ orgId: organizationId, provider: this.provider, nonce: Date.now() })).toString('base64');

    if (!this.isLiveConfigured) {
      // Sandbox OAuth simulator URL
      return `/api/integrations/google/oauth/callback?code=simulated_gcal_code_${Date.now()}&state=${effectiveState}&simulated=true`;
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
        'openid',
        'email',
        'profile',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: effectiveState,
    });

    return `${rootUrl}?${params.toString()}`;
  }

  /**
   * Exchanges Google authorization code for Access & Refresh Tokens.
   */
  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    if (!this.isLiveConfigured || code.startsWith('simulated_')) {
      // Sandbox simulator response
      return {
        accessToken: `ya29.simulated_gcal_token_${Date.now()}`,
        refreshToken: `1//04_simulated_gcal_refresh_${Date.now()}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
        accountIdentifier: 'business-owner@localclinic.de',
        accountName: 'Dr. Müller Clinic Calendar',
        scopes: ['https://www.googleapis.com/auth/calendar.events', 'openid', 'email'],
      };
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google OAuth code exchange failed (${response.status}): ${err}`);
    }

    const data = await response.json();

    // Fetch user profile to extract email identifier
    let accountIdentifier = 'google_user@calendar.google.com';
    let accountName = 'Google Calendar Account';

    try {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userinfoRes.ok) {
        const profile = await userinfoRes.json();
        accountIdentifier = profile.email || accountIdentifier;
        accountName = profile.name || accountName;
      }
    } catch {
      // Fallback identifier
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in || 3600,
      tokenType: data.token_type || 'Bearer',
      accountIdentifier,
      accountName,
      scopes: data.scope ? data.scope.split(' ') : [],
    };
  }

  /**
   * Refreshes an expired Google access token using the stored refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    if (!this.isLiveConfigured || refreshToken.startsWith('1//04_simulated_')) {
      return {
        accessToken: `ya29.simulated_gcal_token_refreshed_${Date.now()}`,
        expiresIn: 3600,
      };
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google token refresh failed (${response.status}): ${err}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Lists available calendars for the connected Google account.
   */
  async listCalendars(accessToken: string): Promise<CalendarSummary[]> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      return [
        {
          id: 'primary',
          name: 'Primary Appointments Calendar',
          isPrimary: true,
          timeZone: 'Europe/Berlin',
          accessRole: 'owner',
        },
        {
          id: 'staff-on-call',
          name: 'Staff On-Call Schedule',
          isPrimary: false,
          timeZone: 'Europe/Berlin',
          accessRole: 'writer',
        },
      ];
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Google Calendar list failed (${res.status})`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      name: item.summary,
      isPrimary: Boolean(item.primary),
      timeZone: item.timeZone || 'UTC',
      accessRole: item.accessRole,
    }));
  }

  /**
   * Queries existing Google Calendar events in a time window to check busy slots.
   */
  async listEvents(
    accessToken: string,
    calendarId: string,
    timeMin: string,
    timeMax: string
  ): Promise<NormalizedCalendarEvent[]> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const minMs = new Date(timeMin).getTime();
      const maxMs = new Date(timeMax).getTime();

      return Array.from(GoogleCalendarAdapter.simulatedEvents.values()).filter((e) => {
        if (e.calendarId !== calendarId && calendarId !== 'primary') return false;
        if (e.status === 'cancelled') return false;
        const eStart = new Date(e.startTime).getTime();
        const eEnd = new Date(e.endTime).getTime();
        return eStart < maxMs && eEnd > minMs;
      });
    }

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      throw new Error(`Google Calendar event list failed (${res.status})`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      externalEventId: item.id,
      calendarId,
      provider: this.provider,
      title: item.summary || 'Untitled Event',
      description: item.description,
      startTime: item.start?.dateTime || item.start?.date,
      endTime: item.end?.dateTime || item.end?.date,
      timeZone: item.start?.timeZone || 'UTC',
      status: item.status === 'cancelled' ? 'cancelled' : 'confirmed',
      attendees: item.attendees?.map((a: any) => ({
        email: a.email,
        name: a.displayName,
        responseStatus: a.responseStatus,
      })),
      htmlLink: item.htmlLink,
    }));
  }

  /**
   * Creates a new event in Google Calendar.
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    event: CreateCalendarEventInput
  ): Promise<NormalizedCalendarEvent> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const simulatedId = `gcal-evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const normalized: NormalizedCalendarEvent = {
        id: simulatedId,
        externalEventId: simulatedId,
        calendarId,
        provider: this.provider,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        timeZone: event.timeZone || 'Europe/Berlin',
        status: 'confirmed',
        attendees: event.attendees?.map((a) => ({ email: a.email, name: a.name })),
        htmlLink: `https://calendar.google.com/calendar/r/eventedit/${simulatedId}`,
        appointmentId: event.appointmentId,
      };

      GoogleCalendarAdapter.simulatedEvents.set(simulatedId, normalized);
      return normalized;
    }

    const body: Record<string, any> = {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.startTime, timeZone: event.timeZone || 'UTC' },
      end: { dateTime: event.endTime, timeZone: event.timeZone || 'UTC' },
    };

    if (event.attendees && event.attendees.length > 0) {
      body.attendees = event.attendees.map((a) => ({ email: a.email, displayName: a.name }));
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await responseError(res);
      throw new Error(`Google Calendar create event failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      externalEventId: data.id,
      calendarId,
      provider: this.provider,
      title: data.summary,
      description: data.description,
      startTime: data.start?.dateTime,
      endTime: data.end?.dateTime,
      timeZone: data.start?.timeZone || 'UTC',
      status: 'confirmed',
      htmlLink: data.htmlLink,
      appointmentId: event.appointmentId,
    };
  }

  /**
   * Updates an existing Google Calendar event.
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    externalEventId: string,
    event: Partial<CreateCalendarEventInput>
  ): Promise<NormalizedCalendarEvent> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const existing = GoogleCalendarAdapter.simulatedEvents.get(externalEventId);
      if (!existing) {
        throw new Error(`Google event ${externalEventId} not found in calendar`);
      }

      if (event.title) existing.title = event.title;
      if (event.description) existing.description = event.description;
      if (event.startTime) existing.startTime = event.startTime;
      if (event.endTime) existing.endTime = event.endTime;
      if (event.timeZone) existing.timeZone = event.timeZone;

      GoogleCalendarAdapter.simulatedEvents.set(externalEventId, existing);
      return existing;
    }

    const patchBody: Record<string, any> = {};
    if (event.title) patchBody.summary = event.title;
    if (event.description) patchBody.description = event.description;
    if (event.startTime) patchBody.start = { dateTime: event.startTime, timeZone: event.timeZone || 'UTC' };
    if (event.endTime) patchBody.end = { dateTime: event.endTime, timeZone: event.timeZone || 'UTC' };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(externalEventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchBody),
      }
    );

    if (!res.ok) {
      throw new Error(`Google Calendar update event failed (${res.status})`);
    }

    const data = await res.json();
    return {
      id: data.id,
      externalEventId: data.id,
      calendarId,
      provider: this.provider,
      title: data.summary,
      description: data.description,
      startTime: data.start?.dateTime,
      endTime: data.end?.dateTime,
      timeZone: data.start?.timeZone || 'UTC',
      status: 'confirmed',
      htmlLink: data.htmlLink,
      appointmentId: event.appointmentId,
    };
  }

  /**
   * Deletes / cancels an event in Google Calendar.
   */
  async deleteEvent(accessToken: string, calendarId: string, externalEventId: string): Promise<boolean> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const existing = GoogleCalendarAdapter.simulatedEvents.get(externalEventId);
      if (existing) {
        existing.status = 'cancelled';
        GoogleCalendarAdapter.simulatedEvents.set(externalEventId, existing);
      }
      return true;
    }

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(externalEventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return res.ok || res.status === 404; // 404 considered successfully absent
  }

  static clearSimulated(): void {
    this.simulatedEvents.clear();
  }
}

async function responseError(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return 'Unknown API error';
  }
}
