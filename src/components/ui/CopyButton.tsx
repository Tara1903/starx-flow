"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { useToastStore } from "../../store/toastStore";

export interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  toastTitle?: string;
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastTitle = "Copied to clipboard",
  size = "sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const prefersReduced = useReducedMotion();
  const pushToast = useToastStore((s) => s.pushToast);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      pushToast({ title: toastTitle, tone: "success", durationMs: 2200 });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      pushToast({
        title: "Clipboard permission unavailable",
        description: "Please copy manually.",
        tone: "warning",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : `${label} ${value}`}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
        copied
          ? "bg-emerald-500/18 border-emerald-400/45 text-emerald-300"
          : "bg-white/[0.05] border-white/12 text-zinc-300 hover:text-white hover:border-white/25 hover:bg-white/[0.09]",
        size === "sm" ? "px-3 py-1.5 text-[11px] min-h-[34px]" : "px-4 py-2 text-xs min-h-[40px]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={prefersReduced ? undefined : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReduced ? undefined : { scale: 0.7, opacity: 0 }}
            className="inline-flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedLabel}</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={prefersReduced ? undefined : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReduced ? undefined : { scale: 0.85, opacity: 0 }}
            className="inline-flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
