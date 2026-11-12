"use client";

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "../../../lib/utils";

export interface ChartTooltipProps {
  visible: boolean;
  label: string;
  value: string | number;
  sublabel?: string;
  comparison?: string;
  className?: string;
}

export function ChartTooltip({
  visible,
  label,
  value,
  sublabel,
  comparison,
  className,
}: ChartTooltipProps) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.96 }}
          transition={{ duration: 0.14 }}
          className={cn(
            "pointer-events-none z-30 min-w-[120px] rounded-xl bg-[#07120e]/95 backdrop-blur-xl border border-emerald-400/30 px-3 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.75)] tabular-nums",
            className
          )}
          style={{ WebkitBackdropFilter: "blur(16px)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <p className="text-xs font-bold text-white mt-0.5">{value}</p>
          {sublabel && <p className="text-[10px] text-emerald-300 mt-0.5">{sublabel}</p>}
          {comparison && (
            <p className="text-[10px] text-zinc-400 mt-0.5 border-t border-white/[0.08] pt-1">
              {comparison}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
