/**
 * StarX-Flow WhatsApp Cloud API Channel Adapter
 * Authenticates Meta Webhook HMAC-SHA256 signatures and normalizes WhatsApp payloads.
 */

import crypto from 'crypto';
import { ChannelAdapter, CanonicalInboundEvent, CanonicalAttachment } from '../types';

export class WhatsAppAdapter implements ChannelAdapter {
  readonly channel = 'whatsapp' as const;

  /**
   * Authenticates incoming request using Meta's HMAC-SHA256 signature header.
   * Strictly enforces cryptographic integrity with fail-closed behavior across all environments.
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

    // 1. Mandatory Application Secret check (Fail Closed)
    if (!appSecret || typeof appSecret !== 'string' || appSecret.trim() === '') {
      console.error('[WhatsApp Webhook Security] Fail-closed: WHATSAPP_APP_SECRET is not configured on server.');
      return {
        authorized: false,
        reason: 'Webhook verification secret not configured (fail closed)',
      };
    }

    // 2. Mandatory Signature Header check
    if (!signature || typeof signature !== 'string') {
      return {
        authorized: false,
        reason: 'Missing x-hub-signature-256 header',
      };
    }

    // 3. Signature Format Validation (Meta format: "sha256=<64-char-hex>")
    const trimmedSig = signature.trim();
    if (!trimmedSig.startsWith('sha256=')) {
      return {
        authorized: false,
        reason: 'Malformed signature header: missing sha256= prefix',
      };
    }

    const providedHex = trimmedSig.slice(7).trim();
    if (providedHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(providedHex)) {
      return {
        authorized: false,
        reason: 'Malformed signature header: invalid hex digest length or characters',
      };
    }

    // 4. Constant-Time HMAC-SHA256 Signature Verification
    try {
      const expectedHex = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      const providedBuffer = Buffer.from(providedHex.toLowerCase(), 'hex');
      const expectedBuffer = Buffer.from(expectedHex.toLowerCase(), 'hex');

      if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
      ) {
        return {
          authorized: false,
          reason: 'Invalid HMAC signature',
        };
      }

      return { authorized: true };
    } catch (err: any) {
      return {
        authorized: false,
        reason: `Signature verification exception: ${err.message}`,
      };
    }
  }

  /**
   * Normalizes Meta WhatsApp Webhook JSON into a CanonicalInboundEvent.
   */
  async normalize(
    rawPayload: any,
    options?: { organizationId?: string; userId?: string }
  ): Promise<CanonicalInboundEvent | null> {
    if (!rawPayload || rawPayload.object !== 'whatsapp_business_account') {
      return null;
    }

    const entry = rawPayload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return null;
    }

    const fromPhone = message.from; // Customer phone (E.164 without leading plus)
    const formattedPhone = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;
    const messageId = message.id || `wa-msg-${Date.now()}`;
    const phoneNumberId = value.metadata?.phone_number_id;

    // Handle text or voice/audio message
    let messageText = '';
    const attachments: CanonicalAttachment[] = [];

    if (message.type === 'text') {
      messageText = message.text?.body || '';
    } else if (message.type === 'audio' || message.type === 'voice') {
      messageText = '[Voice Message Received]';
      if (message.audio?.id || message.voice?.id) {
        attachments.push({
          type: 'audio' as const,
          url: `meta-media://${message.audio?.id || message.voice?.id}`,
          mimeType: message.audio?.mime_type || message.voice?.mime_type || 'audio/ogg',
        });
      }
    } else if (message.type === 'image') {
      messageText = message.image?.caption || '[Image Received]';
      if (message.image?.id) {
        attachments.push({
          type: 'image' as const,
          url: `meta-media://${message.image?.id}`,
          mimeType: message.image?.mime_type || 'image/jpeg',
        });
      }
    } else {
      messageText = `[Unsupported message type: ${message.type}]`;
    }

    const contactName = value.contacts?.[0]?.profile?.name || `WhatsApp (${formattedPhone.slice(-4)})`;

    return {
      eventId: messageId,
      channel: 'whatsapp',
      organizationId: options?.organizationId || null,
      userId: options?.userId || null,
      sender: {
        name: contactName,
        identifier: formattedPhone,
        phone: formattedPhone,
        externalUserId: fromPhone,
        metadata: {
          waid: message.from,
          phoneNumberId,
        },
      },
      message: {
        messageId,
        text: messageText,
        timestamp: new Date(Number(message.timestamp) * 1000 || Date.now()).toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined,
        rawPayload: message,
      },
      metadata: {
        phoneNumberId,
        businessAccountId: entry?.id,
      },
      receivedAt: new Date().toISOString(),
    };
  }
}
