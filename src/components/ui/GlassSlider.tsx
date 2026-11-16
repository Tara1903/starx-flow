"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function GlassSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  formatValue = (v) => `${v}`,
  disabled = false,
  className,
  id,
}: GlassSliderProps) {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );

  return (
    <div className={cn("w-full space-y-2 select-none", className)}>
      {(label || value !== undefined) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-zinc-300">{label}</span>}
          <span className="font-mono font-semibold text-emerald-400">
            {formatValue(value)}
          </span>
        </div>
      )}

      <div className="relative flex items-center w-full h-6 group">
        {/* Optical Glass Track Background */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-[#07130d]/90 border border-white/[0.14] shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Glowing Emerald Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full shadow-[0_0_12px_rgba(40,223,160,0.4)] transition-[width] duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Native Range Input layered on top for perfect accessibility and touch/pointer handling */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
            disabled && "cursor-not-allowed"
          )}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />

        {/* Optical Glass Specular Thumb Indicator */}
        <div
          className={cn(
            "absolute w-5 h-5 -ml-2.5 rounded-full pointer-events-none transition-transform duration-100",
            "bg-gradient-to-b from-white via-emerald-100 to-emerald-300 border border-white",
            "shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_15px_rgba(52,211,153,0.6),inset_0_1px_1px_rgba(255,255,255,0.9)]",
            "group-hover:scale-110 group-active:scale-95",
            disabled && "opacity-40"
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
