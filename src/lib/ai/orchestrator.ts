import { AIProvider } from './provider';
import { AgentRole, AgentExecutionResult } from './types';
import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { UsageService } from '../usage';
import { IdentityResolver } from '../crm/identityResolver';
import { ReceptionistJobScheduler } from '../jobs/receptionistJobScheduler';
import { ToolExecutor } from './tools/toolExecutor';
import { isValidUuid, newUuid, resolveValidOrganizationId } from '../crm/organizationHelper';

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

/**
 * Multilingual intent heuristic that sets primary focus while keeping composable concierge capabilities active.
 */
function inferPrimaryRole(messageText: string, recentAssistantText: string): AgentRole {
  const lower = messageText.toLowerCase();
  const bookingPattern =
    /\b(book|appointment|schedule|slot|reschedule|termin|buchen|rdv|rendez-vous|reservar|cita|verfügbar|available)\b/i;
  const salesPattern =
    /\b(buy|order|pay|price|pricing|cost|quote|plan|package|preis|kosten|angebot|tarif|acheter|precio)\b/i;
  const supportPattern =
    /\b(cancel|complain|refund|broken|issue|problem|storno|beschwerde|erstattung|remboursement|manager|human)\b/i;

  if (bookingPattern.test(lower) || /\b(book|slot|appointment)\b/i.test(recentAssistantText)) {
    return 'appointment';
  }
  if (salesPattern.test(lower)) return 'sales';
  if (supportPattern.test(lower)) return 'support';
  return 'receptionist';
}

export class AIOrchestrator {
  private static inMemoryConversations = new Map<
    string,
    { id: string; status: string; control_mode: 'ai' | 'human'; unread_count: number; leadId?: string }
  >();

  static clearInMemory(): void {
    this.inMemoryConversations.clear();
  }

  static setConversationControlMode(id: string, mode: 'ai' | 'human', _reason?: string): void {
    const existing =
      this.inMemoryConversations.get(id) || {
        id,
        status: 'active',
        control_mode: 'ai',
        unread_count: 0,
      };
    existing.control_mode = mode;
    if (mode === 'human') {
      existing.status = 'needs_attention';
    }
    this.inMemoryConversations.set(id, existing);
  }

  /**
   * Processes any inbound customer message end-to-end with 5-layer context assembly,
   * multi-round tool calling, CRM dossier sync, and intelligence execution telemetry.
   */
  static async handleInboundMessage(event: InboundMessageEvent): Promise<{
    conversationId: string;
    leadId: string;
    aiResponse: AgentExecutionResult;
  }> {
    const { userId, channel, senderPhone, senderEmail, senderName, messageText, roleOverride } = event;
    const dbOrgId = await resolveValidOrganizationId(userId, event.organizationId || event.metadata?.organizationId);
    const effectiveOrgId = dbOrgId || event.organizationId || event.metadata?.organizationId || null;

    // 1. Cross-Channel Customer Identity Resolution
    let leadId: string | null = event.leadId || null;
    let resolvedEmail: string | undefined = senderEmail;
    let resolvedPhone: string | undefined = senderPhone;
    let resolvedName: string = senderName;
    try {
      const resolution = await IdentityResolver.resolveCustomer({
        userId,
        organizationId: effectiveOrgId,
        channel: channel.toLowerCase() as any,
        externalUserId: event.metadata?.senderIdentifier || senderPhone || senderEmail || senderName,
        senderName,
        phone: senderPhone,
        email: senderEmail,
        profileData: event.metadata?.rawPayload,
      });
      leadId = resolution.leadId;
      resolvedEmail = resolvedEmail || resolution.customer?.email || undefined;
      resolvedPhone = resolvedPhone || resolution.customer?.phone || undefined;
      resolvedName = resolution.customer?.name || resolvedName;
    } catch {
      leadId = leadId || newUuid();
    }

    const extractedEmailMatch = messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (extractedEmailMatch && !resolvedEmail) {
      resolvedEmail = extractedEmailMatch[0].toLowerCase();
      if (isValidUuid(userId) && isValidUuid(leadId)) {
        await supabaseAdmin.from('leads').update({ email: resolvedEmail }).eq('id', leadId);
      }
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
        .match(
          leadId
            ? { lead_id: leadId }
            : phoneFilter
              ? { customer_phone: phoneFilter }
              : { customer_name: senderName }
        )
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const inMemConvo = leadId
        ? Array.from(this.inMemoryConversations.values()).find((c) => c.leadId === leadId)
        : undefined;
      activeConvo = existingConvo || inMemConvo;
    }

    if (activeConvo) {
      conversationId = activeConvo.id;

      // Strict human takeover enforcement
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
            updated_at: new Date().toISOString(),
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
      if (isValidUuid(userId)) {
        const { data: newConvo, error: convoErr } = await supabaseAdmin
          .from('conversations')
          .insert({
            user_id: userId,
            organization_id: dbOrgId,
            lead_id: isValidUuid(leadId) ? leadId : null,
            customer_name: senderName,
            customer_phone: senderPhone || null,
            customer_email: senderEmail || null,
            channel,
            status: 'active',
            unread_count: 0,
            metadata: event.metadata
              ? {
                  senderIdentifier: event.metadata.senderIdentifier || senderPhone || senderEmail || null,
                  externalUserId: event.metadata.senderIdentifier || null,
                  recipientIgsid: event.metadata.recipientIgsid || null,
                }
              : {},
            last_message: messageText,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (convoErr) {
          console.warn('[AIOrchestrator] Failed to insert conversation:', convoErr.message);
        } else if (newConvo) {
          conversationId = newConvo.id;
        }
      }
    }

    if (!conversationId) {
      conversationId = event.conversationId || newUuid();
    }

    // 3. Save Inbound Customer Message
    if (isValidUuid(userId) && isValidUuid(conversationId)) {
      const { error: inboundErr } = await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        direction: 'inbound',
        role: 'user',
        content: messageText,
        status: 'delivered',
      });
      if (inboundErr) {
        console.warn('[AIOrchestrator] Failed to insert inbound message:', inboundErr.message);
      }
    }

    if (extractedEmailMatch && resolvedEmail && isValidUuid(userId) && isValidUuid(conversationId)) {
      await supabaseAdmin.from('conversations').update({ customer_email: resolvedEmail }).eq('id', conversationId);
    }

    // 4. Fetch recent non-internal conversation turns (up to 16)
    const { data: recentMsgsDesc } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .eq('is_internal', false)
      .order('created_at', { ascending: false })
      .limit(17);

    const chronological = (recentMsgsDesc || []).slice().reverse();
    if (chronological.length > 0) {
      const last = chronological[chronological.length - 1];
      if (last.role === 'user' && last.content === messageText) {
        chronological.pop();
      }
    }

    const formattedHistory = chronological.slice(-16).map((m: any) => ({
      role: m.role as any,
      text: m.content,
    }));

    // 5. Infer primary focus cleanly (supporting multilingual queries)
    const recentAssistantText = chronological
      .slice(-4)
      .filter((m: any) => m.role !== 'user')
      .map((m: any) => String(m.content || '').toLowerCase())
      .join(' ');
    const selectedRole: AgentRole = roleOverride || inferPrimaryRole(messageText, recentAssistantText);

    // 6. Execute Unified AI Intelligence Pipeline with Full Context + Trace
    const aiResult = await AIProvider.executeAgent({
      userId,
      organizationId: effectiveOrgId || undefined,
      conversationId,
      leadId: leadId || undefined,
      role: selectedRole,
      channel,
      customerMessage: messageText,
      customerName: resolvedName,
      customerPhone: resolvedPhone,
      customerEmail: resolvedEmail,
      conversationHistory: formattedHistory,
      referenceTimestamp:
        typeof event.metadata?.simulatedTimestamp === 'string'
          ? event.metadata.simulatedTimestamp
          : undefined,
      includeTrace: true,
    });

    // 7. Save Outbound AI Message
    if (isValidUuid(userId) && isValidUuid(conversationId)) {
      const { error: outboundErr } = await supabaseAdmin.from('messages').insert({
        conversation_id: conversationId,
        direction: 'outbound',
        role: 'ai',
        content: aiResult.replyText,
        status: 'sent',
      });
      if (outboundErr) {
        console.warn('[AIOrchestrator] Failed to insert outbound message:', outboundErr.message);
      }
    }

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

    if (isValidUuid(userId) && isValidUuid(conversationId)) {
      const { error: updateErr } = await supabaseAdmin
        .from('conversations')
        .update({
          status: finalStatus,
          control_mode: controlMode,
          handoff_reason:
            aiResult.handoffReason || (aiResult.requiresHumanHandoff ? 'Human intervention required' : null),
          last_message: aiResult.replyText,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          unread_count: aiResult.requiresHumanHandoff ? 1 : 0,
        })
        .eq('id', conversationId);
      if (updateErr) {
        console.warn('[AIOrchestrator] Failed to update conversation:', updateErr.message);
      }
    }

    // 8b. Automated Appointment Reminder Scheduling
    for (const execution of aiResult.toolExecutions || []) {
      if (
        execution.tool === 'bookAppointment' &&
        execution.result?.success &&
        execution.result.data?.appointmentId
      ) {
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
            channel: (channel.toLowerCase() === 'messenger'
              ? 'messenger'
              : channel.toLowerCase() === 'instagram'
                ? 'instagram'
                : channel.toLowerCase() === 'email'
                  ? 'email'
                  : 'whatsapp') as any,
            hoursNotice: 24,
          });
        } catch (reminderErr: any) {
          console.warn('[AIOrchestrator] Failed to schedule reminder job:', reminderErr.message);
        }
      }
    }

    // 8c. Persist AI Intelligence Trace & Non-Blocking CRM AI Summary Refresh
    if (isSupabaseAdminConfigured && isValidUuid(effectiveOrgId)) {
      try {
        await supabaseAdmin.from('ai_intelligence_traces').insert({
          organization_id: effectiveOrgId,
          conversation_id: isValidUuid(conversationId) ? conversationId : null,
          lead_id: isValidUuid(leadId) ? leadId : null,
          channel,
          provider: aiResult.provider,
          model: aiResult.model,
          intent: selectedRole,
          rag_chunks_count: aiResult.trace?.ragChunksCount ?? (aiResult.sources?.length || 0),
          memories_count: aiResult.trace?.memoriesCount ?? 0,
          crm_linked: aiResult.trace?.crmLinked ?? Boolean(isValidUuid(leadId)),
          tool_names_used: (aiResult.toolExecutions || []).map((t) => t.tool),
          requires_handoff: aiResult.requiresHumanHandoff,
          latency_ms: aiResult.trace?.latencyMs ?? 0,
          metadata: { contextSourcesUsed: aiResult.trace?.contextSourcesUsed || [] },
        });
      } catch {
        // Non-blocking trace logging
      }

      if (isValidUuid(leadId) && messageText.trim().length >= 16) {
        try {
          const conciseIntent = `[${channel} ${selectedRole}] Latest inquiry: "${messageText.trim().slice(0, 140)}"${aiResult.requiresHumanHandoff ? ' (Human follow-up requested)' : ''}`;
          await supabaseAdmin
            .from('leads')
            .update({
              ai_summary: conciseIntent,
              last_contact_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', leadId);
        } catch {
          // Non-blocking summary update
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

    await supabaseAdmin.from('execution_logs').insert({
      user_id: userId,
      type: 'ai_reply',
      channel,
      message: `[Agent: ${selectedRole} · ${aiResult.provider}] Responded to ${senderName}. Handoff: ${aiResult.requiresHumanHandoff}`,
    });

    if (
      (channel === 'WhatsApp' || channel === 'Instagram') &&
      isValidUuid(userId) &&
      (effectiveOrgId === '215ae89e-80bc-40f8-89e4-5dfd1254ddbe' ||
        userId === '230a2984-8c0b-489f-abda-b31fbcddf742')
    ) {
      await this.syncAdminDemoLead({
        channel,
        phone: resolvedPhone || senderPhone,
        email: resolvedEmail || senderEmail,
        name: resolvedName || senderName,
        externalId: event.metadata?.senderIdentifier,
        messageText,
        conversationId,
      });
    }

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

  private static async syncAdminDemoLead(params: {
    channel: 'WhatsApp' | 'Instagram';
    phone?: string;
    email?: string;
    name: string;
    externalId?: string;
    messageText: string;
    conversationId: string | null;
  }): Promise<void> {
    try {
      const cleanPhone = (params.phone || '').trim();
      const digits = cleanPhone.replace(/\D/g, '');
      const cleanName = (params.name || '').trim() || `${params.channel} Support Inquiry`;
      const cleanEmail = params.email?.trim().toLowerCase();
      const cleanExternalId = (params.externalId || '').trim().replace(/^@/, '');
      const snippet = (params.messageText || '').trim().slice(0, 300);
      const isInstagram = params.channel === 'Instagram';
      const noteLine = `[${params.channel} Support] Latest: ${snippet || 'Inbound message'} (Conv: ${params.conversationId || 'pending'})`;

      let existing: {
        id: string;
        full_name: string | null;
        work_email: string | null;
        primary_need: string | null;
      } | null = null;

      if (isInstagram && cleanExternalId) {
        const igPseudoEmail = `${cleanExternalId}@instagram.starxflow.com`;
        const { data } = await supabaseAdmin
          .from('demo_requests')
          .select('id, full_name, work_email, primary_need')
          .eq('work_email', igPseudoEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        existing = data;
      } else if (digits.length >= 7) {
        const { data } = await supabaseAdmin
          .from('demo_requests')
          .select('id, full_name, work_email, primary_need')
          .eq('preferred_contact', 'whatsapp')
          .ilike('phone', `%${digits.slice(-10)}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        existing = data;
      } else if (cleanPhone) {
        const { data } = await supabaseAdmin
          .from('demo_requests')
          .select('id, full_name, work_email, primary_need')
          .eq('preferred_contact', 'whatsapp')
          .eq('phone', cleanPhone)
          .limit(1)
          .maybeSingle();
        existing = data;
      }

      if (existing?.id) {
        const updates: Record<string, any> = { notes: noteLine };
        const isPlaceholderEmail =
          !existing.work_email ||
          existing.work_email.endsWith('@whatsapp.starxflow.com') ||
          existing.work_email.endsWith('@whatsapp.starxflow.local') ||
          existing.work_email.endsWith('@instagram.starxflow.com');
        if (cleanEmail && isPlaceholderEmail) {
          updates.work_email = cleanEmail;
        }
        if (
          cleanName &&
          cleanName !== 'WhatsApp User' &&
          (!existing.full_name || existing.full_name.endsWith('Support Inquiry'))
        ) {
          updates.full_name = cleanName;
        }
        if (snippet && (!existing.primary_need || existing.primary_need.endsWith('Support Inquiry'))) {
          updates.primary_need = snippet;
        }
        await supabaseAdmin.from('demo_requests').update(updates).eq('id', existing.id);
        return;
      }

      const fallbackEmail =
        cleanEmail ||
        (isInstagram
          ? `${cleanExternalId || 'visitor'}@instagram.starxflow.com`
          : `${digits || 'visitor'}@whatsapp.starxflow.com`);
      await supabaseAdmin.from('demo_requests').insert({
        full_name: cleanName,
        work_email: fallbackEmail,
        phone: cleanPhone || null,
        preferred_contact: isInstagram ? 'email' : 'whatsapp',
        business_name: isInstagram ? 'Instagram Inbound Inquiry' : 'WhatsApp Inbound Inquiry',
        business_type: isInstagram ? 'Instagram DM Support' : 'WhatsApp Support',
        business_size: 'Evaluating',
        primary_need: snippet || `${params.channel} Support Inquiry`,
        status: 'new',
        consent_given: true,
        notes: noteLine,
      });
    } catch (err) {
      console.warn('[AIOrchestrator] Non-fatal demo_requests sync failed:', err);
    }
  }
}
