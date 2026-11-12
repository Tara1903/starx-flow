"use client";

import React, { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { ChartShell } from "./charts/ChartShell";
import { ChartTooltip } from "./charts/ChartTooltip";
import { cn } from "../../lib/utils";

export function ExecutionChart() {
  const chartData = useAuthStore((s) => s.chartData) || [];
  const prefersReduced = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showAverageLine, setShowAverageLine] = useState(true);

  const hasAnyExecutions = useMemo(
    () => chartData.some((d) => Number(d.value) > 0),
    [chartData]
  );

  const { maxValue, avgValue, totalRuns } = useMemo(() => {
    const values = chartData.map((d) => Number(d.value) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const max = Math.max(...values, 1);
    const avg = values.length > 0 ? sum / values.length : 0;
    return { maxValue: max, avgValue: avg, totalRuns: sum };
  }, [chartData]);

  const avgLinePct = maxValue > 0 ? Math.min(100, (avgValue / maxValue) * 100) : 0;

  return (
    <ChartShell
      title="Executions This Week"
      subtitle={hasAnyExecutions ? `${totalRuns.toLocaleString()} real automation runs recorded` : "Awaiting workflow trigger runs"}
      icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
      isEmpty={chartData.length === 0 || !hasAnyExecutions}
      emptyTitle="No executions in this window"
      emptyDescription="Activate or test a workflow to see live daily execution telemetry."
      actions={
        hasAnyExecutions ? (
          <>
            <button
              type="button"
              onClick={() => setShowAverageLine((prev) => !prev)}
              aria-pressed={showAverageLine}
              className={cn(
                "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors cursor-pointer tabular-nums",
                showAverageLine
                  ? "bg-emerald-500/14 border-emerald-400/35 text-emerald-300"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              7d Avg ({avgValue.toFixed(1)})
            </button>
            <span className="text-[11px] text-zinc-400 font-medium bg-white/[0.03] border border-white/10 px-2.5 py-1 rounded-full">
              Last 7 days
            </span>
          </>
        ) : null
      }
    >
      <div className="relative h-52 flex flex-col justify-end pt-6">
        {/* Reference horizontal guide lines */}
        <div
          aria-hidden="true"
          className="absolute inset-x-2 top-6 bottom-7 pointer-events-none flex flex-col justify-between"
        >
          <div className="border-t border-dashed border-white/[0.08] w-full flex justify-end">
            <span className="text-[9px] text-zinc-500 tabular-nums -mt-3.5">{maxValue}</span>
          </div>
          <div className="border-t border-dashed border-white/[0.06] w-full flex justify-end">
            <span className="text-[9px] text-zinc-500 tabular-nums -mt-3.5">{Math.round(maxValue / 2)}</span>
          </div>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        {/* Mean baseline overlay */}
        {showAverageLine && avgValue > 0 && (
          <div
            aria-hidden="true"
            style={{ bottom: `calc(1.75rem + ${avgLinePct * 0.72}%)` }}
            className="absolute inset-x-2 border-t border-emerald-400/45 border-dotted pointer-events-none z-10"
          />
        )}

        <div className="flex items-end justify-between gap-2 sm:gap-3 h-40 px-2 relative z-10">
          {chartData.map((d, i) => {
            const val = Number(d.value) || 0;
            const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
            const isActive = hoveredIdx === i;
            const deltaVsAvg =
              avgValue > 0 ? Math.round(((val - avgValue) / avgValue) * 100) : 0;

            return (
              <div
                key={`${d.day}-${i}`}
                tabIndex={0}
                role="button"
                aria-label={`${d.day}: ${val} executions`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(i)}
                onBlur={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end outline-none group cursor-pointer"
              >
                <div className="w-full relative flex justify-center items-end h-full">
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2">
                    <ChartTooltip
                      visible={isActive}
                      label={d.day}
                      value={`${val.toLocaleString()} runs`}
                      comparison={
                        avgValue > 0
                          ? `${deltaVsAvg >= 0 ? "+" : ""}${deltaVsAvg}% vs 7d avg`
                          : undefined
                      }
                    />
                  </div>

                  <motion.div
                    initial={prefersReduced ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={
                      prefersReduced
                        ? { duration: 0.01 }
                        : { delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                    }
                    style={{ height: `${Math.max(heightPct, val > 0 ? 6 : 2)}%`, originY: 1 }}
                    className={cn(
                      "w-full max-w-[38px] rounded-t-md bg-gradient-to-t from-emerald-600/90 to-emerald-400 transition-all shadow-[0_0_16px_rgba(16,185,129,0.14)]",
                      isActive && "from-emerald-400 to-teal-300 brightness-110 shadow-[0_0_24px_rgba(52,211,153,0.35)]"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 pt-2 border-t border-white/[0.06]">
          {chartData.map((d, i) => (
            <span
              key={`lbl-${i}`}
              className={cn(
                "flex-1 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors",
                hoveredIdx === i ? "text-emerald-300" : "text-zinc-400"
              )}
            >
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}
