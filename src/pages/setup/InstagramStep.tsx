import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2, Check, ArrowRight, Instagram, HelpCircle, ShieldCheck } from 'lucide-react';

export function InstagramStep() {
  const navigate = useNavigate();
  const { connectedChannels, updateChannelConnection, user } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [formData, setFormData] = useState({
    ig_account_id: '',
    access_token: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const igChannel = connectedChannels.find(c => c.channelKey === 'Instagram');
  const isConnected = igChannel?.isConnected || false;

  useEffect(() => {
    if (igChannel && igChannel.credentials) {
      setFormData({
        ig_account_id: igChannel.credentials.ig_account_id || '',
        access_token: igChannel.credentials.access_token || ''
      });
    }
  }, [igChannel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ig_account_id.trim() || !formData.access_token.trim()) {
      setErrorMsg('Please enter both Instagram Account ID and Access Token.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await updateChannelConnection('Instagram', true, formData);
      if (error) throw new Error(error);

      await completeStep('instagram');
      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/sms');
      }, 800);
    } catch (e: any) {
      console.error('[StarX Onboarding] Instagram connect error:', e);
      setErrorMsg(e.message || 'Failed to save credentials. Please verify your keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await skipStep('instagram');
    navigate('/setup/sms');
  };

  const handleNext = async () => {
    await completeStep('instagram');
    navigate('/setup/sms');
  };

  const handleMockConnect = async () => {
    setIsLoading(true);
    try {
      const mockCreds = {
        ig_account_id: '17849204910283457',
        access_token: 'EAAO_mock_token_for_demo_purposes_only_valid'
      };
      const { error } = await updateChannelConnection('Instagram', true, mockCreds);
      if (error) throw new Error(error);

      await completeStep('instagram');
      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/sms');
      }, 800);
    } catch (e: any) {
      setErrorMsg(e.message || 'Mock connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepCard>
      <StepHeader 
        stepNumber={3} 
        totalSteps={6}
        title="Connect Instagram" 
        description="Automate Instagram Direct Messages (DMs). Set up auto-replies for product queries, story mentions, and customer requests."
        timeEstimate="~2 min"
      />

      {isConnected ? (
        <div className="w-full max-w-md p-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center text-center space-y-4 animate-scale mx-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Instagram Connection Live</h3>
            <p className="text-zinc-500 text-xs font-mono">Account: @{formData.ig_account_id || 'demo_account'}</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Next Step</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 max-w-xl">
          {errorMsg && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Instagram Account ID <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={formData.ig_account_id}
              onChange={(e) => setFormData({ ...formData, ig_account_id: e.target.value })}
              placeholder="e.g. 1784XXXXXXXX"
              required
              disabled={isLoading || isSaved}
              className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-pink-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-pink-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Meta System User Access Token <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder="e.g. EAAO..."
              required
              disabled={isLoading || isSaved}
              className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-pink-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-pink-500/20"
            />
          </div>

          {/* Guidelines */}
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-2">
            <div className="flex gap-2 items-start text-xs text-zinc-400">
              <HelpCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                To link Instagram, you need an **Instagram Professional/Business Account** connected to a **Facebook Page** under a Meta Business Portfolio. Generating system user tokens is done via the Meta App Dashboard under permissions `instagram_manage_messages` and `pages_manage_metadata`.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || isSaved}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isSaved 
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>Instagram Connected!</span>
                </>
              ) : (
                <>
                  <span>Connect Instagram</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleMockConnect}
              disabled={isLoading || isSaved}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-400 font-semibold text-sm hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              Connect with Sandbox Keys (Mock)
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto sm:ml-auto text-zinc-500 hover:text-zinc-400 font-semibold text-xs py-3"
            >
              Skip this step
            </button>
          </div>
        </form>
      )}
    </StepCard>
  );
}
