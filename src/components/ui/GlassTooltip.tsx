"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

export interface GlassTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function GlassTooltip({
  content,
  children,
  side = "top",
  className,
}: GlassTooltipProps) {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
  };

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            role="tooltip"
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute z-50 px-2.5 py-1.5 rounded-lg bg-[#09120f]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_12px_rgba(16,185,129,0.08)] text-xs font-medium text-zinc-100 whitespace-nowrap pointer-events-none",
              positionClasses[side]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
