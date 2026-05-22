import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2, Check, ArrowRight, MessageCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export function SMSStep() {
  const navigate = useNavigate();
  const { connectedChannels, updateChannelConnection, user } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [formData, setFormData] = useState({
    twilio_sid: '',
    twilio_token: '',
    twilio_phone: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const smsChannel = connectedChannels.find(c => c.channelKey === 'SMS');
  const isConnected = smsChannel?.isConnected || false;

  useEffect(() => {
    if (smsChannel && smsChannel.credentials) {
      setFormData({
        twilio_sid: smsChannel.credentials.twilio_sid || '',
        twilio_token: smsChannel.credentials.twilio_token || '',
        twilio_phone: smsChannel.credentials.twilio_phone || ''
      });
    }
  }, [smsChannel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.twilio_sid.trim() || !formData.twilio_token.trim() || !formData.twilio_phone.trim()) {
      setErrorMsg('Please fill in all Twilio credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await updateChannelConnection('SMS', true, formData);
      if (error) throw new Error(error);

      await completeStep('sms');
      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/ai');
      }, 800);
    } catch (e: any) {
      console.error('[StarX Onboarding] Twilio connect error:', e);
      setErrorMsg(e.message || 'Failed to save credentials. Please verify your keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await skipStep('sms');
    navigate('/setup/ai');
  };

  const handleNext = async () => {
    await completeStep('sms');
    navigate('/setup/ai');
  };

  const handleMockConnect = async () => {
    setIsLoading(true);
    try {
      const mockCreds = {
        twilio_sid: 'AC_dummy_account_sid',
        twilio_token: 'dummy_auth_token_for_mock_connection',
        twilio_phone: '+15550192834'
      };
      const { error } = await updateChannelConnection('SMS', true, mockCreds);
      if (error) throw new Error(error);

      await completeStep('sms');
      setIsSaved(true);
      setTimeout(() => {
        navigate('/setup/ai');
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
        stepNumber={4} 
        totalSteps={6}
        title="Connect SMS" 
        description="Automate text message replies. Intercept missed calls with instant text recovery, confirmation texts, and support."
        timeEstimate="~2 min"
      />

      {isConnected ? (
        <div className="w-full max-w-md p-6 mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center text-center space-y-4 animate-scale mx-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Twilio SMS Connected</h3>
            <p className="text-zinc-500 text-xs font-mono">Twilio Line: {formData.twilio_phone || '+1 (555) 019-2834'}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Account SID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Twilio Account SID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={formData.twilio_sid}
                onChange={(e) => setFormData({ ...formData, twilio_sid: e.target.value })}
                placeholder="e.g. ACXXXXXXXXXXXXXXXXX"
                required
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Auth Token */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Twilio Auth Token <span className="text-emerald-400">*</span>
              </label>
              <input
                type="password"
                value={formData.twilio_token}
                onChange={(e) => setFormData({ ...formData, twilio_token: e.target.value })}
                placeholder="****************"
                required
                disabled={isLoading || isSaved}
                className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Twilio Phone Number <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={formData.twilio_phone}
              onChange={(e) => setFormData({ ...formData, twilio_phone: e.target.value })}
              placeholder="e.g. +1234567890"
              required
              disabled={isLoading || isSaved}
              className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-blue-500/50 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Help details */}
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-2">
            <div className="flex gap-2 items-start text-xs text-zinc-400">
              <HelpCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Connect your business line using **Twilio SMS credentials**. You can retrieve your Account SID and Auth Token from your Twilio Console. Ensure your number is configured to route webhooks to Starx Flow for automatic incoming response handling.
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
                  <span>Twilio Connected!</span>
                </>
              ) : (
                <>
                  <span>Connect SMS Line</span>
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
