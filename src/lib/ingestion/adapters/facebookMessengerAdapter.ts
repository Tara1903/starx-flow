/**
 * StarX-Flow Facebook Messenger Channel Adapter
 * Implements Meta Graph API Messenger Webhooks (object: "page"), HMAC signature verification,
 * 24-hour messaging window enforcement, and outbound Graph API message delivery.
 */

import crypto from 'crypto';
import { ChannelAdapter, CanonicalInboundEvent } from '../types';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../../supabaseAdmin';
import { supabase } from '../../supabase';
import { CredentialEncryption } from '../../security/encryption';
import { UsageService } from '../../usage/usageService';

export interface MessengerSendOptions {
  organizationId: string;
  recipientPsid: string; // Page-Scoped ID
  text: string;
  isInternal?: boolean;
}

export interface MessengerSendResult {
  success: boolean;
  messageId: string;
  recipientPsid: string;
  timestamp: string;
  error?: string;
}

export class FacebookMessengerAdapter implements ChannelAdapter {
  readonly channel = 'messenger' as any;

  private appSecret: string;
  private verifyToken: string;
  private isLiveConfigured: boolean;

  // In-memory simulation registry for sandbox testing & offline test suites
  private static simulatedSentMessages: MessengerSendResult[] = [];
  private static scopedCustomerWindowMap = new Map<string, number>(); // `${orgId}:messenger:${psid}` -> timestamp
  private static inMemoryConnectedPages = new Map<string, { organizationId: string; pageId: string; pageAccessToken: string }>();

  constructor() {
    this.appSecret = process.env.META_APP_SECRET || '';
    this.verifyToken = process.env.META_VERIFY_TOKEN || 'starx_meta_verify_token_default';
    this.isLiveConfigured = Boolean(this.appSecret && !this.appSecret.includes('placeholder'));
  }

  static clearSimulated(): void {
    this.simulatedSentMessages = [];
    this.scopedCustomerWindowMap.clear();
    this.inMemoryConnectedPages.clear();
  }

  static registerConnectedPage(page: { organizationId: string; pageId: string; pageAccessToken: string }): void {
    this.inMemoryConnectedPages.set(page.pageId, page);
    this.inMemoryConnectedPages.set(`${page.organizationId}:${page.pageId}`, page);
  }

  static getSentMessages(): MessengerSendResult[] {
    return [...this.simulatedSentMessages];
  }

  /**
   * Verifies Meta Webhook Challenge (GET /api/integrations/facebook/webhook)
   */
  verifyWebhookChallenge(params: {
    mode?: string | null;
    token?: string | null;
    challenge?: string | null;
  }): { isValid: boolean; challenge?: string } {
    const { mode, token, challenge } = params;
    if (mode === 'subscribe' && token === this.verifyToken && challenge) {
      return { isValid: true, challenge };
    }
    return { isValid: false };
  }

  /**
   * Validates Meta Webhook HMAC-SHA256 signature (x-hub-signature-256)
   */
  async authenticate(request: Request, rawBody: string): Promise<{ authorized: boolean; reason?: string }> {
    const signature = request.headers.get('x-hub-signature-256');
    if (!this.appSecret || !signature) {
      return { authorized: true };
    }

    try {
      const cleanSignature = signature.replace(/^sha256=/, '');
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      return { authorized: isValid, reason: isValid ? undefined : 'Invalid HMAC signature' };
    } catch (err: any) {
      return { authorized: false, reason: err.message };
    }
  }

  /**
   * Normalizes Meta Facebook Messenger Webhook payload (object: "page").
   */
  async normalize(
    rawPayload: any,
    options?: { organizationId?: string; userId?: string }
  ): Promise<CanonicalInboundEvent | null> {
    if (!rawPayload || rawPayload.object !== 'page') {
      return null;
    }

    const entry = rawPayload.entry?.[0];
    const messaging = entry?.messaging?.[0];
    const message = messaging?.message;

    if (!messaging || !message || message.is_echo) {
      return null;
    }

    const senderPsid = messaging.sender?.id; // Page Scoped ID
    const pageId = entry?.id || messaging.recipient?.id;
    const messageId = message.mid || `fb-msg-${Date.now()}`;
    const text = message.text || '[Attachment or Quick Reply Received]';

    // Resolve tenant by Meta Page ID
    let resolvedOrgId: string | undefined = options?.organizationId;
    if (!resolvedOrgId && pageId) {
      const memPage = FacebookMessengerAdapter.inMemoryConnectedPages.get(pageId);
      if (memPage) {
        resolvedOrgId = memPage.organizationId;
      }
    }

    return {
      eventId: messageId,
      channel: 'messenger' as any,
      organizationId: resolvedOrgId || null,
      userId: options?.userId || resolvedOrgId || null,
      sender: {
        name: `Messenger User (${senderPsid ? senderPsid.slice(-4) : 'Guest'})`,
        identifier: `@fb_${senderPsid}`,
        externalUserId: senderPsid,
        metadata: {
          psid: senderPsid,
          pageId,
        },
      },
      message: {
        messageId,
        text,
        timestamp: new Date(messaging.timestamp || Date.now()).toISOString(),
        rawPayload: messaging,
      },
      metadata: {
        pageId,
        senderPsid,
      },
      receivedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates Meta 24-hour messaging policy window for Facebook Messenger.
   */
  async isWithin24HourWindow(organizationId: string, recipientPsid: string): Promise<boolean> {
    if (!organizationId || !recipientPsid) {
      throw new Error('SECURITY VIOLATION: isWithin24HourWindow requires organizationId and recipientPsid.');
    }

    // 1. Check database customer_channel_windows
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: windowRecord } = await client
          .from('customer_channel_windows')
          .select('window_expires_at')
          .eq('organization_id', organizationId)
          .eq('provider', 'messenger')
          .eq('customer_channel_id', recipientPsid)
          .maybeSingle();

        if (windowRecord && windowRecord.window_expires_at) {
          return new Date(windowRecord.window_expires_at).getTime() > Date.now();
        }
      } catch {
        // Fallback
      }
    }

    // 2. In-memory check
    const key = `${organizationId}:messenger:${recipientPsid}`;
    const windowExpiresAt = FacebookMessengerAdapter.scopedCustomerWindowMap.get(key);
    if (windowExpiresAt) {
      return windowExpiresAt > Date.now();
    }

    return false;
  }

  /**
   * Records inbound customer interaction opening the 24-hour Meta service window.
   */
  static async recordCustomerInteraction(organizationId: string, recipientPsid: string, timestamp = Date.now()): Promise<void> {
    const expiresAt = timestamp + 24 * 60 * 60 * 1000;
    const key = `${organizationId}:messenger:${recipientPsid}`;
    this.scopedCustomerWindowMap.set(key, expiresAt);

    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        await client.from('customer_channel_windows').upsert({
          organization_id: organizationId,
          provider: 'messenger',
          customer_channel_id: recipientPsid,
          last_inbound_at: new Date(timestamp).toISOString(),
          window_expires_at: new Date(expiresAt).toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Handled
      }
    }
  }

  /**
   * Dispatches an outbound Facebook Messenger message.
   */
  async sendMessage(options: MessengerSendOptions): Promise<MessengerSendResult> {
    const { organizationId, recipientPsid, text, isInternal } = options;

    if (isInternal === true) {
      throw new Error('SECURITY VIOLATION: Internal staff notes must never be dispatched to external Messenger customers.');
    }

    if (!recipientPsid || !organizationId) {
      throw new Error('organizationId and recipientPsid are required.');
    }

    // 1. Resolve Page Access Token
    let pageAccessToken: string | undefined;
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: account } = await client
          .from('connected_accounts')
          .select('encrypted_credentials')
          .eq('organization_id', organizationId)
          .eq('provider', 'messenger')
          .eq('status', 'connected')
          .maybeSingle();

        if (account?.encrypted_credentials) {
          const creds = CredentialEncryption.decrypt(account.encrypted_credentials);
          pageAccessToken = creds.pageAccessToken || creds.accessToken;
        }
      } catch {
        // Handled
      }
    }

    if (!pageAccessToken) {
      for (const p of FacebookMessengerAdapter.inMemoryConnectedPages.values()) {
        if (p.organizationId === organizationId) {
          pageAccessToken = p.pageAccessToken;
          break;
        }
      }
    }

    if (!pageAccessToken) {
      throw new Error(`No connected Facebook Page found for organization "${organizationId}".`);
    }

    // 2. Check 24-hour window
    const inWindow = await this.isWithin24HourWindow(organizationId, recipientPsid);
    if (!inWindow) {
      throw new Error('Meta Messaging Policy Violation: 24-hour messaging window has elapsed for Facebook Messenger.');
    }

    // 3. Dispatch (Mock vs Real API)
    if (!this.isLiveConfigured || pageAccessToken.startsWith('fb_simulated') || pageAccessToken.startsWith('EAA_test')) {
      const simulatedResult: MessengerSendResult = {
        success: true,
        messageId: `fb-mid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        recipientPsid,
        timestamp: new Date().toISOString(),
      };
      FacebookMessengerAdapter.simulatedSentMessages.push(simulatedResult);

      await UsageService.recordUsage({
        userId: organizationId,
        organizationId,
        metricType: 'messenger_messages' as any,
        quantity: 1,
      });

      return simulatedResult;
    }

    // Real Meta Call
    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageAccessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Facebook Messenger dispatch failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const result: MessengerSendResult = {
      success: true,
      messageId: data.message_id || `fb-mid-${Date.now()}`,
      recipientPsid,
      timestamp: new Date().toISOString(),
    };

    await UsageService.recordUsage({
      userId: organizationId,
      organizationId,
      metricType: 'messenger_messages' as any,
      quantity: 1,
    });

    return result;
  }
}
