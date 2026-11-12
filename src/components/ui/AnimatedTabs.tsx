"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { navPillSpring } from "../../lib/motionVariants";

export interface AnimatedTabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface AnimatedTabsProps<T extends string = string> {
  tabs: AnimatedTabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  layoutId: string;
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

/**
 * Shared spring-capsule segmented control aligned with Navigation Tabs V10.
 * Uses GPU transforms via Motion layoutId with reduced-motion instant switches.
 */
export function AnimatedTabs<T extends string = string>({
  tabs,
  activeId,
  onChange,
  layoutId,
  size = "md",
  ariaLabel = "Section tabs",
  className,
}: AnimatedTabsProps<T>) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full bg-white/[0.03] border border-white/[0.08] p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs sm:text-sm",
              isActive ? "text-emerald-300" : "text-zinc-400 hover:text-white",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={prefersReduced ? undefined : layoutId}
                transition={navPillSpring}
                className="absolute inset-0 rounded-full bg-emerald-500/16 border border-emerald-400/40 -z-10"
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none",
                  isActive
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-white/[0.06] text-zinc-400",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
