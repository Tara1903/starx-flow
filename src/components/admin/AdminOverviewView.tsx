"use client";

import React from "react";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Kanban,
  Search,
  Workflow,
  Users,
} from "lucide-react";
import { AdminKPIsRow } from "./AdminKPIs";
import { RevenueVelocityChart, MonthlyGoalGauge } from "./AdminCharts";
import { type Client, type DemoLead } from "../../store/adminStore";
import { useCrmStore, type CrmWorkspaceTab } from "../../store/crmStore";
import {
  CONSOLE_PANEL_LG,
  CONSOLE_SUBCARD,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_GHOST,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_INFO,
  CONSOLE_BADGE_MUTED,
  CONSOLE_HEADING,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";
import { CANONICAL_PLANS, normalizePlanId } from "@/lib/plans";

interface AdminOverviewViewProps {
  clients: Client[];
  demoLeads: DemoLead[];
  onSelectSection: (section: "clients" | "leads" | "crm" | "analytics") => void;
  onRefresh: () => void;
  onExportCsv?: () => void;
}

export function AdminOverviewView({
  clients,
  demoLeads,
  onSelectSection,
  onRefresh,
  onExportCsv,
}: AdminOverviewViewProps) {
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const totalLeads = demoLeads.length;
  const totalExecutions = clients.reduce((acc, c) => acc + (c.totalExecutions || 0), 0);
  const totalWorkflows = clients.reduce((acc, c) => acc + (c.totalWorkflows || 0), 0);

  const realMRR = clients.reduce((acc, c) => {
    if (c.status?.toLowerCase() === "churned" || c.status?.toLowerCase() === "inactive") return acc;
    const norm = normalizePlanId(c.plan);
    if (norm === "starter") return acc + CANONICAL_PLANS.starter.price;
    if (norm === "growth") return acc + CANONICAL_PLANS.growth.price;
    if (norm === "pro") return acc + CANONICAL_PLANS.pro.price;
    if (c.plan?.toLowerCase() === "enterprise") return acc + 299;
    return acc;
  }, 0);

  const targetMonthlyGoal = 5000;
  const goalProgress = Math.min(100, Math.round((realMRR / targetMonthlyGoal) * 100));

  const recentClients = clients.slice(0, 4);
  const pendingLeads = demoLeads.filter((l) => l.status === "new").slice(0, 4);

  const crmLeadsCount = useCrmStore((s) => s.leads.length);
  const crmAnalytics = useCrmStore((s) => s.analytics);
  const crmSequencesCount = useCrmStore((s) => s.sequences.length);
  const setCrmTab = useCrmStore((s) => s.setActiveTab);

  const openCrmTab = (tab: CrmWorkspaceTab) => {
    setCrmTab(tab);
    onSelectSection("crm");
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={CONSOLE_HEADING}>Platform overview</h1>
          <p className="text-xs sm:text-sm text-[#727c75] mt-0.5">
            Multi-tenant automation throughput, recurring revenue, and active client accounts
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onExportCsv && (
            <button type="button" onClick={onExportCsv} className={CONSOLE_BTN_SECONDARY}>
              <Download className="w-3.5 h-3.5 text-[#a1aaa4]" strokeWidth={1.65} />
              <span>Export CSV</span>
            </button>
          )}
          <button type="button" onClick={onRefresh} className={CONSOLE_BTN_PRIMARY}>
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Sync data</span>
          </button>
        </div>
      </div>

      {/* Compact KPI Row */}
      <AdminKPIsRow
        totalClients={totalClients}
        activeClients={activeClients}
        totalLeads={totalLeads}
        totalExecutions={totalExecutions}
      />

      {/* Primary Chart (8 cols) + Monthly Target Ring (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex">
          <RevenueVelocityChart
            totalRevenue={realMRR}
            totalExecutions={totalExecutions}
            activeWorkflows={totalWorkflows}
          />
        </div>

        <div className="lg:col-span-4 flex">
          <MonthlyGoalGauge
            progress={goalProgress}
            targetAmount={`$${targetMonthlyGoal.toLocaleString()}`}
            currentAmount={`$${realMRR.toLocaleString()}`}
          />
        </div>
      </div>

      {/* Revenue CRM & Prospecting Admin Cell */}
      <div className={cn(CONSOLE_PANEL_LG, "space-y-4 tabular-nums")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf0ee]/[0.08]">
          <div>
            <h2 className={CONSOLE_SECTION_TITLE}>Revenue CRM & Outbound Hub</h2>
            <p className="text-xs text-[#727c75] mt-0.5">
              Direct admin access to live pipeline deals, OpenStreetMap prospecting, sequences & 360° accounts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={CONSOLE_BADGE_LIVE}>
              Forecast: €{Math.round(crmAnalytics?.weightedPipelineValue || 0).toLocaleString()}
            </span>
            <span className={CONSOLE_BADGE_MUTED}>
              {crmAnalytics?.openDealsCount || 0} open deals · {crmLeadsCount} contacts
            </span>
            <button
              type="button"
              onClick={() => openCrmTab("pipeline")}
              className={CONSOLE_BTN_GHOST}
            >
              <span>Open CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              tab: "pipeline" as CrmWorkspaceTab,
              title: "CRM Pipeline",
              desc: "Manage stages & revenue deals",
              icon: Kanban,
              meta: `€${Math.round(crmAnalytics?.totalPipelineValue || 0).toLocaleString()} gross`,
            },
            {
              tab: "finder" as CrmWorkspaceTab,
              title: "Open Lead Finder",
              desc: "Search & enrich B2B prospects",
              icon: Search,
              meta: "OSM + Web Crawler",
            },
            {
              tab: "sequences" as CrmWorkspaceTab,
              title: "Outreach Sequences",
              desc: "Automated WA, Email & IG drips",
              icon: Workflow,
              meta: `${crmSequencesCount} workflows`,
            },
            {
              tab: "directory" as CrmWorkspaceTab,
              title: "Customer Directory",
              desc: "Full 360° profiles, tasks & merge",
              icon: Users,
              meta: `${crmLeadsCount} records`,
            },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                type="button"
                key={tile.tab}
                onClick={() => openCrmTab(tile.tab)}
                className={cn(
                  CONSOLE_SUBCARD,
                  "p-3.5 text-left group flex items-center justify-between gap-3 hover:bg-[#19201d] hover:border-[#edf0ee]/14 transition-colors cursor-pointer"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] group-hover:text-[#34d399] flex-shrink-0 transition-colors">
                    <Icon className="w-4 h-4" strokeWidth={1.65} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#edf0ee] truncate">{tile.title}</p>
                    <p className="text-[11px] text-[#727c75] truncate">{tile.desc}</p>
                    <p className="text-[10px] text-[#4cc38a] mt-0.5 truncate">{tile.meta}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#727c75] group-hover:text-[#34d399] flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom 7:5 Split: Active Client Roster & Inbound Demo Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={cn(CONSOLE_PANEL_LG, "lg:col-span-7 space-y-4")}>
          <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
            <div>
              <h2 className={CONSOLE_SECTION_TITLE}>Recent clients</h2>
              <p className="text-xs text-[#727c75] mt-0.5">
                Active workspaces provisioned on StarX Flow
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection("clients")}
              className={CONSOLE_BTN_GHOST}
            >
              <span className="tabular-nums">View all ({totalClients})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelectSection("clients")}
                  className={cn(
                    CONSOLE_SUBCARD,
                    "flex items-center justify-between p-3.5 hover:bg-[#19201d] cursor-pointer transition-colors"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#19201d] border border-[#edf0ee]/10 flex items-center justify-center font-medium text-[#edf0ee] text-sm flex-shrink-0">
                      {client.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#edf0ee] truncate">
                        {client.businessName}
                      </p>
                      <p className="text-xs text-[#727c75] truncate">
                        {client.ownerName} · {client.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:block text-right tabular-nums">
                      <span className={CONSOLE_BADGE_MUTED}>{client.plan}</span>
                      <p className="text-[11px] text-[#727c75] mt-1">
                        {client.totalWorkflows} flows · {client.totalExecutions.toLocaleString()} runs
                      </p>
                    </div>

                    <span
                      className={
                        client.status === "Active" ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_INFO
                      }
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#727c75] py-8 text-center">
                No client records retrieved yet
              </p>
            )}
          </div>
        </div>

        <div className={cn(CONSOLE_PANEL_LG, "lg:col-span-5 space-y-4")}>
          <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
            <div>
              <h2 className={CONSOLE_SECTION_TITLE}>Inbound demo inquiries</h2>
              <p className="text-xs text-[#727c75] mt-0.5">
                New requests awaiting follow-up
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection("leads")}
              className={CONSOLE_BTN_GHOST}
            >
              <span className="tabular-nums">Pipeline ({totalLeads})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingLeads.length > 0 ? (
              pendingLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectSection("leads")}
                  className={cn(
                    CONSOLE_SUBCARD,
                    "p-3.5 space-y-1 hover:bg-[#19201d] cursor-pointer transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#edf0ee] truncate">
                      {lead.businessName}
                    </span>
                    <span className={CONSOLE_BADGE_LIVE}>New</span>
                  </div>
                  <p className="text-xs text-[#a1aaa4] truncate">
                    {lead.fullName} · {lead.workEmail}
                  </p>
                  <p className="text-xs text-[#727c75] line-clamp-1">
                    {lead.primaryNeed}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#4cc38a] mx-auto" strokeWidth={1.65} />
                <p className="text-xs text-[#727c75]">
                  All demo requests have been processed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
