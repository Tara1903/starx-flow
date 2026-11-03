/**
 * StarX-Flow Instagram Direct Message Channel Adapter
 * Normalizes Meta Graph API Instagram Direct Messages into CanonicalInboundEvent.
 */

import { ChannelAdapter, CanonicalInboundEvent } from '../types';

export class InstagramAdapter implements ChannelAdapter {
  readonly channel = 'instagram' as const;

  /**
   * Validates Instagram webhook request with HMAC-SHA256 signature if appSecret configured.
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret || !signature) {
      return { authorized: true };
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

      return { authorized: isValid, reason: isValid ? undefined : 'Invalid HMAC signature' };
    } catch (err: any) {
      return { authorized: false, reason: err.message };
    }
  }

  /**
   * Normalizes Meta Instagram Webhook JSON payload.
   */
  async normalize(
    rawPayload: any,
    options?: { organizationId?: string; userId?: string }
  ): Promise<CanonicalInboundEvent | null> {
    if (!rawPayload || rawPayload.object !== 'instagram') {
      return null;
    }

    const entry = rawPayload.entry?.[0];
    const messaging = entry?.messaging?.[0];
    const message = messaging?.message;

    if (!messaging || !message) {
      return null;
    }

    const senderIgsid = messaging.sender?.id; // Instagram Scoped ID
    const recipientIgsid = messaging.recipient?.id;
    const messageId = message.mid || `ig-msg-${Date.now()}`;
    const text = message.text || '[Instagram Story or Media Received]';

    return {
      eventId: messageId,
      channel: 'instagram',
      organizationId: options?.organizationId || null,
      userId: options?.userId || null,
      sender: {
        name: `Instagram User (${senderIgsid.slice(-4)})`,
        identifier: `@ig_${senderIgsid}`,
        externalUserId: senderIgsid,
        metadata: {
          igsid: senderIgsid,
        },
      },
      message: {
        messageId,
        text,
        timestamp: new Date(messaging.timestamp || Date.now()).toISOString(),
        rawPayload: messaging,
      },
      metadata: {
        recipientIgsid,
        pageId: entry?.id,
      },
      receivedAt: new Date().toISOString(),
    };
  }
}
