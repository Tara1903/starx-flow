"use client";

import React, { useEffect, useState, memo, useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { Zap, Activity, Clock, DollarSign } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { CONSOLE_PANEL } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface KPICardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  comparison: string;
  highlight?: boolean;
}

const KPICard = memo(function KPICard({
  icon: Icon,
  label,
  numericValue,
  prefix = "",
  suffix,
  decimals = 0,
  comparison,
  highlight = false,
}: KPICardProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? numericValue : 0);

  useEffect(() => {
    if (prefersReduced || (typeof document !== "undefined" && document.hidden)) {
      setDisplayValue(numericValue);
      return;
    }

    let frame = 0;
    const totalFrames = 18;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(numericValue * eased);
      if (progress >= 1) window.clearInterval(timer);
    }, 20);
    return () => window.clearInterval(timer);
  }, [numericValue, prefersReduced]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <div
      className={cn(
        CONSOLE_PANEL,
        "flex flex-col justify-between min-h-[124px] select-none tabular-nums hover:border-[#edf0ee]/14 transition-colors duration-150"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#a1aaa4] truncate">{label}</span>
        <Icon className="w-4 h-4 text-[#727c75] flex-shrink-0" strokeWidth={1.65} />
      </div>

      <div className="mt-3">
        <p
          className={cn(
            "text-[28px] font-semibold tracking-[-0.02em] leading-none",
            highlight ? "text-[#4cc38a]" : "text-[#edf0ee]"
          )}
        >
          {prefix}
          {formatted}
          {suffix && <span className="text-sm font-normal text-[#a1aaa4] ml-0.5">{suffix}</span>}
        </p>
        <p className="text-xs text-[#727c75] mt-2 truncate">{comparison}</p>
      </div>
    </div>
  );
});

export function KPIGrid() {
  const workflows = useAuthStore((s) => s.workflows);

  const { totalCount, activeRunning, totalExecutions, totalHoursSaved, estimatedRevenue } =
    useMemo(() => {
      const active = workflows.filter((w) => w.isActive).length;
      const executions = workflows.reduce((acc, wf) => acc + (wf.executionsCount || 0), 0);
      const hours = Number(workflows.reduce((acc, wf) => acc + (wf.savedHours || 0), 0).toFixed(1));
      return {
        totalCount: workflows.length,
        activeRunning: active,
        totalExecutions: executions,
        totalHoursSaved: hours,
        estimatedRevenue: Math.round(hours * 55),
      };
    }, [workflows]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
      <KPICard
        icon={Zap}
        label="Deployed flows"
        numericValue={totalCount}
        comparison={`${activeRunning} currently active`}
      />
      <KPICard
        icon={Activity}
        label="Total triage runs"
        numericValue={totalExecutions}
        comparison={totalExecutions > 0 ? "Recorded across all channels" : "Awaiting workflow runs"}
      />
      <KPICard
        icon={Clock}
        label="Hours saved"
        numericValue={totalHoursSaved}
        decimals={1}
        suffix="h"
        comparison="Calculated from automated runs"
      />
      <KPICard
        icon={DollarSign}
        label="Estimated value saved"
        numericValue={estimatedRevenue}
        prefix="€"
        highlight={estimatedRevenue > 0}
        comparison="Based on €55/hr operator baseline"
      />
    </div>
  );
}
