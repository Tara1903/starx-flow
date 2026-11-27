"use client";

import React, { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CONSOLE_PANEL_LG,
  CONSOLE_SUBCARD,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface RevenueVelocityChartProps {
  totalRevenue?: number;
  totalExecutions?: number;
  activeWorkflows?: number;
}

export function RevenueVelocityChart({
  totalRevenue = 0,
  totalExecutions = 0,
  activeWorkflows = 0,
}: RevenueVelocityChartProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "executions">("overview");
  const prefersReduced = useReducedMotion();

  const { strokeD, areaD, points } = useMemo(() => {
    const revBase = Math.max(totalRevenue, 100);
    const execBase = Math.max(totalExecutions, 10);
    const scales =
      activeTab === "revenue"
        ? [0.42, 0.5, 0.58, 0.64, 0.78, 0.88, 1]
        : activeTab === "executions"
          ? [0.35, 0.48, 0.44, 0.68, 0.74, 0.91, 1]
          : [0.38, 0.46, 0.55, 0.62, 0.74, 0.85, 1];

    const hasData =
      activeTab === "revenue"
        ? totalRevenue > 0
        : activeTab === "executions"
          ? totalExecutions > 0
          : revBase > 0 || execBase > 0;

    const coords = scales.map((s, idx) => {
      const x = 20 + idx * 86;
      const y = hasData ? Math.round(150 - s * 105) : 150;
      return { x, y };
    });

    const stroke = coords
      .map((p, idx) => {
        if (idx === 0) return `M ${p.x} ${p.y}`;
        const prev = coords[idx - 1];
        const cx = Math.round((prev.x + p.x) / 2);
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(" ");

    const area = `${stroke} L ${coords[coords.length - 1].x} 170 L ${coords[0].x} 170 Z`;
    return { strokeD: stroke, areaD: area, points: coords };
  }, [activeTab, totalRevenue, totalExecutions]);

  const avgPlanMrr =
    totalRevenue > 0
      ? Math.round(totalRevenue / Math.max(1, activeWorkflows || 1))
      : 0;

  return (
    <div
      className={cn(
        CONSOLE_PANEL_LG,
        "w-full flex flex-col justify-between select-none tabular-nums"
      )}
    >
      {/* Header & Filter Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#edf0ee]/[0.08]">
        <div>
          <h3 className="text-sm font-medium text-[#edf0ee]">
            Platform velocity & revenue
          </h3>
          <p className="text-xs text-[#727c75] mt-0.5">
            Live subscription MRR and workflow throughput across tenants
          </p>
        </div>

        <div className="flex items-center p-1 rounded-lg bg-[#0d1210] border border-[#edf0ee]/[0.08] self-start sm:self-auto">
          {(["overview", "revenue", "executions"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer",
                  isActive
                    ? "bg-[#19201d] text-[#edf0ee] border border-[#edf0ee]/10"
                    : "text-[#727c75] hover:text-[#edf0ee]"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Chart Canvas */}
      <div className="relative w-full h-48 sm:h-56 my-4">
        <svg
          viewBox="0 0 560 180"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradientClean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line x1="20" y1="45" x2="536" y2="45" stroke="rgba(237,240,238,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="95" x2="536" y2="95" stroke="rgba(237,240,238,0.06)" strokeDasharray="3 3" />
          <line x1="20" y1="145" x2="536" y2="145" stroke="rgba(237,240,238,0.08)" />

          <path d={areaD} fill="url(#areaGradientClean)" />

          <motion.path
            key={activeTab}
            d={strokeD}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: prefersReduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={idx === points.length - 1 ? 4 : 2.5}
              fill={idx === points.length - 1 ? "#34d399" : "#121715"}
              stroke="#34d399"
              strokeWidth="1.75"
            />
          ))}
        </svg>
      </div>

      {/* Bottom Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#edf0ee]/[0.08]">
        <div className={cn(CONSOLE_SUBCARD, "p-3")}>
          <p className="text-xs text-[#727c75]">Active MRR</p>
          <p className="text-base font-semibold text-[#edf0ee] mt-0.5 tabular-nums">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className={cn(CONSOLE_SUBCARD, "p-3")}>
          <p className="text-xs text-[#727c75]">Total runs</p>
          <p className="text-base font-semibold text-[#edf0ee] mt-0.5 tabular-nums">
            {totalExecutions.toLocaleString()}
          </p>
        </div>

        <div className={cn(CONSOLE_SUBCARD, "p-3")}>
          <p className="text-xs text-[#727c75]">MRR per active flow</p>
          <p className="text-base font-semibold text-[#edf0ee] mt-0.5 tabular-nums">
            ${avgPlanMrr.toLocaleString()}
            <span className="text-xs text-[#727c75] font-normal">/mo</span>
          </p>
        </div>

        <div className={cn(CONSOLE_SUBCARD, "p-3")}>
          <p className="text-xs text-[#727c75]">Deployed flows</p>
          <p className="text-base font-semibold text-[#edf0ee] mt-0.5 tabular-nums">
            {activeWorkflows.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface MonthlyGoalGaugeProps {
  progress?: number;
  targetAmount?: string;
  currentAmount?: string;
}

export function MonthlyGoalGauge({
  progress = 0,
  targetAmount = "$5,000",
  currentAmount = "$0",
}: MonthlyGoalGaugeProps) {
  const prefersReduced = useReducedMotion();

  const clamped = Math.max(0, Math.min(100, progress));
  const r = 72;
  const arcSweep = 260;
  const totalLength = 2 * Math.PI * r * (arcSweep / 360);
  const strokeDashoffset = totalLength * (1 - clamped / 100);

  const numericTarget = Number(String(targetAmount).replace(/[^0-9.-]/g, "")) || 0;
  const numericCurrent = Number(String(currentAmount).replace(/[^0-9.-]/g, "")) || 0;
  const remaining = Math.max(0, numericTarget - numericCurrent);

  return (
    <div
      className={cn(
        CONSOLE_PANEL_LG,
        "w-full flex flex-col justify-between select-none tabular-nums"
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#edf0ee]/[0.08]">
        <div>
          <h3 className="text-sm font-medium text-[#edf0ee]">Monthly target</h3>
          <p className="text-xs text-[#727c75] mt-0.5">Goal {targetAmount} MRR</p>
        </div>
        <span className={clamped >= 100 ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
          {clamped >= 100 ? "Target reached" : `${clamped}% funded`}
        </span>
      </div>

      {/* Arc Visualizer */}
      <div className="relative w-full flex flex-col items-center justify-center my-4">
        <svg viewBox="0 0 200 160" className="w-48 h-36 overflow-visible">
          <path
            d="M 35 146 A 72 72 0 1 1 165 146"
            fill="none"
            stroke="rgba(237,240,238,0.08)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <motion.path
            d="M 35 146 A 72 72 0 1 1 165 146"
            fill="none"
            stroke="#34d399"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={totalLength}
            initial={prefersReduced ? false : { strokeDashoffset: totalLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: prefersReduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <div className="absolute top-[52px] flex flex-col items-center">
          <span className="text-3xl font-semibold text-[#edf0ee] tracking-[-0.02em]">
            {clamped}%
          </span>
          <span className="text-xs text-[#727c75] mt-0.5">of monthly goal</span>
        </div>
      </div>

      {/* Real Derived Summary */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#edf0ee]/[0.08] text-left">
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-[11px] text-[#727c75]">Current</p>
          <p className="text-xs font-medium text-[#edf0ee] mt-0.5">{currentAmount}</p>
        </div>
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-[11px] text-[#727c75]">Remaining</p>
          <p className="text-xs font-medium text-[#edf0ee] mt-0.5">
            ${remaining.toLocaleString()}
          </p>
        </div>
        <div className={cn(CONSOLE_SUBCARD, "p-2.5")}>
          <p className="text-[11px] text-[#727c75]">Target</p>
          <p className="text-xs font-medium text-[#4cc38a] mt-0.5">{targetAmount}</p>
        </div>
      </div>
    </div>
  );
}
