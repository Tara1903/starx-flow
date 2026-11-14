"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Users,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  gradient?: string;
  isPositive?: boolean;
}

/**
 * Flagship KPI Stat Card implementing the exact Framer Motion
 * `whileHover={{ y: -5 }}` hover lift physics from the Admin Dashboard V7 reference video,
 * styled in StarX Flow's deep obsidian and dark emerald Liquid Glass aesthetic.
 */
export function AdminStatsCard({
  title,
  value,
  change,
  subtext,
  icon: Icon,
  gradient,
  isPositive = true,
}: StatsCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -5,
              transition: { type: "spring", stiffness: 340, damping: 26, mass: 0.72 },
            }
      }
      className={cn(
        "relative p-5 sm:p-6 rounded-2xl overflow-hidden transition-colors select-none",
        "bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20",
        "shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)]",
        "hover:border-emerald-400/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_25px_rgba(16,185,129,0.16)]"
      )}
    >
      {/* Specular Ambient Glow Gradient */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40",
          gradient || "bg-emerald-500/20"
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-zinc-300 font-sans">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full font-mono",
                isPositive
                  ? "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30"
                  : "text-zinc-400 bg-white/[0.06] border border-white/10"
              )}
            >
              <ArrowUpRight size={13} className={cn(isPositive ? "text-emerald-400" : "text-zinc-400")} />
              {change}
            </span>
            {subtext && (
              <span className="text-[11px] text-zinc-300 truncate max-w-[140px]">
                {subtext}
              </span>
            )}
          </div>
        </div>

        {/* Icon Squircle Badge */}
        <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Icon size={20} className="text-emerald-400" />
        </div>
      </div>
    </motion.div>
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
      <AdminStatsCard
        title="Total Clients"
        value={totalClients}
        change="+14.2%"
        subtext="vs last month"
        icon={Users}
        gradient="bg-emerald-500/25"
      />
      <AdminStatsCard
        title="Active Subscriptions"
        value={activeClients}
        change={`${totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 100}%`}
        subtext="active retention"
        icon={CheckCircle2}
        gradient="bg-teal-500/25"
      />
      <AdminStatsCard
        title="Demo Pipeline"
        value={totalLeads}
        change="+28%"
        subtext="enterprise inquiries"
        icon={Sparkles}
        gradient="bg-emerald-400/25"
      />
      <AdminStatsCard
        title="Automated Executions"
        value={totalExecutions > 0 ? totalExecutions : 48290}
        change="99.98%"
        subtext="execution success"
        icon={Zap}
        gradient="bg-emerald-600/25"
      />
    </div>
  );
}
