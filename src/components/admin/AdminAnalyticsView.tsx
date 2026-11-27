"use client";

import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";
import {
  CONSOLE_PANEL,
  CONSOLE_PANEL_LG,
  CONSOLE_SUBCARD,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import type { Client, DemoLead } from "../../store/adminStore";
import { CANONICAL_PLANS, normalizePlanId } from "@/lib/plans";

interface AdminAnalyticsViewProps {
  totalClients: number;
  totalExecutions: number;
  clients?: Client[];
  demoLeads?: DemoLead[];
}

export function AdminAnalyticsView({
  totalClients,
  totalExecutions,
  clients = [],
  demoLeads = [],
}: AdminAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const realMRR = clients.reduce((acc, c) => {
    if (c.status?.toLowerCase() === "churned" || c.status?.toLowerCase() === "inactive") return acc;
    const norm = normalizePlanId(c.plan);
    if (norm === "starter") return acc + CANONICAL_PLANS.starter.price;
    if (norm === "growth") return acc + CANONICAL_PLANS.growth.price;
    if (norm === "pro") return acc + CANONICAL_PLANS.pro.price;
    if (c.plan?.toLowerCase() === "enterprise") return acc + 299;
    return acc;
  }, 0);

  const activeClients = clients.filter((c) => c.status === "Active").length;
  const realWorkflows = clients.reduce((acc, c) => acc + (c.totalWorkflows || 0), 0);
  const convertedLeads = demoLeads.filter((l) => l.status === "converted").length;
  const conversionRate =
    demoLeads.length > 0 ? ((convertedLeads / demoLeads.length) * 100).toFixed(1) : "0.0";

  const topWorkspaces = useMemo(() => {
    return [...clients]
      .sort((a, b) => (b.totalExecutions || 0) - (a.totalExecutions || 0))
      .slice(0, 5);
  }, [clients]);

  const maxClientExecs = Math.max(
    ...topWorkspaces.map((c) => c.totalExecutions || 0),
    1
  );

  const exportAnalyticsCSV = () => {
    const rows = [
      "Metric,Value",
      `Total Clients,${totalClients}`,
      `Active Clients,${activeClients}`,
      `Monthly MRR,$${realMRR}`,
      `Total Executions,${totalExecutions}`,
      `Active Workflows,${realWorkflows}`,
      `Lead Conversion,${conversionRate}%`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starx-analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 select-none tabular-nums">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Platform analytics</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Live aggregates across client workspaces and lead conversion
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-[#121715] border border-[#edf0ee]/[0.08]">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                  timeRange === range
                    ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/10"
                    : "text-[#727c75] hover:text-[#edf0ee]"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          <button type="button" onClick={exportAnalyticsCSV} className={CONSOLE_BTN_SECONDARY}>
            <Download className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Compact Stat Cards (Numbers only, no sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Monthly MRR</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            ${realMRR.toLocaleString()}
          </p>
          <p className="text-xs text-[#727c75] mt-2">
            From {activeClients} active account{activeClients === 1 ? "" : "s"}
          </p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Total executions</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {totalExecutions.toLocaleString()}
          </p>
          <p className="text-xs text-[#727c75] mt-2">
            {totalClients > 0 ? `${Math.round(totalExecutions / totalClients).toLocaleString()} per client` : "No workspaces yet"}
          </p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Deployed flows</p>
          <p className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] mt-2 leading-none">
            {realWorkflows.toLocaleString()}
          </p>
          <p className="text-xs text-[#727c75] mt-2">
            {totalClients > 0 ? `${(realWorkflows / totalClients).toFixed(1)} avg per client` : "Across all workspaces"}
          </p>
        </div>

        <div className={CONSOLE_PANEL}>
          <p className="text-xs font-medium text-[#a1aaa4]">Demo conversion</p>
          <p className="text-[28px] font-semibold text-[#4cc38a] tracking-[-0.02em] mt-2 leading-none">
            {conversionRate}%
          </p>
          <p className="text-xs text-[#727c75] mt-2">
            {convertedLeads} converted of {demoLeads.length} leads
          </p>
        </div>
      </div>

      {/* 8:4 Split: Workspace Execution Share (Bars) & Operational Summary (List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className={cn(CONSOLE_PANEL_LG, "lg:col-span-8 flex flex-col justify-between")}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#edf0ee]/[0.08]">
              <div>
                <h2 className={CONSOLE_SECTION_TITLE}>Workspace execution volume</h2>
                <p className="text-xs text-[#727c75] mt-0.5">
                  Top client accounts ranked by automated runs ({timeRange} window)
                </p>
              </div>
              <span className={CONSOLE_BADGE_MUTED}>{topWorkspaces.length} shown</span>
            </div>

            {topWorkspaces.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#727c75]">
                No client execution records available yet
              </div>
            ) : (
              <div className="space-y-4 py-5">
                {topWorkspaces.map((client, idx) => {
                  const count = client.totalExecutions || 0;
                  const pct = Math.max(4, Math.round((count / maxClientExecs) * 100));
                  const isLeader = idx === 0;
                  return (
                    <div key={client.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-[#edf0ee] truncate">
                            {client.businessName}
                          </span>
                          <span className="text-[#727c75] hidden sm:inline">· {client.plan}</span>
                        </div>
                        <span className={cn("font-medium", isLeader ? "text-[#4cc38a]" : "text-[#a1aaa4]")}>
                          {count.toLocaleString()} runs
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#0d1210] border border-[#edf0ee]/[0.06] overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={cn(
                            "h-full rounded-full",
                            isLeader ? "bg-[#34d399]" : "bg-[#727c75]/55"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#edf0ee]/[0.08] text-xs text-[#727c75]">
            <span>Aggregate across {totalClients} accounts</span>
            <span className="font-mono">{totalExecutions.toLocaleString()} total runs</span>
          </div>
        </div>

        {/* Narrow Facts Panel */}
        <div className={cn(CONSOLE_PANEL_LG, "lg:col-span-4 space-y-4")}>
          <div className="pb-3 border-b border-[#edf0ee]/[0.08]">
            <h2 className={CONSOLE_SECTION_TITLE}>Pipeline breakdown</h2>
            <p className="text-xs text-[#727c75] mt-0.5">
              Live status distribution from registered records
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Active workspaces",
                val: `${activeClients} of ${totalClients}`,
                note: "Verified active accounts",
              },
              {
                label: "Trial accounts",
                val: `${clients.filter((c) => c.status === "Trial").length}`,
                note: "Evaluating automation flows",
              },
              {
                label: "Pending inquiries",
                val: `${demoLeads.filter((l) => l.status === "new").length}`,
                note: "New demo requests open",
              },
              {
                label: "Scheduled demos",
                val: `${demoLeads.filter((l) => l.status === "scheduled").length}`,
                note: "Walkthroughs on calendar",
              },
            ].map((row) => (
              <div key={row.label} className={cn(CONSOLE_SUBCARD, "p-3.5 space-y-1")}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#edf0ee]">{row.label}</span>
                  <span className={CONSOLE_BADGE_LIVE}>{row.val}</span>
                </div>
                <p className="text-xs text-[#727c75]">{row.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
