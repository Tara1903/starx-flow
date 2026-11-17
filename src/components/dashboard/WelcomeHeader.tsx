"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      data-cursor-spotlight="true"
      className="glass-hero rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none relative overflow-hidden border border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.36)]"
    >
      {/* Internal emerald aurora wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-12 w-72 h-72 rounded-full opacity-55"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.28) 0%, rgba(16,185,129,0.10) 48%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex-1">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/14 border border-emerald-400/25 text-[10px] font-bold text-emerald-300 uppercase tracking-widest shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Operational Hub</span>
          </div>

          <h2 suppressHydrationWarning className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight">
            {getGreeting()},{" "}
            <span className="text-gradient-green">{user?.name || "Noah Carter"}</span>
          </h2>
        </div>

        <p className="text-xs sm:text-[13px] text-zinc-300/80 mt-1.5 max-w-[650px] leading-relaxed">
          Managing automations for{" "}
          <span className="text-white font-semibold">
            {user?.businessName || "Crema Studio"}
          </span>
          {user?.businessType ? ` (${user.businessType})` : ""}. All
          communication channels are operational.
        </p>
      </div>

      {/* Realtime System Telemetry Pill */}
      <div className="relative z-10 self-start md:self-center flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 text-xs text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        <span className="font-semibold text-[11px] uppercase tracking-wider">All Systems Operational</span>
      </div>
    </div>
  );
}
