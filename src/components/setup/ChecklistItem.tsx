import React from 'react';
import { OnboardingStep } from '../../store/onboardingStore';
import { cn } from '../../lib/utils';
import { Check, Lock, Play, Hourglass } from 'lucide-react';

interface ChecklistItemProps {
  step: OnboardingStep;
  isActive: boolean;
  onClick: () => void;
}

export function ChecklistItem({ step, isActive, onClick }: ChecklistItemProps) {
  const isComplete = step.state === 'complete';
  const isLocked = step.state === 'locked';
  const isSkipped = step.state === 'skipped';

  // Determine indicator
  let Indicator = <div className="w-5 h-5 rounded-full border-2 border-zinc-600 flex-shrink-0" />;
  if (isComplete) {
    const isChannel = ['whatsapp', 'instagram', 'sms'].includes(step.id);
    Indicator = (
      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 success-icon-enter shadow-lg", isChannel ? "bg-emerald-500 shadow-emerald-500/20" : "bg-cyan-500 shadow-cyan-500/20")}>
        <Check className="w-3 h-3 text-[#050505] stroke-[3]" />
      </div>
    );
  } else if (isSkipped) {
    Indicator = (
      <div className="w-5 h-5 rounded-full border-2 border-dashed border-zinc-500 flex items-center justify-center flex-shrink-0">
        <Hourglass className="w-2.5 h-2.5 text-zinc-400" />
      </div>
    );
  } else if (isActive) {
    Indicator = (
      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/10">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      </div>
    );
  } else if (isLocked) {
    Indicator = (
      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-500">
        <Lock className="w-2.5 h-2.5" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300",
        isActive
          ? "checklist-item-active border-blue-500/20 text-white font-medium"
          : isComplete
          ? cn("glass-focus", 
               ['whatsapp', 'instagram', 'sms'].includes(step.id) ? "border-emerald-500/30 text-emerald-300" : "border-cyan-500/30 text-cyan-300")
          : isLocked
          ? "checklist-item-locked border-transparent text-zinc-600 cursor-not-allowed"
          : "glass-panel text-zinc-400 hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        {Indicator}
        <span className="text-xs tracking-wide">{step.label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 font-semibold px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.04]">
          {step.timeEstimate}
        </span>
        {isActive && <Play className="w-2.5 h-2.5 text-blue-400 fill-blue-400" />}
      </div>
    </button>
  );
}
