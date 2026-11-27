"use client";

import React from "react";
import {
  Users,
  CheckCircle2,
  Inbox,
  Zap,
} from "lucide-react";
import { CONSOLE_PANEL } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isPositive?: boolean;
}

export function AdminStatsCard({
  title,
  value,
  change,
  subtext,
  icon: Icon,
  isPositive = true,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        CONSOLE_PANEL,
        "transition-colors duration-150 hover:border-[#edf0ee]/14 select-none tabular-nums"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#a1aaa4]">{title}</p>
        <Icon className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
      </div>

      <h3 className="text-[28px] font-semibold text-[#edf0ee] tracking-[-0.02em] leading-none">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h3>

      <div className="flex items-center gap-1.5 mt-3 text-xs">
        <span
          className={cn(
            "font-medium tabular-nums",
            isPositive ? "text-[#4cc38a]" : "text-[#a1aaa4]"
          )}
        >
          {change}
        </span>
        {subtext && <span className="text-[#727c75] truncate">{subtext}</span>}
      </div>
    </div>
  );
}

interface AdminKPIsRowProps {
  totalClients: number;
  activeClients: number;
  totalLeads: number;
  totalExecutions: number;
}

export function AdminKPIsRow({
  totalClients,
  activeClients,
  totalLeads,
  totalExecutions,
}: AdminKPIsRowProps) {
  const activeRate =
    totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <AdminStatsCard
        title="Total Clients"
        value={totalClients}
        change={`${activeClients} active`}
        subtext="on platform"
        icon={Users}
      />
      <AdminStatsCard
        title="Active Subscriptions"
        value={activeClients}
        change={`${activeRate}%`}
        subtext="of total accounts"
        icon={CheckCircle2}
      />
      <AdminStatsCard
        title="Demo Inquiries"
        value={totalLeads}
        change={`${totalLeads} recorded`}
        subtext="in lead pipeline"
        icon={Inbox}
      />
      <AdminStatsCard
        title="Automated Executions"
        value={totalExecutions}
        change={totalClients > 0 ? `${Math.round(totalExecutions / totalClients).toLocaleString()} avg` : "0 avg"}
        subtext="per client workspace"
        icon={Zap}
      />
    </div>
  );
}
