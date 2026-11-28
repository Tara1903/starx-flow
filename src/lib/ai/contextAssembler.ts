/**
 * StarX-Flow Unified AI Context Assembler
 * Parallel, bounded-timeout loader merging 5 real workspace layers:
 * 1. Verified Business Profile (+ org/profile fallback)
 * 2. Scoped Customer 360° CRM Dossier (lead, deals, bookings, orders, tasks, cross-channel thread preview)
 * 3. Workspace Operational Memories (`business_memories`, `agent_memories`, custom `agents`)
 * 4. Active Workflow Automation Directives
 * 5. Hybrid Semantic RAG Knowledge Chunks
 */

import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { isValidUuid, lookupExistingOrganizationId } from '../crm/organizationHelper';
import { BusinessProfileService, BusinessReceptionistProfile } from './businessProfileService';
import { KnowledgeEngine, KnowledgeMatch } from './knowledgeEngine';

export interface AssembledCrmDossier {
  leadId: string;
  name: string;
  companyName?: string | null;
  industry?: string | null;
  city?: string | null;
  status: string;
  score: number;
  dealValue: number;
  currency: string;
  tags: string[];
  notes?: string | null;
  aiSummary?: string | null;
  deals: Array<{ title: string; value: number; status: string }>;
  upcomingAppointments: Array<{ id: string; serviceName: string; startTime: string; status: string }>;
  recentOrders: Array<{ orderNumber: string; status: string; paymentStatus: string; totalAmount: number; currency: string }>;
  openTasks: Array<{ title: string; priority: string; dueDate?: string | null }>;
  otherChannelSummary?: string | null;
}

export interface AssembledAIContext {
  organizationId: string;
  businessProfile: BusinessReceptionistProfile;
  verifiedFactsSection: string;
  crmDossier: AssembledCrmDossier | null;
  businessMemories: Array<{ category: string; key: string; value: string }>;
  customerMemories: Array<{ key: string; value: string }>;
  agentPersonaOverrides: Array<{ name: string; role: string; system_prompt: string }>;
  activeWorkflows: Array<{ name: string; channel: string; trigger: string; custom_prompt?: string | null }>;
  ragMatches: KnowledgeMatch[];
  contextSourcesUsed: string[];
}

export class AIContextAssembler {
  /**
   * Assembles full real-time workspace + customer intelligence with bounded latency.
   */
  static async assemble(params: {
    userId: string;
    organizationId?: string | null;
    leadId?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    conversationId?: string | null;
    channel: string;
    query: string;
    simulateProfile?: Partial<BusinessReceptionistProfile>;
    referenceTimestamp?: string;
  }): Promise<AssembledAIContext> {
    const rawOrg = params.organizationId || params.userId;
    let resolvedOrg = rawOrg;

    if (isSupabaseAdminConfigured && (isValidUuid(params.userId) || isValidUuid(rawOrg))) {
      try {
        resolvedOrg = (await lookupExistingOrganizationId(params.userId, rawOrg)) || rawOrg;
      } catch {
        resolvedOrg = rawOrg;
      }
    }

    const validOrgUuid = isValidUuid(resolvedOrg) ? resolvedOrg : null;
    const validUserUuid = isValidUuid(params.userId) ? params.userId : null;
    const validLeadUuid = isValidUuid(params.leadId) ? params.leadId : null;

    const loadCore = async (): Promise<AssembledAIContext> => {
      const [baseProfile, ragMatches, dbContext] = await Promise.all([
        BusinessProfileService.getProfile(resolvedOrg, params.userId),
        KnowledgeEngine.retrieveRelevantContext(params.userId, params.query, 6, resolvedOrg),
        isSupabaseAdminConfigured && (validOrgUuid || validUserUuid)
          ? this.loadDatabaseIntelligence({
              orgId: validOrgUuid,
              userId: validUserUuid,
              leadId: validLeadUuid,
              conversationId: params.conversationId || null,
              channel: params.channel,
            })
          : Promise.resolve({
              crmDossier: null,
              businessMemories: [],
              customerMemories: [],
              agentPersonaOverrides: [],
              activeWorkflows: [],
            }),
      ]);

      const businessProfile: BusinessReceptionistProfile = params.simulateProfile
        ? { ...baseProfile, ...params.simulateProfile }
        : baseProfile;
      const parsedRef = params.referenceTimestamp ? new Date(params.referenceTimestamp) : null;
      const referenceDate = parsedRef && !Number.isNaN(parsedRef.getTime()) ? parsedRef : new Date();
      const verifiedFactsSection = BusinessProfileService.formatSystemContext(businessProfile, referenceDate);

      const contextSourcesUsed: string[] = [];
      if (businessProfile.isConfigured || businessProfile.services.length > 0) {
        contextSourcesUsed.push('Business Profile');
      }
      if (dbContext.crmDossier) contextSourcesUsed.push('CRM 360 Dossier');
      if (ragMatches.length > 0) contextSourcesUsed.push(`Knowledge Base (${ragMatches.length})`);
      if (dbContext.businessMemories.length > 0 || dbContext.customerMemories.length > 0) {
        contextSourcesUsed.push('Workspace & Customer Memory');
      }
      if (dbContext.activeWorkflows.length > 0) {
        contextSourcesUsed.push('Active Workflows');
      }

      return {
        organizationId: resolvedOrg,
        businessProfile,
        verifiedFactsSection,
        crmDossier: dbContext.crmDossier,
        businessMemories: dbContext.businessMemories,
        customerMemories: dbContext.customerMemories,
        agentPersonaOverrides: dbContext.agentPersonaOverrides,
        activeWorkflows: dbContext.activeWorkflows,
        ragMatches,
        contextSourcesUsed,
      };
    };

    // Bounded latency race so external DB hiccups never stall chat replies
    const timeoutFallback = async (): Promise<AssembledAIContext> => {
      await new Promise((r) => setTimeout(r, 2400));
      const baseProfile = await BusinessProfileService.getProfile(resolvedOrg, params.userId);
      const merged = params.simulateProfile ? { ...baseProfile, ...params.simulateProfile } : baseProfile;
      const parsedRef = params.referenceTimestamp ? new Date(params.referenceTimestamp) : null;
      const referenceDate = parsedRef && !Number.isNaN(parsedRef.getTime()) ? parsedRef : new Date();
      return {
        organizationId: resolvedOrg,
        businessProfile: merged,
        verifiedFactsSection: BusinessProfileService.formatSystemContext(merged, referenceDate),
        crmDossier: null,
        businessMemories: [],
        customerMemories: [],
        agentPersonaOverrides: [],
        activeWorkflows: [],
        ragMatches: [],
        contextSourcesUsed: merged.isConfigured ? ['Business Profile'] : [],
      };
    };

    return Promise.race([loadCore(), timeoutFallback()]);
  }

  private static async loadDatabaseIntelligence(params: {
    orgId: string | null;
    userId: string | null;
    leadId: string | null;
    conversationId: string | null;
    channel: string;
  }): Promise<{
    crmDossier: AssembledCrmDossier | null;
    businessMemories: Array<{ category: string; key: string; value: string }>;
    customerMemories: Array<{ key: string; value: string }>;
    agentPersonaOverrides: Array<{ name: string; role: string; system_prompt: string }>;
    activeWorkflows: Array<{ name: string; channel: string; trigger: string; custom_prompt?: string | null }>;
  }> {
    const scopeFilter =
      params.orgId && params.userId && params.orgId !== params.userId
        ? `organization_id.eq.${params.orgId},user_id.eq.${params.userId}`
        : params.orgId
          ? `organization_id.eq.${params.orgId},user_id.eq.${params.orgId}`
          : `user_id.eq.${params.userId}`;

    const [bMemRes, agentsRes, wfRes, leadRes, aMemRes] = await Promise.allSettled([
      supabaseAdmin
        .from('business_memories')
        .select('category, key, value')
        .or(scopeFilter)
        .limit(20),
      supabaseAdmin
        .from('agents')
        .select('name, role, system_prompt, is_active')
        .eq('user_id', params.userId || params.orgId || '')
        .eq('is_active', true)
        .limit(6),
      supabaseAdmin
        .from('workflows')
        .select('name, channel, trigger, custom_prompt')
        .or(scopeFilter)
        .eq('is_active', true)
        .limit(10),
      params.leadId
        ? supabaseAdmin
            .from('leads')
            .select('id, name, company_name, industry, city, status, score, deal_value, currency, tags, notes, ai_summary')
            .eq('id', params.leadId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      params.leadId
        ? supabaseAdmin
            .from('agent_memories')
            .select('key, value')
            .eq('lead_id', params.leadId)
            .order('created_at', { ascending: false })
            .limit(12)
        : Promise.resolve({ data: [] }),
    ]);

    const businessMemories =
      bMemRes.status === 'fulfilled' && Array.isArray(bMemRes.value.data)
        ? bMemRes.value.data
            .filter((m: any) => m.key && m.value)
            .map((m: any) => ({ category: m.category || 'general', key: m.key, value: m.value }))
        : [];

    const agentPersonaOverrides =
      agentsRes.status === 'fulfilled' && Array.isArray(agentsRes.value.data)
        ? agentsRes.value.data.map((a: any) => ({
            name: a.name,
            role: a.role,
            system_prompt: a.system_prompt || '',
          }))
        : [];

    const channelLower = params.channel.toLowerCase();
    const activeWorkflows =
      wfRes.status === 'fulfilled' && Array.isArray(wfRes.value.data)
        ? wfRes.value.data
            .filter(
              (w: any) =>
                !w.channel ||
                w.channel.toLowerCase() === 'all' ||
                w.channel.toLowerCase() === channelLower ||
                params.channel === 'Sandbox'
            )
            .map((w: any) => ({
              name: w.name,
              channel: w.channel || 'All',
              trigger: w.trigger || 'Inbound Message',
              custom_prompt: w.custom_prompt || null,
            }))
        : [];

    const customerMemories =
      aMemRes.status === 'fulfilled' && Array.isArray(aMemRes.value.data)
        ? aMemRes.value.data
            .filter((m: any) => m.key && m.value)
            .map((m: any) => ({ key: m.key, value: m.value }))
        : [];

    let crmDossier: AssembledCrmDossier | null = null;
    const leadRow = leadRes.status === 'fulfilled' ? (leadRes.value.data as any) : null;

    if (leadRow?.id) {
      const [dealsRes, apptsRes, ordersRes, tasksRes, convosRes] = await Promise.allSettled([
        supabaseAdmin
          .from('crm_deals')
          .select('title, value, status')
          .eq('lead_id', leadRow.id)
          .order('updated_at', { ascending: false })
          .limit(3),
        supabaseAdmin
          .from('appointments')
          .select('id, service_name, start_time, status')
          .eq('lead_id', leadRow.id)
          .neq('status', 'cancelled')
          .order('start_time', { ascending: false })
          .limit(3),
        supabaseAdmin
          .from('orders')
          .select('order_number, status, payment_status, total_amount, currency')
          .eq('lead_id', leadRow.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabaseAdmin
          .from('tasks')
          .select('title, priority, due_date')
          .eq('lead_id', leadRow.id)
          .neq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(3),
        supabaseAdmin
          .from('conversations')
          .select('id, channel, last_message, last_message_at')
          .eq('lead_id', leadRow.id)
          .order('last_message_at', { ascending: false })
          .limit(3),
      ]);

      const otherConvo =
        convosRes.status === 'fulfilled' && Array.isArray(convosRes.value.data)
          ? convosRes.value.data.find(
              (c: any) => c.id !== params.conversationId && c.last_message
            )
          : null;

      crmDossier = {
        leadId: leadRow.id,
        name: leadRow.name,
        companyName: leadRow.company_name,
        industry: leadRow.industry,
        city: leadRow.city,
        status: leadRow.status || 'new',
        score: Number(leadRow.score || 50),
        dealValue: Number(leadRow.deal_value || 0),
        currency: leadRow.currency || 'EUR',
        tags: Array.isArray(leadRow.tags) ? leadRow.tags : [],
        notes: leadRow.notes,
        aiSummary: leadRow.ai_summary,
        deals:
          dealsRes.status === 'fulfilled' && Array.isArray(dealsRes.value.data)
            ? dealsRes.value.data.map((d: any) => ({
                title: d.title,
                value: Number(d.value || 0),
                status: d.status || 'open',
              }))
            : [],
        upcomingAppointments:
          apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value.data)
            ? apptsRes.value.data.map((a: any) => ({
                id: a.id,
                serviceName: a.service_name,
                startTime: a.start_time,
                status: a.status,
              }))
            : [],
        recentOrders:
          ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)
            ? ordersRes.value.data.map((o: any) => ({
                orderNumber: o.order_number,
                status: o.status,
                paymentStatus: o.payment_status,
                totalAmount: Number(o.total_amount || 0),
                currency: o.currency || 'EUR',
              }))
            : [],
        openTasks:
          tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value.data)
            ? tasksRes.value.data.map((t: any) => ({
                title: t.title,
                priority: t.priority,
                dueDate: t.due_date,
              }))
            : [],
        otherChannelSummary: otherConvo
          ? `${otherConvo.channel}: "${String(otherConvo.last_message).slice(0, 140)}"`
          : null,
      };
    }

    return {
      crmDossier,
      businessMemories,
      customerMemories,
      agentPersonaOverrides,
      activeWorkflows,
    };
  }

  /**
   * Formats assembled multi-layer context into clean structured prompt blocks.
   */
  static formatPromptBlocks(assembled: AssembledAIContext): string {
    const sections: string[] = [assembled.verifiedFactsSection];

    if (assembled.businessMemories.length > 0) {
      sections.push(
        `\n[WORKSPACE OPERATIONAL RULES & MEMORIES]:\n` +
          assembled.businessMemories
            .map((m) => `- [${m.category}] ${m.key}: ${m.value}`)
            .join('\n')
      );
    }

    if (assembled.activeWorkflows.length > 0) {
      const wfDirectives = assembled.activeWorkflows
        .map((w) => `- Workflow "${w.name}" (${w.channel}): ${w.custom_prompt || w.trigger}`)
        .join('\n');
      sections.push(`\n[ACTIVE WORKFLOW RULES]:\n${wfDirectives}`);
    }

    if (assembled.crmDossier) {
      const c = assembled.crmDossier;
      const lines = [
        `Name: ${c.name}${c.companyName ? ` (${c.companyName})` : ''}`,
        `Pipeline Stage/Status: ${c.status} (ICP Fit Score: ${c.score}/100${c.dealValue > 0 ? `, Deal Value: ${c.dealValue} ${c.currency}` : ''})`,
      ];
      if (c.industry || c.city) {
        lines.push(`Segment: ${[c.industry, c.city].filter(Boolean).join(' · ')}`);
      }
      if (c.aiSummary) lines.push(`Prior CRM Summary: ${c.aiSummary}`);
      if (c.notes) lines.push(`Staff CRM Notes: ${c.notes}`);
      if (c.deals.length > 0) {
        lines.push(
          `Active Deals: ${c.deals.map((d) => `"${d.title}" (${d.value}€, ${d.status})`).join('; ')}`
        );
      }
      if (c.upcomingAppointments.length > 0) {
        lines.push(
          `Appointments: ${c.upcomingAppointments
            .map((a) => `${a.serviceName} on ${a.startTime} [${a.status}] (id:${a.id})`)
            .join('; ')}`
        );
      }
      if (c.recentOrders.length > 0) {
        lines.push(
          `Recent Orders: ${c.recentOrders
            .map((o) => `${o.orderNumber} (${o.status}, payment:${o.paymentStatus}, ${o.totalAmount} ${o.currency})`)
            .join('; ')}`
        );
      }
      if (c.openTasks.length > 0) {
        lines.push(`Open Staff Tasks: ${c.openTasks.map((t) => `${t.title} [${t.priority}]`).join('; ')}`);
      }
      if (c.otherChannelSummary) {
        lines.push(`Recent Cross-Channel Context: ${c.otherChannelSummary}`);
      }
      if (assembled.customerMemories.length > 0) {
        lines.push(
          `Saved Customer Preferences: ${assembled.customerMemories.map((m) => `${m.key}=${m.value}`).join(' | ')}`
        );
      }
      sections.push(`\n[CUSTOMER 360 CRM DOSSIER — VERIFIED CURRENT CONTACT]:\n${lines.join('\n')}`);
    } else if (assembled.customerMemories.length > 0) {
      sections.push(
        `\n[CUSTOMER MEMORIES]:\n` +
          assembled.customerMemories.map((m) => `- ${m.key}: ${m.value}`).join('\n')
      );
    }

    if (assembled.ragMatches.length > 0) {
      sections.push(
        `\n[OFFICIAL BUSINESS KNOWLEDGE BASE — VERIFIED EXCERPTS]:\n` +
          assembled.ragMatches
            .map((c) => `- (${c.documentTitle}, relevance ${Math.round(c.score * 100)}%): ${c.content}`)
            .join('\n')
      );
    }

    return sections.join('\n');
  }
}
