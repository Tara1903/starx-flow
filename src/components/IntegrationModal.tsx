import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Save, Loader2, CheckCircle2, ShieldCheck, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface IntegrationModalProps {
  channelKey: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationModal({ channelKey, isOpen, onClose }: IntegrationModalProps) {
  const updateChannelConnection = useAuthStore(s => s.updateChannelConnection);
  const connectedChannels = useAuthStore(s => s.connectedChannels);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({});

  // WhatsApp connection state helpers
  const whatsappChannel = connectedChannels.find(c => c.channelKey === 'WhatsApp');
  const isWhatsAppConnected = whatsappChannel?.isConnected || false;
  const whatsappCreds = whatsappChannel?.credentials || {};

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

  const handleDisconnect = async () => {
    if (!window.confirm(`Are you sure you want to disconnect ${channelKey}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: disconnectError } = await updateChannelConnection(channelKey, false, {});

    setLoading(false);
    
    if (disconnectError) {
      setError(disconnectError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
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
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">Meta API Connected</h4>
                {whatsappCreds.phone_number_id && (
                  <p className="text-emerald-400 font-mono text-sm">Phone ID: {whatsappCreds.phone_number_id}</p>
                )}
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg flex gap-2 items-start text-left w-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your AI Bot is active and listening via Meta Webhooks. Any message from customers will be processed automatically.
                </p>
              </div>
            </div>
          );
        }

        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Meta Access Token</label>
              <input 
                type="password" name="access_token" value={formData.access_token || ''} onChange={handleChange} required
                placeholder="EAALXxxxxxxxxxxxx..." className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Phone Number ID</label>
              <input 
                type="text" name="phone_number_id" value={formData.phone_number_id || ''} onChange={handleChange} required
                placeholder="123456789012345" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>
          </>
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

  const isConnected = channelKey === 'WhatsApp' ? isWhatsAppConnected : connectedChannels.find(c => c.channelKey === channelKey)?.isConnected;

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
                  {channelKey === 'WhatsApp' ? 'WhatsApp (Meta API)' : `Connect ${channelKey}`}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isConnected ? 'Configuration linked' : 'Enter your API credentials'}
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
                  {isConnected ? 'Successfully Disconnected' : 'Successfully Connected'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {isConnected ? 'Session removed.' : 'Your credentials have been securely stored.'}
                </p>
              </div>
            ) : (
              <>
                {renderFields()}
                {(!isConnected) && (
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
                {isConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    {loading ? 'Disconnecting...' : `Disconnect ${channelKey}`}
                  </button>
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
