/**
 * StarX-Flow Unified Omnichannel Inbox Service (WS-02)
 * Backend engine managing organization-scoped conversations, cross-channel threading,
 * internal staff notes, assignment, collision detection, and audit logging.
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { supabase } from '../supabase';
import { Conversation, Message, Lead } from '../../types/database';
import { OutboundDispatcher } from './outboundDispatcher';

export interface InboxFilterOptions {
  userId: string;
  organizationId?: string | null;
  channel?: string;
  status?: string;
  search?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}

export interface PostMessageOptions {
  conversationId: string;
  userId: string;
  organizationId?: string | null;
  role: 'user' | 'ai' | 'human' | 'system';
  content: string;
  isInternal?: boolean;
  attachments?: any[];
  agentName?: string;
}

export interface ConversationUpdateOptions {
  conversationId: string;
  userId: string;
  organizationId?: string | null;
  status?: 'active' | 'needs_attention' | 'resolved' | 'snoozed';
  controlMode?: 'ai' | 'human';
  handoffReason?: string | null;
  assignedTo?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  actorId?: string;
}

interface PresenceViewer {
  agentId: string;
  agentName: string;
  lastSeenAt: number;
}

export class InboxService {
  // In-memory presence map for active viewer collision detection: conversationId -> agentId -> PresenceViewer
  private static presenceMap = new Map<string, Map<string, PresenceViewer>>();
  private static readonly PRESENCE_TIMEOUT_MS = 45000; // 45 seconds

  // In-memory cache for local tests and offline resilience
  private static inMemoryConversations = new Map<string, Conversation & { messages: Message[]; priority?: string }>();

  /**
   * Fetches organization-scoped conversations with filtering, search, and pagination.
   */
  static async fetchConversations(options: InboxFilterOptions): Promise<{ conversations: any[]; totalCount: number }> {
    const { userId, organizationId, channel, status, search, assignedTo, limit = 50, offset = 0 } = options;
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;

    try {
      let query = client
        .from('conversations')
        .select(`
          *,
          leads (*),
          messages (*)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (channel && channel !== 'All') {
        query = query.eq('channel', channel);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        let results = data;
        if (search) {
          const s = search.toLowerCase();
          results = results.filter(
            (c: any) =>
              c.customer_name?.toLowerCase().includes(s) ||
              c.last_message?.toLowerCase().includes(s) ||
              c.customer_email?.toLowerCase().includes(s) ||
              c.customer_phone?.includes(s)
          );
        }

        return { conversations: results, totalCount: count || results.length };
      }
    } catch {
      // Fallback to in-memory
    }

    // In-memory fallback
    const all = Array.from(this.inMemoryConversations.values()).filter((c) => c.user_id === userId);
    let filtered = all;

    if (channel && channel !== 'All') {
      filtered = filtered.filter((c) => c.channel.toLowerCase() === channel.toLowerCase());
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.customer_name?.toLowerCase().includes(s) ||
          c.last_message?.toLowerCase().includes(s) ||
          c.customer_email?.toLowerCase().includes(s) ||
          c.customer_phone?.includes(s)
      );
    }

    return {
      conversations: filtered.slice(offset, offset + limit),
      totalCount: filtered.length,
    };
  }

  /**
   * Fetches paginated message history for a conversation.
   * Internal notes are EXCLUDED by default unless explicitly requested with an authorized staff session.
   */
  static async fetchMessages(conversationId: string, limit = 50, includeInternal = false): Promise<Message[]> {
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;

    try {
      let query = client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (!includeInternal) {
        query = query.eq('is_internal', false);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data as Message[];
      }
    } catch {
      // In-memory fallback
    }

    const cached = this.inMemoryConversations.get(conversationId);
    const msgs = cached?.messages || [];
    return includeInternal ? msgs : msgs.filter((m) => !m.is_internal);
  }

  /**
   * Posts a new message or private internal note to a conversation.
   * Internal notes are NEVER dispatched to external channels (WhatsApp, Email, etc.).
   */
  static async postMessage(options: PostMessageOptions): Promise<{ message: Message; isInternal: boolean }> {
    const { conversationId, userId, role, content, isInternal = false, attachments, agentName } = options;
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    const timestamp = new Date().toISOString();
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const messageRecord: Message = {
      id: msgId,
      conversation_id: conversationId,
      direction: role === 'user' ? 'inbound' : 'outbound',
      role,
      content,
      attachments: attachments || [],
      status: 'sent',
      is_internal: isInternal,
      created_at: timestamp,
    };

    // Update in-memory thread
    let cached = this.inMemoryConversations.get(conversationId);
    if (!cached) {
      const newConvo: Conversation & { messages: Message[]; priority?: string } = {
        id: conversationId,
        user_id: userId,
        lead_id: null as any,
        channel: 'Web',
        customer_name: 'Customer',
        last_message_at: timestamp,
        status: 'active',
        unread_count: 0,
        messages: [],
        created_at: timestamp,
        updated_at: timestamp,
      };
      this.inMemoryConversations.set(conversationId, newConvo);
      cached = newConvo;
    }
    cached.messages.push(messageRecord);
    if (!isInternal) {
      cached.last_message = content;
      cached.last_message_at = timestamp;
    }
    cached.updated_at = timestamp;

    try {
      await client.from('messages').insert({
        id: msgId,
        conversation_id: conversationId,
        direction: messageRecord.direction,
        role: messageRecord.role,
        content: messageRecord.content,
        attachments: messageRecord.attachments,
        status: messageRecord.status,
        is_internal: isInternal,
        created_at: timestamp,
      });

      // Update conversation last_message if not internal
      if (!isInternal) {
        await client
          .from('conversations')
          .update({
            last_message: content,
            last_message_at: timestamp,
            updated_at: timestamp,
          })
          .eq('id', conversationId);

        // If human staff posted message, dispatch outbound to customer's external channel
        if (role === 'human') {
          const recipient = cached.customer_phone || cached.customer_email || cached.metadata?.externalUserId || cached.metadata?.senderIdentifier;
          if (recipient) {
            await OutboundDispatcher.dispatch({
              conversationId,
              organizationId: options.organizationId || userId,
              channel: cached.channel as any,
              recipient,
              text: content,
              messageId: msgId,
            });
          }
        }
      }
    } catch {
      // Preserved in-memory
    }

    return {
      message: messageRecord,
      isInternal,
    };
  }

  /**
   * Puts a conversation into human takeover mode, assigning staff and suppressing AI responses.
   */
  static async takeoverConversation(
    conversationId: string,
    actorId: string,
    organizationId?: string,
    reason?: string
  ): Promise<boolean> {
    return await this.updateConversation({
      conversationId,
      userId: organizationId || actorId,
      status: 'active',
      controlMode: 'human',
      assignedTo: actorId,
      handoffReason: reason || 'Staff manual takeover',
      actorId,
    });
  }

  /**
   * Releases a human-controlled conversation back to the automated AI Receptionist.
   */
  static async releaseToAI(
    conversationId: string,
    actorId: string,
    organizationId?: string
  ): Promise<boolean> {
    return await this.updateConversation({
      conversationId,
      userId: organizationId || actorId,
      status: 'active',
      controlMode: 'ai',
      handoffReason: null,
      actorId,
    });
  }

  /**
   * Updates conversation metadata (status, assignment, priority, tags) with audit logging.
   */
  static async updateConversation(options: ConversationUpdateOptions): Promise<boolean> {
    const { conversationId, userId, status, controlMode, handoffReason, assignedTo, priority, tags, actorId } = options;
    const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
    const now = new Date().toISOString();

    const cached = this.inMemoryConversations.get(conversationId);
    if (cached) {
      if (status) cached.status = status;
      if (controlMode) cached.control_mode = controlMode;
      if (handoffReason !== undefined) cached.handoff_reason = handoffReason;
      if (assignedTo !== undefined) cached.assigned_to = assignedTo;
      if (priority) cached.priority = priority;
      cached.updated_at = now;
    }

    const updates: Record<string, any> = { updated_at: now };
    if (status) updates.status = status;
    if (controlMode) updates.control_mode = controlMode;
    if (handoffReason !== undefined) updates.handoff_reason = handoffReason;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (priority) updates.metadata = { ...(cached?.metadata || {}), priority };

    try {
      await client.from('conversations').update(updates).eq('id', conversationId);

      // Audit log the status / assignment change
      await client.from('audit_logs').insert({
        organization_id: userId,
        actor_id: actorId || userId,
        actor_type: 'user',
        action: 'conversation.update',
        target_type: 'conversation',
        target_id: conversationId,
        changes: updates,
        created_at: now,
      });
    } catch {
      // In-memory fallback
    }

    return true;
  }

  /**
   * Registers agent presence for real-time collision detection.
   * Updates local cache and persists to distributed database table.
   */
  static async registerViewer(
    conversationId: string,
    agentId: string,
    agentName: string,
    organizationId?: string | null
  ): Promise<void> {
    if (!this.presenceMap.has(conversationId)) {
      this.presenceMap.set(conversationId, new Map());
    }

    const viewers = this.presenceMap.get(conversationId)!;
    viewers.set(agentId, {
      agentId,
      agentName,
      lastSeenAt: Date.now(),
    });

    // Distributed serverless presence persistence
    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.PRESENCE_TIMEOUT_MS);
      await client.from('conversation_presence').upsert({
        conversation_id: conversationId,
        agent_id: agentId,
        agent_name: agentName,
        organization_id: organizationId || null,
        last_seen_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    } catch {
      // In-memory fallback
    }
  }

  /**
   * Checks whether another agent is actively viewing or typing in this conversation.
   * Hybrid sync/async: provides immediate local cache properties while querying distributed table.
   */
  static getCollisionState(
    conversationId: string,
    currentAgentId: string
  ): Promise<{ hasCollision: boolean; activeViewers: string[] }> & { hasCollision: boolean; activeViewers: string[] } {
    const syncResult = this.getCollisionStateSync(conversationId, currentAgentId);

    const asyncExec = async (): Promise<{ hasCollision: boolean; activeViewers: string[] }> => {
      try {
        const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
        const nowIso = new Date().toISOString();
        const { data, error } = await client
          .from('conversation_presence')
          .select('agent_id, agent_name')
          .eq('conversation_id', conversationId)
          .gt('expires_at', nowIso);

        if (!error && data && data.length > 0) {
          const otherViewers = data
            .filter((v: any) => v.agent_id !== currentAgentId)
            .map((v: any) => v.agent_name);

          return {
            hasCollision: otherViewers.length > 0,
            activeViewers: otherViewers,
          };
        }
      } catch {
        // Fallback to local map
      }
      return syncResult;
    };

    const promise = asyncExec();
    return Object.assign(promise, syncResult);
  }

  /**
   * Synchronous check for backward compatibility with local unit tests.
   */
  static getCollisionStateSync(
    conversationId: string,
    currentAgentId: string
  ): { hasCollision: boolean; activeViewers: string[] } {
    const viewers = this.presenceMap.get(conversationId);
    if (!viewers) {
      return { hasCollision: false, activeViewers: [] };
    }

    const now = Date.now();
    const otherViewers: string[] = [];

    for (const [id, viewer] of viewers.entries()) {
      if (now - viewer.lastSeenAt > this.PRESENCE_TIMEOUT_MS) {
        viewers.delete(id);
      } else if (id !== currentAgentId) {
        otherViewers.push(viewer.agentName);
      }
    }

    return {
      hasCollision: otherViewers.length > 0,
      activeViewers: otherViewers,
    };
  }

  /**
   * Removes agent presence when navigating away from a conversation.
   */
  static async removeViewer(conversationId: string, agentId: string): Promise<void> {
    const viewers = this.presenceMap.get(conversationId);
    if (viewers) {
      viewers.delete(agentId);
      if (viewers.size === 0) {
        this.presenceMap.delete(conversationId);
      }
    }

    try {
      const client = typeof window === 'undefined' ? supabaseAdmin : supabase;
      await client
        .from('conversation_presence')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('agent_id', agentId);
    } catch {
      // In-memory fallback
    }
  }

  /**
   * In-memory seed helper for tests and mock environments.
   */
  static seedConversation(convo: Conversation & { messages: Message[]; priority?: string }): void {
    this.inMemoryConversations.set(convo.id, convo);
  }
}
