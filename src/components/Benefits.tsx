"use client";

import React from "react";
import {
  CalendarDays,
  ShieldCheck,
  Star,
  RefreshCw,
  ClipboardList,
  Database,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { GlassCard } from "./ui/GlassCard";
import { cn } from "../lib/utils";

interface BenefitBentoItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  spanClass: string;
  featured?: boolean;
  metricBadge?: string;
}

export function Benefits() {
  const benefits: BenefitBentoItem[] = [
    {
      icon: <CalendarDays className="w-6 h-6 text-emerald-400" />,
      title: "24/7 WhatsApp Bookings",
      desc: "Enable clients to schedule, reschedule, or cancel slots late at night when your front desk is closed — synced live against staff availability.",
      spanClass: "md:col-span-2 lg:col-span-4",
      featured: true,
      metricBadge: "Real-Time Slot Lock",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "No-Show Prevention",
      desc: "Auto-send smart confirmation invites and 24-hour reminders over WhatsApp to secure bookings.",
      spanClass: "md:col-span-1 lg:col-span-2",
      metricBadge: "-68% Drop-off",
    },
    {
      icon: <Star className="w-6 h-6 text-emerald-400" />,
      title: "Google Review Booster",
      desc: "Automatically follow up post-session to request 5-star reviews and lift local rankings.",
      spanClass: "md:col-span-1 lg:col-span-2",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: "Staff Calendar Sync",
      desc: "Real-time, two-way sync with Google Calendar and Microsoft Outlook across your team.",
      spanClass: "md:col-span-1 lg:col-span-2",
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-emerald-400" />,
      title: "WhatsApp Intake Forms",
      desc: "Deliver digital waivers, health forms, and onboarding packets before arrival.",
      spanClass: "md:col-span-1 lg:col-span-2",
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "Unified Service CRM & Audit Trail",
      desc: "Aggregate client session histories, staff notes, WhatsApp/Instagram threads, and deterministic AI guardrails inside one Business OS console.",
      spanClass: "md:col-span-2 lg:col-span-6",
      featured: true,
      metricBadge: "Omni-Channel Memory",
    },
  ];

  return (
    <section
      id="metrics"
      className="py-24 lg:py-32 px-6 relative z-10 bg-black/20 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute top-1/4 -left-[20%] w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-[10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal direction="up" className="max-w-3xl mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-4">
            <HeartHandshake size={12} className="text-emerald-400" />
            Core Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-5">
            Engineered for{" "}
            <span className="text-gradient-green">Operational Excellence.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Stop losing leads to manual administration. Let AI and native
            automation scale your booking capacity and drive repeat visits.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 lg:gap-6">
          {benefits.map((b, i) => (
            <ScrollReveal
              key={b.title}
              direction="up"
              delay={i * 0.05}
              className={b.spanClass}
            >
              <GlassCard
                variant={b.featured ? "focus" : "obsidian"}
                hoverable
                glow={b.featured}
                className={cn(
                  "p-6 sm:p-8 h-full group flex flex-col justify-between",
                  b.featured && "relative overflow-hidden"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-400/50 transition-all duration-200">
                      {b.icon}
                    </div>
                    {b.metricBadge && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-[11px] font-semibold text-emerald-300 tabular-nums">
                        {b.featured ? (
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        )}
                        {b.metricBadge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2.5 tracking-tight group-hover:text-emerald-300 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm sm:text-base font-medium max-w-2xl">
                    {b.desc}
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
