"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { SetupHeader } from '../../components/setup/SetupHeader';
import { SetupChecklist } from '../../components/setup/SetupChecklist';
import { Loader2 } from 'lucide-react';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const location = usePathname();
  const { isLoggedIn, isLoading: authLoading, user } = useAuthStore();
  const { isComplete, isFetching, fetchOnboarding, currentStep, steps } = useOnboardingStore();

  useEffect(() => {
    // 1. If auth is loading, wait
    if (authLoading) return;

    // 2. Enforce authentication guard
    if (!isLoggedIn) {
      router.push(`/signup?returnUrl=${encodeURIComponent(location || '/setup/welcome')}`);
      return;
    }

    // 3. Sync onboarding progress from DB if logged in
    fetchOnboarding();
  }, [isLoggedIn, authLoading, location, router, fetchOnboarding]);

  useEffect(() => {
    // 4. Once onboarding data is loaded
    if (isFetching || authLoading) return;

    // 5. If onboarding is complete, they shouldn't be here (unless they are reviewing, but let's redirect them to dashboard)
    if (isComplete || (user && user.onboardingComplete)) {
      router.push('/dashboard');
      return;
    }

    // 6. If they are on the root `/setup` route, redirect to the current active step
    if (location === '/setup' || location === '/setup/') {
      const activeStep = steps.find(s => s.id === currentStep);
      if (activeStep) {
        router.push(activeStep.route);
      } else {
        router.push('/setup/account');
      }
    }
  }, [isComplete, isFetching, currentStep, location, authLoading, router]);

  // Loading state
  if (authLoading || isFetching) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#020a07] text-[#f0f5ef]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="mt-4 text-xs font-semibold font-mono text-[#b8c9bd]/70 tracking-wider uppercase">Loading Onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400 relative overflow-hidden">
      
      {/* Background Emerald Ambient Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px]"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(40, 223, 160, 0.12) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 80%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px]"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
        />
      </div>

      {/* Onboarding Header */}
      <SetupHeader />

      {/* Main Layout Area */}
      <div role="region" aria-label="Onboarding setup" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-32 lg:pb-12 z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
          
          {/* Step Contents */}
          <div className="flex-1 w-full order-1 min-h-[500px] flex flex-col">
            {children}
          </div>

          {/* Checklist Sidebar */}
          <div className="w-full lg:w-auto order-2 hidden lg:block">
            <SetupChecklist />
          </div>

        </div>
      </div>

      {/* Mobile Progress & Checklist Overlay */}
      <div className="lg:hidden">
        <SetupChecklist mobile />
      </div>

    </div>
  );
}
