"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface GlassSkeletonProps {
  variant?: "kpi-row" | "table-rows" | "card-grid" | "chat-list" | "panel";
  count?: number;
  className?: string;
}

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white/[0.06] animate-pulse motion-reduce:animate-none",
        className
      )}
    />
  );
}

export function GlassSkeleton({
  variant = "panel",
  count = 4,
  className,
}: GlassSkeletonProps) {
  if (variant === "kpi-row") {
    return (
      <div
        role="status"
        aria-label="Loading key performance indicators"
        className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass-card-obsidian rounded-2xl p-5 min-h-[138px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <ShimmerBar className="w-10 h-10 rounded-xl" />
              <ShimmerBar className="w-14 h-5 rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
              <ShimmerBar className="w-24 h-7" />
              <ShimmerBar className="w-28 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table-rows") {
    return (
      <div
        role="status"
        aria-label="Loading records"
        className={cn("glass-card-obsidian rounded-2xl p-4 sm:p-5 space-y-3", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <ShimmerBar className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <ShimmerBar className="w-36 h-3.5" />
                <ShimmerBar className="w-48 h-2.5 opacity-70" />
              </div>
            </div>
            <ShimmerBar className="w-20 h-6 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card-grid") {
    return (
      <div
        role="status"
        aria-label="Loading items"
        className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass-card-obsidian rounded-2xl p-6 space-y-4 min-h-[180px]"
          >
            <ShimmerBar className="w-11 h-11 rounded-xl" />
            <ShimmerBar className="w-2/3 h-5" />
            <ShimmerBar className="w-full h-3" />
            <ShimmerBar className="w-4/5 h-3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chat-list") {
    return (
      <div role="status" aria-label="Loading conversations" className={cn("space-y-2.5 p-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-panel rounded-xl p-3 flex items-center gap-3">
            <ShimmerBar className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerBar className="w-28 h-3.5" />
              <ShimmerBar className="w-44 h-2.5 opacity-70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading workspace module"
      className={cn("space-y-5 py-4", className)}
    >
      <div className="glass-card-obsidian rounded-2xl p-6 space-y-3">
        <ShimmerBar className="w-44 h-5" />
        <ShimmerBar className="w-72 h-3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ShimmerBar className="h-32 rounded-2xl" />
        <ShimmerBar className="h-32 rounded-2xl" />
        <ShimmerBar className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
