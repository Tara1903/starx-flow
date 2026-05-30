import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChecklistItem } from './ChecklistItem';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Flame, ChevronUp } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassSheet } from '../ui/GlassSheet';

export function SetupChecklist({ mobile = false }: { mobile?: boolean }) {
  const { steps, currentStep, completedSteps, skippedSteps } = useOnboardingStore();
  const navigate = useNavigate();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

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

  const content = (
    <div className="flex flex-col gap-6 w-full lg:max-w-xs flex-shrink-0">
      
      {/* Readiness / Activation Card */}
      <GlassPanel tier="panel" tilt className="rounded-2xl p-5 overflow-hidden dash-mesh relative">
        
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

      </GlassPanel>

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
              onClick={() => {
                handleStepClick(step.id, step.route);
                setIsMobileSheetOpen(false);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <>
        {/* Sticky Mobile Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-black via-black/80 to-transparent">
          <GlassPanel
            tier="panel"
            className="flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            onClick={() => setIsMobileSheetOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" className="stroke-zinc-800" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="20" cy="20" r="16"
                    className="stroke-emerald-400 transition-all duration-500"
                    strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - progressPercent / 100)} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {progressPercent}%
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Setup Progress</p>
                <p className="text-xs text-zinc-400">{completed}/{total} steps completed</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
              <ChevronUp className="w-4 h-4" />
            </div>
          </GlassPanel>
        </div>

        {/* Mobile Checklist Sheet */}
        <GlassSheet
          open={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          side="bottom"
          title="Activation Checklist"
        >
          {content}
        </GlassSheet>
      </>
    );
  }

  return content;
}
