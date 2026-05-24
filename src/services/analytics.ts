import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export type AllowedEvent =
  | 'signup_completed'
  | 'channel_connected'
  | 'lead_created'
  | 'booking_created'
  | 'workflow_executed'
  | 'subscription_started'
  | 'subscription_cancelled';

const ALLOWED_EVENTS = new Set<AllowedEvent>([
  'signup_completed',
  'channel_connected',
  'lead_created',
  'booking_created',
  'workflow_executed',
  'subscription_started',
  'subscription_cancelled',
]);

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id?: string;
  properties: Record<string, unknown>;
  created_at: string;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionId: string;
  private userId: string | undefined;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  identify(userId: string) {
    this.userId = userId;
  }

  track(eventName: AllowedEvent, properties: Record<string, unknown> = {}) {
    if (!ALLOWED_EVENTS.has(eventName)) {
      console.warn(`[Analytics] Event '${eventName}' is not in the allowed list and will not be tracked.`);
      return;
    }

    const currentUserId = this.userId || useAuthStore.getState().user?.id;

    const event: AnalyticsEvent = {
      event_name: eventName,
      user_id: currentUserId,
      session_id: this.sessionId,
      properties,
      created_at: new Date().toISOString()
    };

    this.queue.push(event);

    if (this.queue.length >= 10) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, 5000);
    }
  }

  private async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;
    if (!isSupabaseConfigured) {
      this.queue = []; // Drop if no DB
      return;
    }

    const eventsToInsert = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase.from('analytics_events').insert(eventsToInsert);
      if (error) {
        console.error('[Analytics] Failed to flush events:', error);
        // We could put them back in the queue here, but dropping them on failure is often acceptable for basic analytics to prevent memory leaks if offline
      }
    } catch (e) {
      console.error('[Analytics] Exception flushing events:', e);
    }
  }
}

export const analytics = new Analytics();
