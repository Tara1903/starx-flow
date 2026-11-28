'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Briefcase,
  Building2,
  Download,
  ExternalLink,
  Instagram,
  Kanban,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Workflow,
  Globe,
} from 'lucide-react';
import { useCrmStore, type CrmWorkspaceTab } from '@/store/crmStore';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import type { Lead } from '@/types/database';
import { GlassModal } from '@/components/ui/GlassModal';
import { CrmPipelineBoard } from '@/components/crm/CrmPipelineBoard';
import { CrmLeadFinderView } from '@/components/crm/CrmLeadFinderView';
import { CrmSequencesView } from '@/components/crm/CrmSequencesView';
import { CrmAnalyticsView } from '@/components/crm/CrmAnalyticsView';
import { CrmLeadDrawer } from '@/components/crm/CrmLeadDrawer';
import {
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_INPUT,
  CONSOLE_PANEL,
  CONSOLE_PANEL_FLUSH,
  CONSOLE_ROW,
} from '@/lib/consoleSurface';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<Lead['status'], string> = {
  new: CONSOLE_BADGE_INFO,
  contacted: CONSOLE_BADGE_WARN,
  qualified: CONSOLE_BADGE_LIVE,
  converted: CONSOLE_BADGE_LIVE,
  lost: CONSOLE_BADGE_MUTED,
};

function SourceIcon({ source }: { source: string }) {
  if (source === 'whatsapp') return <MessageCircle className="w-3.5 h-3.5 text-[#34d399]" />;
  if (source === 'instagram') return <Instagram className="w-3.5 h-3.5 text-amber-300" />;
  if (source === 'sms') return <Phone className="w-3.5 h-3.5 text-[#a1aaa4]" />;
  if (source === 'outbound_finder') return <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />;
  return <Globe className="w-3.5 h-3.5 text-[#727c75]" />;
}

const CRM_TABS: Array<{ id: CrmWorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  { id: 'directory', label: 'Directory', icon: Users },
  { id: 'finder', label: 'Lead Finder', icon: Search },
  { id: 'sequences', label: 'Sequences', icon: Workflow },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function CrmSection() {
  const {
    leads,
    deals,
    pipelines,
    teamMembers,
    analytics,
    selectedPipelineId,
    activeTab,
    loading,
    error,
    searchQuery,
    statusFilter,
    sourceFilter,
    ownerFilter,
    selectedLeadId,
    workspace,
    workspaceLoading,
    finderResults,
    finderLoading,
    finderLocationLabel,
    finderProvider,
    finderError,
    sequences,
    enrollments,
    sequencesLoading,
    setActiveTab,
    setSearchQuery,
    setStatusFilter,
    setSourceFilter,
    setOwnerFilter,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    importLeads,
    createDeal,
    moveDealStage,
    moveLeadStage,
    openLeadDrawer,
    closeLeadDrawer,
    runLeadAction,
    searchProspects,
    importFinderCandidates,
    fetchSequences,
    createSequence,
    toggleSequenceActive,
    updateEnrollmentStatus,
    deleteSequence,
    enrollLeadsInSequence,
  } = useCrmStore();

  const user = useAuthStore((s) => s.user);
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Customer Modal State (preserves Cancel & Klaus Schneider placeholder behavior)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    industry: '',
    dealValue: '',
    stageId: '',
    notes: '',
  });
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // New Deal Modal State
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealForm, setDealForm] = useState({
    leadId: '',
    title: '',
    value: '1200',
    stageId: '',
  });

  useEffect(() => {
    if (user?.id || isAdmin) {
      void fetchLeads();
      void fetchSequences();
    }
  }, [user?.id, isAdmin, fetchLeads, fetchSequences]);

  const activePipeline = useMemo(
    () => pipelines.find((p) => p.id === selectedPipelineId) || pipelines.find((p) => p.is_default) || pipelines[0],
    [pipelines, selectedPipelineId]
  );

  const stages = useMemo(
    () => [...(activePipeline?.stages || [])].sort((a, b) => a.position - b.position),
    [activePipeline]
  );

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.company_name || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.phone || '').toLowerCase().includes(q) ||
        (lead.city || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesOwner = ownerFilter === 'all' || lead.owner_id === ownerFilter;
      return matchesSearch && matchesStatus && matchesSource && matchesOwner;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, ownerFilter]);

  const resetCustomerModal = () => {
    setShowAddModal(false);
    setModalError(null);
    setNewCustomer({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      website: '',
      city: '',
      industry: '',
      dealValue: '',
      stageId: '',
      notes: '',
    });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;
    setSubmittingCustomer(true);
    setModalError(null);
    try {
      const res = await createLead({
        name: newCustomer.name.trim(),
        companyName: newCustomer.companyName.trim() || null,
        phone: newCustomer.phone.trim() || null,
        email: newCustomer.email.trim() || null,
        website: newCustomer.website.trim() || null,
        city: newCustomer.city.trim() || null,
        industry: newCustomer.industry.trim() || null,
        dealValue: Number(newCustomer.dealValue) || 0,
        pipelineId: activePipeline?.id,
        stageId: newCustomer.stageId || stages[0]?.id,
        notes: newCustomer.notes.trim() || null,
        createDeal: Boolean(newCustomer.dealValue && Number(newCustomer.dealValue) > 0),
      });
      if (res.error) {
        setModalError(res.error);
        return;
      }
      resetCustomerModal();
    } finally {
      setSubmittingCustomer(false);
    }
  };

  const handleOpenNewDeal = (stageId?: string) => {
    setDealForm({
      leadId: leads[0]?.id || '',
      title: leads[0] ? `${leads[0].company_name || leads[0].name} — Retainer` : '',
      value: '1500',
      stageId: stageId || stages[0]?.id || '',
    });
    setShowDealModal(true);
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.leadId || !dealForm.title.trim()) return;
    await createDeal({
      leadId: dealForm.leadId,
      title: dealForm.title.trim(),
      value: Number(dealForm.value) || 0,
      pipelineId: activePipeline?.id,
      stageId: dealForm.stageId || stages[0]?.id,
    });
    setShowDealModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Phone', 'Email', 'City', 'Industry', 'Deal Value', 'Status', 'Source', 'Score'];
    const rows = filteredLeads.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      Number(l.deal_value || 0),
      l.status,
      l.source,
      l.score,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `starx-crm-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;
      const items = lines
        .slice(1)
        .map((line) => {
          const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          return {
            name: cols[0] || 'Imported Contact',
            phone: cols[1] || undefined,
            email: cols[2] || undefined,
            status: 'new' as const,
            notes: cols[3] || undefined,
          };
        })
        .filter((item) => item.name);
      if (items.length > 0) {
        await importLeads(items);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 tabular-nums">
      {/* Top CRM Header & Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <h1 className={CONSOLE_HEADING}>Revenue CRM & Customer Hub</h1>
          <p className="text-xs text-[#727c75] mt-0.5">
            Pipeline forecast, 360° customer intelligence, OpenStreetMap prospecting, and automated outreach sequences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchLeads()}
            className={CONSOLE_BTN_SECONDARY}
            title="Refresh CRM data"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Sync</span>
          </button>

          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleCsvUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={CONSOLE_BTN_SECONDARY}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button type="button" onClick={handleExportCSV} className={CONSOLE_BTN_SECONDARY}>
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button type="button" onClick={() => handleOpenNewDeal()} className={CONSOLE_BTN_SECONDARY}>
            <Briefcase className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setShowAddModal(true);
            }}
            className={CONSOLE_BTN_PRIMARY}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* View Switcher + Filter Bar */}
      <div className={cn(CONSOLE_PANEL, 'p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3')}>
        <div className="flex flex-wrap items-center gap-1 bg-[#0d1210] p-1 rounded-xl border border-[#edf0ee]/[0.08]">
          {CRM_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                activeTab === id
                  ? 'bg-[#19201d] text-[#34d399] border border-[#edf0ee]/10'
                  : 'text-[#a1aaa4] hover:text-[#edf0ee]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {(activeTab === 'pipeline' || activeTab === 'directory') && (
          <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#727c75] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts, companies, emails..."
                className={cn(CONSOLE_INPUT, 'w-full pl-8 pr-3 py-1.5 text-xs')}
              />
            </div>

            {activeTab === 'directory' && (
              <>
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs cursor-pointer')}
                >
                  <option value="all">All statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
                <select
                  aria-label="Filter by source"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs cursor-pointer')}
                >
                  <option value="all">All sources</option>
                  <option value="outbound_finder">Lead Finder</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">Email</option>
                  <option value="demo_request">Demo Request</option>
                  <option value="web_chat">Web Chat</option>
                  <option value="manual">Manual</option>
                  <option value="csv_import">CSV Import</option>
                </select>
              </>
            )}

            {teamMembers.length > 0 && (
              <select
                aria-label="Filter by deal owner"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className={cn(CONSOLE_INPUT, 'px-2.5 py-1.5 text-xs cursor-pointer')}
              >
                <option value="all">All owners</option>
                {teamMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-[#e5484d]/10 border border-[#e5484d]/25 px-4 py-3 text-xs text-[#f28b8e]">
          {error}
        </div>
      )}

      {/* Active Workspace Tab */}
      {activeTab === 'pipeline' && (
        <CrmPipelineBoard
          pipeline={activePipeline}
          deals={deals}
          leads={leads}
          teamMembers={teamMembers}
          analytics={analytics}
          searchQuery={searchQuery}
          ownerFilter={ownerFilter}
          onMoveDealStage={moveDealStage}
          onMoveLeadStage={moveLeadStage}
          onOpenLead={(id) => void openLeadDrawer(id)}
          onOpenNewDealModal={handleOpenNewDeal}
        />
      )}

      {activeTab === 'directory' && (
        <div className={CONSOLE_PANEL_FLUSH}>
          <div className="px-4 py-3 border-b border-[#edf0ee]/[0.08] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#edf0ee]">Customer directory</h2>
            <span className="text-xs text-[#727c75]">{filteredLeads.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#edf0ee]/[0.08] text-[11px] font-medium text-[#727c75]">
                  <th className="py-3 px-4">Customer & Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Fit Score</th>
                  <th className="py-3 px-4">Stage / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]/[0.06] text-xs">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center text-[#727c75]">
                      {loading
                        ? 'Loading customers...'
                        : 'No customers match the current filter. Try Open Lead Finder or Add Customer.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className={CONSOLE_ROW}>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => void openLeadDrawer(lead.id)}
                          className="text-left group cursor-pointer"
                        >
                          <p className="font-medium text-[#edf0ee] group-hover:text-[#34d399] transition-colors flex items-center gap-1.5">
                            <span>{lead.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          {(lead.company_name || lead.city) && (
                            <p className="text-[11px] text-[#727c75] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              {[lead.company_name, lead.city].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#a1aaa4] space-y-0.5">
                        {lead.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#727c75]" />
                            <span className="truncate max-w-[190px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#727c75]" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[#a1aaa4] capitalize">
                          <SourceIcon source={lead.source} />
                          <span>{lead.source.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#edf0ee]">
                        €{Math.round(Number(lead.deal_value || 0)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={lead.score >= 70 ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
                          {lead.score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          aria-label={`Status for ${lead.name}`}
                          value={lead.status}
                          onChange={(e) => void updateLead(lead.id, { status: e.target.value as Lead['status'] })}
                          className={cn(
                            STATUS_BADGE[lead.status] || CONSOLE_BADGE_MUTED,
                            'cursor-pointer outline-none bg-[#121715]'
                          )}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void openLeadDrawer(lead.id)}
                            className={CONSOLE_BTN_SECONDARY}
                          >
                            360° View
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteLead(lead.id)}
                            aria-label={`Delete ${lead.name}`}
                            className="p-1.5 rounded-lg text-[#727c75] hover:text-[#f28b8e] hover:bg-[#19201d] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'finder' && (
        <CrmLeadFinderView
          results={finderResults}
          loading={finderLoading}
          locationLabel={finderLocationLabel}
          provider={finderProvider}
          error={finderError}
          pipelines={pipelines}
          sequences={sequences}
          onSearch={searchProspects}
          onImport={importFinderCandidates}
        />
      )}

      {activeTab === 'sequences' && (
        <CrmSequencesView
          sequences={sequences}
          enrollments={enrollments}
          leads={leads}
          loading={sequencesLoading}
          onCreateSequence={createSequence}
          onToggleSequence={toggleSequenceActive}
          onUpdateEnrollmentStatus={updateEnrollmentStatus}
          onDeleteSequence={deleteSequence}
          onEnrollLeads={enrollLeadsInSequence}
        />
      )}

      {activeTab === 'analytics' && <CrmAnalyticsView analytics={analytics} />}

      {/* Add Customer & Optional Deal Modal */}
      <GlassModal
        open={showAddModal}
        onClose={resetCustomerModal}
        title="Add Customer to CRM"
        subtitle="Create a contact record and optionally attach a pipeline deal."
        maxWidth="lg"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          {modalError && (
            <div role="alert" className="rounded-lg bg-[#e5484d]/10 border border-[#e5484d]/25 px-3 py-2 text-xs text-[#f28b8e]">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Full name *</label>
              <input
                type="text"
                required
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="e.g. Klaus Schneider"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Company / business</label>
              <input
                type="text"
                value={newCustomer.companyName}
                onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                placeholder="e.g. Schneider Aesthetics GmbH"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Email address</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="klaus@company.de"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+49 170 0000000"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">City</label>
              <input
                type="text"
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                placeholder="Berlin"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Industry</label>
              <input
                type="text"
                value={newCustomer.industry}
                onChange={(e) => setNewCustomer({ ...newCustomer, industry: e.target.value })}
                placeholder="Beauty, Medical, SaaS..."
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Expected deal value (€)</label>
              <input
                type="number"
                min={0}
                value={newCustomer.dealValue}
                onChange={(e) => setNewCustomer({ ...newCustomer, dealValue: e.target.value })}
                placeholder="1500"
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Initial stage</label>
              <select
                value={newCustomer.stageId || stages[0]?.id || ''}
                onChange={(e) => setNewCustomer({ ...newCustomer, stageId: e.target.value })}
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#a1aaa4] mb-1">Website</label>
            <input
              type="text"
              value={newCustomer.website}
              onChange={(e) => setNewCustomer({ ...newCustomer, website: e.target.value })}
              placeholder="https://example.de"
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
            />
          </div>

          <div>
            <label className="block text-xs text-[#a1aaa4] mb-1">Context / notes</label>
            <textarea
              rows={2}
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
              placeholder="Any discovery context or requested services..."
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs resize-none')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={resetCustomerModal} className={CONSOLE_BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={submittingCustomer} className={CONSOLE_BTN_PRIMARY}>
              {submittingCustomer ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* New Deal Modal */}
      <GlassModal
        open={showDealModal}
        onClose={() => setShowDealModal(false)}
        title="Create Pipeline Deal"
        subtitle="Attach a tracked revenue opportunity to any CRM contact."
        maxWidth="md"
      >
        <form onSubmit={handleSaveDeal} className="space-y-4">
          <div>
            <label className="block text-xs text-[#a1aaa4] mb-1">Customer *</label>
            <select
              required
              value={dealForm.leadId}
              onChange={(e) => {
                const chosen = leads.find((l) => l.id === e.target.value);
                setDealForm({
                  ...dealForm,
                  leadId: e.target.value,
                  title: chosen ? `${chosen.company_name || chosen.name} — Deal` : dealForm.title,
                });
              }}
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
            >
              <option value="">Select customer...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.company_name ? `(${l.company_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#a1aaa4] mb-1">Deal title *</label>
            <input
              type="text"
              required
              value={dealForm.title}
              onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
              placeholder="e.g. Annual Receptionist Retainer"
              className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Deal value (€)</label>
              <input
                type="number"
                min={0}
                value={dealForm.value}
                onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs')}
              />
            </div>
            <div>
              <label className="block text-xs text-[#a1aaa4] mb-1">Stage</label>
              <select
                value={dealForm.stageId}
                onChange={(e) => setDealForm({ ...dealForm, stageId: e.target.value })}
                className={cn(CONSOLE_INPUT, 'w-full px-3 py-2 text-xs cursor-pointer')}
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowDealModal(false)} className={CONSOLE_BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" className={CONSOLE_BTN_PRIMARY}>
              Create Deal
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Slide-Over 360° Customer Dossier Drawer */}
      <CrmLeadDrawer
        open={Boolean(selectedLeadId)}
        loading={workspaceLoading}
        workspace={workspace}
        sequences={sequences}
        onClose={closeLeadDrawer}
        onRefresh={async () => {
          if (selectedLeadId) await openLeadDrawer(selectedLeadId);
          await fetchLeads();
        }}
        onUpdateLead={updateLead}
        onDeleteLead={deleteLead}
        onRunAction={runLeadAction}
        onEnrollSequence={enrollLeadsInSequence}
        onUpdateEnrollmentStatus={updateEnrollmentStatus}
      />
    </div>
  );
}
