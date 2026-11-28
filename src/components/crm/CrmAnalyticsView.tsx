'use client';

import React from 'react';
import { Award, BarChart3, DollarSign, Layers, Target, Users } from 'lucide-react';
import type { CrmAnalyticsSummary } from '@/types/crm';
import {
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
} from '@/lib/consoleSurface';
import { cn } from '@/lib/utils';

interface CrmAnalyticsViewProps {
  analytics: CrmAnalyticsSummary | null;
}

export function CrmAnalyticsView({ analytics }: CrmAnalyticsViewProps) {
  if (!analytics) {
    return (
      <div className={cn(CONSOLE_PANEL, 'py-12 text-center')}>
        <p className="text-sm font-medium text-[#edf0ee]">CRM analytics will populate once leads or deals exist</p>
      </div>
    );
  }

  const maxStageValue = Math.max(1, ...analytics.stageBreakdown.map((s) => s.value));
  const maxStageCount = Math.max(1, ...analytics.stageBreakdown.map((s) => s.count));

  return (
    <div className="space-y-4 tabular-nums">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <div className="flex items-center justify-between text-xs text-[#727c75]">
            <span>Weighted forecast</span>
            <DollarSign className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee] mt-2">
            €{Math.round(analytics.weightedPipelineValue).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#a1aaa4] mt-1">
            Gross pipeline: €{Math.round(analytics.totalPipelineValue).toLocaleString()}
          </p>
        </div>

        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <div className="flex items-center justify-between text-xs text-[#727c75]">
            <span>Closed won revenue</span>
            <Award className="w-3.5 h-3.5 text-[#4cc38a]" />
          </div>
          <p className="text-2xl font-semibold text-[#4cc38a] mt-2">
            €{Math.round(analytics.wonRevenue).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#a1aaa4] mt-1">
            {analytics.wonDealsCount} won · {analytics.lostDealsCount} lost
          </p>
        </div>

        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <div className="flex items-center justify-between text-xs text-[#727c75]">
            <span>Win conversion rate</span>
            <Target className="w-3.5 h-3.5 text-[#a1aaa4]" />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee] mt-2">{analytics.winRatePercent}%</p>
          <p className="text-[11px] text-[#a1aaa4] mt-1">
            Across {analytics.wonDealsCount + analytics.lostDealsCount} closed deals
          </p>
        </div>

        <div className={cn(CONSOLE_PANEL, 'p-4')}>
          <div className="flex items-center justify-between text-xs text-[#727c75]">
            <span>Total contacts</span>
            <Users className="w-3.5 h-3.5 text-[#a1aaa4]" />
          </div>
          <p className="text-2xl font-semibold text-[#edf0ee] mt-2">{analytics.totalLeads}</p>
          <p className="text-[11px] text-[#a1aaa4] mt-1">
            Average fit score: {analytics.averageLeadScore}/100
          </p>
        </div>
      </div>

      {/* Stage Funnel Breakdown */}
      <div className={CONSOLE_PANEL}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#34d399]" />
            <h3 className="text-sm font-medium text-[#edf0ee]">Pipeline stage funnel & probability</h3>
          </div>
          <span className={CONSOLE_BADGE_MUTED}>{analytics.openDealsCount} open deals</span>
        </div>

        <div className="space-y-3">
          {analytics.stageBreakdown.map((stage) => {
            const countPct = Math.round((stage.count / maxStageCount) * 100);
            const valuePct = Math.round((stage.value / maxStageValue) * 100);
            const widthPct = stage.value > 0 ? valuePct : countPct;

            return (
              <div key={stage.stageId} className={cn(CONSOLE_SUBCARD, 'p-3')}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#edf0ee]">{stage.stageName}</span>
                    <span className={CONSOLE_BADGE_MUTED}>{stage.probability}% prob</span>
                  </div>
                  <div className="flex items-center gap-4 text-[#a1aaa4]">
                    <span>{stage.count} records</span>
                    <span>€{Math.round(stage.value).toLocaleString()} gross</span>
                    <span className="text-[#34d399]">
                      €{Math.round(stage.weightedValue).toLocaleString()} weighted
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[#19201d] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#34d399] transition-all duration-300"
                    style={{ width: `${Math.max(stage.count > 0 ? 6 : 0, widthPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source Attribution & Team Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={CONSOLE_PANEL}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#34d399]" />
            <h3 className="text-sm font-medium text-[#edf0ee]">Acquisition source performance</h3>
          </div>
          <div className="space-y-2">
            {analytics.sourceBreakdown.length === 0 ? (
              <p className="text-xs text-[#727c75] py-4">No lead sources recorded yet.</p>
            ) : (
              analytics.sourceBreakdown.map((src) => (
                <div
                  key={src.source}
                  className={cn(CONSOLE_SUBCARD, 'px-3 py-2.5 flex items-center justify-between text-xs')}
                >
                  <div>
                    <p className="font-medium text-[#edf0ee] capitalize">
                      {src.source.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-[#727c75]">
                      {src.count} leads · {src.convertedCount} converted
                    </p>
                  </div>
                  <span className="font-medium text-[#edf0ee]">
                    €{Math.round(src.totalValue).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={CONSOLE_PANEL}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#34d399]" />
            <h3 className="text-sm font-medium text-[#edf0ee]">Owner revenue leaderboard</h3>
          </div>
          <div className="space-y-2">
            {analytics.ownerBreakdown.length === 0 ? (
              <p className="text-xs text-[#727c75] py-4">Assign deals to team members to track quotas.</p>
            ) : (
              analytics.ownerBreakdown.map((owner) => (
                <div
                  key={owner.ownerId || 'unassigned'}
                  className={cn(CONSOLE_SUBCARD, 'px-3 py-2.5 flex items-center justify-between text-xs')}
                >
                  <div>
                    <p className="font-medium text-[#edf0ee]">{owner.ownerName}</p>
                    <p className="text-[11px] text-[#727c75]">
                      {owner.dealsCount} deals · €{Math.round(owner.pipelineValue).toLocaleString()} active
                    </p>
                  </div>
                  <span className={CONSOLE_BADGE_LIVE}>
                    €{Math.round(owner.wonRevenue).toLocaleString()} won
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
