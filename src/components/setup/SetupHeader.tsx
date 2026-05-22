import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { ProgressBar } from './ProgressBar';
import { Clock, LogOut, Sparkles } from 'lucide-react';

export function SetupHeader() {
  const navigate = useNavigate();
  const { progressPercent, remainingMinutes } = useOnboardingStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#050505]/80 backdrop-filter backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-8">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090909]">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-sm">StarX<span className="text-emerald-400">Flow</span></span>
            <div className="text-[10px] text-zinc-500 font-medium">Onboarding Hub</div>
          </div>
        </div>

        {/* Center: Setup Progress */}
        <div className="hidden md:flex flex-1 max-w-md items-center gap-4">
          <ProgressBar progressPercent={progressPercent} />
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 rounded-lg text-zinc-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-[11px]">{remainingMinutes}m left</span>
          </div>
        </div>

        {/* Right: Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] px-3.5 py-2 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

      </div>

      {/* Mobile progress bar under header */}
      <div className="md:hidden w-full border-t border-white/[0.04] px-4 py-2 flex items-center justify-between gap-4 bg-black/20">
        <div className="flex-1">
          <ProgressBar progressPercent={progressPercent} />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 bg-white/[0.03] border border-white/[0.06] px-2 py-1 rounded-lg text-zinc-400 text-[10px]">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span className="font-medium">{remainingMinutes}m</span>
        </div>
      </div>
    </header>
  );
}
