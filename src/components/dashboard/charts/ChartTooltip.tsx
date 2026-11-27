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
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.98 }}
          transition={{ duration: 0.14 }}
          className={cn(
            "pointer-events-none z-30 min-w-[120px] rounded-lg bg-[#0c100e] border border-[#edf0ee]/12 px-3 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.65)] tabular-nums",
            className
          )}
        >
          <p className="text-[11px] font-medium text-[#727c75]">{label}</p>
          <p className="text-xs font-semibold text-[#edf0ee] mt-0.5">{value}</p>
          {sublabel && <p className="text-[11px] text-[#4cc38a] mt-0.5">{sublabel}</p>}
          {comparison && (
            <p className="text-[11px] text-[#a1aaa4] mt-1 border-t border-[#edf0ee]/[0.08] pt-1">
              {comparison}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
