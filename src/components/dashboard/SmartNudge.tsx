import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, AlertTriangle, CheckCircle, ArrowRight, X } from "lucide-react";
import { useDashboardStore, type SmartNudge } from "../../store/dashboardStore";
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
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          border: "border-amber-500/20 bg-amber-500/5",
          accent: "bg-amber-400",
          cta: "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/10"
        };
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          border: "border-emerald-500/20 bg-emerald-500/5",
          accent: "bg-emerald-400",
          cta: "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/10"
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
          border: "border-blue-500/20 bg-blue-500/5",
          accent: "bg-blue-400",
          cta: "text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/10"
        };
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {nudges.map((nudge) => {
          const styles = getStyles(nudge.type);
          return (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "p-4 rounded-xl border flex items-start gap-4 relative group shadow-sm",
                  styles.border
                )}
              >
                {/* Accent line on left */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", styles.accent)} />

                {/* Icon */}
                <div className="mt-0.5">{styles.icon}</div>

                {/* Content */}
                <div className="flex-1 pr-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed max-w-[560px]">
                      {nudge.message}
                    </p>
                  </div>
                  
                  {/* Action CTA */}
                  <button
                    onClick={() => setActiveSection(nudge.ctaSection)}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-bold py-1.5 px-3.5 rounded-full transition-all self-start md:self-auto",
                      styles.cta
                    )}
                  >
                    <span>{nudge.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => dismissNudge(nudge.id)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-white/5 transition-colors"
                  aria-label="Dismiss recommendation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
