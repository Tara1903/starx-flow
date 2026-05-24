import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Wifi, Loader2, ArrowRight, RefreshCw, AlertCircle, Play } from 'lucide-react';

type ConnectionState = 'idle' | 'waking_server' | 'ready' | 'requesting_qr' | 'qr_ready' | 'connected' | 'failed' | 'timeout';

export function WhatsAppStep() {
  const navigate = useNavigate();
  const { connectedChannels, fetchChannels } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [errorDetails, setErrorDetails] = useState('');
  const [eta, setEta] = useState(60);
  const [resetLoading, setResetLoading] = useState(false);
  const [directQrUrl, setDirectQrUrl] = useState('');
  
  const wakeFlowStartedRef = useRef(false);
  const pollIntervalRef = useRef<any>(null);

  const whatsappChannel = connectedChannels.find(c => c.channelKey === 'WhatsApp');
  const isWhatsAppConnected = whatsappChannel?.isConnected || false;
  const whatsappCreds = whatsappChannel?.credentials || {};

  const serverUrl = React.useMemo(() => {
    // Browsers explicitly allow HTTPS websites to fetch from http://localhost
    // This completely bypasses the need for Ngrok, Localtunnel, or any cloud proxies!
    return 'http://localhost:10000';
  }, []);



  const startConnection = async () => {
    if (!isSupabaseConfigured) return;
    setConnectionState('requesting_qr');
    setErrorDetails('');
    setDirectQrUrl('');
    
    // The backend automatically generates the QR code on startup and writes it to Supabase.
    // We just need to trigger a fresh DB fetch, and the derived state effect will catch the QR code!
    await fetchChannels();
  };

  // Polling for DB updates (for background connection state)
  useEffect(() => {
    fetchChannels().catch(console.error);
    const interval = setInterval(() => {
      fetchChannels().catch(console.error);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchChannels]);

  // Derived state sync
  useEffect(() => {
    if (isWhatsAppConnected) {
      setConnectionState('connected');
      wakeFlowStartedRef.current = false;
    } else if ((whatsappCreds.qr || directQrUrl) && connectionState !== 'connected') {
      setConnectionState('qr_ready');
      wakeFlowStartedRef.current = false;
    } else if (connectionState === 'idle' && !wakeFlowStartedRef.current) {
      wakeFlowStartedRef.current = true;
      startConnection();
    }
  }, [isWhatsAppConnected, whatsappCreds.qr, directQrUrl, connectionState]);

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp and reset the session? This will log out the active device and generate a new QR code.")) {
      return;
    }

    setResetLoading(true);
    setErrorDetails('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("You must be logged in to reset the WhatsApp session.");
      }

      const res = await fetch(`${serverUrl}/api/whatsapp/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Bypass-Tunnel-Reminder': 'true'
        }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server HTTP ${res.status}`);
      }

      const resData = await res.json();
      if (resData.success) {
        const user = useAuthStore.getState().user;
        if (user) {
          await supabase
            .from('connected_channels')
            .upsert({
              user_id: user.id,
              channel_key: 'WhatsApp',
              is_connected: false,
              credentials: { server_url: serverUrl, updated_at: new Date().toISOString() },
              last_synced: new Date().toISOString()
            }, { onConflict: 'user_id, channel_key' });
        }
        
        await fetchChannels();
        setDirectQrUrl('');
        setConnectionState('idle'); // will re-trigger wake flow
        wakeFlowStartedRef.current = false;
      } else {
        throw new Error(resData.message || "Failed to reset WhatsApp session.");
      }
    } catch (err: any) {
      console.error("[WA RESET ERROR]", err);
      setConnectionState('failed');
      setErrorDetails(err.message || "Failed to communicate with WhatsApp server.");
    } finally {
      setResetLoading(false);
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
        title="Connect WhatsApp" 
        description="Bring your customer WhatsApp conversations into your unified assistant inbox. Let AI auto-respond to messages."
        timeEstimate="~3 min"
      />

      <div className="mt-6 flex flex-col items-center">
        
        {connectionState === 'connected' && (
          <div className="w-full max-w-md p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center text-center space-y-4 animate-scale">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#050505] rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">WhatsApp Account Linked!</h3>
              <p className="text-zinc-500 text-xs font-mono">+{whatsappCreds.phone || '15550192834'}</p>
              <p className="text-zinc-500 text-[10px]">Connected on {whatsappCreds.name || 'Demo iPhone 15'}</p>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed bg-[#0a0a0a] border border-white/[0.04] p-3 rounded-xl w-full">
              Your AI Assistant is active and listening on this number. Let's proceed to Instagram or move to the next steps!
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={handleNext}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Next Step</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleReset}
                disabled={resetLoading}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Disconnect & Link Different Number</span>
              </button>
            </div>
          </div>
        )}

        {(connectionState === 'failed' || connectionState === 'timeout') && (
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            <div className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center space-y-3 animate-fade-in">
              <div className="flex justify-center mb-1">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm font-bold text-white">
                {connectionState === 'timeout' ? "Server Wake Timeout" : "Connection Error"}
              </p>
              <p className="text-xs text-red-400 font-medium">
                {errorDetails}
              </p>
              <button
                onClick={() => startConnection()}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-white font-bold transition-all inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {connectionState === 'ready' && (
          <div className="w-full max-w-md flex flex-col items-center space-y-6 animate-fade-in">
            <div className="w-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Wifi className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Server Online</h4>
                <p className="text-zinc-400 text-xs mt-1">WhatsApp engine is initialized and ready to pair.</p>
              </div>
              <button
                onClick={startConnection}
                className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform fill-current" />
                <span>Start Connection</span>
              </button>
            </div>
          </div>
        )}

        {connectionState === 'qr_ready' && (directQrUrl || whatsappCreds.qr) && (
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center space-y-4 animate-fade-in-up">
              <div className="bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10 relative group">
                <img
                  src={directQrUrl || whatsappCreds.qr}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48 select-none"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
                </div>
              </div>

              <div className="space-y-1 text-center px-4">
                <h4 className="text-white font-bold text-sm">Scan QR Code with WhatsApp</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Open WhatsApp on your phone → Linked Devices → Link a Device. Scan the QR code to pair instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {(connectionState === 'waking_server' || connectionState === 'requesting_qr' || connectionState === 'idle') && (
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4 w-full animate-pulse">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
              
              <div className="space-y-2 text-center max-w-xs">
                <h4 className="text-white font-bold text-sm">
                  {connectionState === 'waking_server' && "Waking Connection Server..."}
                  {connectionState === 'requesting_qr' && "Generating QR Code..."}
                  {connectionState === 'idle' && "Initializing..."}
                </h4>
                <p className="text-zinc-500 text-[11px] px-2 leading-relaxed">
                  {connectionState === 'waking_server' && `Free hosting servers may take a moment to boot. Please wait (ETA: ~${eta}s).`}
                  {connectionState !== 'waking_server' && "Setting up secure bridge. This should only take a few seconds."}
                </p>
              </div>
              
              {connectionState === 'waking_server' && (
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.max(0, 100 - (eta / 60) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skip Actions (Only show if not connected) */}
        {connectionState !== 'connected' && (
          <div className="flex gap-4 w-full max-w-md items-center justify-center pt-6 mt-4 border-t border-white/5">
            <button
              onClick={handleSkip}
              className="text-zinc-500 hover:text-zinc-300 font-medium text-xs transition-colors"
            >
              Skip WhatsApp connection for now
            </button>
          </div>
        )}

      </div>
    </StepCard>
  );
}
