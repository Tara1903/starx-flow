"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CalendarCheck,
  DollarSign,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { SpatialGlassCard } from "./spatial/SpatialGlassCard";

export function Testimonials() {
  const commitments = [
    {
      title: "Zero Double-Booking Guarantee",
      badge: "Concurrency Locked",
      icon: <CalendarCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Real-time two-way synchronization with Google Calendar and Microsoft Outlook, reinforced with PostgreSQL exclusion constraint locks at the database engine level to mathematically prevent overlapping slot bookings.",
      actionLabel: "View Calendar Architecture",
      actionHref: "/how-it-works",
      margin: "mt-0",
    },
    {
      title: "100% Direct Client Ownership",
      badge: "Zero Marketplace Lock-in",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Unlike marketplace directories that pool your clients into public aggregators and cross-sell competitors, StarX Flow stores your contacts, conversations, and appointments in your private tenant database with Row Level Security.",
      actionLabel: "View Security Architecture",
      actionHref: "/security",
      margin: "lg:mt-6",
    },
    {
      title: "Predictable Flat-Rate Pricing",
      badge: "0% Commission Deductions",
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      content:
        "StarX Flow charges a flat monthly software subscription ($29 to $99/mo) with no per-booking fees or hidden percentages. When your clinic, gym, or salon grows, your software bill remains flat and predictable.",
      actionLabel: "View Transparent Pricing",
      actionHref: "/pricing",
      margin: "lg:mt-12",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 overflow-hidden border-t border-white/5 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal
          direction="up"
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 spatial-content-protected"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-crystal text-xs font-bold tracking-widest text-emerald-300 uppercase mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Platform Guarantees
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-5 text-white leading-tight">
            Built on architectural{" "}
            <span className="text-gradient-green">Certainty.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
            Your clients, appointments, and brand equity belong exclusively to
            you. We never monetize your customer list.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item) => (
            <div key={item.title} className={item.margin}>
              <SpatialGlassCard
                variant="secondary"
                hoverTilt={true}
                glow={true}
                className="p-8 h-full flex flex-col justify-between border-emerald-500/20 hover:border-emerald-400/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full spatial-glass-crystal text-[11px] font-semibold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-zinc-400 leading-relaxed font-medium text-sm sm:text-base mb-8">
                    {item.content}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.08]">
                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors group"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </SpatialGlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
