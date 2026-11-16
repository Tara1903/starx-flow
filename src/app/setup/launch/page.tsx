"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '../../../store/authStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { StepCard } from '../../../components/setup/StepCard';
import { ConfettiOverlay } from '../../../components/setup/ConfettiOverlay';
import { PartyPopper, Check, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function LaunchStep() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { connectedChannels } = useAuthStore();
  const { completeOnboarding, steps, aiConfig } = useOnboardingStore();

  // Count active channels
  const activeChannels = connectedChannels.filter(c => c.isConnected);
  const connectedCount = activeChannels.length;

  const handleLaunch = async () => {
    // Update profile complete flag in Supabase & LocalStorage
    await completeOnboarding();
    
    // Explicitly update user state in AuthStore
    if (user) {
      useAuthStore.setState({
        user: {
          ...user,
          onboardingComplete: true
        }
      });
    }

    // Force redirection to redesigned command center dashboard
    router.push('/dashboard');
  };

  return (
    <StepCard>
      
      {/* RENDER DYNAMIC CONFETTI */}
      <ConfettiOverlay count={120} active={true} />

      <div className="flex flex-col items-center text-center max-w-xl mx-auto py-6 relative">
        
        {/* Glow circle behind icon */}
        <div className="absolute top-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 success-icon-enter shadow-[0_0_20px_rgba(40,223,160,0.2)]">
            <PartyPopper className="w-8 h-8" />
          </div>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-[1.1]">
          Your Assistant is <span className="text-gradient-emerald">Ready to Go Live!</span>
        </h1>
        
        <p className="text-[#b8c9bd] text-xs md:text-sm leading-relaxed mb-8 max-w-md font-normal">
          Congratulations! You&apos;ve successfully connected your channels, trained your custom AI brain, and tested it for accuracy. You&apos;re fully setup.
        </p>

        {/* Milestone Cards Summary */}
        <div className="w-full space-y-3 mb-8 text-left">
          <h4 className="text-[11px] font-mono font-bold text-[#b8c9bd]/70 uppercase tracking-wider block px-1">
            Setup Summary & Accomplishments
          </h4>
          
          <div className="grid gap-2.5">
            
            {/* Account Setup */}
            <div className="glass-panel flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Business Profile Active</h5>
                  <p className="text-[10px] text-[#b8c9bd] mt-0.5 font-normal">Profile personalization configured for {user?.name || 'Owner'}.</p>
                </div>
              </div>
            </div>

            {/* Channels Summary */}
            <div className="glass-panel flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Communications Linked</h5>
                  <p className="text-[10px] text-[#b8c9bd] mt-0.5 font-normal">
                    {connectedCount === 0 
                      ? 'Web Sandbox connection is active.' 
                      : `${connectedCount} channel(s) connected: ${activeChannels.map(c => c.channelKey).join(', ')}.`}
                  </p>
                </div>
              </div>
            </div>

            {/* AI brain */}
            <div className="glass-panel flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">AI Brain Trained & Sandbox Checked</h5>
                  <p className="text-[10px] text-[#b8c9bd] mt-0.5 font-normal">Auto-responses configured in a {aiConfig.tone} tone with {aiConfig.faqs.length} FAQs.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLaunch}
          className="spatial-btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_25px_rgba(40,223,160,0.3)] hover:shadow-[0_0_35px_rgba(40,223,160,0.45)]"
        >
          <span>Launch My Command Center Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5 mt-6 text-[9px] font-mono font-bold text-[#b8c9bd]/70 uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          <span>Activation score reached: 100% Ready</span>
        </div>

      </div>
    </StepCard>
  );
}
