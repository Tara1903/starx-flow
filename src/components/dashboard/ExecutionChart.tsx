"use client";

import React, { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { ChartShell } from "./charts/ChartShell";
import { ChartTooltip } from "./charts/ChartTooltip";
import { CONSOLE_BADGE_MUTED } from "../../lib/consoleSurface";
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
      title="Executions this week"
      subtitle={
        hasAnyExecutions
          ? `${totalRuns.toLocaleString()} automation runs over the last 7 days`
          : "Awaiting workflow runs"
      }
      icon={<BarChart3 className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />}
      isEmpty={chartData.length === 0 || !hasAnyExecutions}
      emptyTitle="No executions recorded yet"
      emptyDescription="Activate or test a workflow to populate daily throughput"
      actions={
        hasAnyExecutions ? (
          <>
            <button
              type="button"
              onClick={() => setShowAverageLine((prev) => !prev)}
              aria-pressed={showAverageLine}
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-md border transition-colors cursor-pointer tabular-nums",
                showAverageLine
                  ? "bg-[#19201d] border-[#34d399]/35 text-[#edf0ee]"
                  : "bg-[#0d1210] border-[#edf0ee]/[0.08] text-[#727c75] hover:text-[#edf0ee]"
              )}
            >
              7d avg {avgValue.toFixed(1)}
            </button>
            <span className={CONSOLE_BADGE_MUTED}>Last 7 days</span>
          </>
        ) : null
      }
    >
      <div className="relative h-64 flex flex-col justify-end pt-6">
        {/* Reference Horizontal Guide Lines */}
        <div
          aria-hidden="true"
          className="absolute inset-x-2 top-6 bottom-7 pointer-events-none flex flex-col justify-between"
        >
          <div className="border-t border-dashed border-[#edf0ee]/[0.06] w-full flex justify-end">
            <span className="text-[11px] font-mono text-[#727c75] tabular-nums -mt-4">
              {maxValue}
            </span>
          </div>
          <div className="border-t border-dashed border-[#edf0ee]/[0.05] w-full flex justify-end">
            <span className="text-[11px] font-mono text-[#727c75] tabular-nums -mt-4">
              {Math.round(maxValue / 2)}
            </span>
          </div>
          <div className="border-t border-[#edf0ee]/[0.08] w-full" />
        </div>

        {/* 7-day Mean Baseline */}
        {showAverageLine && avgValue > 0 && (
          <div
            aria-hidden="true"
            style={{ bottom: `calc(1.75rem + ${avgLinePct * 0.72}%)` }}
            className="absolute inset-x-2 border-t border-[#34d399]/40 border-dashed pointer-events-none z-10"
          />
        )}

        <div className="flex items-end justify-between gap-2 sm:gap-3 h-52 px-2 relative z-10">
          {chartData.map((d, i) => {
            const val = Number(d.value) || 0;
            const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
            const isActive = hoveredIdx === i;
            const isPeak = val === maxValue && val > 0;
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
                        : { delay: i * 0.035, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                    }
                    style={{ height: `${Math.max(heightPct, val > 0 ? 5 : 2)}%`, originY: 1 }}
                    className={cn(
                      "w-full max-w-[38px] rounded-t-md transition-colors",
                      isPeak || isActive ? "bg-[#34d399]" : "bg-[#727c75]/45 hover:bg-[#a1aaa4]"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 pt-2 border-t border-[#edf0ee]/[0.06]">
          {chartData.map((d, i) => (
            <span
              key={`lbl-${i}`}
              className={cn(
                "flex-1 text-center text-xs font-mono transition-colors",
                hoveredIdx === i ? "text-[#edf0ee]" : "text-[#727c75]"
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
