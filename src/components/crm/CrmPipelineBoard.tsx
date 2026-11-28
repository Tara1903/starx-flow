'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  GripVertical,
  Mail,
  Phone,
  Plus,
  Sparkles,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import type { CrmAnalyticsSummary, CrmDeal, CrmPipeline, CrmStage, CrmTeamMember } from '@/types/crm';
import type { Lead } from '@/types/database';
import {
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_INPUT,
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
} from '@/lib/consoleSurface';
import { cn } from '@/lib/utils';

interface CrmPipelineBoardProps {
  pipeline: CrmPipeline | undefined;
  deals: CrmDeal[];
  leads: Lead[];
  teamMembers: CrmTeamMember[];
  analytics: CrmAnalyticsSummary | null;
  searchQuery: string;
  ownerFilter: string;
  onMoveDealStage: (dealId: string, stageId: string) => Promise<{ error: string | null }>;
  onMoveLeadStage: (leadId: string, stageId: string) => Promise<{ error: string | null }>;
  onOpenLead: (leadId: string) => void;
  onOpenNewDealModal: (stageId?: string) => void;
}

interface BoardCardItem {
  kind: 'deal' | 'lead';
  id: string;
  leadId: string;
  title: string;
  contactName: string;
  companyName: string | null;
  value: number;
  probability: number;
  score: number;
  source: string;
  phone: string | null;
  email: string | null;
  ownerId: string | null;
  stageId: string;
}

function getStageBadgeClass(stage: CrmStage): string {
  if (stage.is_won) return CONSOLE_BADGE_LIVE;
  if (stage.is_lost) return CONSOLE_BADGE_MUTED;
  if (stage.probability >= 50) return CONSOLE_BADGE_LIVE;
  if (stage.probability >= 25) return CONSOLE_BADGE_WARN;
  return CONSOLE_BADGE_INFO;
}

export function CrmPipelineBoard({
  pipeline,
  deals,
  leads,
  teamMembers,
  analytics,
  searchQuery,
  ownerFilter,
  onMoveDealStage,
  onMoveLeadStage,
  onOpenLead,
  onOpenNewDealModal,
}: CrmPipelineBoardProps) {
  const [draggingCard, setDraggingCard] = useState<{ kind: 'deal' | 'lead'; id: string } | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);
  const [movingKey, setMovingKey] = useState<string | null>(null);

  const stages = useMemo(
    () => [...(pipeline?.stages || [])].sort((a, b) => a.position - b.position),
    [pipeline]
  );

  const ownerMap = useMemo(
    () => new Map(teamMembers.map((m) => [m.userId, m.name])),
    [teamMembers]
  );

  const cards = useMemo<BoardCardItem[]>(() => {
    const dealLeadIds = new Set(deals.map((d) => d.lead_id));
    const defaultStageId = stages[0]?.id || '';
    const leadById = new Map(leads.map((l) => [l.id, l]));

    const dealCards: BoardCardItem[] = deals.map((d) => {
      const linkedLead = leadById.get(d.lead_id) || d.lead;
      return {
        kind: 'deal',
        id: d.id,
        leadId: d.lead_id,
        title: d.title,
        contactName: linkedLead?.name || d.title,
        companyName: linkedLead?.company_name || null,
        value: Number(d.value || 0),
        probability: Number(d.probability ?? 0),
        score: Number(linkedLead?.score ?? 50),
        source: linkedLead?.source || 'manual',
        phone: linkedLead?.phone || null,
        email: linkedLead?.email || null,
        ownerId: d.owner_id || linkedLead?.owner_id || null,
        stageId: d.stage_id || defaultStageId,
      };
    });

    const leadCards: BoardCardItem[] = leads
      .filter((l) => !dealLeadIds.has(l.id))
      .map((l) => {
        const matchedStage =
          stages.find((s) => s.id === l.stage_id) ||
          stages.find((s) => s.slug === l.status) ||
          stages[0];
        return {
          kind: 'lead',
          id: l.id,
          leadId: l.id,
          title: l.company_name ? `${l.name} · ${l.company_name}` : l.name,
          contactName: l.name,
          companyName: l.company_name || null,
          value: Number(l.deal_value || 0),
          probability: matchedStage?.probability ?? 10,
          score: Number(l.score || 50),
          source: l.source || 'manual',
          phone: l.phone || null,
          email: l.email || null,
          ownerId: l.owner_id || null,
          stageId: matchedStage?.id || defaultStageId,
        };
      });

    const q = searchQuery.trim().toLowerCase();
    return [...dealCards, ...leadCards].filter((c) => {
      if (ownerFilter !== 'all' && c.ownerId !== ownerFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        (c.companyName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    });
  }, [deals, leads, stages, searchQuery, ownerFilter]);

  const handleMove = async (item: { kind: 'deal' | 'lead'; id: string }, targetStageId: string) => {
    setMovingKey(`${item.kind}:${item.id}`);
    try {
      if (item.kind === 'deal') {
        await onMoveDealStage(item.id, targetStageId);
      } else {
        await onMoveLeadStage(item.id, targetStageId);
      }
    } finally {
      setMovingKey(null);
    }
  };

  if (stages.length === 0) {
    return (
      <div className={cn(CONSOLE_PANEL, 'flex flex-col items-center justify-center py-12 text-center')}>
        <p className="text-sm font-medium text-[#edf0ee]">Pipeline stages are initializing</p>
        <p className="text-xs text-[#727c75] mt-1">Refresh or add your first customer to populate stages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Forecast Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <p className="text-xs text-[#727c75]">Total pipeline</p>
          <p className="text-xl font-semibold text-[#edf0ee] mt-1">
            €{Math.round(analytics?.totalPipelineValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#a1aaa4] mt-0.5">
            {analytics?.openDealsCount || 0} active opportunities
          </p>
        </div>
        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <p className="text-xs text-[#727c75]">Weighted forecast</p>
          <p className="text-xl font-semibold text-[#34d399] mt-1">
            €{Math.round(analytics?.weightedPipelineValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#a1aaa4] mt-0.5">Probability-adjusted value</p>
        </div>
        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <p className="text-xs text-[#727c75]">Closed won revenue</p>
          <p className="text-xl font-semibold text-[#edf0ee] mt-1">
            €{Math.round(analytics?.wonRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#4cc38a] mt-0.5">
            {analytics?.wonDealsCount || 0} won deals
          </p>
        </div>
        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <p className="text-xs text-[#727c75]">Conversion & avg score</p>
          <p className="text-xl font-semibold text-[#edf0ee] mt-1">
            {analytics?.winRatePercent || 0}%
          </p>
          <p className="text-[11px] text-[#a1aaa4] mt-0.5">
            Avg ICP fit score: {analytics?.averageLeadScore || 0}/100
          </p>
        </div>
      </div>

      {/* Horizontal Kanban Pipeline Board */}
      <div className="flex gap-3 overflow-x-auto pb-3 console-scroll">
        {stages.map((stage) => {
          const stageCards = cards.filter((c) => c.stageId === stage.id);
          const stageTotal = stageCards.reduce((sum, c) => sum + c.value, 0);
          const isDropTarget = dragOverStageId === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStageId !== stage.id) setDragOverStageId(stage.id);
              }}
              onDragLeave={() => {
                if (dragOverStageId === stage.id) setDragOverStageId(null);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOverStageId(null);
                if (draggingCard) {
                  await handleMove(draggingCard, stage.id);
                  setDraggingCard(null);
                }
              }}
              className={cn(
                'w-[290px] sm:w-[308px] flex-shrink-0 rounded-2xl border p-3 flex flex-col gap-2.5 transition-colors duration-150',
                isDropTarget
                  ? 'bg-[#19201d] border-[#34d399]/50'
                  : 'bg-[#0c100e] border-[#edf0ee]/[0.08]'
              )}
            >
              {/* Column Header */}
              <div className="flex items-start justify-between gap-2 px-1 py-0.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#edf0ee] truncate">{stage.name}</span>
                    <span className={CONSOLE_BADGE_MUTED}>{stageCards.length}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 tabular-nums text-[11px] text-[#727c75]">
                    <span>€{Math.round(stageTotal).toLocaleString()}</span>
                    <span>·</span>
                    <span>{stage.probability}% prob</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenNewDealModal(stage.id)}
                  title={`Add to ${stage.name}`}
                  className="p-1.5 rounded-lg text-[#727c75] hover:text-[#edf0ee] hover:bg-[#19201d] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Stack */}
              <div className="space-y-2 min-h-[140px]">
                {stageCards.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#edf0ee]/[0.07] py-8 px-3 text-center">
                    <p className="text-[11px] text-[#727c75]">Drop deal or customer here</p>
                  </div>
                ) : (
                  stageCards.map((card) => {
                    const isMoving = movingKey === `${card.kind}:${card.id}`;
                    const ownerName = card.ownerId ? ownerMap.get(card.ownerId) : null;

                    return (
                      <div
                        key={`${card.kind}:${card.id}`}
                        draggable
                        onDragStart={() => setDraggingCard({ kind: card.kind, id: card.id })}
                        onDragEnd={() => {
                          setDraggingCard(null);
                          setDragOverStageId(null);
                        }}
                        className={cn(
                          CONSOLE_SUBCARD,
                          'p-3 bg-[#121715] hover:border-[#edf0ee]/20 transition-colors duration-150 group',
                          isMoving && 'opacity-60'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenLead(card.leadId)}
                            className="text-left min-w-0 flex-1 cursor-pointer"
                          >
                            <p className="text-xs font-medium text-[#edf0ee] truncate group-hover:text-[#34d399] transition-colors">
                              {card.contactName}
                            </p>
                            {card.companyName && (
                              <p className="text-[11px] text-[#a1aaa4] flex items-center gap-1 mt-0.5 truncate">
                                <Building2 className="w-3 h-3 text-[#727c75] flex-shrink-0" />
                                <span className="truncate">{card.companyName}</span>
                              </p>
                            )}
                          </button>
                          <GripVertical className="w-3.5 h-3.5 text-[#727c75] flex-shrink-0 cursor-grab" />
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#edf0ee]/[0.06] tabular-nums">
                          <span className="text-xs font-semibold text-[#edf0ee]">
                            €{Math.round(card.value).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                card.score >= 70
                                  ? CONSOLE_BADGE_LIVE
                                  : card.score >= 50
                                    ? CONSOLE_BADGE_WARN
                                    : CONSOLE_BADGE_MUTED,
                                'px-1.5 py-0 text-[10px]'
                              )}
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              {card.score}
                            </span>
                            <span className={cn(getStageBadgeClass(stage), 'px-1.5 py-0 text-[10px]')}>
                              {card.source.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-[#727c75]">
                          <div className="flex items-center gap-2 min-w-0">
                            {card.phone && <Phone className="w-3 h-3 text-[#a1aaa4] flex-shrink-0" />}
                            {card.email && <Mail className="w-3 h-3 text-[#a1aaa4] flex-shrink-0" />}
                            <span className="truncate flex items-center gap-1">
                              <UserCheck className="w-3 h-3 flex-shrink-0" />
                              {ownerName ? ownerName.split(' ')[0] : 'Unassigned'}
                            </span>
                          </div>
                          <select
                            aria-label={`Move stage for ${card.contactName}`}
                            value={card.stageId}
                            disabled={isMoving}
                            onChange={(e) => handleMove({ kind: card.kind, id: card.id }, e.target.value)}
                            className={cn(CONSOLE_INPUT, 'text-[10px] px-1.5 py-0.5 max-w-[105px] cursor-pointer')}
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#0c100e]">
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Funnel Hint */}
      <div className="flex items-center justify-between text-xs text-[#727c75] px-1">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#34d399]" />
          Drag any card across stages or click a customer name to open their 360° dossier drawer.
        </span>
        <span className="tabular-nums">{cards.length} visible items</span>
      </div>
    </div>
  );
}
