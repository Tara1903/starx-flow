"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, AlertTriangle, Info, ArrowRight, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { liquidSpring } from "../../lib/motionVariants";
import { cn } from "../../lib/utils";

export function DashboardNotifications() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

  // Onboarding Store
  const { isComplete, steps, currentStep, completedSteps } = useOnboardingStore();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const isSetupFullyDone = isComplete && completedSteps.length === steps.length;
  const showOnboarding = !isSetupFullyDone && !onboardingDismissed;

  const completedCount = completedSteps.length;
  const totalCount = steps.length || 7;
  const percent = Math.round((completedCount / totalCount) * 100);

  const handleResumeOnboarding = () => {
    const activeStep = steps.find((s) => s.id === currentStep) || steps[0];
    if (activeStep?.route) {
      router.push(activeStep.route);
    } else {
      router.push("/setup");
    }
  };

  // Nudges Store
  const nudges = useDashboardStore((s) => s.smartNudges);
  const dismissNudge = useDashboardStore((s) => s.dismissNudge);

  const instagramNudge = nudges.find((n) => n.id === "ndg-1" || n.ctaSection === "channels");
  const aiNudge = nudges.find((n) => n.id === "ndg-2" || n.ctaSection === "playground");

  // Calculate visible count for responsive grid
  const activeCount = 1 + (showOnboarding ? 1 : 0) + (instagramNudge ? 1 : 0) + (aiNudge ? 1 : 0);

  const gridClass =
    activeCount >= 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : activeCount === 3
        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        : activeCount === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1";

  return (
    <div className={cn("grid gap-3.5 select-none", gridClass)}>
      {/* ─── CARD 1: AI AGENT SHIELD ─── */}
      <motion.div
        layout
        whileHover={{ y: -2 }}
        transition={liquidSpring}
        className="glass-card-obsidian rounded-2xl p-4 border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col justify-between min-h-[114px] relative group overflow-hidden"
      >
        <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />

        <div className="flex items-center justify-between gap-2 relative z-10 pl-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/18 border border-emerald-400/35 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide truncate">AI Agent Shield</h4>
          </div>
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#34d399]" />
          </span>
        </div>

        <p className="text-[11px] text-zinc-300/85 leading-snug my-1.5 pl-1 relative z-10">
          Security &amp; credentials 100% active and protected.
        </p>

        <div className="flex items-center justify-between pt-1 pl-1 relative z-10 border-t border-white/[0.05]">
          <span className="text-[10px] font-medium text-emerald-300/80 truncate">
            Operational
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection("settings")}
            className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/35 transition-all cursor-pointer flex-shrink-0"
          >
            <span>Settings</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* ─── CARD 2: ONBOARDING INCOMPLETE ─── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={liquidSpring}
            className="glass-card-obsidian rounded-2xl p-4 border border-amber-500/28 bg-gradient-to-r from-amber-500/[0.09] via-amber-500/[0.03] to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col justify-between min-h-[114px] relative group overflow-hidden"
          >
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />

            <div className="flex items-center justify-between gap-2 relative z-10 pl-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/18 border border-amber-400/35 flex items-center justify-center text-amber-300 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide truncate">
                  Onboarding ({percent}%)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setOnboardingDismissed(true)}
                className="text-zinc-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Dismiss onboarding alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-300/85 leading-snug my-1.5 pl-1 relative z-10">
              {completedCount} of {totalCount} tasks done. Finish setup to go live.
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 pl-1 relative z-10 border-t border-white/[0.05]">
              <div className="h-1.5 flex-1 max-w-[80px] rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.06]">
                <div
                  style={{ width: `${Math.max(percent, 8)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                />
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleResumeOnboarding}
                className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/35 transition-all cursor-pointer"
              >
                <span>Resume</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CARD 3: INSTAGRAM CHANNEL NUDGE ─── */}
      <AnimatePresence>
        {instagramNudge && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={liquidSpring}
            className="glass-card-obsidian rounded-2xl p-4 border border-amber-400/28 bg-gradient-to-r from-amber-500/[0.09] via-amber-500/[0.03] to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col justify-between min-h-[114px] relative group overflow-hidden"
          >
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />

            <div className="flex items-center justify-between gap-2 relative z-10 pl-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/18 border border-amber-400/35 flex items-center justify-center text-amber-300 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide truncate">Instagram DM</h4>
              </div>
              <button
                type="button"
                onClick={() => dismissNudge(instagramNudge.id)}
                className="text-zinc-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Dismiss Instagram notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-300/85 leading-snug my-1.5 pl-1 relative z-10 line-clamp-1">
              Connect to unlock automated direct message replies.
            </p>

            <div className="flex items-center justify-between pt-1 pl-1 relative z-10 border-t border-white/[0.05]">
              <span className="text-[10px] font-medium text-amber-300/80">Disconnected</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(instagramNudge.ctaSection)}
                className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/35 transition-all cursor-pointer"
              >
                <span>Connect</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CARD 4: AI MODEL ACCURACY NUDGE ─── */}
      <AnimatePresence>
        {aiNudge && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={liquidSpring}
            className="glass-card-obsidian rounded-2xl p-4 border border-sky-400/28 bg-gradient-to-r from-sky-500/[0.09] via-sky-500/[0.03] to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col justify-between min-h-[114px] relative group overflow-hidden"
          >
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />

            <div className="flex items-center justify-between gap-2 relative z-10 pl-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6.5 h-6.5 rounded-lg bg-sky-500/18 border border-sky-400/35 flex items-center justify-center text-sky-300 flex-shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white tracking-wide truncate">AI Model (98.2%)</h4>
              </div>
              <button
                type="button"
                onClick={() => dismissNudge(aiNudge.id)}
                className="text-zinc-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Dismiss AI model notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-300/85 leading-snug my-1.5 pl-1 relative z-10 line-clamp-1">
              Add 2–3 FAQs in settings to boost accuracy higher.
            </p>

            <div className="flex items-center justify-between pt-1 pl-1 relative z-10 border-t border-white/[0.05]">
              <span className="text-[10px] font-medium text-sky-300/80">98.2% Accuracy</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(aiNudge.ctaSection)}
                className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/35 transition-all cursor-pointer"
              >
                <span>Train</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
