import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Save, Loader2, CheckCircle2, Wifi, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const isLocalHost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.startsWith('172.') ||
  window.location.hostname === '0.0.0.0';

interface IntegrationModalProps {
  channelKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationModal({ channelKey, isOpen, onClose }: IntegrationModalProps) {
  const updateChannelConnection = useAuthStore(s => s.updateChannelConnection);
  const connectedChannels = useAuthStore(s => s.connectedChannels);
  const fetchChannels = useAuthStore(s => s.fetchChannels);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for other channels
  const [formData, setFormData] = useState<Record<string, string>>({});

  // WhatsApp connection state helpers
  const whatsappChannel = connectedChannels.find(c => c.channelKey === 'WhatsApp');
  const isWhatsAppConnected = whatsappChannel?.isConnected || false;
  const whatsappCreds = whatsappChannel?.credentials || {};

  // Setup WhatsApp status polling when the modal is open
  useEffect(() => {
    if (isOpen && channelKey === 'WhatsApp') {
      fetchChannels().catch(console.error);

      // Trigger the backend connect endpoint to initialize connection
      const triggerConnect = async () => {
        try {
          const currentChannel = useAuthStore.getState().connectedChannels.find(c => c.channelKey === 'WhatsApp');
          const currentCreds = currentChannel?.credentials || {};
          
          let serverUrl = isLocalHost
            ? `http://${window.location.hostname}:10000`
            : (currentCreds.server_url || 'https://starx-whatsapp-bot.onrender.com');

          console.log(`[WA] Triggering connect on server: ${serverUrl}`);
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return;

          let response: Response | null = null;
          let fetchError: any = null;

          const attemptFetch = async (url: string) => {
            try {
              return await fetch(`${url}/api/whatsapp/connect`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'Bypass-Tunnel-Reminder': 'true'
                }
              });
            } catch (err) {
              console.warn(`[WA] Connect fetch to ${url} failed:`, err);
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
              console.log(`[WA] Retrying connect on fallback: ${fallbackUrl}`);
              try {
                response = await attemptFetch(fallbackUrl);
                fetchError = null;
              } catch (err) {
                fetchError = err;
              }
            }
          }

          if (!response || !response.ok) {
            console.warn(`[WA] Connect trigger failed or server not reached`);
          }
        } catch (err) {
          console.error('[WA] Connect trigger error:', err);
        }
      };

      triggerConnect();
      
      const interval = setInterval(() => {
        fetchChannels().catch(console.error);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, channelKey, fetchChannels]);

  useEffect(() => {
    if (isOpen && channelKey) {
      setSuccess(false);
      setError(null);
      
      // Pre-fill existing credentials if they exist
      const existing = connectedChannels.find(c => c.channelKey === channelKey);
      if (existing && existing.credentials) {
        setFormData(existing.credentials);
      } else {
        setFormData({});
      }
    }
  }, [isOpen, channelKey, connectedChannels]);

  if (!isOpen || !channelKey) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: submitError } = await updateChannelConnection(channelKey, true, formData);
    
    setLoading(false);
    
    if (submitError) {
      setError(submitError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp and reset the session? This will log out the active device and generate a new QR code.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let serverUrl = isLocalHost
        ? `http://${window.location.hostname}:10000`
        : (whatsappCreds.server_url || 'https://starx-whatsapp-bot.onrender.com');
      
      // Get current user session token
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
              'Authorization': `Bearer ${token}`,
              'Bypass-Tunnel-Reminder': 'true'
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
            fetchError = null;
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
        // Optimistically update connected_channels in DB to clear QR and set disconnected
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
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 1500);
      } else {
        throw new Error(resData.message || "Failed to reset WhatsApp session.");
      }
    } catch (err: any) {
      console.error("[WA RESET ERROR]", err);
      setError(err.message || "Failed to communicate with WhatsApp server. Please verify the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderFields = () => {
    switch (channelKey) {
      case 'WhatsApp':
        if (isWhatsAppConnected) {
          return (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">WhatsApp Connected</h4>
                {whatsappCreds.phone && (
                  <p className="text-emerald-400 font-mono text-sm">+{whatsappCreds.phone}</p>
                )}
                {whatsappCreds.name && (
                  <p className="text-zinc-400 text-xs">Device: {whatsappCreds.name}</p>
                )}
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex gap-2 items-start text-left w-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your AI Bot is active and listening for incoming messages on this number. Any message from customers will be processed automatically.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center justify-center py-2 text-center space-y-4">
            {whatsappCreds.qr ? (
              <>
                <div className="bg-white p-3 rounded-xl shadow-lg border border-white/10">
                  <img
                    src={whatsappCreds.qr}
                    alt="WhatsApp QR Code"
                    className="w-52 h-52 select-none"
                  />
                </div>
                <div className="space-y-1.5 px-4">
                  <h4 className="text-white font-bold text-sm">Scan QR Code</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Open WhatsApp on your phone, go to Linked Devices, and scan this QR code to connect your account.
                  </p>
                </div>
                <div className="flex flex-col gap-1 w-full items-center">
                  <a
                    href={whatsappCreds.qr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline underline-offset-4"
                  >
                    Can't scan? Open QR Code in new tab
                  </a>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    QR code updates automatically every few seconds.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <div className="space-y-1.5">
                  <h4 className="text-white font-bold text-sm">Initializing WhatsApp Session</h4>
                  <p className="text-zinc-400 text-xs px-6 leading-relaxed">
                    Setting up connection and generating QR code. If the server is sleeping (Render free tier), this can take up to 30 seconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case 'Instagram':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Instagram Account ID</label>
              <input 
                type="text" name="ig_account_id" value={formData.ig_account_id || ''} onChange={handleChange} required
                placeholder="e.g. 1784XXXXXXXX" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Meta Access Token</label>
              <input 
                type="password" name="access_token" value={formData.access_token || ''} onChange={handleChange} required
                placeholder="EAAO..." className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
            </div>
          </>
        );
      case 'SMS':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Twilio Account SID</label>
              <input 
                type="text" name="twilio_sid" value={formData.twilio_sid || ''} onChange={handleChange} required
                placeholder="ACXXXXXXXXXXXXXXXXX" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Twilio Auth Token</label>
              <input 
                type="password" name="twilio_token" value={formData.twilio_token || ''} onChange={handleChange} required
                placeholder="****************" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Twilio Phone Number</label>
              <input 
                type="text" name="twilio_phone" value={formData.twilio_phone || ''} onChange={handleChange} required
                placeholder="+1234567890" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </>
        );
      default:
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">API Key / Token</label>
            <input 
              type="password" name="api_key" value={formData.api_key || ''} onChange={handleChange} required
              placeholder="Enter API Key" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
            />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.1)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {channelKey === 'WhatsApp' ? 'WhatsApp Connection' : `Connect ${channelKey}`}
                </h3>
                <p className="text-xs text-zinc-400">
                  {channelKey === 'WhatsApp' ? 'Scan QR code to link device' : 'Enter your API credentials'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                <h4 className="text-white font-bold text-lg mb-1">
                  {channelKey === 'WhatsApp' ? 'Reset Successful' : 'Successfully Connected'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {channelKey === 'WhatsApp' ? 'WhatsApp session has been reset.' : 'Your credentials have been securely stored.'}
                </p>
              </div>
            ) : (
              <>
                {renderFields()}
                {channelKey !== 'WhatsApp' && (
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex gap-2 items-start mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Your credentials are encrypted and stored securely. We will never share these keys with third parties.
                    </p>
                  </div>
                )}
              </>
            )}

            {!success && (
              <div className="pt-2">
                {channelKey === 'WhatsApp' ? (
                  isWhatsAppConnected ? (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10 font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
                      {loading ? 'Resetting...' : 'Reset Session & New QR'}
                    </button>
                  )
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : 'Save & Connect'}
                  </button>
                )}
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
