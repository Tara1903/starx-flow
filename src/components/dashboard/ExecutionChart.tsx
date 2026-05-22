import React from "react";
import { BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/authStore";

export function ExecutionChart() {
  const chartData = useAuthStore((s) => s.chartData) || [];
  const maxValue = Math.max(...chartData.map((d) => d.value), 5); // Fallback to 5 to avoid 0 division if no data

  return (
    <div className="glass-card rounded-xl p-5 select-none h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4.5 h-4.5 text-zinc-400" />
          <span>Executions This Week</span>
        </h3>
        <span className="text-[11px] text-zinc-500 font-medium bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md">
          Last 7 days
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-44 text-center">
          <p className="text-xs text-zinc-500 font-medium">No activity data yet</p>
          <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
            Data will appear once your active workflows trigger and run.
          </p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-3 h-44 px-2">
          {chartData.map((d, i) => {
            const heightPct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full relative flex justify-center items-end h-[80%]">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 bg-black/90 border border-white/10 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {d.value} runs
                  </div>

                  {/* Bar */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: `${Math.max(heightPct, 4)}%`, originY: 1 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 relative cursor-crosshair group-hover:from-emerald-500 group-hover:to-teal-300 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">{d.day}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
