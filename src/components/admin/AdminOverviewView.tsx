"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import { AdminKPIsRow } from "./AdminKPIs";
import { RevenueVelocityChart, MonthlyGoalGauge } from "./AdminCharts";
import { type Client, type DemoLead } from "../../store/adminStore";
import { cn } from "../../lib/utils";

interface AdminOverviewViewProps {
  clients: Client[];
  demoLeads: DemoLead[];
  onSelectSection: (section: "clients" | "leads" | "analytics") => void;
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
  const prefersReduced = useReducedMotion();

  // Compute metrics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const totalLeads = demoLeads.length;
  const totalExecutions = clients.reduce((acc, c) => acc + (c.totalExecutions || 0), 0);
  const totalWorkflows = clients.reduce((acc, c) => acc + (c.totalWorkflows || 0), 0);

  // Dynamic time greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Recent 4 clients and recent 3 leads
  const recentClients = clients.slice(0, 4);
  const pendingLeads = demoLeads.filter((l) => l.status === "new").slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* ── 1. WELCOME GREETING & CONTEXTUAL HEADER (Frame 003) ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <div className="space-y-2">
          {/* Live Platform Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● Live Platform &bull; All AI Workers Operational</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {timeGreeting}, <span className="text-emerald-400">Administrator</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            Here is your real-time platform telemetry, enterprise automation throughput, and active client roster.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.35)] cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* ── 2. TOP VISUALIZATION ROW: REVENUE VELOCITY CHART & GOAL GAUGE (Frame 003) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-8 flex">
          <RevenueVelocityChart
            totalRevenue={59553}
            totalExecutions={totalExecutions > 0 ? totalExecutions : 48290}
            activeWorkflows={totalWorkflows > 0 ? totalWorkflows : 142}
          />
        </div>

        <div className="lg:col-span-4 flex">
          <MonthlyGoalGauge
            progress={78}
            targetAmount="$75,000"
            currentAmount="$59,553"
          />
        </div>
      </div>

      {/* ── 3. FOUR HOVER-LIFT KPI CARDS (Exact Video JSX `whileHover={{ y: -5 }}`) ── */}
      <AdminKPIsRow
        totalClients={totalClients}
        activeClients={activeClients}
        totalLeads={totalLeads}
        totalExecutions={totalExecutions}
      />

      {/* ── 4. DUAL ACTIVITY COLUMNS: RECENT CLIENTS & HIGH-PRIORITY INQUIRIES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Recent Client Activity (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                Active Client Roster
              </h3>
              <p className="text-xs text-zinc-300">
                Latest enterprise businesses deployed on StarX Flow
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection("clients")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalClients})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/12 border border-emerald-400/30 flex items-center justify-center font-bold font-mono text-emerald-300 text-sm">
                      {client.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {client.businessName}
                      </p>
                      <p className="text-[11px] text-zinc-300">
                        {client.ownerName} &bull; {client.businessType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                        {client.plan}
                      </span>
                      <p className="text-[10px] text-zinc-300 mt-0.5">
                        {client.totalWorkflows} flows &bull; {client.totalExecutions.toLocaleString()} execs
                      </p>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                        client.status === "Active"
                          ? "bg-emerald-500/15 border border-emerald-500/35 text-emerald-300"
                          : "bg-blue-500/15 border border-blue-500/35 text-blue-300"
                      )}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No client records retrieved yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: High-Priority Demo Inquiries (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                Inbound Demo Leads
              </h3>
              <p className="text-xs text-zinc-300">
                New enterprise requests awaiting action
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection("leads")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Pipeline ({totalLeads})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingLeads.length > 0 ? (
              pendingLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {lead.businessName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                      NEW
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Contact: <span className="text-zinc-200 font-medium">{lead.fullName}</span> &bull; {lead.workEmail}
                  </p>
                  <p className="text-xs text-emerald-300 font-medium line-clamp-1">
                    Primary Need: {lead.primaryNeed}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={24} className="text-emerald-400 mx-auto opacity-70" />
                <p className="text-xs text-zinc-400">
                  All demo requests are processed and scheduled!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
