import { AIProvider } from './provider';
import { AgentRole, AgentExecutionResult } from './types';
import { supabaseAdmin } from '../supabaseAdmin';
import { UsageService } from '../usage';
import { IdentityResolver } from '../crm/identityResolver';
import { ReceptionistJobScheduler } from '../jobs/receptionistJobScheduler';
import { ToolExecutor } from './tools/toolExecutor';

export interface InboundMessageEvent {
  userId: string;
  organizationId?: string | null;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Web' | 'Email' | 'Messenger';
  senderPhone?: string;
  senderEmail?: string;
  senderName: string;
  messageText: string;
  conversationId?: string;
  leadId?: string;
  roleOverride?: AgentRole;
  metadata?: Record<string, any>;
}

export class AIOrchestrator {
  private static inMemoryConversations = new Map<string, { id: string; status: string; control_mode: 'ai' | 'human'; unread_count: number; leadId?: string }>();

  static clearInMemory(): void {
    this.inMemoryConversations.clear();
  }

  static setConversationControlMode(id: string, mode: 'ai' | 'human', reason?: string): void {
    const existing = this.inMemoryConversations.get(id) || { id, status: 'active', control_mode: 'ai', unread_count: 0 };
    existing.control_mode = mode;
    if (mode === 'human') {
      existing.status = 'needs_attention';
    }
    this.inMemoryConversations.set(id, existing);
  }
  /**
   * Processes any inbound customer message end-to-end:
   * 1. CRM Lead capture / identification
   * 2. Conversation & Message persistence
   * 3. AI Agent execution with Knowledge Base RAG
   * 4. Auto-reply persistence
   * 5. Hand-off routing & execution telemetry
   */
  static async handleInboundMessage(event: InboundMessageEvent): Promise<{
    conversationId: string;
    leadId: string;
    aiResponse: AgentExecutionResult;
  }> {
    const { userId, channel, senderPhone, senderEmail, senderName, messageText, roleOverride } = event;

    // 1. Cross-Channel Customer Identity Resolution (WS-03)
    let leadId: string | null = null;
    try {
      const resolution = await IdentityResolver.resolveCustomer({
        userId,
        organizationId: event.metadata?.organizationId,
        channel: channel.toLowerCase() as any,
        externalUserId: event.metadata?.senderIdentifier || senderPhone || senderEmail || senderName,
        senderName,
        phone: senderPhone,
        email: senderEmail,
        profileData: event.metadata?.rawPayload,
      });
      leadId = resolution.leadId;
    } catch {
      // Resilient fallback
      leadId = `lead-${Date.now()}`;
    }

    // 2. Locate or create active Conversation thread
    let conversationId: string | null = null;
    let activeConvo: any = null;

    if (event.conversationId) {
      const { data: directConvo } = await supabaseAdmin
        .from('conversations')
        .select('id, status, control_mode, unread_count')
        .eq('id', event.conversationId)
        .maybeSingle();

      if (directConvo) {
        activeConvo = directConvo;
      } else if (this.inMemoryConversations.has(event.conversationId)) {
        activeConvo = this.inMemoryConversations.get(event.conversationId);
      } else {
        // Conversation was referenced directly by external adapter / thread
        conversationId = event.conversationId;
      }
    }

    if (!activeConvo && !conversationId) {
      const phoneFilter = senderPhone || '';
      const { data: existingConvo } = await supabaseAdmin
        .from('conversations')
        .select('id, status, control_mode, unread_count')
        .eq('user_id', userId)
        .eq('channel', channel)
        .match(leadId ? { lead_id: leadId } : phoneFilter ? { customer_phone: phoneFilter } : { customer_name: senderName })
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const inMemConvo = leadId ? Array.from(this.inMemoryConversations.values()).find((c) => c.leadId === leadId) : undefined;
      activeConvo = existingConvo || inMemConvo;
    }

    if (activeConvo) {
      conversationId = activeConvo.id;

      // HUMAN TAKEOVER ENFORCEMENT: If conversation is currently controlled by human staff,
      // do not generate an automated AI response! (Requirement 3.G)
      if (activeConvo.control_mode === 'human' || activeConvo.status === 'human_takeover') {
        await supabaseAdmin.from('messages').insert({
          conversation_id: conversationId,
          direction: 'inbound',
          role: 'user',
          content: messageText,
          status: 'delivered',
        });

        await supabaseAdmin
          .from('conversations')
          .update({
            last_message: messageText,
            last_message_at: new Date().toISOString(),
            unread_count: (activeConvo.unread_count || 0) + 1,
          })
          .eq('id', conversationId);

        return {
          conversationId: conversationId || '',
          leadId: leadId || '',
          aiResponse: {
            replyText: '',
            confidence: 1.0,
            requiresHumanHandoff: true,
            handoffReason: 'Conversation under active human staff management',
            suggestedAction: { type: 'human_handoff' },
            sources: [],
            model: 'human-control-suppression',
            provider: 'none' as any,
          },
        };
      }
    } else if (!conversationId) {
      const { data: newConvo } = await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: userId,
          lead_id: leadId,
          customer_name: senderName,
          customer_phone: senderPhone || null,
          customer_email: senderEmail || null,
          channel,
          status: 'active',
          unread_count: 0,
          last_message: messageText,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (newConvo) {
        conversationId = newConvo.id;
      }
    }

    if (!conversationId) {
      conversationId = event.conversationId || `convo-${Date.now()}`;
    }

    // 3. Save Inbound Customer Message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversationId,
      direction: 'inbound',
      role: 'user',
      content: messageText,
      status: 'delivered',
    });

    // 4. Fetch recent conversation history for context (EXCLUDE internal staff notes)
    const { data: recentMsgs } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true })
      .limit(8);

    const formattedHistory = (recentMsgs || []).map((m: any) => ({
      role: m.role as any,
      text: m.content,
    }));

    // 5. Select Agent Role based on keyword analysis or override
    let selectedRole: AgentRole = roleOverride || 'receptionist';
    const lower = messageText.toLowerCase();

    if (!roleOverride) {
      if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('slot')) {
        selectedRole = 'appointment';
      } else if (lower.includes('buy') || lower.includes('order') || lower.includes('pay') || lower.includes('price')) {
        selectedRole = 'sales';
      } else if (lower.includes('cancel') || lower.includes('complain') || lower.includes('refund') || lower.includes('broken')) {
        selectedRole = 'support';
      }
    }

    // 6. Execute AI Agent with customer context for authorization
    const aiResult = await AIProvider.executeAgent({
      userId,
      organizationId: event.metadata?.organizationId,
      conversationId,
      leadId: leadId || undefined,
      role: selectedRole,
      channel,
      customerMessage: messageText,
      customerName: senderName,
      customerPhone: senderPhone,
      customerEmail: senderEmail,
      conversationHistory: formattedHistory,
    });

    // 7. Save Outbound AI Message
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversationId,
      direction: 'outbound',
      role: 'ai',
      content: aiResult.replyText,
      status: 'sent',
    });

    // 8. Update Conversation Thread State
    const finalStatus = aiResult.requiresHumanHandoff ? 'needs_attention' : 'active';
    const controlMode = aiResult.requiresHumanHandoff ? 'human' : 'ai';
    this.inMemoryConversations.set(conversationId, {
      id: conversationId,
      status: finalStatus,
      control_mode: controlMode,
      unread_count: aiResult.requiresHumanHandoff ? 1 : 0,
      leadId: leadId || undefined,
    });

    await supabaseAdmin
      .from('conversations')
      .update({
        status: finalStatus,
        control_mode: controlMode,
        handoff_reason: aiResult.handoffReason || (aiResult.requiresHumanHandoff ? 'Human intervention required' : null),
        last_message: aiResult.replyText,
        last_message_at: new Date().toISOString(),
        unread_count: aiResult.requiresHumanHandoff ? 1 : 0,
      })
      .eq('id', conversationId);

    // 8b. Automated Appointment Reminder Scheduling (Requirement 3.H)
    for (const execution of aiResult.toolExecutions || []) {
      if (execution.tool === 'bookAppointment' && execution.result?.success && execution.result.data?.appointmentId) {
        const d = execution.result.data;
        try {
          await ReceptionistJobScheduler.scheduleAppointmentReminder({
            organizationId: event.organizationId || userId,
            appointmentId: d.appointmentId,
            customerName: d.customerName || senderName,
            customerPhone: senderPhone || null,
            customerEmail: senderEmail || null,
            serviceName: d.serviceName || 'Consultation',
            startTime: d.startTime,
            channel: (channel.toLowerCase() === 'messenger' ? 'messenger' : channel.toLowerCase() === 'instagram' ? 'instagram' : channel.toLowerCase() === 'email' ? 'email' : 'whatsapp') as any,
            hoursNotice: 24,
          });
        } catch (reminderErr: any) {
          console.warn('[AIOrchestrator] Failed to schedule reminder job:', reminderErr.message);
        }
      }
    }

    // 9. Central Idempotent Usage Accounting & Telemetry
    const eventId = event.metadata?.eventId;
    await UsageService.recordUsage({
      userId,
      metricType: 'ai_requests',
      quantity: 1,
      idempotencyKey: eventId ? `usage:ai:${eventId}` : undefined,
      metadata: {
        channel,
        role: selectedRole,
        requiresHumanHandoff: aiResult.requiresHumanHandoff,
      },
    });

    if (channel === 'WhatsApp') {
      await UsageService.recordUsage({
        userId,
        metricType: 'whatsapp_messages',
        quantity: 1,
        idempotencyKey: eventId ? `usage:wa:${eventId}` : undefined,
      });
    }

    // Legacy telemetry insert for backward compatibility
    await supabaseAdmin.from('execution_logs').insert({
      user_id: userId,
      type: 'ai_reply',
      channel,
      message: `[Agent: ${selectedRole}] Responded to ${senderName}. Handoff required: ${aiResult.requiresHumanHandoff}`,
    });

    await supabaseAdmin.from('usage_records').insert({
      user_id: userId,
      metric_type: 'ai_conversations',
      quantity: 1,
    });

    return {
      conversationId,
      leadId: leadId || '',
      aiResponse: aiResult,
    };
  }

  /**
   * Helper for direct appointment booking with conflict checking & 24h reminder scheduling
   */
  static async bookAppointment(params: {
    userId: string;
    organizationId?: string | null;
    customerName: string;
    customerPhone?: string | null;
    customerEmail?: string | null;
    serviceName: string;
    startTime: string;
    endTime?: string;
    channel?: 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'web';
  }): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
    const result = await ToolExecutor.executeTool(
      'bookAppointment',
      {
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        serviceName: params.serviceName,
        startTime: params.startTime,
        endTime: params.endTime || new Date(new Date(params.startTime).getTime() + 45 * 60000).toISOString(),
      },
      {
        userId: params.userId,
        organizationId: params.organizationId,
        actorType: 'ai_agent',
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
      }
    );

    if (result.success && result.data?.appointmentId) {
      try {
        await ReceptionistJobScheduler.scheduleAppointmentReminder({
          organizationId: params.organizationId || params.userId,
          appointmentId: result.data.appointmentId,
          customerName: params.customerName,
          customerPhone: params.customerPhone || null,
          customerEmail: params.customerEmail || null,
          serviceName: params.serviceName,
          startTime: params.startTime,
          channel: params.channel || 'whatsapp',
          hoursNotice: 24,
        });
      } catch (err: any) {
        console.warn('[AIOrchestrator] Reminder schedule error:', err.message);
      }
      return { success: true, appointmentId: result.data.appointmentId };
    }

    return { success: false, error: result.error };
  }
}
