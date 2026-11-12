"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { liquidSpring } from '../../lib/motionVariants';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

export function SetupBanner() {
  const router = useRouter();
  const { isComplete, steps, currentStep, completedSteps } = useOnboardingStore();
  const [dismissed, setDismissed] = useState(false);

  // If onboarding is marked fully complete or dismissed locally, don't show the banner
  const isSetupFullyDone = isComplete && completedSteps.length === steps.length;
  if (isSetupFullyDone || dismissed) {
    return null;
  }

  const completedCount = completedSteps.length;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  const handleResume = () => {
    // Find the route of the current step to resume from
    const activeStep = steps.find(s => s.id === currentStep) || steps[0];
    if (activeStep) {
      router.push(activeStep.route);
    } else {
      router.push('/setup');
    }
  };

  return (
    <div
      className="liquid-glass relative overflow-hidden w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/[0.1] via-amber-500/[0.04] to-emerald-500/[0.05] px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 shadow-[0_14px_38px_rgba(0,0,0,0.45),inset_0_1.5px_0_rgba(255,255,255,0.22)]"
    >
      {/* Background amber liquid glow */}
      <div className="absolute -top-14 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none animate-glow-breathe" />

      <div className="flex items-start sm:items-center gap-3.5 relative z-10 flex-1">
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-500/18 border border-amber-400/35 text-amber-300 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.22),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <span className="absolute inset-0 bg-amber-400/20 rounded-xl animate-pulse" />
          <AlertTriangle className="w-4.5 h-4.5 relative z-10" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Onboarding Incomplete ({percent}% Configured)</span>
          </h4>
          <p className="text-[11px] text-zinc-300/85 mt-0.5 leading-relaxed max-w-xl">
            You&apos;ve only completed {completedCount} of {totalCount} tasks. Complete setup to go live.
          </p>
          {/* Animated Liquid Progress Bar */}
          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-white/[0.08] overflow-hidden border border-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(percent, 6)}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-center relative z-10">
        <motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={liquidSpring}
          onClick={handleResume}
          className="flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-[10px] rounded-xl transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.38),inset_0_1px_0_rgba(255,255,255,0.5)] uppercase tracking-wider cursor-pointer"
        >
          <span>Resume Guided Setup</span>
          <ArrowRight className="w-3 h-3" />
        </motion.button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 rounded-xl border border-white/15 hover:border-white/25 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Dismiss Banner"
          aria-label="Dismiss Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
