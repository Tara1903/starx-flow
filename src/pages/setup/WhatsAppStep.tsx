import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Wifi, Loader2, ArrowRight, Save, ShieldCheck } from 'lucide-react';

export function WhatsAppStep() {
  const navigate = useNavigate();
  const { connectedChannels, fetchChannels } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  
  const whatsappChannel = connectedChannels.find(c => c.channelKey === 'WhatsApp');
  const isWhatsAppConnected = whatsappChannel?.isConnected || false;
  const whatsappCreds = whatsappChannel?.credentials || {};

  const [accessToken, setAccessToken] = useState(whatsappCreds.access_token || '');
  const [phoneNumberId, setPhoneNumberId] = useState(whatsappCreds.phone_number_id || '');

  useEffect(() => {
    if (whatsappCreds.access_token) setAccessToken(whatsappCreds.access_token);
    if (whatsappCreds.phone_number_id) setPhoneNumberId(whatsappCreds.phone_number_id);
  }, [whatsappCreds]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    
    setLoading(true);
    setErrorDetails('');

    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("You must be logged in.");

      const { error } = await supabase
        .from('connected_channels')
        .upsert({
          user_id: user.id,
          channel_key: 'WhatsApp',
          is_connected: true, // Auto-connect upon saving tokens for Meta API
          credentials: { 
            access_token: accessToken,
            phone_number_id: phoneNumberId,
            phone: phoneNumberId, // Fallback for display
            updated_at: new Date().toISOString() 
          },
          last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });

      if (error) throw error;
      
      await fetchChannels();
    } catch (err: any) {
      console.error("[META CONFIG ERROR]", err);
      setErrorDetails(err.message || "Failed to save Meta configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp and remove your Meta keys?")) {
      return;
    }

    setLoading(true);
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      await supabase
        .from('connected_channels')
        .upsert({
          user_id: user.id,
          channel_key: 'WhatsApp',
          is_connected: false,
          credentials: { updated_at: new Date().toISOString() },
          last_synced: new Date().toISOString()
        }, { onConflict: 'user_id, channel_key' });
        
      setAccessToken('');
      setPhoneNumberId('');
      await fetchChannels();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await completeStep('whatsapp');
    navigate('/setup/instagram');
  };

  const handleSkip = async () => {
    await skipStep('whatsapp');
    navigate('/setup/instagram');
  };

  return (
    <StepCard>
      <StepHeader 
        stepNumber={2} 
        totalSteps={6}
        title="Connect WhatsApp (Meta Cloud API)" 
        description="Enter your official Meta API credentials. This completely replaces the old QR code scanning method with scalable serverless infrastructure."
        timeEstimate="~2 min"
      />

      <div className="mt-6 flex flex-col items-center">
        
        {isWhatsAppConnected ? (
          <div className="w-full max-w-md p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center text-center space-y-4 animate-scale">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Meta API Connected!</h3>
              <p className="text-zinc-500 text-xs font-mono">Phone ID: {whatsappCreds.phone_number_id}</p>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed bg-[#0a0a0a] border border-white/[0.04] p-3 rounded-xl w-full">
              Your AI Assistant is active and listening via Meta Webhooks. Let's proceed to Instagram or move to the next steps!
            </div>

            <div className="w-full space-y-2 mt-4">
              <button
                onClick={handleNext}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Next Step</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Disconnect Meta API</span>}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-fade-in">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 pl-1">Permanent Access Token</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAALXxxxxxxxxxxxx..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 pl-1">Phone Number ID</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  required
                />
              </div>

              {errorDetails && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-400 font-medium">{errorDetails}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !accessToken || !phoneNumberId}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 group mt-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Meta API Configuration</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex gap-4 w-full max-w-md items-center justify-center pt-6 mt-6 border-t border-white/5">
              <button
                onClick={handleSkip}
                className="text-zinc-500 hover:text-zinc-300 font-medium text-xs transition-colors"
              >
                Skip WhatsApp connection for now
              </button>
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
}
