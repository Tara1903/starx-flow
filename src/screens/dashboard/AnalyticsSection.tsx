"use client";
import React, { useEffect, useState } from "react";
import { Activity, Brain, Database, RefreshCw, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { KPIGrid } from "../../components/dashboard/KPIGrid";
import { ExecutionChart } from "../../components/dashboard/ExecutionChart";
import { ChannelDistribution } from "../../components/dashboard/ChannelDistribution";
import { crmFetch } from "../../lib/crm/crmApi";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_ROW,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_WARN,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface AnalyticsSummaryData {
  aiTelemetry: {
    totalRuns: number;
    avgLatencyMs: number;
    ragHitRatePct: number;
    handoffRatePct: number;
    crmLinkedRatePct: number;
    providers: Record<string, number>;
    topTools: Array<{ tool: string; count: number }>;
    recentTraces: Array<{
      id: string;
      channel: string;
      provider: string;
      model: string;
      intent: string;
      rag_chunks_count: number;
      memories_count: number;
      crm_linked: boolean;
      tool_names_used: string[];
      requires_handoff: boolean;
      latency_ms: number;
      created_at: string;
    }>;
  };
  operations: {
    workflowsTotal: number;
    workflowsActive: number;
    totalWorkflowRuns: number;
    openTasks: number;
    jobsPending: number;
    jobsCompleted: number;
    jobsFailed: number;
    activeSequenceEnrollments: number;
  };
  revenueAndCrm: {
    totalLeads: number;
    qualifiedLeads: number;
    pipelineValueEur: number;
    wonRevenueEur: number;
    ordersRevenueEur: number;
    upcomingBookings: number;
  };
}

export function AnalyticsSection() {
  const [summary, setSummary] = useState<AnalyticsSummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await crmFetch<AnalyticsSummaryData & { success: boolean }>("/api/analytics/summary");
    if (res.ok && res.data) {
      setSummary(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const ai = summary?.aiTelemetry;
  const ops = summary?.operations;
  const rev = summary?.revenueAndCrm;

  return (
    <div className="space-y-6 pb-16">
      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8">
          <ExecutionChart />
        </div>
        <div className="lg:col-span-4">
          <ChannelDistribution />
        </div>
      </div>

      {/* Live AI Pipeline & CRM Telemetry Strip */}
      <div className={cn(CONSOLE_PANEL, "space-y-5 tabular-nums")}>
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0ee]/[0.08] pb-3.5">
          <div>
            <h3 className={cn(CONSOLE_SECTION_TITLE, "flex items-center gap-2")}>
              <Brain className="w-4 h-4 text-[#34d399]" />
              <span>AI intelligence &amp; revenue attribution</span>
            </h3>
            <p className="text-xs text-[#727c75] mt-0.5">
              30-day live telemetry from AI context traces, background scheduler queues, and CRM deals
            </p>
          </div>
          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
            className={CONSOLE_BTN_SECONDARY}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span>Refresh telemetry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
            <div className="flex items-center justify-between text-xs text-[#727c75]">
              <span>AI pipeline turns</span>
              <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
            </div>
            <div className="text-2xl font-semibold text-[#edf0ee]">{ai?.totalRuns ?? 0}</div>
            <p className="text-[11px] text-[#a1aaa4]">
              Avg latency {ai?.avgLatencyMs ?? 0}ms across {Object.keys(ai?.providers || {}).length || 0} provider(s)
            </p>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
            <div className="flex items-center justify-between text-xs text-[#727c75]">
              <span>RAG &amp; CRM grounding</span>
              <Database className="w-3.5 h-3.5 text-[#4cc38a]" />
            </div>
            <div className="text-2xl font-semibold text-[#edf0ee]">{ai?.ragHitRatePct ?? 0}%</div>
            <p className="text-[11px] text-[#a1aaa4]">
              CRM linked: {ai?.crmLinkedRatePct ?? 0}% · Qualified leads: {rev?.qualifiedLeads ?? 0}/{rev?.totalLeads ?? 0}
            </p>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
            <div className="flex items-center justify-between text-xs text-[#727c75]">
              <span>Automation &amp; jobs queue</span>
              <Activity className="w-3.5 h-3.5 text-[#a1aaa4]" />
            </div>
            <div className="text-2xl font-semibold text-[#edf0ee]">{ops?.jobsCompleted ?? 0} done</div>
            <p className="text-[11px] text-[#a1aaa4]">
              {ops?.jobsPending ?? 0} queued · {ops?.activeSequenceEnrollments ?? 0} active sequences
            </p>
          </div>

          <div className={cn(CONSOLE_SUBCARD, "p-4 space-y-1.5")}>
            <div className="flex items-center justify-between text-xs text-[#727c75]">
              <span>Open CRM pipeline</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#34d399]" />
            </div>
            <div className="text-2xl font-semibold text-[#4cc38a]">
              €{(rev?.pipelineValueEur ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#a1aaa4]">
              Won + paid revenue: €{((rev?.wonRevenueEur ?? 0) + (rev?.ordersRevenueEur ?? 0)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top Tools + Recent Traces */}
        {ai?.topTools && ai.topTools.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#727c75] flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" />
              Top AI tools executed:
            </span>
            {ai.topTools.map((t) => (
              <span key={t.tool} className={CONSOLE_BADGE_LIVE}>
                {t.tool} ({t.count})
              </span>
            ))}
          </div>
        )}

        {ai?.recentTraces && ai.recentTraces.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf0ee]/[0.08] text-[#727c75]">
                  <th className="py-2 font-medium pl-2">Channel</th>
                  <th className="py-2 font-medium">Intent</th>
                  <th className="py-2 font-medium">Provider / Model</th>
                  <th className="py-2 font-medium">Context hits</th>
                  <th className="py-2 font-medium">Latency</th>
                  <th className="py-2 font-medium text-right pr-2">Handoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]/[0.06]">
                {ai.recentTraces.map((tr) => (
                  <tr key={tr.id} className={CONSOLE_ROW}>
                    <td className="py-2.5 pl-2 font-medium text-[#edf0ee]">{tr.channel}</td>
                    <td className="py-2.5 text-[#a1aaa4] capitalize">{tr.intent}</td>
                    <td className="py-2.5 font-mono text-[11px] text-[#a1aaa4]">
                      {tr.provider} · {tr.model}
                    </td>
                    <td className="py-2.5 text-[#a1aaa4]">
                      {tr.rag_chunks_count} KB · {tr.memories_count} mem {tr.crm_linked ? "· CRM" : ""}
                    </td>
                    <td className="py-2.5 text-[#edf0ee] font-mono">{tr.latency_ms}ms</td>
                    <td className="py-2.5 text-right pr-2">
                      <span className={tr.requires_handoff ? CONSOLE_BADGE_WARN : CONSOLE_BADGE_MUTED}>
                        {tr.requires_handoff ? "Escalated" : "Autonomous"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={cn(CONSOLE_SUBCARD, "p-6 text-center text-xs text-[#727c75]")}>
            No AI intelligence traces recorded yet. Test a query in AI Playground or handle a customer message to inspect real traces here.
          </div>
        )}
      </div>
    </div>
  );
}
