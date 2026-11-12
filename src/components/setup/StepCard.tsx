"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface StepCardProps {
  children: React.ReactNode;
}

export function StepCard({ children }: StepCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-obsidian rounded-2xl p-6 sm:p-8 relative overflow-hidden flex-1 border border-emerald-500/15"
    >
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </motion.div>
  );
}
