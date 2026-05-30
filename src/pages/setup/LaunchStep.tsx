import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { ConfettiOverlay } from '../../components/setup/ConfettiOverlay';
import { PartyPopper, Check, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export function LaunchStep() {
  const navigate = useNavigate();
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
    navigate('/dashboard');
  };

  return (
    <StepCard>
      
      {/* RENDER DYNAMIC CONFETTI */}
      <ConfettiOverlay count={120} active={true} />

      <div className="flex flex-col items-center text-center max-w-xl mx-auto py-6 relative">
        
        {/* Glow circle behind icon */}
        <div className="absolute top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 success-icon-enter">
            <PartyPopper className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Your Assistant is Ready to Go Live!
        </h1>
        
        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-8 max-w-md">
          Congratulations! You've successfully connected your channels, trained your custom AI brain, and tested it for accuracy. You're fully setup.
        </p>

        {/* Milestone Cards Summary */}
        <div className="w-full space-y-3 mb-8 text-left">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block px-1">
            Setup Summary & Accomplishments
          </h4>
          
          <div className="grid gap-2">
            
            {/* Account Setup */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Business Profile Active</h5>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Profile personalization configured for {user?.name || 'Owner'}.</p>
                </div>
              </div>
            </div>

            {/* Channels Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Communications Linked</h5>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {connectedCount === 0 
                      ? 'Web Sandbox connection is active.' 
                      : `${connectedCount} channel(s) connected: ${activeChannels.map(c => c.channelKey).join(', ')}.`}
                  </p>
                </div>
              </div>
            </div>

            {/* AI brain */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">AI Brain Trained & Sandbox Checked</h5>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Auto-responses configured in a {aiConfig.tone} tone with {aiConfig.faqs.length} FAQs.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]"
        >
          <span>Launch My Command Center Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5 mt-6 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 text-emerald-500" />
          <span>Activation score reached: 100% Ready</span>
        </div>

      </div>
    </StepCard>
  );
}
