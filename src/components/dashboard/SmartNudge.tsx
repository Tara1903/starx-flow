"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, AlertTriangle, CheckCircle, ArrowRight, X } from "lucide-react";
import { useDashboardStore, type SmartNudge } from "../../store/dashboardStore";
import { CONSOLE_PANEL, CONSOLE_BTN_SECONDARY } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function SmartNudges() {
  const nudges = useDashboardStore((s) => s.smartNudges);
  const dismissNudge = useDashboardStore((s) => s.dismissNudge);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  if (nudges.length === 0) return null;

  const getIcon = (type: SmartNudge["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" strokeWidth={1.65} />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#4cc38a] flex-shrink-0" strokeWidth={1.65} />;
      default:
        return <Info className="w-4 h-4 text-sky-300 flex-shrink-0" strokeWidth={1.65} />;
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {nudges.map((nudge) => (
          <motion.div
            key={nudge.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={cn(CONSOLE_PANEL, "p-4 flex items-center justify-between gap-4")}>
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5">{getIcon(nudge.type)}</div>
                <p className="text-xs text-[#a1aaa4] leading-relaxed">{nudge.message}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSection(nudge.ctaSection)}
                  className={CONSOLE_BTN_SECONDARY}
                >
                  <span>{nudge.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => dismissNudge(nudge.id)}
                  className="text-[#727c75] hover:text-[#edf0ee] p-1.5 rounded-lg hover:bg-[#19201d] transition-colors cursor-pointer"
                  aria-label="Dismiss recommendation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
