/**
 * StarX-Flow WhatsApp Cloud API Channel Adapter
 * Authenticates Meta Webhook HMAC-SHA256 signatures and normalizes WhatsApp payloads.
 */

import { ChannelAdapter, CanonicalInboundEvent, CanonicalAttachment } from '../types';

export class WhatsAppAdapter implements ChannelAdapter {
  readonly channel = 'whatsapp' as const;

  /**
   * Authenticates incoming request using Meta's HMAC-SHA256 signature header.
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
      // In development or sandbox mode without appSecret configured, allow for testing
      return { authorized: true };
    }

    if (!signature) {
      return { authorized: false, reason: 'Missing x-hub-signature-256 header' };
    }

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(appSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const sigHex = signature.replace('sha256=', '');
      const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);

      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        sigBytes,
        encoder.encode(rawBody)
      );

      if (!isValid) {
        return { authorized: false, reason: 'Invalid HMAC signature' };
      }

      return { authorized: true };
    } catch (err: any) {
      return { authorized: false, reason: `Signature verification error: ${err.message}` };
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
