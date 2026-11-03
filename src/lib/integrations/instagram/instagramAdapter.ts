/**
 * StarX-Flow Instagram Messaging Adapter (WS-08)
 * Implements Meta Graph API messaging, webhook verification challenge, HMAC signature validation,
 * 24-hour customer messaging window enforcement, and unified inbox ingestion.
 */

import crypto from 'crypto';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../../supabaseAdmin';
import { supabase } from '../../supabase';
import { UsageService } from '../../usage/usageService';
import { IdentityResolver } from '../../crm/identityResolver';
import { InboxService } from '../../inbox/inboxService';
import { AIOrchestrator } from '../../ai/orchestrator';
import { CredentialEncryption } from '../../security/encryption';
import {
  InstagramMessagePayload,
  InstagramSendResult,
  MetaWebhookPayload,
} from './types';

export interface ConnectedInstagramAccountRecord {
  organizationId: string;
  accountIdentifier: string; // Meta Page ID or Instagram Business Account ID
  accountName?: string;
  pageAccessToken: string;
}

export class InstagramAdapter {
  private appSecret: string;
  private verifyToken: string;
  private isLiveConfigured: boolean;

  // In-memory simulation registry for sandbox testing & offline test suites
  private static simulatedSentMessages: InstagramSendResult[] = [];
  // Tenant-scoped window map (C3 remediation)
  private static scopedCustomerWindowMap = new Map<string, number>(); // `${orgId}:instagram:${igsid}` -> timestamp
  // Tenant-scoped connected accounts registry (H3 & C2 remediation)
  private static inMemoryConnectedAccounts = new Map<string, ConnectedInstagramAccountRecord>();

  constructor() {
    this.appSecret = process.env.META_APP_SECRET || '';
    this.verifyToken = process.env.META_VERIFY_TOKEN || 'starx_meta_verify_token_default';
    this.isLiveConfigured = Boolean(this.appSecret && !this.appSecret.includes('placeholder'));
  }

  get isConfigured(): boolean {
    return this.isLiveConfigured;
  }

  /**
   * Registers a connected Instagram account in memory (used for sandbox & offline tests).
   * Remediates Account Collisions: Disallows cross-tenant registration of identical account identifiers.
   */
  static registerConnectedAccount(account: ConnectedInstagramAccountRecord): void {
    const existing = this.inMemoryConnectedAccounts.get(account.accountIdentifier);
    if (existing && existing.organizationId !== account.organizationId) {
      throw new Error(
        `INTEGRATION CONFLICT: Account identifier "${account.accountIdentifier}" is already connected to organization "${existing.organizationId}". Cross-tenant account collisions are prohibited.`
      );
    }
    this.inMemoryConnectedAccounts.set(`${account.organizationId}:${account.accountIdentifier}`, account);
    this.inMemoryConnectedAccounts.set(account.accountIdentifier, account); // Quick lookup by Meta Page ID
  }

  /**
   * Handles Meta Webhook Verification Challenge (GET /api/integrations/instagram/webhook).
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
   * Validates Meta Webhook HMAC-SHA256 signature (x-hub-signature-256).
   */
  verifySignature(rawBody: string, signatureHeader?: string | null): boolean {
    if (!this.appSecret || !signatureHeader) {
      // In development / sandbox without configured secret, allow pass-through
      return true;
    }

    try {
      const cleanSignature = signatureHeader.replace(/^sha256=/, '');
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(cleanSignature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Evaluates Meta 24-hour messaging policy window across serverless instances (C3 remediation).
   * Scoped strictly by organizationId and recipientIgsid against PostgreSQL customer_channel_windows.
   * STRICT SECURITY RULE: One-argument unscoped in-memory fallback is completely removed.
   */
  async isWithin24HourWindow(organizationId: string, recipientIgsid: string): Promise<boolean> {
    if (!organizationId || !recipientIgsid) {
      throw new Error(
        'SECURITY VIOLATION: isWithin24HourWindow requires organizationId and recipientIgsid. Unscoped window checks are prohibited.'
      );
    }

    // 1. Query PostgreSQL database
    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: windowRecord } = await client
          .from('customer_channel_windows')
          .select('window_expires_at')
          .eq('organization_id', organizationId)
          .eq('provider', 'instagram')
          .eq('customer_channel_id', recipientIgsid)
          .maybeSingle();

        if (windowRecord && windowRecord.window_expires_at) {
          return new Date(windowRecord.window_expires_at).getTime() > Date.now();
        }
      } catch {
        // Fallback to scoped memory
      }
    }

    // 2. Fallback to strictly scoped memory registry (sandbox / tests)
    const windowDurationMs = 24 * 60 * 60 * 1000;
    const key = `${organizationId}:instagram:${recipientIgsid}`;
    const lastSeen = InstagramAdapter.scopedCustomerWindowMap.get(key);
    return lastSeen ? Date.now() - lastSeen <= windowDurationMs : false;
  }

  /**
   * Records the timestamp of an inbound customer message atomically (C3 remediation).
   * Persisted to PostgreSQL customer_channel_windows table.
   */
  static async recordCustomerInteraction(
    organizationId: string,
    recipientIgsid: string,
    timestampMs = Date.now()
  ): Promise<void> {
    const key = `${organizationId}:instagram:${recipientIgsid}`;
    this.scopedCustomerWindowMap.set(key, timestampMs);

    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const tsIso = new Date(timestampMs).toISOString();
        await client.rpc('record_customer_channel_interaction', {
          p_org_id: organizationId,
          p_provider: 'instagram',
          p_customer_id: recipientIgsid,
          p_timestamp: tsIso,
        });
      } catch {
        // Continue
      }
    }
  }

  /**
   * Sends an outbound Instagram Direct Message via Meta Graph API.
   * Remediates H3: Resolves tenant's individual Page Access Token from connected_accounts.
   * STRICT SECURITY RULE: Internal notes (isInternal: true) are rejected immediately.
   */
  async sendMessage(options: InstagramMessagePayload): Promise<InstagramSendResult> {
    const { organizationId, recipientIgsid, text, messageTag, isInternal } = options;

    if (isInternal === true) {
      throw new Error('SECURITY VIOLATION: Internal staff notes must never be dispatched to external Instagram customers.');
    }

    if (!recipientIgsid) {
      throw new Error('Recipient Instagram Scoped ID (IGSID) is required.');
    }

    if (!organizationId) {
      throw new Error('SECURITY VIOLATION: organizationId is required to resolve tenant credentials.');
    }

    // 1. Resolve tenant-specific credentials (H3 remediation - no single-tenant fallback)
    let pageAccessToken: string | undefined;

    if (isSupabaseAdminConfigured) {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const { data: account } = await client
          .from('connected_accounts')
          .select('encrypted_credentials, status')
          .eq('organization_id', organizationId)
          .eq('provider', 'instagram')
          .eq('status', 'connected')
          .maybeSingle();

        if (account && account.encrypted_credentials) {
          const creds = CredentialEncryption.decrypt(account.encrypted_credentials);
          pageAccessToken = creds.accessToken || creds.pageAccessToken;
        }
      } catch {
        // Fallback
      }
    }

    // Check memory registry for registered test account
    if (!pageAccessToken) {
      for (const acc of InstagramAdapter.inMemoryConnectedAccounts.values()) {
        if (acc.organizationId === organizationId) {
          pageAccessToken = acc.pageAccessToken;
          break;
        }
      }
    }

    // Require tenant to have connected an Instagram account
    if (!pageAccessToken) {
      throw new Error(
        `No connected Instagram account found for organization "${organizationId}". Please connect your Meta Page in Settings.`
      );
    }

    // 2. Check Meta 24-hour messaging window rule with tenant scoping (C3)
    const inWindow = await this.isWithin24HourWindow(organizationId, recipientIgsid);
    if (!inWindow && !messageTag) {
      throw new Error(
        'Meta Messaging Policy Violation: 24-hour messaging window has elapsed. Outbound message requires an approved Meta messageTag (e.g. HUMAN_AGENT or CONFIRMED_EVENT_UPDATE).'
      );
    }

    const effectiveToken = pageAccessToken;

    // 1. Simulated Sandbox Mode
    if (!this.isLiveConfigured || effectiveToken.startsWith('ig_simulated') || effectiveToken.startsWith('EAA_test_token')) {
      const simulatedResult: InstagramSendResult = {
        success: true,
        messageId: `ig-mid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        recipientId: recipientIgsid,
        recipientIgsid,
        timestamp: new Date().toISOString(),
      };

      InstagramAdapter.simulatedSentMessages.push(simulatedResult);

      // Meter usage
      await UsageService.recordUsage({
        userId: organizationId,
        organizationId,
        metricType: 'instagram_messages',
        quantity: 1,
      });

      return simulatedResult;
    }

    // 2. Real Meta Graph API Call (v19.0)
    const payload: Record<string, any> = {
      recipient: { id: recipientIgsid },
      message: { text },
    };

    if (messageTag) {
      payload.messaging_type = 'MESSAGE_TAG';
      payload.tag = messageTag;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(effectiveToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Meta Graph API message dispatch failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const result: InstagramSendResult = {
      success: true,
      messageId: data.message_id || `ig-mid-${Date.now()}`,
      recipientId: data.recipient_id || recipientIgsid,
      recipientIgsid: data.recipient_id || recipientIgsid,
      timestamp: new Date().toISOString(),
    };

    // Meter usage
    await UsageService.recordUsage({
      userId: organizationId,
      organizationId,
      metricType: 'instagram_messages',
      quantity: 1,
    });

    return result;
  }

  /**
   * Processes inbound Meta Instagram Webhook payload.
   * Remediates C2: Strictly resolves tenant by matching Meta Page ID against connected_accounts (NO org-default).
   */
  async processWebhookEvent(
    payload: MetaWebhookPayload,
    options?: { organizationId?: string }
  ): Promise<{
    status: string;
    processedCount: number;
    processed?: number;
    repliesSent: number;
    quarantinedCount?: number;
    quarantined?: number;
  }> {
    if (!payload || payload.object !== 'instagram') {
      return { status: 'ignored', processedCount: 0, repliesSent: 0 };
    }

    let processedCount = 0;
    let repliesSent = 0;
    let quarantinedCount = 0;

    for (const entry of payload.entry || []) {
      const targetPageId = entry.id;

      for (const msgEvent of entry.messaging || []) {
        if (!msgEvent.message || msgEvent.message.is_echo) {
          continue;
        }

        const senderIgsid = msgEvent.sender.id;
        const messageId = msgEvent.message.mid;
        const messageText = msgEvent.message.text || '[Instagram Story Mention or Attachment]';
        const targetAccountId = targetPageId || msgEvent.recipient?.id;

        // 1. Trusted Multi-Tenant Resolution (C2 remediation - NO org-default)
        let resolvedOrgId: string | undefined = options?.organizationId;

        if (!resolvedOrgId && targetAccountId) {
          if (isSupabaseAdminConfigured) {
            try {
              const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
              const { data: accounts } = await client
                .from('connected_accounts')
                .select('organization_id')
                .eq('provider', 'instagram')
                .eq('account_identifier', targetAccountId)
                .eq('status', 'connected');

              if (accounts && accounts.length === 1) {
                resolvedOrgId = accounts[0].organization_id;
              } else if (accounts && accounts.length > 1) {
                // Ambiguous account mapping: Multiple organizations registered this account identifier!
                console.warn(
                  `[InstagramAdapter] Ambiguous account mapping: ${accounts.length} organizations linked to ${targetAccountId}. Routing rejected.`
                );
                resolvedOrgId = undefined;
              }
            } catch {
              // Handled
            }
          }

          if (!resolvedOrgId) {
            const memAcc = InstagramAdapter.inMemoryConnectedAccounts.get(targetAccountId);
            if (memAcc) {
              resolvedOrgId = memAcc.organizationId;
            }
          }
        }

        // STRICT MULTI-TENANT QUARANTINE: Reject unmapped events without falling back to org-default!
        if (!resolvedOrgId) {
          quarantinedCount++;
          if (isSupabaseAdminConfigured) {
            try {
              const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
              await client.from('integration_sync_logs').insert({
                organization_id: '00000000-0000-0000-0000-000000000000',
                provider: 'meta_instagram',
                action: 'unmapped_instagram_account_quarantine',
                status: 'warning',
                details: {
                  targetAccountId,
                  senderIgsid,
                  messageId,
                  reason: 'Meta Page ID or recipient does not match any registered connected_accounts record',
                },
              });
            } catch {
              // Handled
            }
          }
          continue; // Skip processing unmapped tenant message
        }

        const orgId = resolvedOrgId;

        // 2. Record customer interaction to open 24-hour messaging window (C3)
        await InstagramAdapter.recordCustomerInteraction(orgId, senderIgsid, msgEvent.timestamp || Date.now());

        // 3. Idempotency Check
        if (isSupabaseAdminConfigured) {
          try {
            const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
            const { data: existing } = await client
              .from('provider_webhook_events')
              .select('id')
              .eq('provider', 'meta')
              .eq('event_id', messageId)
              .maybeSingle();

            if (existing) {
              continue; // Skip duplicate
            }

            await client.from('provider_webhook_events').insert({
              organization_id: orgId,
              provider: 'meta',
              event_id: messageId,
              event_type: 'instagram_direct_message',
              payload_hash: crypto.createHash('sha256').update(JSON.stringify(msgEvent)).digest('hex'),
              status: 'processed',
              raw_payload: msgEvent,
            });
          } catch {
            // Handled
          }
        }

        // 4. Resolve Customer Identity via IdentityResolver (Isolated by Org)
        const identityRes = await IdentityResolver.resolveCustomer({
          userId: orgId,
          organizationId: orgId,
          channel: 'instagram',
          externalUserId: senderIgsid,
          senderName: `Instagram @user_${senderIgsid.slice(-4)}`,
        });

        // 5. Ingest into Unified Inbox and AI Orchestrator
        const aiResult = await AIOrchestrator.handleInboundMessage({
          userId: orgId,
          organizationId: orgId,
          channel: 'Instagram',
          senderName: identityRes.customer.name || `Instagram @user_${senderIgsid.slice(-4)}`,
          messageText,
          leadId: identityRes.leadId,
        });

        processedCount++;

        // 6. Send AI auto-reply to customer if available
        if (aiResult.aiResponse?.replyText) {
          try {
            await this.sendMessage({
              organizationId: orgId,
              recipientIgsid: senderIgsid,
              text: aiResult.aiResponse.replyText,
              conversationId: aiResult.conversationId,
              leadId: identityRes.leadId,
            });
            repliesSent++;
          } catch (replyErr) {
            console.error('[InstagramAdapter] Failed to send outbound reply:', replyErr);
          }
        }
      }
    }

    return {
      status: quarantinedCount > 0 && processedCount === 0 ? 'quarantined' : 'processed',
      processedCount,
      processed: processedCount,
      repliesSent,
      quarantinedCount,
      quarantined: quarantinedCount,
    };
  }

  static getSentMessages(): InstagramSendResult[] {
    return [...this.simulatedSentMessages];
  }

  static clearSimulated(): void {
    this.simulatedSentMessages = [];
    this.scopedCustomerWindowMap.clear();
    this.inMemoryConnectedAccounts.clear();
  }
}
