"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { navPillSpring } from "../../lib/motionVariants";

export interface GlassToggleProps {
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
}

export function GlassToggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className,
}: GlassToggleProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "text-xs sm:text-sm font-semibold block",
                disabled ? "text-zinc-500 cursor-not-allowed" : "text-white cursor-pointer"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!checked);
        }}
        className={cn(
          "relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
          disabled
            ? "opacity-50 cursor-not-allowed bg-white/[0.04] border-white/10"
            : checked
            ? "bg-emerald-500/85 border-emerald-300/60 shadow-[0_0_16px_rgba(16,185,129,0.4)] cursor-pointer"
            : "bg-white/[0.08] border-white/15 hover:border-white/30 cursor-pointer"
        )}
      >
        <motion.span
          layout
          transition={prefersReduced ? { duration: 0.01 } : navPillSpring}
          className={cn(
            "inline-block h-5 w-5 rounded-full shadow-md",
            checked ? "ml-auto bg-white" : "mr-auto bg-zinc-300"
          )}
        />
      </button>
    </div>
  );
}
