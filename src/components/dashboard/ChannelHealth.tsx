"use client";

import React from "react";
import { motion } from "motion/react";
import { MessageCircle, Phone, Star, Instagram, Globe, Settings, Shield, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { liquidSpring } from "../../lib/motionVariants";
import { cn } from "../../lib/utils";

interface ChannelHealthProps {
  onOpenIntegration: (key: string) => void;
}

const HEALTH_CHANNELS = [
  { key: "WhatsApp", name: "WhatsApp Business API", icon: <MessageCircle className="w-5 h-5" />, color: "text-green-300 border-green-400/30 bg-green-500/14", desc: "Customer auto-bookings" },
  { key: "Reviews", name: "GBP Reviews", icon: <Star className="w-5 h-5" />, color: "text-amber-300 border-amber-400/30 bg-amber-500/14", desc: "Google review responder" },
  { key: "SMS", name: "Twilio SMS Gateway", icon: <Phone className="w-5 h-5" />, color: "text-blue-300 border-blue-400/30 bg-blue-500/14", desc: "Missed call recoveries" },
  { key: "Instagram", name: "Instagram Direct", icon: <Instagram className="w-5 h-5" />, color: "text-pink-300 border-pink-400/30 bg-pink-500/14", desc: "Lead generation & DMs" },
  { key: "Web", name: "Live Website Widget", icon: <Globe className="w-5 h-5" />, color: "text-cyan-300 border-cyan-400/30 bg-cyan-500/14", desc: "Interactive customer chat" }
];

export function ChannelHealth({ onOpenIntegration }: ChannelHealthProps) {
  const connectedChannels = useAuthStore((s) => s.connectedChannels);

  return (
    <div
      className="liquid-glass glass-card-obsidian rounded-2xl p-5 select-none border border-white/[0.14]"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Channel Health &amp; Integrations</h3>
          <p className="text-[11px] text-zinc-300/75 mt-0.5">Live status and API connection health check</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/18 border border-emerald-400/35 text-[10px] font-bold text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.16)]">
          <Shield className="w-3 h-3" />
          <span>RLS Secure</span>
        </div>
      </div>

      <div className="space-y-2.5 relative z-10">
        {HEALTH_CHANNELS.map((ch, idx) => {
          const dbChannel = connectedChannels.find((c) => c.channelKey === ch.key);
          const isConnected = dbChannel?.isConnected || false;

          return (
            <motion.div
              key={ch.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.34, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 3 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-colors",
                isConnected
                  ? "bg-white/[0.05] border-white/[0.12] hover:border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "bg-white/[0.025] border-white/[0.06] hover:border-white/[0.15] opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Custom channel colored icon box */}
                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]", ch.color)}>
                  {ch.icon}
                </div>
                
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white leading-tight">{ch.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{ch.desc}</p>
                </div>
              </div>

              {/* Status and Action button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-400 status-live" : "bg-zinc-500")} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", isConnected ? "text-emerald-300" : "text-zinc-400")}>
                    {isConnected ? "Live" : "Offline"}
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={liquidSpring}
                  onClick={() => onOpenIntegration(ch.key)}
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-full border transition-all cursor-pointer",
                    isConnected
                      ? "bg-white/[0.08] border-white/15 text-zinc-200 hover:text-white hover:bg-white/14"
                      : "bg-emerald-500/16 border-emerald-400/35 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_14px_rgba(16,185,129,0.16)]"
                  )}
                >
                  {isConnected ? <Settings className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{isConnected ? "Manage" : "Setup"}</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
