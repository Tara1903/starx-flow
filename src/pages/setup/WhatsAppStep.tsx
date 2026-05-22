import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { StepCard } from '../../components/setup/StepCard';
import { StepHeader } from '../../components/setup/StepHeader';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Wifi, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

const isLocalHost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.startsWith('172.') ||
  window.location.hostname === '0.0.0.0';

export function WhatsAppStep() {
  const navigate = useNavigate();
  const { connectedChannels, fetchChannels } = useAuthStore();
  const { completeStep, skipStep } = useOnboardingStore();

  const [errorMsg, setErrorMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // Local polling state
  const whatsappChannel = connectedChannels.find(c => c.channelKey === 'WhatsApp');
  const isWhatsAppConnected = whatsappChannel?.isConnected || false;
  const whatsappCreds = whatsappChannel?.credentials || {};

  const triggerConnect = async () => {
    setTriggerLoading(true);
    setErrorMsg('');
    try {
      if (!isSupabaseConfigured) return;
      const currentChannel = useAuthStore.getState().connectedChannels.find(c => c.channelKey === 'WhatsApp');
      const currentCreds = currentChannel?.credentials || {};
      
      let serverUrl = isLocalHost
        ? `http://${window.location.hostname}:10000`
        : (currentCreds.server_url || 'https://starx-whatsapp-bot.onrender.com');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setErrorMsg('Authentication error. Please refresh the page and try again.');
        return;
      }

      console.log(`[WA] Initializing connection with server: ${serverUrl}`);
      let response: Response | null = null;
      let fetchError: any = null;

      const attemptFetch = async (url: string) => {
        try {
          return await fetch(`${url}/api/whatsapp/connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.warn(`[WA] Fetch to ${url} failed:`, err);
          throw err;
        }
      };

      try {
        response = await attemptFetch(serverUrl);
      } catch (err) {
        fetchError = err;
      }

      // Fallback strategies for local development to handle Windows dual-stack loopback issues
      if ((!response || !response.ok) && isLocalHost) {
        const fallbacks = [];
        if (window.location.hostname !== '127.0.0.1') {
          fallbacks.push('http://127.0.0.1:10000');
        }
        if (window.location.hostname !== 'localhost') {
          fallbacks.push('http://localhost:10000');
        }

        for (const fallbackUrl of fallbacks) {
          if (response && response.ok) break;
          console.log(`[WA] Retrying connection on fallback: ${fallbackUrl}`);
          try {
            response = await attemptFetch(fallbackUrl);
            fetchError = null; // reset if successful
          } catch (err) {
            fetchError = err;
          }
        }
      }

      if (fetchError) {
        throw new Error('Unable to reach the WhatsApp server. Please verify the backend is running.');
      }

      if (!response || !response.ok) {
        const errData = response ? await response.json().catch(() => ({})) : {};
        throw new Error(errData.error || `Server returned HTTP ${response?.status || 500}`);
      }
    } catch (err: any) {
      console.warn('[WA] Connect trigger warning:', err);
      setErrorMsg(err.message || 'Unable to connect to WhatsApp Server. Please make sure the backend is active.');
    } finally {
      setTriggerLoading(false);
    }
  };

  // Setup WhatsApp status polling when the component is mounted
  useEffect(() => {
    fetchChannels().catch(console.error);
    triggerConnect();
    
    const interval = setInterval(() => {
      fetchChannels().catch(console.error);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [fetchChannels]);

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp and reset the session? This will log out the active device and generate a new QR code.")) {
      return;
    }

    setResetLoading(true);
    setErrorMsg('');

    try {
      let serverUrl = isLocalHost
        ? `http://${window.location.hostname}:10000`
        : (whatsappCreds.server_url || 'https://starx-whatsapp-bot.onrender.com');
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("You must be logged in to reset the WhatsApp session.");
      }

      console.log(`[WA] Requesting reset on server: ${serverUrl}`);
      let response: Response | null = null;
      let fetchError: any = null;

      const attemptReset = async (url: string) => {
        try {
          return await fetch(`${url}/api/whatsapp/reset`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.warn(`[WA] Reset fetch to ${url} failed:`, err);
          throw err;
        }
      };

      try {
        response = await attemptReset(serverUrl);
      } catch (err) {
        fetchError = err;
      }

      // Fallback strategies for local development to handle Windows dual-stack loopback issues
      if ((!response || !response.ok) && isLocalHost) {
        const fallbacks = [];
        if (window.location.hostname !== '127.0.0.1') {
          fallbacks.push('http://127.0.0.1:10000');
        }
        if (window.location.hostname !== 'localhost') {
          fallbacks.push('http://localhost:10000');
        }

        for (const fallbackUrl of fallbacks) {
          if (response && response.ok) break;
          console.log(`[WA] Retrying reset on fallback: ${fallbackUrl}`);
          try {
            response = await attemptReset(fallbackUrl);
            fetchError = null; // reset if successful
          } catch (err) {
            fetchError = err;
          }
        }
      }

      if (fetchError) {
        throw new Error("Unable to reach the WhatsApp server. Please verify the backend is running.");
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => ({})) : {};
        throw new Error(errJson.error || `Server returned HTTP ${response?.status || 500}`);
      }

      const resData = await response.json();
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
        triggerConnect();
      } else {
        throw new Error(resData.message || "Failed to reset WhatsApp session.");
      }
    } catch (err: any) {
      console.error("[WA RESET ERROR]", err);
      setErrorMsg(err.message || "Failed to communicate with WhatsApp server.");
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
        
        {isWhatsAppConnected ? (
          /* CONNECTED STATE */
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
        ) : (
          /* DISCONNECTED STATE */
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            
            {errorMsg && (
              <div className="w-full p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-medium space-y-2 text-center animate-fade-in">
                <p>{errorMsg}</p>
                <button
                  onClick={triggerConnect}
                  disabled={triggerLoading}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-[10px] text-white font-bold transition-all inline-flex items-center gap-1.5"
                >
                  {triggerLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                  Retry Server Connection
                </button>
              </div>
            )}

            {/* REAL QR CODE FROM SERVER */}
            {whatsappCreds.qr ? (
              <div className="flex flex-col items-center space-y-4 animate-fade-in-up">
                <div className="bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10 relative group">
                  <img
                    src={whatsappCreds.qr}
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
            ) : (
              /* DEFAULT SPINNER STATE (WAITING FOR BACKEND CONTAINER) */
              <div className="flex flex-col items-center justify-center py-8 space-y-3 w-full animate-pulse">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
                
                <div className="space-y-1 text-center max-w-xs">
                  <h4 className="text-white font-bold text-sm">Initializing Connection Server</h4>
                  <p className="text-zinc-500 text-[11px] px-2 leading-relaxed">
                    Setting up WhatsApp session. Free hosting servers may take up to 25 seconds to spin up.
                  </p>
                </div>
              </div>
            )}

            {/* Skip Actions */}
            <div className="flex gap-4 w-full items-center justify-between pt-2">
              <button
                onClick={handleSkip}
                className="text-zinc-500 hover:text-zinc-400 font-semibold text-xs transition-colors"
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

