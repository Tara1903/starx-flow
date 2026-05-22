import React from 'react';
import { Clock } from 'lucide-react';

interface StepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  timeEstimate: string;
}

export function StepHeader({
  stepNumber,
  totalSteps,
  title,
  description,
  timeEstimate,
}: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-5 border-b border-white/[0.06] mb-6">
      
      {/* Step Badge & Time Estimate */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
          Step {stepNumber} of {totalSteps}
        </span>
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeEstimate} Setup</span>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">{description}</p>
      </div>

    </div>
  );
}
