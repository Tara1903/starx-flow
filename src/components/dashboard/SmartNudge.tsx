"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, AlertTriangle, CheckCircle, ArrowRight, X } from "lucide-react";
import { useDashboardStore, type SmartNudge } from "../../store/dashboardStore";
import { liquidSpring } from "../../lib/motionVariants";
import { cn } from "../../lib/utils";

export function SmartNudges() {
  const nudges = useDashboardStore((s) => s.smartNudges);
  const dismissNudge = useDashboardStore((s) => s.dismissNudge);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  if (nudges.length === 0) return null;

  const getStyles = (type: SmartNudge["type"]) => {
    switch (type) {
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />,
          border: "border-amber-400/28 bg-gradient-to-r from-amber-500/[0.11] via-amber-500/[0.04] to-transparent",
          accent: "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
          cta: "text-amber-200 hover:text-amber-100 bg-amber-500/18 hover:bg-amber-500/28 border border-amber-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        };
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />,
          border: "border-emerald-400/28 bg-gradient-to-r from-emerald-500/[0.11] via-emerald-500/[0.04] to-transparent",
          accent: "bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
          cta: "text-emerald-200 hover:text-emerald-100 bg-emerald-500/18 hover:bg-emerald-500/28 border border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-300 flex-shrink-0" />,
          border: "border-sky-400/28 bg-gradient-to-r from-sky-500/[0.11] via-sky-500/[0.04] to-transparent",
          accent: "bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
          cta: "text-sky-200 hover:text-sky-100 bg-sky-500/18 hover:bg-sky-500/28 border border-sky-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
        };
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {nudges.map((nudge, idx) => {
          const styles = getStyles(nudge.type);
          return (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.34, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <motion.div
                data-cursor-spotlight="true"
                whileHover={{ y: -2 }}
                transition={liquidSpring}
                className={cn(
                  "liquid-glass p-4 rounded-2xl border flex items-start gap-4 relative group shadow-[0_10px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]",
                  styles.border
                )}
              >
                {/* Luminous liquid accent beam */}
                <div className={cn("absolute left-0 top-2 bottom-2 w-[3.5px] rounded-full", styles.accent)} />

                {/* Icon */}
                <div className="mt-0.5 ml-1 relative z-10">{styles.icon}</div>

                {/* Content */}
                <div className="flex-1 pr-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <p className="text-xs text-zinc-200 font-medium leading-relaxed max-w-[580px]">
                      {nudge.message}
                    </p>
                  </div>
                  
                  {/* Action CTA */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveSection(nudge.ctaSection)}
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-3.5 rounded-full transition-all self-start md:self-auto cursor-pointer",
                      styles.cta
                    )}
                  >
                    <span>{nudge.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => dismissNudge(nudge.id)}
                  className="relative z-10 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Dismiss recommendation"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
