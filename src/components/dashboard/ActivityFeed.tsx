"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Phone, Star, Instagram, Globe, 
  Settings, Clock, Sparkles, CheckCircle2,
  Trash2, Search, Activity
} from "lucide-react";
import { useAuthStore, type SimulationLog } from "../../store/authStore";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp:  <MessageCircle className="w-3.5 h-3.5" />,
  SMS:       <Phone className="w-3.5 h-3.5" />,
  Reviews:   <Star className="w-3.5 h-3.5" />,
  Instagram: <Instagram className="w-3.5 h-3.5" />,
  Web:       <Globe className="w-3.5 h-3.5" />,
  System:    <Settings className="w-3.5 h-3.5 text-zinc-400" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-300 bg-green-500/14 border-green-400/25",
  SMS:       "text-blue-300 bg-blue-500/14 border-blue-400/25",
  Reviews:   "text-amber-300 bg-amber-500/14 border-amber-400/25",
  Instagram: "text-pink-300 bg-pink-500/14 border-pink-400/25",
  Web:       "text-cyan-300 bg-cyan-500/14 border-cyan-400/25",
  System:    "text-zinc-300 bg-white/[0.08] border-white/15",
};

export function ActivityFeed() {
  const logs = useAuthStore((s) => s.logs);
  const addLog = useAuthStore((s) => s.addLog);
  const connectedChannels = useAuthStore((s) => s.connectedChannels);
  const clearLogs = useAuthStore((s) => s.clearLogs);
  const [filter, setFilter] = useState<"all" | "WhatsApp" | "Instagram" | "SMS" | "System">("all");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    const activeChannels = connectedChannels.filter(c => c.isConnected);
    if (activeChannels.length === 0) return;

    const interval = setInterval(() => {
      // 50% chance to generate a log every 6 seconds to make dashboard feel alive
      if (Math.random() > 0.5) return;
      
      const channel = activeChannels[Math.floor(Math.random() * activeChannels.length)].channelKey;
      
      const eventTypes = [
        { type: "trigger", msgs: ["Incoming customer inquiry received", "New lead captured from campaign", "User initiated help sequence"] },
        { type: "ai_process", msgs: ["AI Agent analyzing intent & sentiment", "Drafting personalized response", "Checking availability calendar"] },
        { type: "ai_reply", msgs: ["AI Assistant dispatched response", "Follow-up question sent", "Sending rich media template"] },
        { type: "success", msgs: ["Meeting successfully booked for tomorrow", "Support ticket resolved automatically", "Discount voucher sent to user"] }
      ] as const;

      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomMsg = randomEvent.msgs[Math.floor(Math.random() * randomEvent.msgs.length)];

      addLog(randomEvent.type, channel, randomMsg);
    }, 6000);

    return () => clearInterval(interval);
  }, [connectedChannels, addLog]);

  const handleClear = () => {
    clearLogs();
  };

  const getLogStatusStyle = (type: SimulationLog["type"]) => {
    switch (type) {
      case "trigger":
        return {
          dot: "bg-amber-400",
          bg: "bg-amber-500/[0.08] border-amber-400/20",
          indicator: <Sparkles className="w-3 h-3 text-amber-300" />
        };
      case "ai_process":
        return {
          dot: "bg-blue-400",
          bg: "bg-blue-500/[0.08] border-blue-400/20",
          indicator: <Clock className="w-3 h-3 text-blue-300 animate-pulse" />
        };
      case "ai_reply":
        return {
          dot: "bg-purple-400",
          bg: "bg-purple-500/[0.08] border-purple-400/20",
          indicator: <Sparkles className="w-3 h-3 text-purple-300" />
        };
      case "success":
        return {
          dot: "bg-emerald-400",
          bg: "bg-emerald-500/[0.08] border-emerald-400/20",
          indicator: <CheckCircle2 className="w-3 h-3 text-emerald-300" />
        };
      case "system":
      default:
        return {
          dot: "bg-zinc-400",
          bg: "bg-white/[0.04] border-white/[0.09]",
          indicator: <Settings className="w-3 h-3 text-zinc-400" />
        };
    }
  };

  const filteredLogs = logs
    .slice()
    .reverse() // show newest first
    .filter((log) => {
      const matchFilter = filter === "all" || log.channel === filter;
      const matchSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.channel.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });

  return (
    <div
      className="liquid-glass glass-card-obsidian rounded-2xl overflow-hidden flex flex-col h-[400px] border border-white/[0.14]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.1] bg-white/[0.03] flex flex-col xs:flex-row xs:items-center justify-between gap-3 select-none relative z-10">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4.5 h-4.5 text-emerald-300" />
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Stream</h3>
          <span className="w-2 h-2 bg-emerald-400 rounded-full status-live" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl p-0.5 text-[10px] font-bold">
            {(["all", "WhatsApp", "Instagram", "SMS", "System"] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "relative px-2.5 py-1 rounded-lg transition-colors uppercase tracking-wider cursor-pointer",
                  filter === opt
                    ? "text-emerald-200"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {filter === opt && (
                  <motion.span
                    layoutId="activity-filter-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-emerald-500/22 border border-emerald-400/35 -z-10"
                  />
                )}
                {opt === "all" ? "All" : opt === "System" ? "Sys" : opt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
            title="Clear Stream Logs"
            aria-label="Clear Stream Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 py-2.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-2 select-none relative z-10">
        <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter events or logs..."
          className="bg-transparent border-none text-xs text-zinc-200 outline-none w-full placeholder-zinc-500"
        />
      </div>

      {/* Events Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 console-scroll relative z-10">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 select-none">
            <div className="w-12 h-12 rounded-2xl liquid-glass border border-white/15 flex items-center justify-center mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <Clock className="w-5 h-5 text-emerald-300/70" />
            </div>
            <p className="text-xs text-zinc-300 font-semibold uppercase tracking-wider">No Activity Logged</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[220px]">Waiting for real-time customer integrations to trigger automations.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 pl-5 space-y-4">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log) => {
                const styles = getLogStatusStyle(log.type);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="relative group"
                  >
                    {/* Floating timeline dot */}
                    <span className="absolute -left-[25px] top-1.5 flex items-center justify-center w-2.5 h-2.5 rounded-full border border-emerald-400/30 bg-[#050a08] z-10">
                      <span className={cn("w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125", styles.dot)} />
                    </span>

                    {/* Timeline Event Card */}
                    <div className={cn("p-3 rounded-xl border flex items-start justify-between gap-3 text-xs leading-relaxed transition-colors hover:bg-white/[0.06]", styles.bg)}>
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Channel Icon Badge */}
                        <div className={cn("w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5", CHANNEL_COLOR[log.channel] || CHANNEL_COLOR.System)}>
                          {CHANNEL_ICON[log.channel] || CHANNEL_ICON.System}
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-100 break-words">{log.message}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1 select-none">
                            <span className="font-semibold uppercase tracking-wider text-[9px] px-1.5 bg-white/[0.08] rounded border border-white/10">{log.type}</span>
                            <span>·</span>
                            <span>{log.channel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Log Timestamp */}
                      <span className="text-[10px] text-zinc-400 flex-shrink-0 select-none font-mono mt-0.5">
                        {log.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
