import React from "react";
import { MessageCircle, Phone, Star, Instagram, Globe, Wifi, Settings, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

interface ChannelGridProps {
  onOpenIntegration: (key: string) => void;
}

const CHANNEL_SERVICES = [
  { 
    name: "WhatsApp Business", 
    key: "WhatsApp", 
    desc: "Automate bookings, send confirmations, and capture leads via WhatsApp Business API.", 
    icon: <MessageCircle className="w-6 h-6" />, 
    color: "text-green-400", 
    bg: "bg-green-500/10 border-green-500/20" 
  },
  { 
    name: "Google Business Profile", 
    key: "Reviews", 
    desc: "Automate 5-star review requests post-service and monitor your public reputation score.", 
    icon: <Star className="w-6 h-6" />, 
    color: "text-amber-400", 
    bg: "bg-amber-500/10 border-amber-500/20" 
  },
  { 
    name: "SMS / Twilio Gateway", 
    key: "SMS", 
    desc: "Recover missed calls, send appointment reminders, and dispatch follow-ups via SMS.", 
    icon: <Phone className="w-6 h-6" />, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10 border-blue-500/20" 
  },
  { 
    name: "Instagram Business", 
    key: "Instagram", 
    desc: "Auto-reply to DMs and comments with AI, send promotional vouchers, capture leads.", 
    icon: <Instagram className="w-6 h-6" />, 
    color: "text-pink-400", 
    bg: "bg-pink-500/10 border-pink-500/20" 
  },
  { 
    name: "Website Chat Widget", 
    key: "Web", 
    desc: "Embed a live AI chat widget on your website for instant visitor engagement.", 
    icon: <Globe className="w-6 h-6" />, 
    color: "text-cyan-400", 
    bg: "bg-cyan-500/10 border-cyan-500/20" 
  },
];

export function ChannelGrid({ onOpenIntegration }: ChannelGridProps) {
  const connectedChannels = useAuthStore((s) => s.connectedChannels) || [];
  const activeCount = connectedChannels.filter((c) => c.isConnected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-white">Connected Channels</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your integrations, API credentials, and live connections</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/[0.02] border border-white/5 rounded-full px-3.5 py-1.5 select-none">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-live" />
          <span>{activeCount} Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHANNEL_SERVICES.map((ch, index) => {
          const connectedState = connectedChannels.find((c) => c.channelKey === ch.key);
          const isConnected = connectedState?.isConnected || false;

          return (
            <motion.div
              key={ch.key}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={cn(
                "glass-card rounded-xl p-5 transition-all flex flex-col justify-between h-[210px] relative overflow-hidden group border",
                isConnected
                  ? "border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.02)]"
                  : "border-white/5 opacity-70 hover:opacity-100"
              )}
            >
              {/* Top Row: Icon and Status Control */}
              <div className="flex items-start justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", ch.bg, ch.color)}>
                  {ch.icon}
                </div>
                
                <button
                  onClick={() => onOpenIntegration(ch.key)}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-3 rounded-full border transition-all select-none",
                    isConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
                  <span>{isConnected ? "Configure" : "Connect"}</span>
                </button>
              </div>

              {/* Middle Row: Name and Description */}
              <div className="mt-4 flex-1">
                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
                  {ch.name}
                  {isConnected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-live" />
                  )}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {ch.desc}
                </p>
              </div>

              {/* Bottom Row: Details and Credentials (if connected) */}
              <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between text-[10px] text-zinc-500">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-emerald-400/80 font-semibold">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    {ch.key === "WhatsApp" && connectedState?.credentials?.phone ? (
                      <span>Active: +{connectedState.credentials.phone}</span>
                    ) : (
                      <span>API active & secure</span>
                    )}
                  </div>
                ) : (
                  <span className="font-semibold text-zinc-600">Not configured</span>
                )}
                
                {isConnected && connectedState?.lastSynced && (
                  <span className="text-[9px] text-zinc-600 font-medium">
                    Synced: {new Date(connectedState.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
