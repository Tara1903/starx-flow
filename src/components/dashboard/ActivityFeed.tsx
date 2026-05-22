import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Phone, Star, Instagram, Globe, 
  Settings, Clock, Sparkles, AlertTriangle, AlertCircle, CheckCircle2,
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
  System:    <Settings className="w-3.5 h-3.5 text-zinc-500" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp:  "text-green-400 bg-green-500/10 border-green-500/20",
  SMS:       "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Reviews:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Web:       "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  System:    "text-zinc-500 bg-white/5 border-white/10",
};

export function ActivityFeed() {
  const logs = useAuthStore((s) => s.logs);
  const clearLogs = useAuthStore((s) => s.clearLogs);
  const [filter, setFilter] = useState<"all" | "WhatsApp" | "Instagram" | "SMS" | "System">("all");
  const [search, setSearch] = useState("");

  const handleClear = () => {
    clearLogs();
  };

  const getLogStatusStyle = (type: SimulationLog["type"]) => {
    switch (type) {
      case "trigger":
        return {
          dot: "bg-amber-500",
          bg: "bg-amber-500/5 border-amber-500/10",
          indicator: <Sparkles className="w-3 h-3 text-amber-400" />
        };
      case "ai_process":
        return {
          dot: "bg-blue-500",
          bg: "bg-blue-500/5 border-blue-500/10",
          indicator: <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
        };
      case "ai_reply":
        return {
          dot: "bg-purple-500",
          bg: "bg-purple-500/5 border-purple-500/10",
          indicator: <Sparkles className="w-3 h-3 text-purple-400" />
        };
      case "success":
        return {
          dot: "bg-emerald-500",
          bg: "bg-emerald-500/5 border-emerald-500/10",
          indicator: <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        };
      case "system":
      default:
        return {
          dot: "bg-zinc-600",
          bg: "bg-white/[0.01] border-white/5",
          indicator: <Settings className="w-3 h-3 text-zinc-500" />
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
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01] flex flex-col xs:flex-row xs:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Activity Stream</h3>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="flex items-center bg-white/5 border border-white/5 rounded-lg p-0.5 text-[10px] font-bold">
            {(["all", "WhatsApp", "Instagram", "SMS", "System"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-2 py-1 rounded-md transition-all uppercase tracking-wider",
                  filter === opt
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {opt === "all" ? "All" : opt === "System" ? "Sys" : opt}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/10"
            title="Clear Stream Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 py-2.5 border-b border-white/5 bg-white/[0.005] flex items-center gap-2 select-none">
        <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter events or logs..."
          className="bg-transparent border-none text-xs text-zinc-300 outline-none w-full placeholder-zinc-600"
        />
      </div>

      {/* Events Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 console-scroll">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 select-none">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">No Activity Logged</p>
            <p className="text-[11px] text-zinc-600 mt-1 max-w-[200px]">Waiting for real-time customer integrations to trigger automations.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/5 ml-3 pl-5 space-y-4">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log) => {
                const styles = getLogStatusStyle(log.type);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group"
                  >
                    {/* Floating timeline dot */}
                    <span className="absolute -left-[25px] top-1.5 flex items-center justify-center w-2.5 h-2.5 rounded-full border border-black bg-[#050505] z-10">
                      <span className={cn("w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125", styles.dot)} />
                    </span>

                    {/* Timeline Event Card */}
                    <div className={cn("p-3 rounded-lg border flex items-start justify-between gap-3 text-xs leading-relaxed transition-all hover:bg-white/[0.015]", styles.bg)}>
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Channel Icon Badge */}
                        <div className={cn("w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5", CHANNEL_COLOR[log.channel] || CHANNEL_COLOR.System)}>
                          {CHANNEL_ICON[log.channel] || CHANNEL_ICON.System}
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-200 break-words">{log.message}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1 select-none">
                            <span className="font-semibold uppercase tracking-wider text-[9px] px-1 bg-white/5 rounded border border-white/5">{log.type}</span>
                            <span>·</span>
                            <span>{log.channel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Log Timestamp */}
                      <span className="text-[10px] text-zinc-500 flex-shrink-0 select-none font-mono mt-0.5">
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
