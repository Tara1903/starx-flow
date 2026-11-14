"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Calendar,
  Download,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Bot,
  MessageSquare,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AdminAnalyticsViewProps {
  totalClients: number;
  totalExecutions: number;
}

export function AdminAnalyticsView({
  totalClients,
  totalExecutions,
}: AdminAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "executions" | "clients">("overview");
  const prefersReduced = useReducedMotion();

  // Mini sparkline bar chart generator
  const renderSparklineBars = (heights: number[]) => (
    <div className="flex items-end gap-1 h-9 mt-3">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={cn(
            "flex-1 rounded-sm transition-all duration-300",
            i === heights.length - 1
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              : "bg-emerald-500/25 hover:bg-emerald-500/40"
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* ── 1. HEADER WITH DATE RANGE & CONTROLS (Frame 007) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#08150f]/80 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
              Platform Intelligence
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Live Aggregate Metrics
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analytics &amp; Telemetry
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={cn(
                  "relative px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-colors cursor-pointer",
                  timeRange === range
                    ? "text-white bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── 2. FOUR SUMMARY METRICS WITH SPARKLINE BARS (Frame 007/008) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Revenue</span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              <ArrowUpRight size={11} /> +18.4%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
            $59,553
          </p>
          {renderSparklineBars([35, 42, 48, 60, 55, 68, 74, 82, 95])}
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Executions</span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              <ArrowUpRight size={11} /> +12.2%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
            {(totalExecutions > 0 ? totalExecutions : 48290).toLocaleString()}
          </p>
          {renderSparklineBars([40, 50, 45, 62, 58, 70, 78, 85, 92])}
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Active Workflows</span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              <ArrowUpRight size={11} /> +22.0%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
            142
          </p>
          {renderSparklineBars([30, 38, 44, 52, 60, 65, 72, 80, 88])}
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Demo Conversion</span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
              <ArrowUpRight size={11} /> +4.5%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
            14.2%
          </p>
          {renderSparklineBars([25, 32, 40, 38, 45, 52, 60, 70, 82])}
        </div>
      </div>

      {/* ── 3. MAIN DETAILED CHART & "WHAT STANDS OUT" PANEL (Frame 008) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Main Chart Panel (7 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Daily Execution Throughput
                </h3>
                <p className="text-xs text-zinc-400">
                  Daily volume and peak concurrency over the last {timeRange}
                </p>
              </div>

              {/* View Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 self-start sm:self-auto text-xs">
                {(["overview", "revenue", "executions"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer",
                      activeTab === tab
                        ? "text-white bg-emerald-500/25 border border-emerald-400/40 text-emerald-300"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Bar Visualization */}
            <div className="w-full h-56 flex items-end justify-between gap-2 sm:gap-3 my-6 pt-6 px-2">
              {[
                { day: "Mon", val: 42, label: "4.2k" },
                { day: "Tue", val: 56, label: "5.6k" },
                { day: "Wed", val: 78, label: "7.8k", peak: true },
                { day: "Thu", val: 65, label: "6.5k" },
                { day: "Fri", val: 84, label: "8.4k" },
                { day: "Sat", val: 38, label: "3.8k" },
                { day: "Sun", val: 32, label: "3.2k" },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-300 transition-colors">
                    {item.label}
                  </span>
                  <div
                    style={{ height: `${item.val * 1.8}px` }}
                    className={cn(
                      "w-full rounded-xl transition-all duration-300 relative overflow-hidden",
                      item.peak
                        ? "bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.5)]"
                        : "bg-emerald-500/20 group-hover:bg-emerald-500/35 border border-emerald-500/20"
                    )}
                  >
                    {item.peak && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/60" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs text-zinc-400">
            <span>Peak Day: Wednesday (7.8k executions)</span>
            <span className="text-emerald-400 font-semibold font-mono">
              Average Latency: 240ms
            </span>
          </div>
        </div>

        {/* Right Side: "What Stands Out" Panel (Frame 008) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#08150f]/85 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-4">
          <div className="pb-3 border-b border-white/[0.08]">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              What Stands Out
            </h3>
            <p className="text-xs text-zinc-400">
              Key operational highlights and anomalies
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-400" />
                  WhatsApp AI Engine
                </span>
                <span className="text-emerald-400 font-mono">48% Volume</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Primary client workload driver across booking and support bots.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Bot size={14} className="text-emerald-400" />
                  Voice Receptionist
                </span>
                <span className="text-emerald-400 font-mono">2,840 Calls</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Average call duration 1m 45s with 94% successful resolution.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Zero Platform Outages
                </span>
                <span className="text-emerald-400 font-mono">100% SLA</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                All edge webhook handlers maintained sub-300ms response times.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-400" />
                  Enterprise Inquiries
                </span>
                <span className="text-emerald-400 font-mono">+28% WoW</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Highest inbound lead volume originating from dental and fitness clinics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
