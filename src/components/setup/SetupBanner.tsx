import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

export function SetupBanner() {
  const navigate = useNavigate();
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
      navigate(activeStep.route);
    } else {
      navigate('/setup');
    }
  };

  return (
    <div className="relative overflow-hidden w-full rounded-xl border border-amber-500/20 bg-amber-500/[0.02] backdrop-blur-md px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-[fade-in-up_0.3s_ease-out]">
      {/* Background orange warning glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start sm:items-center gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center relative">
          <span className="absolute inset-0 bg-amber-500/10 rounded-lg animate-pulse" />
          <AlertTriangle className="w-4.5 h-4.5 relative z-10" />
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Onboarding Incomplete ({percent}% Configured)</span>
            <span className="text-[10px] text-amber-500 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest">
              Demo Active
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed max-w-xl">
            You've only completed {completedCount} of {totalCount} tasks. Some AI integrations, custom business training rules, and channels are currently running in simulated mode. Complete setup to go live.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-center">
        <button
          onClick={handleResume}
          className="flex items-center gap-1.5 py-1.5 px-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] uppercase tracking-wider"
        >
          <span>Resume Guided Setup</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="h-7 w-7 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          title="Dismiss Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
