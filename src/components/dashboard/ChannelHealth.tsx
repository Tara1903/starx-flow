"use client";

import React from "react";
import {
  MessageCircle,
  Phone,
  Star,
  Instagram,
  Globe,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  CONSOLE_PANEL,
  CONSOLE_SUBCARD,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface ChannelHealthProps {
  onOpenIntegration: (key: string) => void;
}

const HEALTH_CHANNELS = [
  {
    key: "WhatsApp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    desc: "Customer bookings and replies",
  },
  {
    key: "Reviews",
    name: "Google Business Profile",
    icon: Star,
    desc: "Automated review responses",
  },
  {
    key: "SMS",
    name: "Twilio SMS",
    icon: Phone,
    desc: "Missed call follow-ups",
  },
  {
    key: "Instagram",
    name: "Instagram Direct",
    icon: Instagram,
    desc: "Lead capture and direct replies",
  },
  {
    key: "Web",
    name: "Website Chat Widget",
    icon: Globe,
    desc: "Embedded visitor chat",
  },
];

export function ChannelHealth({ onOpenIntegration }: ChannelHealthProps) {
  const connectedChannels = useAuthStore((s) => s.connectedChannels);
  const connectedCount = HEALTH_CHANNELS.filter((ch) =>
    connectedChannels.some((c) => c.channelKey === ch.key && c.isConnected)
  ).length;

  return (
    <div className={cn(CONSOLE_PANEL, "select-none h-full flex flex-col justify-between")}>
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#edf0ee]/[0.08]">
        <div>
          <h2 className={CONSOLE_SECTION_TITLE}>Channel connections</h2>
          <p className="text-xs text-[#727c75] mt-0.5">
            {connectedCount} of {HEALTH_CHANNELS.length} connected
          </p>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {HEALTH_CHANNELS.map((ch) => {
          const dbChannel = connectedChannels.find((c) => c.channelKey === ch.key);
          const isConnected = dbChannel?.isConnected || false;
          const Icon = ch.icon;

          return (
            <div
              key={ch.key}
              className={cn(
                CONSOLE_SUBCARD,
                "flex items-center justify-between p-3 gap-3 hover:bg-[#19201d] transition-colors"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4] flex-shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={1.65} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#edf0ee] truncate">{ch.name}</p>
                  <p className="text-[11px] text-[#727c75] mt-0.5 truncate">{ch.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isConnected ? "bg-[#4cc38a]" : "bg-[#727c75]"
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "text-xs",
                      isConnected ? "text-[#4cc38a]" : "text-[#727c75]"
                    )}
                  >
                    {isConnected ? "Live" : "Offline"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenIntegration(ch.key)}
                  className={cn(
                    isConnected ? CONSOLE_BTN_SECONDARY : CONSOLE_BTN_PRIMARY,
                    "py-1 px-2.5 text-[11px]"
                  )}
                >
                  {isConnected ? (
                    <Settings className="w-3 h-3" strokeWidth={1.65} />
                  ) : (
                    <AlertCircle className="w-3 h-3" strokeWidth={1.65} />
                  )}
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
