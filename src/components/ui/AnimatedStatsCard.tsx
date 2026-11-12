"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { cardHoverGlow, MOTION_EASE } from "../../lib/motionVariants";

export interface AnimatedStatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

export function AnimatedStatsCard({
  label,
  value,
  icon,
  delta,
  deltaPositive = true,
  subtitle,
  delay = 0,
  className,
  onClick,
}: AnimatedStatsCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: MOTION_EASE.premium }}
      whileHover={prefersReduced ? undefined : cardHoverGlow}
      onClick={onClick}
      className={cn(
        "glass-card-obsidian rounded-2xl p-5 transition-all duration-200 hover:border-emerald-500/35 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(16,185,129,0.12)] group",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/15 transition-transform flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(delta || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border",
                deltaPositive
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              )}
            >
              {deltaPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {delta}
            </span>
          )}
          {subtitle && <span className="text-zinc-500 truncate">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
}
