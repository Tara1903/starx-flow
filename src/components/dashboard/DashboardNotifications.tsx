"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, Info, ArrowRight, X } from "lucide-react";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { CONSOLE_PANEL } from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

export function DashboardNotifications() {
  const router = useRouter();
  const setActiveSection = useDashboardStore((s) => s.setActiveSection);

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

  const nudges = useDashboardStore((s) => s.smartNudges);
  const dismissNudge = useDashboardStore((s) => s.dismissNudge);

  const instagramNudge = nudges.find((n) => n.id === "ndg-1" || n.ctaSection === "channels");
  const aiNudge = nudges.find((n) => n.id === "ndg-2" || n.ctaSection === "playground");

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
    <div className={cn("grid gap-3 select-none tabular-nums", gridClass)}>
      {/* Security & credentials */}
      <div className={cn(CONSOLE_PANEL, "p-4 flex flex-col justify-between min-h-[104px]")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#4cc38a] flex-shrink-0" strokeWidth={1.65} />
            <h2 className="text-xs font-medium text-[#edf0ee] truncate">Credentials guard</h2>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4cc38a] flex-shrink-0" aria-hidden="true" />
        </div>

        <p className="text-xs text-[#a1aaa4] my-2 line-clamp-1">
          Tenant row security and keys active
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#edf0ee]/[0.06] text-xs">
          <span className="text-[#4cc38a]">Operational</span>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className="inline-flex items-center gap-1 text-[#edf0ee] hover:text-[#4cc38a] transition-colors cursor-pointer font-medium"
          >
            <span>Settings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboarding && (
        <div className={cn(CONSOLE_PANEL, "p-4 flex flex-col justify-between min-h-[104px]")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" strokeWidth={1.65} />
              <h2 className="text-xs font-medium text-[#edf0ee] truncate">
                Workspace setup ({percent}%)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOnboardingDismissed(true)}
              className="text-[#727c75] hover:text-[#edf0ee] p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss onboarding alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#a1aaa4] my-2 line-clamp-1">
            {completedCount} of {totalCount} steps complete
          </p>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#edf0ee]/[0.06]">
            <div className="h-1 flex-1 max-w-[96px] rounded-full bg-[#0d1210] overflow-hidden">
              <div
                style={{ width: `${Math.max(percent, 6)}%` }}
                className="h-full rounded-full bg-amber-300"
              />
            </div>
            <button
              type="button"
              onClick={handleResumeOnboarding}
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:underline cursor-pointer font-medium"
            >
              <span>Resume</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Instagram nudge */}
      {instagramNudge && (
        <div className={cn(CONSOLE_PANEL, "p-4 flex flex-col justify-between min-h-[104px]")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" strokeWidth={1.65} />
              <h2 className="text-xs font-medium text-[#edf0ee] truncate">Instagram DM</h2>
            </div>
            <button
              type="button"
              onClick={() => dismissNudge(instagramNudge.id)}
              className="text-[#727c75] hover:text-[#edf0ee] p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss Instagram notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#a1aaa4] my-2 line-clamp-1">
            Connect account to automate DM replies
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#edf0ee]/[0.06] text-xs">
            <span className="text-[#727c75]">Disconnected</span>
            <button
              type="button"
              onClick={() => setActiveSection(instagramNudge.ctaSection)}
              className="inline-flex items-center gap-1 text-[#edf0ee] hover:text-[#4cc38a] transition-colors cursor-pointer font-medium"
            >
              <span>Connect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* AI accuracy nudge */}
      {aiNudge && (
        <div className={cn(CONSOLE_PANEL, "p-4 flex flex-col justify-between min-h-[104px]")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Info className="w-4 h-4 text-sky-300 flex-shrink-0" strokeWidth={1.65} />
              <h2 className="text-xs font-medium text-[#edf0ee] truncate">Knowledge coverage</h2>
            </div>
            <button
              type="button"
              onClick={() => dismissNudge(aiNudge.id)}
              className="text-[#727c75] hover:text-[#edf0ee] p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Dismiss AI model notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#a1aaa4] my-2 line-clamp-1">
            Add business FAQs to improve reply precision
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#edf0ee]/[0.06] text-xs">
            <span className="text-sky-300">98.2% evaluated</span>
            <button
              type="button"
              onClick={() => setActiveSection(aiNudge.ctaSection)}
              className="inline-flex items-center gap-1 text-[#edf0ee] hover:text-[#4cc38a] transition-colors cursor-pointer font-medium"
            >
              <span>Train</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
