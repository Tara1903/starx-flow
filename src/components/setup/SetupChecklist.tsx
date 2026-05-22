import React from 'react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChecklistItem } from './ChecklistItem';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Flame } from 'lucide-react';

export function SetupChecklist() {
  const { steps, currentStep, completedSteps, skippedSteps } = useOnboardingStore();
  const navigate = useNavigate();

  // Dynamic readiness score calculation
  const total = steps.length;
  const completed = completedSteps.length;
  const progressPercent = Math.round((completed / total) * 100);

  const handleStepClick = (stepId: string, route: string) => {
    const targetStep = steps.find(s => s.id === stepId);
    if (targetStep && targetStep.state !== 'locked') {
      navigate(route);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-xs flex-shrink-0">
      
      {/* Readiness / Activation Card */}
      <div className="glass-card rounded-2xl p-5 border border-white/[0.06] bg-[#090909]/60 backdrop-blur-md relative overflow-hidden dash-mesh">
        
        {/* Decorative corner light */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Readiness Score</h3>
            <p className="text-[10px] text-zinc-500 font-medium">Activation Status</p>
          </div>
        </div>

        {/* Circular Gauge / Numerical representation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">{progressPercent}%</span>
              <span className="text-xs text-zinc-500">ready</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              {progressPercent === 100 
                ? 'Your assistant is fully trained and ready to go live! 🎉'
                : 'Complete the steps below to unleash your automated assistant.'}
            </p>
          </div>

          {/* Svg Circle Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-emerald-400 transition-all duration-500 ease-out"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-2.5">
        <div className="px-1 text-[11px] font-bold text-zinc-500 tracking-wider uppercase flex items-center justify-between">
          <span>Connection Tasks</span>
          <span>{completed}/{total} Completed</span>
        </div>
        
        <div className="flex flex-col gap-2">
          {steps.map((step) => (
            <ChecklistItem
              key={step.id}
              step={step}
              isActive={step.id === currentStep}
              onClick={() => handleStepClick(step.id, step.route)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
