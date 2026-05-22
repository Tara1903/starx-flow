import React from "react";
import { MessageCircle, Phone, Star, Instagram, Globe, Check, Settings, Shield, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

interface ChannelHealthProps {
  onOpenIntegration: (key: string) => void;
}

const HEALTH_CHANNELS = [
  { key: "WhatsApp", name: "WhatsApp Business API", icon: <MessageCircle className="w-5 h-5" />, color: "text-green-400 border-green-500/20 bg-green-500/5", desc: "Customer auto-bookings" },
  { key: "Reviews", name: "GBP Reviews", icon: <Star className="w-5 h-5" />, color: "text-amber-400 border-amber-500/20 bg-amber-500/5", desc: "Google review responder" },
  { key: "SMS", name: "Twilio SMS Gateway", icon: <Phone className="w-5 h-5" />, color: "text-blue-400 border-blue-500/20 bg-blue-500/5", desc: "Missed call recoveries" },
  { key: "Instagram", name: "Instagram Direct", icon: <Instagram className="w-5 h-5" />, color: "text-pink-400 border-pink-500/20 bg-pink-500/5", desc: "Lead generation & DMs" },
  { key: "Web", name: "Live Website Widget", icon: <Globe className="w-5 h-5" />, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5", desc: "Interactive customer chat" }
];

export function ChannelHealth({ onOpenIntegration }: ChannelHealthProps) {
  const connectedChannels = useAuthStore((s) => s.connectedChannels);

  return (
    <div className="glass-card rounded-xl p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Channel Health & Integrations</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Live status and API connection health check</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[10px] font-bold text-emerald-400">
          <Shield className="w-3 h-3" />
          <span>RLS Secure</span>
        </div>
      </div>

      <div className="space-y-3">
        {HEALTH_CHANNELS.map((ch) => {
          const dbChannel = connectedChannels.find((c) => c.channelKey === ch.key);
          const isConnected = dbChannel?.isConnected || false;

          return (
            <div
              key={ch.key}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                isConnected
                  ? "bg-white/[0.01] border-white/5"
                  : "bg-white/[0.005] border-white/[0.02] opacity-60"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Custom channel colored icon box */}
                <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0", ch.color)}>
                  {ch.icon}
                </div>
                
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white leading-tight">{ch.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{ch.desc}</p>
                </div>
              </div>

              {/* Status and Action button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500 status-live" : "bg-zinc-600")} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", isConnected ? "text-emerald-400" : "text-zinc-500")}>
                    {isConnected ? "Live" : "Offline"}
                  </span>
                </div>

                <button
                  onClick={() => onOpenIntegration(ch.key)}
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-full border transition-all",
                    isConnected
                      ? "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  )}
                >
                  {isConnected ? <Settings className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{isConnected ? "Manage" : "Setup"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
