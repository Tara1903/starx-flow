"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlassSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export function GlassSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = "md",
  className,
  id,
}: GlassSwitchProps) {
  const prefersReduced = useReducedMotion();

  const sizeClasses = {
    sm: {
      track: "w-9 h-5 p-0.5",
      thumb: "w-4 h-4",
      travel: 16,
    },
    md: {
      track: "w-12 h-6.5 p-0.5",
      thumb: "w-5.5 h-5.5",
      travel: 22,
    },
    lg: {
      track: "w-14 h-8 p-1",
      thumb: "w-6 h-6",
      travel: 24,
    },
  }[size];

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
          sizeClasses.track,
          checked
            ? "bg-gradient-to-r from-emerald-500/40 via-emerald-400/50 to-teal-400/40 border border-emerald-400/50 shadow-[0_0_20px_rgba(40,223,160,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.45)]"
            : "bg-[#07130d]/80 border border-white/[0.14] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        )}
      >
        <motion.span
          animate={{
            x: checked ? sizeClasses.travel : 0,
          }}
          transition={
            prefersReduced
              ? { duration: 0.1 }
              : { type: "spring", stiffness: 500, damping: 30 }
          }
          className={cn(
            "rounded-full pointer-events-none transition-shadow",
            sizeClasses.thumb,
            checked
              ? "bg-gradient-to-b from-white via-emerald-100 to-emerald-300 shadow-[0_0_14px_#34d399,0_2px_4px_rgba(0,0,0,0.3)] border border-white/80"
              : "bg-zinc-400/80 shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-white/20"
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[#f0f5ef]">{label}</span>
          )}
          {description && (
            <span className="text-xs text-zinc-400">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
