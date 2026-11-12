"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { springTransition } from "../../lib/motionVariants";

export interface SuccessStateProps {
  title: string;
  description?: string;
  compact?: boolean;
  className?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function SuccessState({
  title,
  description,
  compact = false,
  className,
  action,
  children,
}: SuccessStateProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-4" : "py-8 px-4",
        className
      )}
    >
      <motion.div
        initial={prefersReduced ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springTransition}
        className="relative mb-4"
      >
        <div className="absolute -inset-3 rounded-full bg-emerald-500/25 blur-xl" />
        <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_32px_rgba(16,185,129,0.45)]">
          <Check className="w-8 h-8 text-emerald-300 stroke-[2.75]" />
        </div>
      </motion.div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
