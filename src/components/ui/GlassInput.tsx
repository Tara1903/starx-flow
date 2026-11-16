"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  variant?: "default" | "subtle" | "prominent";
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      className,
      type = "text",
      icon,
      rightElement,
      error,
      variant = "default",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-1.5">
        <div
          className={cn(
            "relative flex items-center w-full rounded-2xl transition-all duration-200 group",
            "bg-[#07130d]/80 backdrop-blur-xl border",
            error
              ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              : "border-white/[0.14] focus-within:border-emerald-400/60 focus-within:shadow-[0_0_24px_rgba(40,223,160,0.18),inset_0_1.5px_1px_rgba(255,255,255,0.4)]",
            variant === "prominent" && "bg-[#0b1d14]/90 border-white/[0.18]",
            variant === "subtle" && "bg-white/[0.03] border-white/[0.08]",
            disabled && "opacity-50 cursor-not-allowed",
            "shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.25)]"
          )}
        >
          {icon && (
            <div className="pl-3.5 pr-1 text-zinc-400 group-focus-within:text-emerald-300 transition-colors flex-shrink-0">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent px-4 py-2.5 text-sm text-[#f0f5ef] placeholder:text-zinc-500",
              "focus:outline-none focus:ring-0 selection:bg-emerald-500/30 selection:text-emerald-200",
              icon && "pl-2",
              rightElement && "pr-2",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="pr-3 pl-1 flex items-center flex-shrink-0">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-400 pl-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
GlassInput.displayName = "GlassInput";

export interface GlassTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  variant?: "default" | "subtle" | "prominent";
}

export const GlassTextarea = React.forwardRef<
  HTMLTextAreaElement,
  GlassTextareaProps
>(({ className, error, variant = "default", disabled, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      <div
        className={cn(
          "relative flex w-full rounded-2xl transition-all duration-200 group p-1",
          "bg-[#07130d]/80 backdrop-blur-xl border",
          error
            ? "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : "border-white/[0.14] focus-within:border-emerald-400/60 focus-within:shadow-[0_0_24px_rgba(40,223,160,0.18),inset_0_1.5px_1px_rgba(255,255,255,0.4)]",
          variant === "prominent" && "bg-[#0b1d14]/90 border-white/[0.18]",
          variant === "subtle" && "bg-white/[0.03] border-white/[0.08]",
          disabled && "opacity-50 cursor-not-allowed",
          "shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.25)]"
        )}
      >
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full bg-transparent px-3.5 py-2.5 text-sm text-[#f0f5ef] placeholder:text-zinc-500 resize-y min-h-[96px]",
            "focus:outline-none focus:ring-0 selection:bg-emerald-500/30 selection:text-emerald-200",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400 pl-1 font-medium">{error}</p>
      )}
    </div>
  );
});
GlassTextarea.displayName = "GlassTextarea";
