"use client";
import React from "react";
import {
  MessageCircle,
  Phone,
  Star,
  Instagram,
  Globe,
  Wifi,
  Settings,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  CONSOLE_PANEL,
  CONSOLE_BTN_PRIMARY,
  CONSOLE_BTN_SECONDARY,
  CONSOLE_BADGE_LIVE,
  CONSOLE_BADGE_MUTED,
  CONSOLE_SECTION_TITLE,
} from "../../lib/consoleSurface";
import { cn } from "../../lib/utils";

interface ChannelGridProps {
  onOpenIntegration: (key: string) => void;
}

const CHANNEL_SERVICES = [
  {
    name: "WhatsApp Business",
    key: "WhatsApp",
    desc: "Automate bookings, send confirmations, and capture leads via WhatsApp Business API",
    icon: MessageCircle,
  },
  {
    name: "Google Business Profile",
    key: "Reviews",
    desc: "Automate review invitations after appointments and reply to public feedback",
    icon: Star,
  },
  {
    name: "SMS / Twilio Gateway",
    key: "SMS",
    desc: "Recover missed calls, send reminders, and dispatch customer follow-ups",
    icon: Phone,
  },
  {
    name: "Instagram Business",
    key: "Instagram",
    desc: "Respond to direct messages and story inquiries with trained business context",
    icon: Instagram,
  },
  {
    name: "Website Chat Widget",
    key: "Web",
    desc: "Embed a live customer chat widget on your domain",
    icon: Globe,
  },
];

export function ChannelGrid({ onOpenIntegration }: ChannelGridProps) {
  const connectedChannels = useAuthStore((s) => s.connectedChannels) || [];
  const activeCount = connectedChannels.filter((c) => c.isConnected).length;

  return (
    <div className="space-y-5 select-none tabular-nums">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={CONSOLE_SECTION_TITLE}>Connected channels</h2>
          <p className="text-xs text-[#727c75] mt-0.5">
            Manage integration credentials and webhook status
          </p>
        </div>
        <span className={activeCount > 0 ? CONSOLE_BADGE_LIVE : CONSOLE_BADGE_MUTED}>
          {activeCount} active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHANNEL_SERVICES.map((ch) => {
          const connectedState = connectedChannels.find((c) => c.channelKey === ch.key);
          const isConnected = connectedState?.isConnected || false;
          const Icon = ch.icon;

          return (
            <div
              key={ch.key}
              className={cn(
                CONSOLE_PANEL,
                "flex flex-col justify-between min-h-[196px] transition-colors",
                isConnected && "border-[#34d399]/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#19201d] border border-[#edf0ee]/[0.08] flex items-center justify-center text-[#a1aaa4]">
                  <Icon className="w-5 h-5" strokeWidth={1.65} />
                </div>

                <button
                  type="button"
                  onClick={() => onOpenIntegration(ch.key)}
                  className={isConnected ? CONSOLE_BTN_SECONDARY : CONSOLE_BTN_PRIMARY}
                >
                  {isConnected ? (
                    <Wifi className="w-3.5 h-3.5 text-[#4cc38a]" strokeWidth={1.65} />
                  ) : (
                    <Settings className="w-3.5 h-3.5" strokeWidth={1.65} />
                  )}
                  <span>{isConnected ? "Configure" : "Connect"}</span>
                </button>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-[#edf0ee]">{ch.name}</h3>
                  {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-[#4cc38a]" />}
                </div>
                <p className="text-xs text-[#a1aaa4] leading-relaxed">{ch.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#edf0ee]/[0.06] flex items-center justify-between text-xs text-[#727c75]">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 text-[#4cc38a]">
                    <Shield className="w-3.5 h-3.5" strokeWidth={1.65} />
                    {ch.key === "WhatsApp" ? (
                      connectedState?.credentials?.connection_type === "baileys" ? (
                        <span>WhatsApp Web active</span>
                      ) : connectedState?.credentials?.phone ? (
                        <span>+{connectedState.credentials.phone}</span>
                      ) : (
                        <span>Official API active</span>
                      )
                    ) : (
                      <span>Credentials active</span>
                    )}
                  </div>
                ) : (
                  <span>Not connected</span>
                )}

                {isConnected && connectedState?.lastSynced && (
                  <span suppressHydrationWarning className="font-mono text-[11px]">
                    Synced{" "}
                    {new Date(connectedState.lastSynced).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
