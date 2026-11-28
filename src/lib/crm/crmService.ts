import { supabaseAdmin, isSupabaseAdminConfigured } from '../supabaseAdmin';
import { IdentityResolver } from './identityResolver';
import type { Lead } from '@/types/database';
import type {
  CrmActivity,
  CrmActivityType,
  CrmAnalyticsSummary,
  CrmDeal,
  CrmPipeline,
  CrmSequenceEnrollment,
  CrmStage,
  CrmTeamMember,
  LeadWorkspace360,
} from '@/types/crm';

export const DEFAULT_PIPELINE_STAGES: Array<{
  name: string;
  slug: string;
  position: number;
  probability: number;
  color_token: string;
  is_won: boolean;
  is_lost: boolean;
}> = [
  { name: 'New Lead', slug: 'new', position: 0, probability: 10, color_token: 'info', is_won: false, is_lost: false },
  { name: 'Contacted', slug: 'contacted', position: 1, probability: 25, color_token: 'warn', is_won: false, is_lost: false },
  { name: 'Qualified', slug: 'qualified', position: 2, probability: 50, color_token: 'emerald', is_won: false, is_lost: false },
  { name: 'Proposal / Booked', slug: 'proposal', position: 3, probability: 75, color_token: 'emerald', is_won: false, is_lost: false },
  { name: 'Converted / Won', slug: 'converted', position: 4, probability: 100, color_token: 'live', is_won: true, is_lost: false },
  { name: 'Closed Lost', slug: 'lost', position: 5, probability: 0, color_token: 'muted', is_won: false, is_lost: true },
];

export const STAGE_SLUG_TO_LEAD_STATUS: Record<string, Lead['status']> = {
  new: 'new',
  contacted: 'contacted',
  qualified: 'qualified',
  proposal: 'qualified',
  converted: 'converted',
  lost: 'lost',
};

export function mapStageToLeadStatus(stage: Pick<CrmStage, 'slug' | 'is_won' | 'is_lost'>): Lead['status'] {
  if (stage.is_won) return 'converted';
  if (stage.is_lost) return 'lost';
  return STAGE_SLUG_TO_LEAD_STATUS[stage.slug] || 'qualified';
}

/**
 * Transparent deterministic lead fit + intent score (0-100).
 */
export function computeLeadScore(
  lead: Partial<Lead>,
  signals?: { conversationsCount?: number; appointmentsCount?: number; ordersCount?: number; dealsCount?: number }
): number {
  let score = 25;
  if (lead.phone) score += 12;
  if (lead.email) score += 12;
  if (lead.website) score += 8;
  if (lead.company_name) score += 6;
  if (lead.ai_summary || lead.enriched_at) score += 5;

  const statusBoost: Record<string, number> = {
    new: 0,
    contacted: 8,
    qualified: 18,
    converted: 28,
    lost: -15,
  };
  score += statusBoost[lead.status || 'new'] ?? 0;

  if (signals?.conversationsCount) score += Math.min(10, signals.conversationsCount * 4);
  if (signals?.appointmentsCount) score += Math.min(15, signals.appointmentsCount * 8);
  if (signals?.ordersCount) score += Math.min(15, signals.ordersCount * 10);
  if (signals?.dealsCount) score += Math.min(8, signals.dealsCount * 4);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export class CrmService {
  /**
   * Ensures an organization has at least one default pipeline + canonical stages, returning all pipelines.
   */
  static async ensureDefaultPipeline(organizationId: string): Promise<CrmPipeline[]> {
    if (!isSupabaseAdminConfigured || !organizationId) return [];

    const { data: existing } = await supabaseAdmin
      .from('crm_pipelines')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    let pipelines = (existing || []) as CrmPipeline[];

    if (pipelines.length === 0) {
      const { data: inserted, error: pipeErr } = await supabaseAdmin
        .from('crm_pipelines')
        .insert({
          organization_id: organizationId,
          name: 'Revenue & Client Lifecycle',
          pipeline_type: 'dual',
          is_default: true,
        })
        .select('*')
        .maybeSingle();

      if (pipeErr) {
        const { data: retry } = await supabaseAdmin
          .from('crm_pipelines')
          .select('*')
          .eq('organization_id', organizationId);
        pipelines = (retry || []) as CrmPipeline[];
      } else if (inserted) {
        pipelines = [inserted as CrmPipeline];
      }
    }

    if (pipelines.length === 0) return [];

    const pipelineIds = pipelines.map((p) => p.id);
    const { data: existingStages } = await supabaseAdmin
      .from('crm_stages')
      .select('*')
      .in('pipeline_id', pipelineIds)
      .order('position', { ascending: true });

    let stages = (existingStages || []) as CrmStage[];

    // Seed default stages if default pipeline is empty
    const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
    const hasStagesForDefault = stages.some((s) => s.pipeline_id === defaultPipeline.id);
    if (!hasStagesForDefault) {
      const rows = DEFAULT_PIPELINE_STAGES.map((s) => ({
        ...s,
        pipeline_id: defaultPipeline.id,
        organization_id: organizationId,
      }));
      const { data: seededStages } = await supabaseAdmin
        .from('crm_stages')
        .upsert(rows, { onConflict: 'pipeline_id,slug' })
        .select('*');
      if (seededStages) {
        stages = [...stages, ...(seededStages as CrmStage[])].sort((a, b) => a.position - b.position);
      }
    }

    return pipelines.map((p) => ({
      ...p,
      stages: stages.filter((s) => s.pipeline_id === p.id).sort((a, b) => a.position - b.position),
    }));
  }

  /**
   * Lists organization teammates from organization_members + profiles for deal/lead assignment.
   */
  static async listOrgTeamMembers(organizationId: string): Promise<CrmTeamMember[]> {
    if (!isSupabaseAdminConfigured || !organizationId) return [];

    const { data: members } = await supabaseAdmin
      .from('organization_members')
      .select('user_id, role')
      .eq('organization_id', organizationId);

    const userIds = Array.from(new Set((members || []).map((m) => m.user_id).filter(Boolean)));
    if (userIds.length === 0) return [];

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, owner_name, business_name, email')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    return (members || []).map((m) => {
      const p = profileMap.get(m.user_id);
      return {
        userId: m.user_id,
        name: p?.owner_name || p?.email || 'Team Member',
        email: p?.email || null,
        role: m.role || 'member',
      };
    });
  }

  /**
   * Writes an immutable timeline event to crm_activities.
   */
  static async recordActivity(params: {
    organizationId: string;
    leadId: string;
    dealId?: string | null;
    actorId?: string | null;
    activityType: CrmActivityType;
    title: string;
    body?: string | null;
    metadata?: Record<string, any>;
  }): Promise<CrmActivity | null> {
    if (!isSupabaseAdminConfigured || !params.organizationId || !params.leadId) return null;

    try {
      const { data, error } = await supabaseAdmin
        .from('crm_activities')
        .insert({
          organization_id: params.organizationId,
          lead_id: params.leadId,
          deal_id: params.dealId || null,
          actor_id: params.actorId || null,
          activity_type: params.activityType,
          title: params.title,
          body: params.body || null,
          metadata: params.metadata || {},
        })
        .select('*')
        .maybeSingle();

      if (error) {
        console.warn('[CrmService] recordActivity failed:', error.message);
        return null;
      }
      return data as CrmActivity;
    } catch {
      return null;
    }
  }

  /**
   * Automatically advances lead status, pipeline stage, and active sequence enrollments
   * when external app events occur (inbound message, AI slot check, booking, order).
   */
  static async advanceLeadOnEvent(params: {
    organizationId: string;
    leadId?: string | null;
    event: 'inbound_message' | 'outbound_message' | 'booking_created' | 'order_created' | 'qualified';
    channel?: string;
    title?: string;
    body?: string;
    valueDelta?: number;
    actorId?: string | null;
  }): Promise<void> {
    if (!isSupabaseAdminConfigured || !params.organizationId || !params.leadId) return;

    try {
      const [{ data: lead }, pipelines] = await Promise.all([
        supabaseAdmin
          .from('leads')
          .select('*')
          .eq('id', params.leadId)
          .maybeSingle(),
        this.ensureDefaultPipeline(params.organizationId),
      ]);

      if (!lead) return;

      const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
      const stages = defaultPipeline?.stages || [];

      const rank: Record<string, number> = {
        new: 0,
        contacted: 1,
        qualified: 2,
        converted: 3,
        lost: -1,
      };

      let targetStatus: Lead['status'] = lead.status;
      if (params.event === 'booking_created' || params.event === 'order_created') {
        targetStatus = 'converted';
      } else if (params.event === 'qualified' && (rank[lead.status] ?? 0) < rank.qualified) {
        targetStatus = 'qualified';
      } else if (
        (params.event === 'inbound_message' || params.event === 'outbound_message') &&
        (rank[lead.status] ?? 0) < rank.contacted
      ) {
        targetStatus = 'contacted';
      }

      const targetSlug = targetStatus === 'converted' ? 'converted' : targetStatus;
      const targetStage = stages.find((s) => s.slug === targetSlug) || stages[0];
      const nextDealValue =
        typeof params.valueDelta === 'number' && params.valueDelta > 0
          ? Number(lead.deal_value || 0) + params.valueDelta
          : Number(lead.deal_value || 0);

      const nextScore = computeLeadScore({ ...lead, status: targetStatus }, {
        appointmentsCount: params.event === 'booking_created' ? 1 : 0,
        ordersCount: params.event === 'order_created' ? 1 : 0,
        conversationsCount: params.event === 'inbound_message' ? 1 : 0,
      });

      const updates: Record<string, any> = {
        status: targetStatus,
        score: Math.max(lead.score || 0, nextScore),
        last_contact_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (defaultPipeline) updates.pipeline_id = lead.pipeline_id || defaultPipeline.id;
      if (targetStage) updates.stage_id = targetStage.id;
      if (nextDealValue > Number(lead.deal_value || 0)) updates.deal_value = nextDealValue;

      await supabaseAdmin.from('leads').update(updates).eq('id', lead.id);

      // Sync open deals stage/won state
      if (targetStage) {
        const dealUpdates: Record<string, any> = {
          stage_id: targetStage.id,
          probability: targetStage.probability,
          updated_at: new Date().toISOString(),
        };
        if (targetStage.is_won) {
          dealUpdates.status = 'won';
        }
        await supabaseAdmin
          .from('crm_deals')
          .update(dealUpdates)
          .eq('organization_id', params.organizationId)
          .eq('lead_id', lead.id)
          .eq('status', 'open');
      }

      // Stop/mark active outreach sequences as replied on inbound message or conversion
      if (params.event === 'inbound_message' || params.event === 'booking_created' || params.event === 'order_created') {
        const enrollmentStatus = params.event === 'inbound_message' ? 'replied' : 'completed';
        await supabaseAdmin
          .from('crm_sequence_enrollments')
          .update({ status: enrollmentStatus, next_run_at: null, updated_at: new Date().toISOString() })
          .eq('organization_id', params.organizationId)
          .eq('lead_id', lead.id)
          .eq('status', 'active');
      }

      const activityTypeMap: Record<string, CrmActivityType> = {
        inbound_message:
          params.channel?.toLowerCase() === 'instagram'
            ? 'instagram'
            : params.channel?.toLowerCase() === 'email'
              ? 'email'
              : 'whatsapp',
        outbound_message:
          params.channel?.toLowerCase() === 'instagram'
            ? 'instagram'
            : params.channel?.toLowerCase() === 'email'
              ? 'email'
              : 'whatsapp',
        booking_created: 'booking',
        order_created: 'order',
        qualified: 'stage_change',
      };

      await this.recordActivity({
        organizationId: params.organizationId,
        leadId: lead.id,
        actorId: params.actorId || null,
        activityType: activityTypeMap[params.event] || 'note',
        title: params.title || `Pipeline updated to ${targetStatus}`,
        body: params.body || null,
        metadata: { event: params.event, channel: params.channel, newStatus: targetStatus },
      });
    } catch (err) {
      console.warn('[CrmService] advanceLeadOnEvent warning:', err);
    }
  }

  /**
   * Lists org-scoped leads, deals, pipelines, team members, and aggregated analytics.
   */
  static async listSnapshot(params: {
    organizationId: string;
    userId: string;
    search?: string;
    status?: string;
    source?: string;
    ownerId?: string;
  }): Promise<{
    leads: Lead[];
    deals: CrmDeal[];
    pipelines: CrmPipeline[];
    teamMembers: CrmTeamMember[];
    analytics: CrmAnalyticsSummary;
  }> {
    const { organizationId, userId } = params;
    const [pipelines, teamMembers] = await Promise.all([
      this.ensureDefaultPipeline(organizationId),
      this.listOrgTeamMembers(organizationId),
    ]);

    const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
    const defaultStages = defaultPipeline?.stages || [];

    const [{ data: rawLeads }, { data: rawDeals }] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('*')
        .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(500),
      supabaseAdmin
        .from('crm_deals')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(500),
    ]);

    const allLeads = (rawLeads || []) as Lead[];
    const leadMap = new Map(allLeads.map((l) => [l.id, l]));

    const allDeals = ((rawDeals || []) as CrmDeal[]).map((d) => ({
      ...d,
      value: Number(d.value || 0),
      lead: leadMap.get(d.lead_id) || null,
    }));

    // Auto-build stage analytics combining deals + leads without deals so analytics stay accurate
    const dealLeadIds = new Set(allDeals.map((d) => d.lead_id));
    const stageBreakdown = defaultStages.map((stage) => {
      const stageDeals = allDeals.filter((d) => d.stage_id === stage.id);
      const stageLeadsWithoutDeal = allLeads.filter((l) => {
        if (dealLeadIds.has(l.id)) return false;
        if (l.stage_id) return l.stage_id === stage.id;
        return l.status === mapStageToLeadStatus(stage) && !(l.status === 'qualified' && stage.slug === 'proposal');
      });

      const valueFromDeals = stageDeals.reduce((acc, d) => acc + Number(d.value || 0), 0);
      const valueFromLeads = stageLeadsWithoutDeal.reduce((acc, l) => acc + Number(l.deal_value || 0), 0);
      const value = valueFromDeals + valueFromLeads;
      const count = stageDeals.length + stageLeadsWithoutDeal.length;

      return {
        stageId: stage.id,
        stageName: stage.name,
        slug: stage.slug,
        count,
        value,
        weightedValue: Math.round((value * stage.probability) / 100),
        probability: stage.probability,
      };
    });

    const sourceMap = new Map<string, { source: string; count: number; totalValue: number; convertedCount: number }>();
    for (const lead of allLeads) {
      const key = lead.source || 'manual';
      const entry = sourceMap.get(key) || { source: key, count: 0, totalValue: 0, convertedCount: 0 };
      entry.count++;
      entry.totalValue += Number(lead.deal_value || 0);
      if (lead.status === 'converted') entry.convertedCount++;
      sourceMap.set(key, entry);
    }

    const memberNameMap = new Map(teamMembers.map((m) => [m.userId, m.name]));
    const ownerMap = new Map<string, { ownerId: string | null; ownerName: string; dealsCount: number; pipelineValue: number; wonRevenue: number }>();
    for (const deal of allDeals) {
      const key = deal.owner_id || 'unassigned';
      const existing = ownerMap.get(key) || {
        ownerId: deal.owner_id || null,
        ownerName: deal.owner_id ? memberNameMap.get(deal.owner_id) || 'Team Member' : 'Unassigned',
        dealsCount: 0,
        pipelineValue: 0,
        wonRevenue: 0,
      };
      existing.dealsCount++;
      if (deal.status === 'won') existing.wonRevenue += Number(deal.value || 0);
      else if (deal.status === 'open') existing.pipelineValue += Number(deal.value || 0);
      ownerMap.set(key, existing);
    }

    const openDeals = allDeals.filter((d) => d.status === 'open');
    const wonDeals = allDeals.filter((d) => d.status === 'won');
    const lostDeals = allDeals.filter((d) => d.status === 'lost');
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const weightedPipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value || 0) * Number(d.probability || 0)) / 100, 0);
    const wonRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const closedCount = wonDeals.length + lostDeals.length;

    const searchLower = params.search?.trim().toLowerCase() || '';
    const filteredLeads = allLeads.filter((l) => {
      if (params.status && params.status !== 'all' && l.status !== params.status) return false;
      if (params.source && params.source !== 'all' && l.source !== params.source) return false;
      if (params.ownerId && params.ownerId !== 'all' && l.owner_id !== params.ownerId) return false;
      if (searchLower) {
        const hay = `${l.name} ${l.email || ''} ${l.phone || ''} ${l.company_name || ''} ${l.city || ''}`.toLowerCase();
        if (!hay.includes(searchLower)) return false;
      }
      return true;
    });

    const filteredLeadIds = new Set(filteredLeads.map((l) => l.id));
    const filteredDeals = allDeals.filter((d) => {
      if (params.ownerId && params.ownerId !== 'all' && d.owner_id !== params.ownerId) return false;
      if (searchLower || (params.status && params.status !== 'all') || (params.source && params.source !== 'all')) {
        return filteredLeadIds.has(d.lead_id);
      }
      return true;
    });

    const avgScore =
      allLeads.length > 0
        ? Math.round(allLeads.reduce((s, l) => s + Number(l.score || 0), 0) / allLeads.length)
        : 0;

    return {
      leads: filteredLeads,
      deals: filteredDeals,
      pipelines,
      teamMembers,
      analytics: {
        totalLeads: allLeads.length,
        openDealsCount: openDeals.length,
        totalPipelineValue: Math.round(totalPipelineValue),
        weightedPipelineValue: Math.round(weightedPipelineValue),
        wonRevenue: Math.round(wonRevenue),
        wonDealsCount: wonDeals.length,
        lostDealsCount: lostDeals.length,
        winRatePercent: closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0,
        averageLeadScore: avgScore,
        stageBreakdown,
        sourceBreakdown: Array.from(sourceMap.values()).sort((a, b) => b.count - a.count),
        ownerBreakdown: Array.from(ownerMap.values()).sort((a, b) => b.pipelineValue + b.wonRevenue - (a.pipelineValue + a.wonRevenue)),
      },
    };
  }

  /**
   * Aggregates unified 360° Customer Workspace across every StarX Flow module for one lead.
   */
  static async getLeadWorkspace360(
    organizationId: string,
    userId: string,
    leadId: string
  ): Promise<LeadWorkspace360 | null> {
    if (!isSupabaseAdminConfigured) return null;

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
      .maybeSingle();

    if (!lead) return null;

    const [
      pipelines,
      teamMembers,
      identities,
      duplicates,
      dealsRes,
      activitiesRes,
      convosRes,
      apptsRes,
      ordersRes,
      enrollmentsRes,
    ] = await Promise.all([
      this.ensureDefaultPipeline(organizationId),
      this.listOrgTeamMembers(organizationId),
      IdentityResolver.getCustomerIdentities(userId, leadId, organizationId),
      IdentityResolver.detectPotentialDuplicates(userId, leadId, organizationId),
      supabaseAdmin.from('crm_deals').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabaseAdmin.from('crm_activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(80),
      supabaseAdmin.from('conversations').select('*').eq('lead_id', leadId).order('last_message_at', { ascending: false }),
      supabaseAdmin.from('appointments').select('*').eq('lead_id', leadId).order('start_time', { ascending: false }),
      supabaseAdmin.from('orders').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabaseAdmin
        .from('crm_sequence_enrollments')
        .select('*, sequence:crm_sequences(id, name, channel, steps)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
    ]);

    // Fetch tasks linked explicitly by lead_id OR matching lead contact
    const { data: tasksData } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    return {
      lead: lead as Lead,
      deals: (dealsRes.data || []) as CrmDeal[],
      activities: (activitiesRes.data || []) as CrmActivity[],
      conversations: (convosRes.data || []) as any[],
      appointments: (apptsRes.data || []) as any[],
      orders: (ordersRes.data || []) as any[],
      tasks: (tasksData || []) as any[],
      enrollments: (enrollmentsRes.data || []) as CrmSequenceEnrollment[],
      identities: identities.map((i) => ({
        ...i,
        organization_id: organizationId,
        verified_at: i.verified_at || null,
        updated_at: (i as { updated_at?: string }).updated_at || i.created_at,
      })) as LeadWorkspace360['identities'],
      duplicates,
      teamMembers,
      pipelines,
    };
  }
}
