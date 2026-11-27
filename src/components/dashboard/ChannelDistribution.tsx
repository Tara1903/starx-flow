"use client";

import React, { useMemo, useState } from "react";
import { MessageCircle, Phone, Star, Instagram, Globe, Hash } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { ChartShell } from "./charts/ChartShell";

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.65} />,
  SMS: <Phone className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Reviews: <Star className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Instagram: <Instagram className="w-3.5 h-3.5" strokeWidth={1.65} />,
  Web: <Globe className="w-3.5 h-3.5" strokeWidth={1.65} />,
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
    return Array.from(map.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count);
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
      title="Channel mix"
      subtitle={
        visibleTotal > 0
          ? `${visibleTotal.toLocaleString()} runs across active channels`
          : "Filter channels below to inspect traffic share"
      }
      icon={<Hash className="w-4 h-4 text-[#727c75]" strokeWidth={1.65} />}
      isEmpty={groupedChannels.length === 0}
      emptyTitle="No connected channels yet"
      emptyDescription="Connect WhatsApp, SMS, Instagram, or Web Chat to compare traffic share"
      actions={
        groupedChannels.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {groupedChannels.map(({ channel }) => {
              const isHidden = Boolean(hiddenChannels[channel]);
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  aria-pressed={!isHidden}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                    isHidden
                      ? "opacity-45 border-[#edf0ee]/[0.06] bg-[#0d1210] text-[#727c75]"
                      : "border-[#edf0ee]/12 bg-[#19201d] text-[#a1aaa4] hover:text-[#edf0ee]"
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
          const isLead = idx === 0 && !isHidden;
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
                  <span className="text-[#727c75] flex-shrink-0">
                    {CHANNEL_ICON[channel] || <Globe className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-xs font-medium text-[#edf0ee]">{channel}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-xs text-[#727c75]">
                    {count.toLocaleString()} runs
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isLead ? "text-[#4cc38a]" : "text-[#a1aaa4]"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 bg-[#0d1210] border border-[#edf0ee]/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={prefersReduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: pct / 100 }}
                  transition={
                    prefersReduced
                      ? { duration: 0.01 }
                      : { duration: 0.5, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }
                  }
                  style={{ originX: 0 }}
                  className={cn(
                    "h-full w-full rounded-full transition-colors",
                    isLead || isHighlighted ? "bg-[#34d399]" : "bg-[#727c75]/55"
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
