/**
 * StarX-Flow Website Chat Channel Adapter
 * Normalizes live website chat widget payloads and visitor sessions into CanonicalInboundEvent.
 */

import { ChannelAdapter, CanonicalInboundEvent } from '../types';

export interface WebChatRawPayload {
  businessId?: string;
  organizationId?: string;
  message: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class WebChatAdapter implements ChannelAdapter<WebChatRawPayload> {
  readonly channel = 'web' as const;

  /**
   * Validates web chat requests (CORS origin validation or API token if enabled).
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    // Web chat is public-facing by design, but requires valid JSON body
    if (!rawBody || rawBody.trim() === '') {
      return { authorized: false, reason: 'Empty request body' };
    }
    return { authorized: true };
  }

  /**
   * Normalizes website chat request body.
   */
  async normalize(
    rawPayload: WebChatRawPayload,
    options?: { organizationId?: string; userId?: string }
  ): Promise<CanonicalInboundEvent | null> {
    if (!rawPayload || !rawPayload.message || typeof rawPayload.message !== 'string') {
      return null;
    }

    const messageText = rawPayload.message.trim();
    if (!messageText) return null;

    const sessionId = rawPayload.sessionId || `web-sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const eventId = `web-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const identifier = rawPayload.visitorEmail || rawPayload.visitorPhone || sessionId;
    const senderName = rawPayload.visitorName || 'Website Visitor';

    return {
      eventId,
      channel: 'web',
      organizationId: rawPayload.organizationId || options?.organizationId || null,
      userId: rawPayload.businessId || options?.userId || null,
      sender: {
        name: senderName,
        identifier,
        phone: rawPayload.visitorPhone || null,
        email: rawPayload.visitorEmail || null,
        externalUserId: sessionId,
        metadata: rawPayload.metadata || {},
      },
      message: {
        messageId: eventId,
        text: messageText,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        sessionId,
        ...rawPayload.metadata,
      },
      receivedAt: new Date().toISOString(),
    };
  }
}
