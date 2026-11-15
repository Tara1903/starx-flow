"use client";

import React from "react";
import { PhoneOff, CalendarX, TrendingDown, DollarSign, AlertCircle, ArrowDown } from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialSectionHeader } from "./SpatialSectionHeader";
import { SpatialGlassCard } from "./SpatialGlassCard";

export function SpatialProblemScene() {
  const failurePoints = [
    {
      num: "01",
      icon: <PhoneOff className="w-5 h-5 text-emerald-400" />,
      title: "62% Unanswered Calls",
      desc: "During busy treatment hours or after 6:00 PM, callers don't leave voicemails — they immediately call the next local clinic on Google.",
      badge: "Lost New Inquiries",
    },
    {
      num: "02",
      icon: <CalendarX className="w-5 h-5 text-emerald-400" />,
      title: "Manual Scheduling Friction",
      desc: "Staff manually texting back and forth to confirm dates, checking Google Calendar on phones, and risking costly double-bookings.",
      badge: "12+ Admin Hours Lost",
    },
    {
      num: "03",
      icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
      title: "Leaked Leads & Silent No-Shows",
      desc: "Inquiries go cold without instant replies. Clients forget unreminded appointments, leaving practitioners with empty, unpaid treatment slots.",
      badge: "Unrecovered Revenue",
    },
  ];

  return (
    <SpatialScrollScene
      id="problem"
      sceneNumber="02"
      ambientBeam="top"
      className="border-t border-white/5"
    >
      <SpatialSectionHeader
        badge="SCENE 02 // FRONT DESK ENTROPY"
        badgeIcon={<AlertCircle size={13} className="text-emerald-400" />}
        titlePrefix="Your front desk is"
        titleHighlight="leaking revenue"
        titleSuffix="while you treat clients."
        subtitle="When you are in the treatment room, coaching a member, or styling hair, every delayed response costs you an appointment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT: The 3 Friction Shards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
          {failurePoints.map((point) => (
            <SpatialGlassCard
              key={point.num}
              variant="secondary"
              hoverTilt={true}
              glow={true}
              className="p-6 sm:p-7 border border-white/10 hover:border-emerald-500/30 flex flex-col sm:flex-row items-start gap-5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
                {point.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {point.title}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                    {point.badge}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </SpatialGlassCard>
          ))}
        </div>

        {/* RIGHT: Architectural Cost Telemetry Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <SpatialGlassCard
            variant="primary"
            hoverTilt={true}
            glow={true}
            className="p-8 sm:p-10 border border-emerald-500/30 shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.15)] text-center flex flex-col items-center justify-center h-full relative overflow-hidden"
          >
            {/* Ambient Specular Inset Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
            />

            <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-widest mb-6">
              AVERAGE LEAKAGE AUDIT
            </span>

            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">
              Annual Revenue Lost to Delayed Replies
            </span>

            <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-4 tabular-nums">
              $48,590
            </div>

            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full mb-6" />

            <p className="text-sm text-zinc-300 leading-relaxed max-w-sm mb-6">
              Based on 20+ missed calls and delayed evening inquiries per month for an average independent practice ($120 average booking value).
            </p>

            <div className="w-full pt-4 border-t border-white/10 text-xs font-mono text-emerald-300 flex items-center justify-between">
              <span>StarX Autonomous Recovery:</span>
              <span className="font-bold text-white">&lt; 1.4s Instant Reply</span>
            </div>
          </SpatialGlassCard>
        </div>

      </div>
    </SpatialScrollScene>
  );
}
