import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { SetupHeader } from '../../components/setup/SetupHeader';
import { SetupChecklist } from '../../components/setup/SetupChecklist';
import { Loader2 } from 'lucide-react';

export function SetupLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isLoading: authLoading, user } = useAuthStore();
  const { isComplete, isFetching, fetchOnboarding, currentStep, steps } = useOnboardingStore();

  useEffect(() => {
    // 1. If auth is loading, wait
    if (authLoading) return;

    // 2. If not logged in, redirect to home / login
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // 3. Sync onboarding progress from DB/Local
    fetchOnboarding();
  }, [isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    // 4. Once onboarding data is loaded
    if (isFetching || authLoading) return;

    // 5. If onboarding is complete, they shouldn't be here (unless they are reviewing, but let's redirect them to dashboard)
    if (isComplete || (user && user.onboardingComplete)) {
      navigate('/dashboard');
      return;
    }

    // 6. If they are on the root `/setup` route, redirect to the current active step
    if (location.pathname === '/setup' || location.pathname === '/setup/') {
      const activeStep = steps.find(s => s.id === currentStep);
      if (activeStep) {
        navigate(activeStep.route);
      } else {
        navigate('/setup/account');
      }
    }
  }, [isComplete, isFetching, currentStep, location.pathname, authLoading, navigate]);

  // Loading state
  if (authLoading || isFetching) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="mt-4 text-xs font-semibold text-zinc-500 tracking-wider uppercase">Loading Onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* Premium background mesh effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.01] rounded-full blur-[120px]" />
      </div>

      {/* Onboarding Header */}
      <SetupHeader />

      {/* Main Layout Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
          
          {/* Step Contents */}
          <div className="flex-1 w-full order-2 lg:order-1 min-h-[500px] flex flex-col">
            <Outlet />
          </div>

          {/* Checklist Sidebar */}
          <div className="w-full lg:w-auto order-1 lg:order-2">
            <SetupChecklist />
          </div>

        </div>
      </main>

    </div>
  );
}
