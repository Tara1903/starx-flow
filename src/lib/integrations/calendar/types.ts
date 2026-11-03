/**
 * StarX-Flow Universal Calendar Integration Types (WS-06)
 * Normalized provider-independent interface for Google Calendar and Microsoft Outlook.
 */

export type CalendarProvider = 'google_calendar' | 'microsoft_calendar';

export interface NormalizedCalendarEvent {
  id: string;
  externalEventId: string;
  calendarId: string;
  provider: CalendarProvider;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  timeZone: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Array<{
    email: string;
    name?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  htmlLink?: string;
  appointmentId?: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  timeZone?: string;
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
  appointmentId?: string;
}

export interface CalendarSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  conflictReason?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType?: string;
  accountIdentifier: string;
  accountName?: string;
  scopes?: string[];
}

export interface CalendarSummary {
  id: string;
  name: string;
  isPrimary: boolean;
  timeZone: string;
  accessRole?: string;
}

export interface CalendarProviderAdapter {
  readonly provider: CalendarProvider;

  getAuthUrl(options: { organizationId: string; redirectUri: string; state?: string }): string;

  exchangeCode(code: string, redirectUri: string): Promise<OAuthTokens>;

  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;

  listCalendars(accessToken: string): Promise<CalendarSummary[]>;

  listEvents(
    accessToken: string,
    calendarId: string,
    timeMin: string,
    timeMax: string
  ): Promise<NormalizedCalendarEvent[]>;

  createEvent(
    accessToken: string,
    calendarId: string,
    event: CreateCalendarEventInput
  ): Promise<NormalizedCalendarEvent>;

  updateEvent(
    accessToken: string,
    calendarId: string,
    externalEventId: string,
    event: Partial<CreateCalendarEventInput>
  ): Promise<NormalizedCalendarEvent>;

  deleteEvent(
    accessToken: string,
    calendarId: string,
    externalEventId: string
  ): Promise<boolean>;
}
