/**
 * StarX-Flow Microsoft Outlook Provider Adapter (WS-06)
 * Integrates with Microsoft Graph API for calendar events, OAuth token lifecycle,
 * change notifications, and simulated sandbox testing.
 */

import {
  CalendarProviderAdapter,
  CalendarProvider,
  OAuthTokens,
  CalendarSummary,
  NormalizedCalendarEvent,
  CreateCalendarEventInput,
} from './types';

export class OutlookCalendarAdapter implements CalendarProviderAdapter {
  readonly provider: CalendarProvider = 'microsoft_calendar';

  private clientId: string;
  private clientSecret: string;
  private isLiveConfigured: boolean;

  // In-memory simulator registry for sandbox testing & offline test suites
  private static simulatedEvents = new Map<string, NormalizedCalendarEvent>();

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || '';
    this.isLiveConfigured = Boolean(this.clientId && this.clientSecret && !this.clientId.includes('placeholder'));
  }

  get isConfigured(): boolean {
    return this.isLiveConfigured;
  }

  /**
   * Generates Microsoft OAuth 2.0 Authorization URL (Microsoft Identity Platform).
   */
  getAuthUrl(options: { organizationId: string; redirectUri: string; state?: string }): string {
    const { organizationId, redirectUri, state } = options;
    const effectiveState = state || Buffer.from(JSON.stringify({ orgId: organizationId, provider: this.provider, nonce: Date.now() })).toString('base64');

    if (!this.isLiveConfigured) {
      return `/api/integrations/microsoft/oauth/callback?code=simulated_ms_code_${Date.now()}&state=${effectiveState}&simulated=true`;
    }

    const rootUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: ['Calendars.ReadWrite', 'offline_access', 'User.Read', 'openid', 'email'].join(' '),
      state: effectiveState,
    });

    return `${rootUrl}?${params.toString()}`;
  }

  /**
   * Exchanges Microsoft authorization code for tokens.
   */
  async exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    if (!this.isLiveConfigured || code.startsWith('simulated_')) {
      return {
        accessToken: `ms_simulated_token_${Date.now()}`,
        refreshToken: `ms_simulated_refresh_${Date.now()}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
        accountIdentifier: 'consultant@lawfirm.de',
        accountName: 'Kanzlei Schmidt Outlook Calendar',
        scopes: ['Calendars.ReadWrite', 'User.Read'],
      };
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Microsoft OAuth token exchange failed (${response.status}): ${err}`);
    }

    const data = await response.json();

    // Fetch user profile from Microsoft Graph
    let accountIdentifier = 'outlook_user@outlook.com';
    let accountName = 'Outlook Calendar Account';

    try {
      const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        accountIdentifier = me.mail || me.userPrincipalName || accountIdentifier;
        accountName = me.displayName || accountName;
      }
    } catch {
      // Fallback
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
   * Refreshes an expired Microsoft Graph access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    if (!this.isLiveConfigured || refreshToken.startsWith('ms_simulated_')) {
      return {
        accessToken: `ms_simulated_token_refreshed_${Date.now()}`,
        expiresIn: 3600,
      };
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Microsoft token refresh failed (${response.status}): ${err}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  }

  /**
   * Lists available calendars in the user's Outlook account.
   */
  async listCalendars(accessToken: string): Promise<CalendarSummary[]> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      return [
        {
          id: 'primary',
          name: 'Calendar',
          isPrimary: true,
          timeZone: 'Europe/Berlin',
          accessRole: 'owner',
        },
      ];
    }

    const res = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph list calendars failed (${res.status})`);
    }

    const data = await res.json();
    return (data.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      isPrimary: Boolean(cal.isDefaultCalendar),
      timeZone: 'UTC',
      accessRole: cal.canEdit ? 'writer' : 'reader',
    }));
  }

  /**
   * Lists events within a date range from Outlook calendar.
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

      return Array.from(OutlookCalendarAdapter.simulatedEvents.values()).filter((e) => {
        if (e.calendarId !== calendarId && calendarId !== 'primary') return false;
        if (e.status === 'cancelled') return false;
        const eStart = new Date(e.startTime).getTime();
        const eEnd = new Date(e.endTime).getTime();
        return eStart < maxMs && eEnd > minMs;
      });
    }

    const path = calendarId === 'primary' ? '/me/calendarView' : `/me/calendars/${encodeURIComponent(calendarId)}/calendarView`;
    const params = new URLSearchParams({
      startDateTime: timeMin,
      endDateTime: timeMax,
      $top: '100',
    });

    const res = await fetch(`https://graph.microsoft.com/v1.0${path}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph event list failed (${res.status})`);
    }

    const data = await res.json();
    return (data.value || []).map((item: any) => ({
      id: item.id,
      externalEventId: item.id,
      calendarId,
      provider: this.provider,
      title: item.subject || 'Untitled Event',
      description: item.body?.content,
      startTime: item.start?.dateTime ? `${item.start.dateTime}Z` : timeMin,
      endTime: item.end?.dateTime ? `${item.end.dateTime}Z` : timeMax,
      timeZone: item.start?.timeZone || 'UTC',
      status: item.isCancelled ? 'cancelled' : 'confirmed',
      htmlLink: item.webLink,
    }));
  }

  /**
   * Creates an event in Microsoft Outlook calendar.
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    event: CreateCalendarEventInput
  ): Promise<NormalizedCalendarEvent> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const simulatedId = `ms-evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
        htmlLink: `https://outlook.live.com/calendar/item/${simulatedId}`,
        appointmentId: event.appointmentId,
      };

      OutlookCalendarAdapter.simulatedEvents.set(simulatedId, normalized);
      return normalized;
    }

    const path = calendarId === 'primary' ? '/me/events' : `/me/calendars/${encodeURIComponent(calendarId)}/events`;
    const body: Record<string, any> = {
      subject: event.title,
      body: { contentType: 'HTML', content: event.description || '' },
      start: { dateTime: event.startTime.replace(/Z$/, ''), timeZone: event.timeZone || 'UTC' },
      end: { dateTime: event.endTime.replace(/Z$/, ''), timeZone: event.timeZone || 'UTC' },
    };

    if (event.attendees && event.attendees.length > 0) {
      body.attendees = event.attendees.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
        type: 'required',
      }));
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Microsoft Graph create event failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      externalEventId: data.id,
      calendarId,
      provider: this.provider,
      title: data.subject,
      description: data.body?.content,
      startTime: `${data.start?.dateTime}Z`,
      endTime: `${data.end?.dateTime}Z`,
      timeZone: data.start?.timeZone || 'UTC',
      status: 'confirmed',
      htmlLink: data.webLink,
      appointmentId: event.appointmentId,
    };
  }

  /**
   * Updates an existing Microsoft Outlook event.
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    externalEventId: string,
    event: Partial<CreateCalendarEventInput>
  ): Promise<NormalizedCalendarEvent> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const existing = OutlookCalendarAdapter.simulatedEvents.get(externalEventId);
      if (!existing) {
        throw new Error(`Microsoft event ${externalEventId} not found`);
      }

      if (event.title) existing.title = event.title;
      if (event.description) existing.description = event.description;
      if (event.startTime) existing.startTime = event.startTime;
      if (event.endTime) existing.endTime = event.endTime;

      OutlookCalendarAdapter.simulatedEvents.set(externalEventId, existing);
      return existing;
    }

    const patchBody: Record<string, any> = {};
    if (event.title) patchBody.subject = event.title;
    if (event.description) patchBody.body = { contentType: 'HTML', content: event.description };
    if (event.startTime) patchBody.start = { dateTime: event.startTime.replace(/Z$/, ''), timeZone: event.timeZone || 'UTC' };
    if (event.endTime) patchBody.end = { dateTime: event.endTime.replace(/Z$/, ''), timeZone: event.timeZone || 'UTC' };

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalEventId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchBody),
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph update event failed (${res.status})`);
    }

    const data = await res.json();
    return {
      id: data.id,
      externalEventId: data.id,
      calendarId,
      provider: this.provider,
      title: data.subject,
      description: data.body?.content,
      startTime: `${data.start?.dateTime}Z`,
      endTime: `${data.end?.dateTime}Z`,
      timeZone: data.start?.timeZone || 'UTC',
      status: 'confirmed',
      htmlLink: data.webLink,
      appointmentId: event.appointmentId,
    };
  }

  /**
   * Deletes an event in Microsoft Outlook calendar.
   */
  async deleteEvent(accessToken: string, calendarId: string, externalEventId: string): Promise<boolean> {
    if (!this.isLiveConfigured || accessToken.includes('simulated')) {
      const existing = OutlookCalendarAdapter.simulatedEvents.get(externalEventId);
      if (existing) {
        existing.status = 'cancelled';
        OutlookCalendarAdapter.simulatedEvents.set(externalEventId, existing);
      }
      return true;
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalEventId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return res.ok || res.status === 404;
  }

  static setSimulatedEvents(events: NormalizedCalendarEvent[]): void {
    this.simulatedEvents.clear();
    for (const evt of events) {
      this.simulatedEvents.set(evt.externalEventId, evt);
    }
  }

  static addSimulatedEvent(event: NormalizedCalendarEvent): void {
    this.simulatedEvents.set(event.externalEventId, event);
  }

  static clearSimulated(): void {
    this.simulatedEvents.clear();
  }
}
