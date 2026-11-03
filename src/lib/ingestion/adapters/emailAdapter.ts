/**
 * StarX-Flow Inbound Email Channel Adapter
 * Normalizes incoming emails (e.g. Resend / SendGrid / standard inbound webhooks) into CanonicalInboundEvent.
 */

import { ChannelAdapter, CanonicalInboundEvent } from '../types';
import { ResendEmailAdapter } from '../../integrations/email/resendEmailAdapter';

export interface EmailRawPayload {
  from: string;
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
    size?: number;
  }>;
}

export class EmailAdapter implements ChannelAdapter<EmailRawPayload> {
  readonly channel = 'email' as const;

  /**
   * Verifies incoming webhook signature if configured (Svix signature for Resend).
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    const resend = new ResendEmailAdapter();
    const authorized = resend.verifyWebhookSignature(rawBody, request.headers);
    return {
      authorized,
      reason: authorized ? undefined : 'Invalid Svix webhook signature',
    };
  }

  /**
   * Normalizes incoming email payload.
   */
  async normalize(
    rawPayload: EmailRawPayload,
    options?: { organizationId?: string; userId?: string }
  ): Promise<CanonicalInboundEvent | null> {
    if (!rawPayload || !rawPayload.from) {
      return null;
    }

    // Parse sender display name and email address
    // e.g. "Hans Müller <hans@example.com>" -> name: "Hans Müller", email: "hans@example.com"
    const fromMatch = rawPayload.from.match(/(.*)<(.+@.+)>/);
    let senderName = rawPayload.from;
    let senderEmail = rawPayload.from;

    if (fromMatch) {
      senderName = fromMatch[1].trim().replace(/^["']|["']$/g, '') || fromMatch[2].trim();
      senderEmail = fromMatch[2].trim();
    }

    const messageText = (rawPayload.text || rawPayload.html?.replace(/<[^>]*>?/gm, '') || '').trim();
    const eventId = rawPayload.messageId || `email-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      eventId,
      channel: 'email',
      organizationId: options?.organizationId || null,
      userId: options?.userId || null,
      sender: {
        name: senderName,
        identifier: senderEmail,
        email: senderEmail,
        externalUserId: senderEmail,
      },
      message: {
        messageId: eventId,
        text: messageText,
        timestamp: new Date().toISOString(),
        rawPayload,
      },
      metadata: {
        subject: rawPayload.subject,
        to: rawPayload.to,
        inReplyTo: rawPayload.inReplyTo,
      },
      receivedAt: new Date().toISOString(),
    };
  }
}
