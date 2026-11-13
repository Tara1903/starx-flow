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
      initial={prefersReduced ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={prefersReduced ? undefined : liquidHoverLift}
      transition={{ duration: 0.36, delay: delayIndex * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-obsidian glass-interactive rounded-2xl p-5 flex flex-col justify-between min-h-[138px] border border-white/[0.14] hover:border-emerald-400/45 select-none group overflow-hidden tabular-nums"
    >
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.14] border border-emerald-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-400/35 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-[0_0_14px_rgba(16,185,129,0.22)]">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trend}</span>
          </span>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-white tracking-tight leading-none">
            {prefix}
            {formatted}
            {suffix && <span className="text-xs font-normal text-zinc-300 ml-1">{suffix}</span>}
          </p>
          <p className="text-[11px] text-zinc-300/85 font-medium mt-1.5 uppercase tracking-wider">
            {label}
          </p>
        </div>

        <svg
          viewBox="0 0 80 28"
          className="w-16 h-7 opacity-75 group-hover:opacity-100 transition-opacity flex-shrink-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={sparkId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            d={sparkPoints}
            fill="none"
            stroke={`url(#${sparkId})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={prefersReduced ? false : { pathLength: 0, opacity: 0.3 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: prefersReduced ? 0.01 : 0.9, delay: 0.1 + delayIndex * 0.08, ease: "easeOut" }}
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
        icon={<Zap className="w-4 h-4 text-emerald-300" />}
        label="Deployed Flows"
        numericValue={activeCount}
        trend="+14%"
        delayIndex={0}
        sparkPoints="M2 22 C 18 20, 26 12, 40 14 S 62 6, 78 4"
        sparkId="kpi-spark-1"
      />
      <KPICard
        icon={<Activity className="w-4 h-4 text-pink-300" />}
        label="Total Triage Runs"
        numericValue={totalExecutions}
        trend={totalExecutions > 0 ? "Live" : "+24%"}
        delayIndex={1}
        sparkPoints="M2 24 C 16 18, 28 20, 42 12 S 60 10, 78 3"
        sparkId="kpi-spark-2"
      />
      <KPICard
        icon={<Clock className="w-4 h-4 text-blue-300" />}
        label="Hours Saved"
        numericValue={totalHoursSaved}
        decimals={1}
        suffix="h"
        trend={totalHoursSaved > 0 ? "Verified" : "+18%"}
        delayIndex={2}
        sparkPoints="M2 23 C 20 21, 30 16, 46 13 S 64 7, 78 5"
        sparkId="kpi-spark-3"
      />
      <KPICard
        icon={<DollarSign className="w-4 h-4 text-amber-300" />}
        label="Rev Protected"
        numericValue={estimatedRevenue}
        prefix="€"
        trend={estimatedRevenue > 0 ? "Active" : "+16%"}
        delayIndex={3}
        sparkPoints="M2 25 C 18 22, 32 14, 48 11 S 64 5, 78 2"
        sparkId="kpi-spark-4"
      />
    </div>
  );
}
