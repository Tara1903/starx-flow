"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface GlassSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

export function GlassSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  layoutId = "glass-segment-pill",
  size = "md",
  className,
  ariaLabel = "Segmented control",
}: GlassSegmentedControlProps<T>) {
  const prefersReduced = useReducedMotion();

  const sizeClasses = {
    sm: "p-1 text-xs gap-1",
    md: "p-1.5 text-sm gap-1.5",
    lg: "p-2 text-base gap-2",
  }[size];

  const itemPadding = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
    lg: "px-5 py-2.5",
  }[size];

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full bg-[#07130d]/85 backdrop-blur-2xl border border-white/[0.14]",
        "shadow-[0_16px_40px_rgba(0,0,0,0.65),inset_0_1px_1.5px_rgba(255,255,255,0.22)] select-none",
        sizeClasses,
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
              itemPadding,
              isSelected
                ? "text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={prefersReduced ? undefined : layoutId}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 32,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-emerald-400/15 to-white/5 backdrop-blur-xl border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_20px_rgba(40,223,160,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.6)] -z-10"
              />
            )}
            {option.icon && (
              <span
                className={cn(
                  "transition-colors",
                  isSelected ? "text-emerald-300" : "text-zinc-400"
                )}
              >
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold leading-none",
                  isSelected
                    ? "bg-emerald-400/25 text-emerald-300 border border-emerald-400/40"
                    : "bg-white/[0.06] text-zinc-400 border border-white/10"
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
