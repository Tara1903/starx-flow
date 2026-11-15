"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CalendarCheck, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialSectionHeader } from "./SpatialSectionHeader";
import { SpatialGlassCard } from "./SpatialGlassCard";

export function SpatialGuaranteesScene() {
  const guarantees = [
    {
      title: "Zero Double-Booking Guarantee",
      badge: "CONCURRENCY MUTEX",
      icon: <CalendarCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Real-time bi-directional synchronization with Google Calendar & Microsoft Outlook, enforced by PostgreSQL exclusion constraint locks at the database engine level to mathematically eliminate overlapping appointments.",
      actionLabel: "View Calendar Engine",
      actionHref: "/how-it-works",
    },
    {
      title: "100% Direct Client Ownership",
      badge: "RLS TENANT ISOLATION",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Unlike marketplace directories that pool your clients into public aggregators and cross-sell local competitors, StarX Flow stores your contacts, conversations, and appointments in an isolated tenant database.",
      actionLabel: "View Security Architecture",
      actionHref: "/security",
    },
    {
      title: "Predictable Flat-Rate Pricing",
      badge: "0% COMMISSION EXTORTION",
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      content:
        "Flat monthly software subscriptions ($29 to $99/mo) with zero commission per booking. As your clinic, gym, or salon doubles its revenue, your software bill remains flat, transparent, and predictable.",
      actionLabel: "View Transparent Pricing",
      actionHref: "/pricing",
    },
  ];

  return (
    <SpatialScrollScene
      id="guarantees"
      sceneNumber="09"
      ambientBeam="center"
      className="border-t border-white/5"
    >
      <SpatialSectionHeader
        badge="SCENE 09 // ARCHITECTURAL CERTAINTY"
        badgeIcon={<ShieldCheck size={13} className="text-emerald-400" />}
        titlePrefix="Built on mathematical"
        titleHighlight="certainty."
        titleSuffix="Not promises."
        subtitle="Your clients, appointments, and brand equity belong exclusively to you. We never monetize or cross-sell your customer list."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {guarantees.map((item, idx) => (
          <SpatialGlassCard
            key={idx}
            variant="secondary"
            hoverTilt={true}
            glow={true}
            className="p-8 sm:p-9 rounded-3xl border border-white/10 hover:border-emerald-500/35 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                {item.content}
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href={item.actionHref}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </SpatialGlassCard>
        ))}
      </div>
    </SpatialScrollScene>
  );
}
