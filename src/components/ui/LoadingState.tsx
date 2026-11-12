"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface LoadingStateProps {
  message?: string;
  compact?: boolean;
  className?: string;
}

export function LoadingState({
  message = "Loading workspace data...",
  compact = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center select-none",
        compact ? "py-8 px-4" : "py-20 px-6",
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="w-12 h-12 rounded-2xl glass-card-obsidian border border-emerald-500/30 flex items-center justify-center relative z-10">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {message}
      </p>
    </div>
  );
}
