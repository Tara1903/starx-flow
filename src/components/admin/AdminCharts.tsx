"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  TrendingUp,
  Target,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface RevenueVelocityChartProps {
  totalRevenue?: number;
  totalExecutions?: number;
  activeWorkflows?: number;
}

export function RevenueVelocityChart({
  totalRevenue = 59553,
  totalExecutions = 48290,
  activeWorkflows = 142,
}: RevenueVelocityChartProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "executions">("overview");
  const prefersReduced = useReducedMotion();

  // 7-point curved Bezier SVG curve
  // Normalized points: 0: 140, 1: 125, 2: 95, 3: 110, 4: 70, 5: 60, 6: 45
  const pathD = "M 20 135 C 70 130, 120 95, 180 100 C 240 105, 300 75, 360 65 C 420 55, 480 70, 540 45 L 540 180 L 20 180 Z";
  const strokeD = "M 20 135 C 70 130, 120 95, 180 100 C 240 105, 300 75, 360 65 C 420 55, 480 70, 540 45";

  return (
    <div className="relative p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)] overflow-hidden flex flex-col justify-between select-none">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Platform Velocity &amp; Revenue
            </h3>
          </div>
          <p className="text-xs text-zinc-300 mt-0.5">
            Real-time execution throughput &amp; platform MRR growth
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          {(["overview", "revenue", "executions"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer",
                  isActive ? "text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="velocityFilterPill"
                    transition={
                      prefersReduced
                        ? undefined
                        : { type: "spring", stiffness: 400, damping: 30 }
                    }
                    className="absolute inset-0 rounded-lg bg-emerald-500/25 border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] pointer-events-none"
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Bezier Area Chart */}
      <div className="relative w-full h-44 sm:h-52 my-3">
        <svg
          viewBox="0 0 560 190"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradientV7" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="strokeGradientV7" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1="20" y1="45" x2="540" y2="45" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="20" y1="90" x2="540" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="20" y1="135" x2="540" y2="135" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Area Fill */}
          <path d={pathD} fill="url(#areaGradientV7)" />

          {/* Animated Curved Stroke */}
          <motion.path
            d={strokeD}
            fill="none"
            stroke="url(#strokeGradientV7)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />

          {/* Highlight Data Checkpoints */}
          <circle cx="180" cy="100" r="4.5" fill="#10b981" stroke="#050807" strokeWidth="2.5" />
          <circle cx="360" cy="65" r="4.5" fill="#34d399" stroke="#050807" strokeWidth="2.5" />
          <circle cx="540" cy="45" r="5" fill="#6ee7b7" stroke="#050807" strokeWidth="2.5" className="filter drop-shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
        </svg>

        {/* Milestone Tooltip Pill over peak */}
        <div className="absolute top-2 right-4 sm:right-8 px-2.5 py-1 rounded-xl bg-[#091f16] border border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.35)] flex items-center gap-1.5 pointer-events-none">
          <ArrowUpRight size={13} className="text-emerald-400" />
          <span className="text-xs font-mono font-bold text-white">Peak €5.6k</span>
          <span className="text-[10px] font-mono text-emerald-300 font-semibold">+18.4%</span>
        </div>
      </div>

      {/* Bottom Sub-Metric Capsules (Matching Frame 003) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/[0.08]">
        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <p className="text-[10px] uppercase font-semibold text-zinc-300 tracking-wider">
            Gross Volume
          </p>
          <p className="text-base sm:text-lg font-bold font-mono text-white">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <p className="text-[10px] uppercase font-semibold text-zinc-300 tracking-wider">
            Executions
          </p>
          <p className="text-base sm:text-lg font-bold font-mono text-white">
            {totalExecutions.toLocaleString()}
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <p className="text-[10px] uppercase font-semibold text-zinc-300 tracking-wider">
            Avg Plan MRR
          </p>
          <p className="text-base sm:text-lg font-bold font-mono text-white">
            $499<span className="text-xs text-zinc-300 font-normal">/mo</span>
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <p className="text-[10px] uppercase font-semibold text-zinc-300 tracking-wider">
            Active Flows
          </p>
          <p className="text-base sm:text-lg font-bold font-mono text-white">
            {activeWorkflows}
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
  progress = 78,
  targetAmount = "$75,000",
  currentAmount = "$59,553",
}: MonthlyGoalGaugeProps) {
  const prefersReduced = useReducedMotion();

  // 260° arc calculation: center (100, 100), radius 72
  const r = 72;
  const arcSweep = 260; // deg
  const totalLength = 2 * Math.PI * r * (arcSweep / 360);
  const strokeDashoffset = totalLength * (1 - progress / 100);

  // Generate 24 radial tick marks
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = -130 + i * (260 / 23);
    const rad = (angle * Math.PI) / 180;
    const x1 = Math.round(100 + 58 * Math.cos(rad));
    const y1 = Math.round(100 + 58 * Math.sin(rad));
    const x2 = Math.round(100 + 64 * Math.cos(rad));
    const y2 = Math.round(100 + 64 * Math.sin(rad));
    const isCompleted = i / 23 <= progress / 100;
    return { x1, y1, x2, y2, isCompleted };
  });

  return (
    <div className="relative p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.14)] overflow-hidden flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Target size={16} className="text-emerald-400" />
            Monthly Goal
          </h3>
          <p className="text-xs text-zinc-300 mt-0.5">
            Capacity target vs {targetAmount} goal
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          On Pace
        </span>
      </div>

      {/* Speedometer Gauge Visualizer */}
      <div className="relative w-full flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 200 160" className="w-52 h-40 overflow-visible">
          <defs>
            <linearGradient id="gaugeGradientV7" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 35 146 A 72 72 0 1 1 165 146"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Inner Radial Ticks */}
          {ticks.map((t, idx) => (
            <line
              key={idx}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isCompleted ? "#10b981" : "rgba(255,255,255,0.12)"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}

          {/* Animated Value Arc */}
          <motion.path
            d="M 35 146 A 72 72 0 1 1 165 146"
            fill="none"
            stroke="url(#gaugeGradientV7)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={totalLength}
            initial={prefersReduced ? false : { strokeDashoffset: totalLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute top-[52px] flex flex-col items-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {progress}%
          </span>
          <span className="text-[11px] text-zinc-300 font-sans">
            Capacity achieved
          </span>
        </div>
      </div>

      {/* Bottom Target Milestones (Matching Frame 003) */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.08] text-center">
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[9px] uppercase font-semibold text-zinc-300">Min Capacity</p>
          <p className="text-xs font-bold font-mono text-white">$6.1K</p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
          <p className="text-[9px] uppercase font-semibold text-emerald-400">Projected</p>
          <p className="text-xs font-bold font-mono text-emerald-300">$11.5K</p>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[9px] uppercase font-semibold text-zinc-300">Today Pace</p>
          <p className="text-xs font-bold font-mono text-white">$323</p>
        </div>
      </div>
    </div>
  );
}
