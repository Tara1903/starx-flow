/**
 * StarX-Flow Shared Ingestion Gateway
 * Central orchestration gateway for all incoming multi-channel messages and events.
 */

import {
  CanonicalInboundEvent,
  IngestionResult,
  GatewayHealthStatus,
  IngestionChannel,
  ChannelAdapter,
} from './types';
import { IdempotencyManager } from './idempotency';
import { WhatsAppAdapter } from './adapters/whatsappAdapter';
import { WebChatAdapter } from './adapters/webChatAdapter';
import { EmailAdapter } from './adapters/emailAdapter';
import { InstagramAdapter } from './adapters/instagramAdapter';
import { FacebookMessengerAdapter } from './adapters/facebookMessengerAdapter';
import { AIOrchestrator } from '../ai/orchestrator';
import { supabaseAdmin } from '../supabaseAdmin';

export class IngestionGateway {
  private static startTime = Date.now();
  private static totalEventsProcessed = 0;
  private static duplicateEventsDropped = 0;
  private static latencyHistory: number[] = [];

  private static channelStats: Record<IngestionChannel, { active: boolean; lastReceivedAt: string | null; errorCount: number }> = {
    whatsapp: { active: true, lastReceivedAt: null, errorCount: 0 },
    web: { active: true, lastReceivedAt: null, errorCount: 0 },
    email: { active: true, lastReceivedAt: null, errorCount: 0 },
    instagram: { active: true, lastReceivedAt: null, errorCount: 0 },
    messenger: { active: true, lastReceivedAt: null, errorCount: 0 },
    phone: { active: true, lastReceivedAt: null, errorCount: 0 },
    sms: { active: true, lastReceivedAt: null, errorCount: 0 },
  };

  private static adapters: Record<string, ChannelAdapter> = {
    whatsapp: new WhatsAppAdapter(),
    web: new WebChatAdapter(),
    email: new EmailAdapter(),
    instagram: new InstagramAdapter(),
    messenger: new FacebookMessengerAdapter(),
  };

  /**
   * Retrieves registered adapter for a given channel.
   */
  static getAdapter(channel: string): ChannelAdapter | undefined {
    return this.adapters[channel.toLowerCase()];
  }

  /**
   * Central processor for canonical inbound events.
   */
  static async process(event: CanonicalInboundEvent): Promise<IngestionResult> {
    const startMs = Date.now();
    const { eventId, channel, sender, message } = event;

    // 1. Idempotency Check & Duplicate Event Detection
    if (IdempotencyManager.isDuplicate(channel, eventId)) {
      this.duplicateEventsDropped += 1;
      return {
        success: true,
        status: 'duplicate',
        eventId,
        channel,
        processingTimeMs: Date.now() - startMs,
      };
    }

    try {
      // Mark as being processed
      IdempotencyManager.markProcessed(channel, eventId);

      // 2. Organization & User Identification
      const targetUserId = await this.resolveTargetUser(event);
      if (!targetUserId) {
        throw new Error(`Unable to resolve organization or user for incoming ${channel} event.`);
      }

      // Update Channel Telemetry
      if (this.channelStats[channel]) {
        this.channelStats[channel].lastReceivedAt = new Date().toISOString();
      }

      // 3. Delegate to AI Orchestrator (with CRM resolution, conversation threading, RAG, and AI response)
      const orchestratorChannelMap: Record<IngestionChannel, 'WhatsApp' | 'Instagram' | 'SMS' | 'Web' | 'Email' | 'Messenger'> = {
        whatsapp: 'WhatsApp',
        web: 'Web',
        email: 'Email',
        instagram: 'Instagram',
        messenger: 'Messenger',
        phone: 'SMS',
        sms: 'SMS',
      };

      const orchestratorResult = await AIOrchestrator.handleInboundMessage({
        userId: targetUserId,
        channel: orchestratorChannelMap[channel] || 'Web',
        senderName: sender.name,
        senderPhone: sender.phone || undefined,
        senderEmail: sender.email || undefined,
        messageText: message.text,
        metadata: {
          eventId,
          attachments: message.attachments,
          rawPayload: message.rawPayload,
          senderIdentifier: sender.identifier,
        },
      });

      // 4. Update Latency & Telemetry
      const duration = Date.now() - startMs;
      this.totalEventsProcessed += 1;
      this.latencyHistory.push(duration);
      if (this.latencyHistory.length > 100) this.latencyHistory.shift();

      return {
        success: true,
        status: 'processed',
        eventId,
        channel,
        organizationId: event.organizationId || null,
        conversationId: orchestratorResult.conversationId,
        leadId: orchestratorResult.leadId,
        replyText: orchestratorResult.aiResponse.replyText,
        requiresHumanHandoff: orchestratorResult.aiResponse.requiresHumanHandoff,
        processingTimeMs: duration,
      };
    } catch (err: any) {
      if (this.channelStats[channel]) {
        this.channelStats[channel].errorCount += 1;
      }

      // Allow retry on failure
      IdempotencyManager.clear(channel, eventId);

      return {
        success: false,
        status: 'error',
        eventId,
        channel,
        error: err.message || 'Unknown ingestion failure',
        processingTimeMs: Date.now() - startMs,
      };
    }
  }

  /**
   * Resolves target business user or organization ID from event or connected channels.
   */
  private static async resolveTargetUser(event: CanonicalInboundEvent): Promise<string | null> {
    if (event.userId) return event.userId;

    // Check connected_channels
    if (event.channel === 'whatsapp' && event.metadata?.phoneNumberId) {
      const { data: channels } = await supabaseAdmin
        .from('connected_channels')
        .select('user_id, credentials')
        .eq('channel_key', 'WhatsApp')
        .eq('is_connected', true);

      if (channels) {
        for (const row of channels) {
          if (row.credentials?.phone_number_id === event.metadata.phoneNumberId) {
            return row.user_id;
          }
        }
      }
    }

    // Fallback to first active business profile for test / demo mode
    const { data: defaultProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();

    return defaultProfile?.id || null;
  }

  /**
   * Returns live health and performance metrics for the Ingestion Gateway.
   */
  static getHealthStatus(): GatewayHealthStatus {
    const avgLatency =
      this.latencyHistory.length > 0
        ? Math.round(this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length)
        : 0;

    return {
      status: 'healthy',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      eventsProcessedTotal: this.totalEventsProcessed,
      duplicateEventsDropped: this.duplicateEventsDropped,
      averageLatencyMs: avgLatency,
      lastEventProcessedAt: this.latencyHistory.length > 0 ? new Date().toISOString() : null,
      channels: this.channelStats,
    };
  }
}
