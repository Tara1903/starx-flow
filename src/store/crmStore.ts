'use client';

import { create } from 'zustand';
import { Lead } from '../types/database';
import type {
  CrmAnalyticsSummary,
  CrmDeal,
  CrmPipeline,
  CrmSequence,
  CrmSequenceEnrollment,
  CrmSequenceEnrollmentStatus,
  CrmSequenceStep,
  CrmSequenceTriggerType,
  CrmSequenceChannel,
  CrmTeamMember,
  LeadFinderCandidate,
  LeadWorkspace360,
} from '../types/crm';
import { useAuthStore } from './authStore';
import { useAdminStore } from './adminStore';
import { crmFetch } from '../lib/crm/crmApi';

export type CrmWorkspaceTab = 'pipeline' | 'directory' | 'finder' | 'sequences' | 'analytics';

export interface CreateLeadPayload extends Partial<Lead> {
  name: string;
  companyName?: string | null;
  jobTitle?: string | null;
  dealValue?: number;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string | null;
  createDeal?: boolean;
  dealTitle?: string;
}

interface CrmState {
  // Core Directory & Snapshot
  leads: Lead[];
  deals: CrmDeal[];
  pipelines: CrmPipeline[];
  teamMembers: CrmTeamMember[];
  analytics: CrmAnalyticsSummary | null;
  selectedPipelineId: string | null;
  activeTab: CrmWorkspaceTab;

  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
  sourceFilter: string;
  ownerFilter: string;

  // 360° Customer Dossier Drawer
  selectedLeadId: string | null;
  workspace: LeadWorkspace360 | null;
  workspaceLoading: boolean;

  // Open Lead Finder
  finderResults: LeadFinderCandidate[];
  finderLoading: boolean;
  finderLocationLabel: string | null;
  finderProvider: string | null;
  finderError: string | null;

  // Automated Sequences
  sequences: CrmSequence[];
  enrollments: CrmSequenceEnrollment[];
  sequencesLoading: boolean;

  // Navigation & Filters
  setActiveTab: (tab: CrmWorkspaceTab) => void;
  setSelectedPipelineId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setSourceFilter: (source: string) => void;
  setOwnerFilter: (ownerId: string) => void;

  // Snapshot & CRUD
  fetchLeads: () => Promise<void>;
  createLead: (
    lead: CreateLeadPayload
  ) => Promise<{ lead: Lead | null; error: string | null }>;
  updateLead: (
    id: string,
    updates: Partial<Lead> & { stageId?: string; ownerId?: string | null; dealValue?: number }
  ) => Promise<{ error: string | null }>;
  deleteLead: (id: string) => Promise<{ error: string | null }>;
  importLeads: (
    leads: Partial<Lead>[]
  ) => Promise<{ imported: number; error: string | null }>;

  // Deals & Kanban Actions
  createDeal: (input: {
    leadId: string;
    title: string;
    value: number;
    pipelineId?: string;
    stageId?: string;
    ownerId?: string | null;
    expectedCloseAt?: string | null;
  }) => Promise<{ deal: CrmDeal | null; error: string | null }>;
  moveDealStage: (dealId: string, stageId: string) => Promise<{ error: string | null }>;
  moveLeadStage: (leadId: string, stageId: string) => Promise<{ error: string | null }>;
  updateDeal: (
    dealId: string,
    updates: {
      title?: string;
      stageId?: string;
      ownerId?: string | null;
      value?: number;
      status?: 'open' | 'won' | 'lost';
      lostReason?: string | null;
    }
  ) => Promise<{ error: string | null }>;
  deleteDeal: (dealId: string) => Promise<{ error: string | null }>;

  // 360° Drawer Workspace & Cross-App Actions
  openLeadDrawer: (leadId: string) => Promise<void>;
  closeLeadDrawer: () => void;
  runLeadAction: (
    leadId: string,
    payload:
      | { action: 'add_note'; dealId?: string | null; body: string; saveToLeadNotes?: boolean }
      | {
          action: 'create_task';
          dealId?: string | null;
          title: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high';
          dueDate?: string | null;
        }
      | {
          action: 'create_booking';
          serviceType: string;
          startTime: string;
          endTime: string;
          notes?: string;
          dealValue?: number;
        }
      | {
          action: 'send_message';
          channel: 'WhatsApp' | 'Email' | 'Instagram';
          text: string;
          subject?: string;
        }
      | { action: 'enrich_website'; website?: string }
  ) => Promise<{ ok: boolean; error: string | null }>;

  // Lead Finder Actions
  searchProspects: (params: {
    niche: string;
    city: string;
    country?: string;
    limit?: number;
    enrichWebsites?: boolean;
  }) => Promise<{ ok: boolean; error: string | null }>;
  importFinderCandidates: (params: {
    candidates: LeadFinderCandidate[];
    pipelineId?: string;
    stageId?: string;
    defaultDealValue?: number;
    listName?: string;
    sequenceId?: string;
  }) => Promise<{ importedCount: number; skippedDuplicates: number; error: string | null }>;

  // Sequence Actions
  fetchSequences: () => Promise<void>;
  createSequence: (input: {
    name: string;
    description?: string;
    triggerType: CrmSequenceTriggerType;
    channel: CrmSequenceChannel;
    steps: CrmSequenceStep[];
  }) => Promise<{ ok: boolean; error: string | null }>;
  toggleSequenceActive: (id: string, isActive: boolean) => Promise<{ ok: boolean; error: string | null }>;
  updateEnrollmentStatus: (
    enrollmentId: string,
    sequenceId: string,
    status: 'active' | 'paused' | 'stopped'
  ) => Promise<{ ok: boolean; error: string | null }>;
  deleteSequence: (id: string) => Promise<{ ok: boolean; error: string | null }>;
  enrollLeadsInSequence: (
    sequenceId: string,
    leadIds: string[]
  ) => Promise<{ enrolled: number; skipped: number; error: string | null }>;
}

function makeIdemKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}:${crypto.randomUUID()}`;
  }
  return `${prefix}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  leads: [],
  deals: [],
  pipelines: [],
  teamMembers: [],
  analytics: null,
  selectedPipelineId: null,
  activeTab: 'pipeline',

  loading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  sourceFilter: 'all',
  ownerFilter: 'all',

  selectedLeadId: null,
  workspace: null,
  workspaceLoading: false,

  finderResults: [],
  finderLoading: false,
  finderLocationLabel: null,
  finderProvider: null,
  finderError: null,

  sequences: [],
  enrollments: [],
  sequencesLoading: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedPipelineId: (selectedPipelineId) => set({ selectedPipelineId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  setOwnerFilter: (ownerFilter) => set({ ownerFilter }),

  fetchLeads: async () => {
    const user = useAuthStore.getState().user;
    const isAdmin = useAdminStore.getState().isAdmin;
    if (!user && !isAdmin) return;

    set({ loading: true, error: null });
    const res = await crmFetch<{
      leads: Lead[];
      deals: CrmDeal[];
      pipelines: CrmPipeline[];
      teamMembers: CrmTeamMember[];
      analytics: CrmAnalyticsSummary;
    }>('/api/crm/leads');

    if (res.ok && res.data) {
      const pipelines = res.data.pipelines || [];
      const currentPid = get().selectedPipelineId;
      const validPid =
        pipelines.find((p) => p.id === currentPid)?.id ||
        pipelines.find((p) => p.is_default)?.id ||
        pipelines[0]?.id ||
        null;

      set({
        leads: res.data.leads || [],
        deals: res.data.deals || [],
        pipelines,
        teamMembers: res.data.teamMembers || [],
        analytics: res.data.analytics || null,
        selectedPipelineId: validPid,
        loading: false,
      });
    } else {
      set({ error: res.error || 'Could not load CRM data', loading: false });
    }
  },

  createLead: async (leadData) => {
    const user = useAuthStore.getState().user;
    if (!user) return { lead: null, error: 'User not logged in' };

    const res = await crmFetch<{ lead: Lead; deal?: CrmDeal | null }>('/api/crm/leads', {
      method: 'POST',
      idempotencyKey: makeIdemKey('lead-create'),
      body: JSON.stringify({
        name: leadData.name,
        phone: leadData.phone || null,
        email: leadData.email || null,
        status: leadData.status || 'new',
        source: leadData.source || 'manual',
        score: leadData.score,
        tags: leadData.tags || [],
        notes: leadData.notes || null,
        companyName: leadData.companyName ?? leadData.company_name ?? null,
        jobTitle: leadData.jobTitle ?? leadData.job_title ?? null,
        website: leadData.website || null,
        city: leadData.city || null,
        country: leadData.country || null,
        industry: leadData.industry || null,
        ownerId: leadData.ownerId ?? leadData.owner_id ?? user.id,
        dealValue: Number(leadData.dealValue ?? leadData.deal_value ?? 0),
        pipelineId: leadData.pipelineId || get().selectedPipelineId || undefined,
        stageId: leadData.stageId || leadData.stage_id || undefined,
        createDeal: leadData.createDeal ?? Number(leadData.dealValue ?? leadData.deal_value ?? 0) > 0,
        dealTitle: leadData.dealTitle,
      }),
    });

    if (!res.ok || !res.data?.lead) {
      return { lead: null, error: res.error || 'Failed to create customer' };
    }

    await get().fetchLeads();
    return { lead: res.data.lead, error: null };
  },

  updateLead: async (id, updates) => {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.score !== undefined) payload.score = updates.score;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.company_name !== undefined) payload.companyName = updates.company_name;
    if (updates.job_title !== undefined) payload.jobTitle = updates.job_title;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if ((updates.ownerId ?? updates.owner_id) !== undefined) {
      payload.ownerId = updates.ownerId !== undefined ? updates.ownerId : updates.owner_id;
    }
    if ((updates.dealValue ?? updates.deal_value) !== undefined) {
      payload.dealValue = Number(updates.dealValue !== undefined ? updates.dealValue : updates.deal_value);
    }
    if ((updates.stageId ?? updates.stage_id) !== undefined) {
      payload.stageId = updates.stageId !== undefined ? updates.stageId : updates.stage_id;
    }
    if (updates.next_follow_up_at !== undefined) {
      payload.nextFollowUpAt = updates.next_follow_up_at;
    }

    const res = await crmFetch<{ lead: Lead }>(`/api/crm/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (!res.ok || !res.data?.lead) {
      return { error: res.error || 'Failed to update customer' };
    }

    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? res.data!.lead : l)),
    }));
    await get().fetchLeads();
    if (get().selectedLeadId === id) {
      void get().openLeadDrawer(id);
    }
    return { error: null };
  },

  deleteLead: async (id) => {
    const res = await crmFetch(`/api/crm/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      return { error: res.error || 'Failed to delete customer' };
    }
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
      deals: state.deals.filter((d) => d.lead_id !== id),
      selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId,
      workspace: state.selectedLeadId === id ? null : state.workspace,
    }));
    await get().fetchLeads();
    return { error: null };
  },

  importLeads: async (newLeads) => {
    const items = newLeads.map((l) => ({
      name: l.name || 'Unnamed Contact',
      phone: l.phone || null,
      email: l.email || null,
      status: l.status || 'new',
      source: l.source || 'csv_import',
      score: l.score,
      tags: l.tags || ['imported'],
      notes: l.notes || null,
      companyName: l.company_name || null,
      city: l.city || null,
      industry: l.industry || null,
      dealValue: Number(l.deal_value || 0),
    }));

    const res = await crmFetch<{ imported: number; leads: Lead[] }>('/api/crm/leads', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      return { imported: 0, error: res.error || 'CSV import failed' };
    }

    await get().fetchLeads();
    return { imported: res.data?.imported || items.length, error: null };
  },

  createDeal: async (input) => {
    const res = await crmFetch<{ deal: CrmDeal }>('/api/crm/deals', {
      method: 'POST',
      idempotencyKey: makeIdemKey('deal-create'),
      body: JSON.stringify(input),
    });
    if (!res.ok || !res.data?.deal) {
      return { deal: null, error: res.error || 'Failed to create deal' };
    }
    await get().fetchLeads();
    if (get().selectedLeadId === input.leadId) {
      void get().openLeadDrawer(input.leadId);
    }
    return { deal: res.data.deal, error: null };
  },

  moveDealStage: async (dealId, stageId) => {
    const previousDeals = get().deals;
    const pipelines = get().pipelines;
    const targetStage = pipelines.flatMap((p) => p.stages || []).find((s) => s.id === stageId);

    // Optimistic board movement so Kanban drags feel instantaneous
    set({
      deals: previousDeals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage_id: stageId,
              probability: targetStage?.probability ?? d.probability,
              status: targetStage?.is_won ? 'won' : targetStage?.is_lost ? 'lost' : 'open',
            }
          : d
      ),
    });

    const res = await crmFetch(`/api/crm/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stageId }),
    });

    if (!res.ok) {
      set({ deals: previousDeals });
      return { error: res.error || 'Failed to move deal stage' };
    }

    await get().fetchLeads();
    return { error: null };
  },

  moveLeadStage: async (leadId, stageId) => {
    const res = await crmFetch(`/api/crm/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stageId }),
    });
    if (!res.ok) {
      return { error: res.error || 'Failed to move customer stage' };
    }
    await get().fetchLeads();
    return { error: null };
  },

  updateDeal: async (dealId, updates) => {
    const res = await crmFetch(`/api/crm/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      return { error: res.error || 'Failed to update deal' };
    }
    await get().fetchLeads();
    return { error: null };
  },

  deleteDeal: async (dealId) => {
    const res = await crmFetch(`/api/crm/deals/${dealId}`, { method: 'DELETE' });
    if (!res.ok) {
      return { error: res.error || 'Failed to delete deal' };
    }
    await get().fetchLeads();
    return { error: null };
  },

  openLeadDrawer: async (leadId) => {
    set({ selectedLeadId: leadId, workspaceLoading: true });
    const res = await crmFetch<{ workspace: LeadWorkspace360 }>(`/api/crm/leads/${leadId}/workspace`);
    if (res.ok && res.data?.workspace) {
      set({ workspace: res.data.workspace, workspaceLoading: false });
    } else {
      set({ workspaceLoading: false, error: res.error || 'Could not load 360 customer dossier' });
    }
  },

  closeLeadDrawer: () => set({ selectedLeadId: null, workspace: null, workspaceLoading: false }),

  runLeadAction: async (leadId, payload) => {
    const res = await crmFetch(`/api/crm/leads/${leadId}/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Action failed' };
    }
    await Promise.all([get().openLeadDrawer(leadId), get().fetchLeads()]);
    return { ok: true, error: null };
  },

  searchProspects: async (params) => {
    set({ finderLoading: true, finderError: null });
    const res = await crmFetch<{
      candidates: LeadFinderCandidate[];
      locationLabel: string;
      provider: string;
    }>('/api/crm/finder/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!res.ok || !res.data) {
      const msg = res.error || 'Lead discovery search failed';
      set({ finderLoading: false, finderError: msg });
      return { ok: false, error: msg };
    }

    set({
      finderResults: res.data.candidates || [],
      finderLocationLabel: res.data.locationLabel || params.city,
      finderProvider: res.data.provider || 'overpass',
      finderLoading: false,
      finderError: null,
    });
    return { ok: true, error: null };
  },

  importFinderCandidates: async (params) => {
    const res = await crmFetch<{ importedCount: number; skippedDuplicates: number }>(
      '/api/crm/finder/import',
      {
        method: 'POST',
        idempotencyKey: makeIdemKey('finder-import'),
        body: JSON.stringify(params),
      }
    );

    if (!res.ok || !res.data) {
      return { importedCount: 0, skippedDuplicates: 0, error: res.error || 'Import failed' };
    }

    const importedIds = new Set(params.candidates.map((c) => c.externalId));
    set((state) => ({
      finderResults: state.finderResults.map((c) =>
        importedIds.has(c.externalId) ? { ...c, alreadyInCrm: true } : c
      ),
    }));

    await Promise.all([get().fetchLeads(), get().fetchSequences()]);
    return {
      importedCount: res.data.importedCount,
      skippedDuplicates: res.data.skippedDuplicates,
      error: null,
    };
  },

  fetchSequences: async () => {
    const user = useAuthStore.getState().user;
    const isAdmin = useAdminStore.getState().isAdmin;
    if (!user && !isAdmin) return;
    set({ sequencesLoading: true });
    const res = await crmFetch<{ sequences: CrmSequence[]; enrollments: CrmSequenceEnrollment[] }>(
      '/api/crm/sequences'
    );
    if (res.ok && res.data) {
      set({
        sequences: res.data.sequences || [],
        enrollments: res.data.enrollments || [],
        sequencesLoading: false,
      });
    } else {
      set({ sequencesLoading: false });
    }
  },

  createSequence: async (input) => {
    const res = await crmFetch<{ sequence: CrmSequence }>('/api/crm/sequences', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Failed to create sequence' };
    }
    await get().fetchSequences();
    return { ok: true, error: null };
  },

  toggleSequenceActive: async (id, isActive) => {
    const res = await crmFetch('/api/crm/sequences', {
      method: 'PATCH',
      body: JSON.stringify({ id, isActive }),
    });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Failed to update sequence' };
    }
    set((state) => ({
      sequences: state.sequences.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)),
    }));
    return { ok: true, error: null };
  },

  updateEnrollmentStatus: async (enrollmentId, sequenceId, status) => {
    const res = await crmFetch('/api/crm/sequences', {
      method: 'PATCH',
      body: JSON.stringify({ id: sequenceId, enrollmentId, enrollmentStatus: status }),
    });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Failed to update enrollment' };
    }
    set((state) => ({
      enrollments: state.enrollments.map((e) =>
        e.id === enrollmentId ? { ...e, status: status as CrmSequenceEnrollmentStatus } : e
      ),
    }));
    await get().fetchSequences();
    return { ok: true, error: null };
  },

  deleteSequence: async (id) => {
    const res = await crmFetch(`/api/crm/sequences?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Failed to delete sequence' };
    }
    set((state) => ({
      sequences: state.sequences.filter((s) => s.id !== id),
    }));
    return { ok: true, error: null };
  },

  enrollLeadsInSequence: async (sequenceId, leadIds) => {
    const res = await crmFetch<{ enrolled: number; skipped: number }>(
      `/api/crm/sequences/${sequenceId}/enroll`,
      {
        method: 'POST',
        idempotencyKey: makeIdemKey('enroll'),
        body: JSON.stringify({ leadIds }),
      }
    );
    if (!res.ok || !res.data) {
      return { enrolled: 0, skipped: 0, error: res.error || 'Enrollment failed' };
    }
    await get().fetchSequences();
    return { enrolled: res.data.enrolled, skipped: res.data.skipped, error: null };
  },
}));
