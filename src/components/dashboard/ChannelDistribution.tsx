"use client";

import React, { useMemo, useState } from "react";
import { MessageCircle, Phone, Star, Instagram, Globe, Hash } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { ChartShell } from "./charts/ChartShell";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-4 h-4" />,
  SMS: <Phone className="w-4 h-4" />,
  Reviews: <Star className="w-4 h-4" />,
  Instagram: <Instagram className="w-4 h-4" />,
  Web: <Globe className="w-4 h-4" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WhatsApp: "text-green-400 border-green-500/25 bg-green-500/10",
  SMS: "text-blue-400 border-blue-500/25 bg-blue-500/10",
  Reviews: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  Instagram: "text-pink-400 border-pink-500/25 bg-pink-500/10",
  Web: "text-cyan-400 border-cyan-500/25 bg-cyan-500/10",
};

const CHANNEL_TEXT_COLOR: Record<string, string> = {
  WhatsApp: "text-green-300",
  SMS: "text-blue-300",
  Reviews: "text-amber-300",
  Instagram: "text-pink-300",
  Web: "text-cyan-300",
};

const CHANNEL_BAR_COLOR: Record<string, string> = {
  WhatsApp: "from-green-500 to-emerald-400",
  SMS: "from-blue-500 to-indigo-400",
  Reviews: "from-amber-500 to-yellow-400",
  Instagram: "from-pink-500 to-rose-400",
  Web: "from-cyan-500 to-blue-400",
};

export function ChannelDistribution() {
  const workflows = useAuthStore((s) => s.workflows) || [];
  const prefersReduced = useReducedMotion();
  const [hiddenChannels, setHiddenChannels] = useState<Record<string, boolean>>({});
  const [focusedChannel, setFocusedChannel] = useState<string | null>(null);

  const groupedChannels = useMemo(() => {
    const map = new Map<string, number>();
    for (const wf of workflows) {
      const prev = map.get(wf.channel) || 0;
      map.set(wf.channel, prev + (wf.executionsCount || 0));
    }
    return Array.from(map.entries()).map(([channel, count]) => ({ channel, count }));
  }, [workflows]);

  const visibleTotal = useMemo(
    () =>
      groupedChannels
        .filter((c) => !hiddenChannels[c.channel])
        .reduce((acc, c) => acc + c.count, 0),
    [groupedChannels, hiddenChannels]
  );

  const toggleChannel = (channel: string) => {
    setHiddenChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  return (
    <ChartShell
      title="Channel Distribution"
      subtitle={
        visibleTotal > 0
          ? `${visibleTotal.toLocaleString()} active channel runs`
          : "Click legends to inspect channel mix"
      }
      icon={<Hash className="w-4 h-4 text-emerald-400" />}
      isEmpty={groupedChannels.length === 0}
      emptyTitle="No connected channels active"
      emptyDescription="Connect WhatsApp, SMS, Instagram, or Web Chat to compare traffic share."
      actions={
        groupedChannels.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {groupedChannels.map(({ channel }) => {
              const isHidden = Boolean(hiddenChannels[channel]);
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  aria-pressed={!isHidden}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer",
                    isHidden
                      ? "opacity-45 border-white/10 bg-white/[0.02] text-zinc-400"
                      : "border-emerald-400/30 bg-emerald-500/10 text-zinc-200 hover:text-white"
                  )}
                >
                  {channel}
                </button>
              );
            })}
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {groupedChannels.map(({ channel, count }, idx) => {
          const isHidden = Boolean(hiddenChannels[channel]);
          const pct =
            !isHidden && visibleTotal > 0 ? Math.round((count / visibleTotal) * 100) : 0;
          const isHighlighted = focusedChannel === channel;

          return (
            <div
              key={channel}
              tabIndex={0}
              onMouseEnter={() => setFocusedChannel(channel)}
              onMouseLeave={() => setFocusedChannel(null)}
              onFocus={() => setFocusedChannel(channel)}
              onBlur={() => setFocusedChannel(null)}
              className={cn(
                "group outline-none transition-opacity",
                isHidden && "opacity-35"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0",
                      CHANNEL_COLOR[channel] || "text-emerald-300 border-white/10 bg-white/5"
                    )}
                  >
                    {CHANNEL_ICON[channel] || <Globe className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {channel}
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-[11px] text-zinc-400">
                    {count.toLocaleString()} runs
                  </span>
                  <span className={cn("text-xs font-bold", CHANNEL_TEXT_COLOR[channel] || "text-emerald-300")}>
                    {pct}%
                  </span>
                </div>
              </div>

              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={prefersReduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: pct / 100 }}
                  transition={
                    prefersReduced
                      ? { duration: 0.01 }
                      : { duration: 0.65, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }
                  }
                  style={{ originX: 0 }}
                  className={cn(
                    "h-full w-full rounded-full bg-gradient-to-r transition-all",
                    CHANNEL_BAR_COLOR[channel] || "from-emerald-500 to-teal-400",
                    isHighlighted && "brightness-115"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}
