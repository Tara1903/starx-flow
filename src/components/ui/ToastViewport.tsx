"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { useToastStore, type ToastTone } from "../../store/toastStore";
import { springTransition } from "../../lib/motionVariants";
import { cn } from "../../lib/utils";

const TONE_STYLES: Record<ToastTone, { icon: React.ReactNode; border: string; badge: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    border: "border-emerald-400/35 shadow-[0_18px_42px_rgba(0,0,0,0.65),0_0_24px_rgba(16,185,129,0.18)]",
    badge: "bg-emerald-500/15 border-emerald-500/30",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    border: "border-red-400/40 shadow-[0_18px_42px_rgba(0,0,0,0.65),0_0_24px_rgba(239,68,68,0.18)]",
    badge: "bg-red-500/15 border-red-500/30",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    border: "border-amber-400/35 shadow-[0_18px_42px_rgba(0,0,0,0.65),0_0_24px_rgba(245,158,11,0.15)]",
    badge: "bg-amber-500/15 border-amber-500/30",
  },
  info: {
    icon: <Info className="w-4 h-4 text-sky-400" />,
    border: "border-sky-400/30 shadow-[0_18px_42px_rgba(0,0,0,0.65),0_0_24px_rgba(56,189,248,0.15)]",
    badge: "bg-sky-500/15 border-sky-500/30",
  },
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);
  const prefersReduced = useReducedMotion();

  return (
    <div
      aria-live="polite"
      aria-relevant="additions text"
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] sm:bottom-6 right-4 sm:right-6 z-[9995] flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-[360px] pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              role={toast.tone === "error" ? "alert" : "status"}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
              transition={springTransition}
              className={cn(
                "pointer-events-auto rounded-2xl bg-[#060f0c]/92 backdrop-blur-2xl border p-3.5 flex items-start gap-3",
                style.border
              )}
              style={{ WebkitBackdropFilter: "blur(24px)" }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5",
                  style.badge
                )}
              >
                {style.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {toast.description}
                  </p>
                )}
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction?.();
                      dismissToast(toast.id);
                    }}
                    className="mt-2 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline underline-offset-2 cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
