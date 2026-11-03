/**
 * StarX-Flow Outbound Message Dispatcher
 * Unifies outbound message delivery from human staff and AI receptionist
 * across WhatsApp, Instagram, Messenger, Email, and Web Chat with delivery retry scheduling.
 */

import { WhatsAppAdapter } from '../ingestion/adapters/whatsappAdapter';
import { InstagramAdapter } from '../integrations/instagram/instagramAdapter';
import { FacebookMessengerAdapter } from '../ingestion/adapters/facebookMessengerAdapter';
import { ResendEmailAdapter } from '../integrations/email/resendEmailAdapter';
import { ReceptionistJobScheduler } from '../jobs/receptionistJobScheduler';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { supabase } from '../supabase';

export interface OutboundDispatchOptions {
  conversationId: string;
  organizationId: string;
  channel: 'WhatsApp' | 'Instagram' | 'Messenger' | 'Email' | 'Web' | 'SMS';
  recipient: string; // Phone, Email, IGSID, PSID, or Web Session ID
  text: string;
  subject?: string;
  inReplyTo?: string;
  messageId?: string;
  isInternal?: boolean;
}

export interface OutboundDispatchResult {
  success: boolean;
  channel: string;
  delivered: boolean;
  externalMessageId?: string;
  queuedForRetry?: boolean;
  error?: string;
}

export class OutboundDispatcher {
  /**
   * High-level convenience method for outbound message dispatch with failure simulation & retry support.
   */
  static async dispatchOutboundMessage(params: {
    organizationId: string;
    conversationId: string;
    channel: string;
    recipient: string;
    content: string;
    subject?: string;
    isStaffReply?: boolean;
    simulateFailure?: boolean;
  }): Promise<{ success: boolean; retryJobId?: string; error?: string }> {
    if (params.simulateFailure) {
      // Simulate external provider outage (503) and queue delivery_retry job
      const retryResult = await ReceptionistJobScheduler.scheduleJob({
        organizationId: params.organizationId,
        jobType: 'delivery_retry',
        targetId: params.conversationId,
        channel: (params.channel.toLowerCase() === 'messenger' ? 'messenger' : params.channel.toLowerCase() === 'instagram' ? 'instagram' : params.channel.toLowerCase() === 'email' ? 'email' : 'whatsapp') as any,
        recipient: params.recipient,
        payload: {
          content: params.content,
          conversationId: params.conversationId,
          error: 'HTTP 503 Service Unavailable',
        },
        scheduledFor: new Date(Date.now() + 300000), // 5 min backoff
      });
      return { success: false, retryJobId: retryResult.job.id, error: 'HTTP 503 Service Unavailable' };
    }

    const mappedChannel = (params.channel.charAt(0).toUpperCase() + params.channel.slice(1).toLowerCase()) as any;
    const result = await this.dispatch({
      organizationId: params.organizationId,
      conversationId: params.conversationId,
      channel: mappedChannel,
      recipient: params.recipient,
      text: params.content,
      subject: params.subject,
    });

    return {
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Dispatches an outbound message to the customer's native channel.
   * STRICT SECURITY RULE: Internal notes must NEVER be dispatched externally.
   */
  static async dispatch(options: OutboundDispatchOptions): Promise<OutboundDispatchResult> {
    const { conversationId, organizationId, channel, recipient, text, subject, inReplyTo, messageId, isInternal } = options;

    if (isInternal === true) {
      throw new Error('SECURITY VIOLATION: Internal staff notes must never be dispatched to external channels.');
    }

    if (!recipient) {
      return {
        success: false,
        channel,
        delivered: false,
        error: `Missing recipient identifier for channel ${channel}.`,
      };
    }

    try {
      let externalId: string | undefined;

      switch (channel.toLowerCase()) {
        case 'whatsapp': {
          // Outbound WhatsApp via Meta Cloud API or simulation
          const cleanPhone = recipient.replace('+', '');
          const res = await this.sendWhatsAppMessage(organizationId, cleanPhone, text);
          externalId = res.messageId;
          break;
        }

        case 'instagram': {
          const adapter = new InstagramAdapter();
          const res = await adapter.sendMessage({
            organizationId,
            recipientIgsid: recipient,
            text,
          });
          externalId = res.messageId;
          break;
        }

        case 'messenger': {
          const adapter = new FacebookMessengerAdapter();
          const res = await adapter.sendMessage({
            organizationId,
            recipientPsid: recipient,
            text,
          });
          externalId = res.messageId;
          break;
        }

        case 'email': {
          const adapter = new ResendEmailAdapter();
          const res = await adapter.sendEmail({
            organizationId,
            to: recipient,
            subject: subject || 'Message from your service provider',
            text,
            inReplyTo,
          });
          externalId = res.messageId;
          break;
        }

        case 'web': {
          // Web chat widget retrieves messages via live query / polling
          externalId = `web-out-${Date.now()}`;
          break;
        }

        default:
          throw new Error(`Unsupported outbound channel: ${channel}`);
      }

      // Update message status in DB if messageId provided
      if (messageId && isSupabaseAdminConfigured) {
        try {
          const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
          await client
            .from('messages')
            .update({ status: 'delivered', updated_at: new Date().toISOString() })
            .eq('id', messageId);
        } catch {
          // Handled
        }
      }

      return {
        success: true,
        channel,
        delivered: true,
        externalMessageId: externalId,
      };
    } catch (err: any) {
      console.warn(`[OutboundDispatcher] Delivery failed for ${channel} to ${recipient}:`, err.message);

      // Fault tolerance: schedule a delivery retry in receptionist_jobs
      let queuedForRetry = false;
      try {
        const channelKey = channel.toLowerCase() as any;
        await ReceptionistJobScheduler.scheduleJob({
          organizationId,
          jobType: 'delivery_retry',
          targetId: messageId || conversationId,
          channel: channelKey,
          recipient,
          payload: { text, subject, inReplyTo, conversationId },
          scheduledFor: new Date(Date.now() + 30000), // Retry in 30 seconds
        });
        queuedForRetry = true;
      } catch (schedErr: any) {
        console.error('[OutboundDispatcher] Failed to schedule retry job:', schedErr.message);
      }

      return {
        success: false,
        channel,
        delivered: false,
        queuedForRetry,
        error: err.message,
      };
    }
  }

  private static async sendWhatsAppMessage(
    organizationId: string,
    toPhone: string,
    text: string
  ): Promise<{ success: boolean; messageId: string }> {
    // 1. Check for live credentials
    let phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    let accessToken = process.env.META_ACCESS_TOKEN;

    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: channelData } = await client
          .from('connected_channels')
          .select('credentials')
          .eq('channel_key', 'WhatsApp')
          .eq('is_connected', true)
          .maybeSingle();

        if (channelData?.credentials?.phone_number_id && channelData.credentials.access_token) {
          phoneNumberId = channelData.credentials.phone_number_id;
          accessToken = channelData.credentials.access_token;
        }
      } catch {
        // Fallback
      }
    }

    if (!accessToken || !phoneNumberId || accessToken.includes('placeholder')) {
      // Sandbox mode: simulate successful dispatch
      return {
        success: true,
        messageId: `wa-sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp Meta Graph API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id || `wa-out-${Date.now()}`,
    };
  }
}
