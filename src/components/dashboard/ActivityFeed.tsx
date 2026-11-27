"use client";
import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  Star,
  Instagram,
  Globe,
  Settings,
  Clock,
  Trash2,
  Search,
  Activity,
} from "lucide-react";
import { useAuthStore, type SimulationLog } from "../../store/authStore";
import {
  CONSOLE_PANEL_FLUSH,
  CONSOLE_SUBCARD,
  CONSOLE_INPUT,
  CONSOLE_BADGE_MUTED,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_WARN,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.65} />,
  SMS: <Phone className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Reviews: <Star className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Instagram: <Instagram className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Web: <Globe className="w-3.5 h-3.5" strokeWidth={1.65} />,
  System: <Settings className="w-3.5 h-3.5" strokeWidth={1.65} />,
};

export function ActivityFeed() {
  const logs = useAuthStore((s) => s.logs);
  const clearLogs = useAuthStore((s) => s.clearLogs);
  const [filter, setFilter] = useState<"all" | "WhatsApp" | "Instagram" | "SMS" | "System">("all");
  const [search, setSearch] = useState("");

  const getTypeBadge = (type: SimulationLog["type"]) => {
    switch (type) {
      case "trigger":
        return CONSOLE_BADGE_WARN;
      case "success":
        return CONSOLE_BADGE_LIVE;
      default:
        return CONSOLE_BADGE_MUTED;
    }
  };

  const filteredLogs = logs
    .slice()
    .reverse()
    .filter((log) => {
      const matchFilter = filter === "all" || log.channel === filter;
      const matchSearch =
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.channel.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });

  return (
    <div className={cn(CONSOLE_PANEL_FLUSH, "flex flex-col h-[390px]")}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#edf0ee]/[0.08] flex flex-col xs:flex-row xs:items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />
          <h2 className={CONSOLE_SECTION_TITLE}>Recent activity</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0d1210] border border-[#edf0ee]/[0.08] rounded-lg p-0.5 text-xs">
            {(["all", "WhatsApp", "Instagram", "SMS", "System"] as const).map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setFilter(opt)}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                  filter === opt
                    ? "bg-[#19201d] text-[#edf0ee]"
                    : "text-[#727c75] hover:text-[#edf0ee]"
                )}
              >
                {opt === "all" ? "All" : opt}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={clearLogs}
            className="text-[#727c75] hover:text-[#f28b8e] p-1.5 rounded-lg hover:bg-[#e5484d]/10 transition-colors cursor-pointer"
            title="Clear activity logs"
            aria-label="Clear activity logs"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.65} />
          </button>
        </div>
      </div>

      {/* Filter Search */}
      <div className="px-5 py-2.5 border-b border-[#edf0ee]/[0.06] bg-[#0d1210] flex items-center gap-2 select-none">
        <Search className="w-3.5 h-3.5 text-[#727c75] flex-shrink-0" strokeWidth={1.65} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events"
          className={cn(CONSOLE_INPUT, "bg-transparent border-none text-xs w-full py-0.5")}
        />
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 console-scroll">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 select-none">
            <Clock className="w-6 h-6 text-[#727c75] mb-2.5" strokeWidth={1.5} />
            <p className="text-xs font-medium text-[#edf0ee]">No events recorded yet</p>
            <p className="text-xs text-[#727c75] mt-1 max-w-[240px]">
              Customer automation runs and channel events appear here in real time
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                CONSOLE_SUBCARD,
                "p-3 flex items-start justify-between gap-3 text-xs leading-relaxed"
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] flex-shrink-0 mt-0.5">
                  {CHANNEL_ICON[log.channel] || CHANNEL_ICON.System}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#edf0ee] break-words">{log.message}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#727c75] mt-1">
                    <span className={getTypeBadge(log.type)}>{log.type.replace("_", " ")}</span>
                    <span>{log.channel}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#727c75] flex-shrink-0 font-mono tabular-nums mt-0.5">
                {log.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
