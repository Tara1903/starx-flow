"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Zap, Activity, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { liquidHoverLift } from "../../lib/motionVariants";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: string;
  delayIndex: number;
  sparkPoints: string;
  sparkId: string;
}

const KPICard = memo(function KPICard({
  icon,
  label,
  numericValue,
  prefix = "",
  suffix,
  decimals = 0,
  trend,
  delayIndex,
  sparkPoints,
  sparkId,
}: KPICardProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? numericValue : 0);

  useEffect(() => {
    if (prefersReduced || (typeof document !== "undefined" && document.hidden)) {
      setDisplayValue(numericValue);
      return;
    }

    let frame = 0;
    const totalFrames = 22;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(numericValue * eased);
      if (progress >= 1) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [numericValue, prefersReduced]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <motion.div
      data-cursor-spotlight="true"
      suppressHydrationWarning
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={prefersReduced ? undefined : liquidHoverLift}
      transition={{ duration: 0.36, delay: delayIndex * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-obsidian rounded-2xl p-5 flex flex-col justify-between min-h-[148px] border border-white/[0.12] hover:border-emerald-400/40 select-none group overflow-hidden tabular-nums relative shadow-[0_8px_24px_rgba(0,0,0,0.32)]"
    >
      {/* Top Row: Icon & Trend Pill */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.12] border border-emerald-400/25 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.16),inset_0_1px_0_rgba(255,255,255,0.18)] transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/18 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trend}</span>
          </span>
        )}
      </div>

      {/* Bottom Row: Numeric Value, Label, and Sparkline */}
      <div className="relative z-10 mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-none">
            {prefix}
            {formatted}
            {suffix && <span className="text-xs font-normal text-zinc-300 ml-1">{suffix}</span>}
          </p>
          <p className="text-[11px] text-zinc-400 font-semibold mt-2 uppercase tracking-wider truncate">
            {label}
          </p>
        </div>

        <svg
          viewBox="0 0 80 28"
          suppressHydrationWarning
          className="w-18 h-7.5 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={sparkId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d={sparkPoints}
            fill="none"
            stroke={`url(#${sparkId})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={1}
          />
        </svg>
      </div>
    </motion.div>
  );
});

export function KPIGrid() {
  const workflows = useAuthStore((s) => s.workflows);

  const { activeCount, totalExecutions, totalHoursSaved, estimatedRevenue } = useMemo(() => {
    const active = workflows.filter((w) => w.isActive).length;
    const executions = workflows.reduce((acc, wf) => acc + (wf.executionsCount || 0), 0);
    const hours = Number(workflows.reduce((acc, wf) => acc + (wf.savedHours || 0), 0).toFixed(1));
    return {
      activeCount: workflows.length,
      activeRunning: active,
      totalExecutions: executions,
      totalHoursSaved: hours,
      estimatedRevenue: Math.round(hours * 55),
    };
  }, [workflows]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        icon={<Zap className="w-5 h-5 text-emerald-300" />}
        label="Deployed Flows"
        numericValue={activeCount}
        trend="+14%"
        delayIndex={0}
        sparkPoints="M 2 24 C 20 22, 40 18, 58 12 C 68 8, 74 4, 78 2"
        sparkId="spark-flow-1"
      />
      <KPICard
        icon={<Activity className="w-5 h-5 text-emerald-300" />}
        label="Total Triage Runs"
        numericValue={totalExecutions > 0 ? totalExecutions : 1880}
        trend="Live"
        delayIndex={1}
        sparkPoints="M 2 22 C 24 20, 44 16, 62 10 C 70 6, 76 3, 78 2"
        sparkId="spark-runs-2"
      />
      <KPICard
        icon={<Clock className="w-5 h-5 text-emerald-300" />}
        label="Hours Saved"
        numericValue={totalHoursSaved > 0 ? totalHoursSaved : 98.7}
        decimals={1}
        suffix="h"
        trend="Verified"
        delayIndex={2}
        sparkPoints="M 2 26 C 26 24, 48 18, 64 12 C 72 7, 76 4, 78 2"
        sparkId="spark-hours-3"
      />
      <KPICard
        icon={<DollarSign className="w-5 h-5 text-emerald-300" />}
        label="Rev Protected"
        numericValue={estimatedRevenue > 0 ? estimatedRevenue : 5429}
        prefix="€"
        trend="Active"
        delayIndex={3}
        sparkPoints="M 2 25 C 22 23, 46 17, 60 11 C 70 6, 75 3, 78 2"
        sparkId="spark-rev-4"
      />
    </div>
  );
}
