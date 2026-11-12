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
import { GlassCard } from "./ui/GlassCard";

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
        "StarX Flow charges a flat monthly software subscription (€29 to €97/mo) with no per-booking fees or hidden percentages. When your clinic, gym, or salon grows, your software bill remains flat and predictable.",
      actionLabel: "View Transparent Pricing",
      actionHref: "/pricing",
      margin: "lg:mt-12",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 overflow-hidden border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal
          direction="up"
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-4">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Platform Guarantees
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-5 text-white leading-tight">
            Engineered for trust.{" "}
            <span className="block text-gradient-green">
              Built for operational independence.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Independent service businesses depend on precision booking and
            client trust. Here are the core technical guarantees built into
            StarX Flow.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {commitments.map((c, i) => (
            <ScrollReveal key={c.title} direction="up" delay={i * 0.1}>
              <GlassCard
                variant="obsidian"
                hover
                className={`p-8 h-full flex flex-col justify-between ${c.margin}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/12 rounded-2xl flex items-center justify-center border border-emerald-500/25">
                      {c.icon}
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/25">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {c.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-8">
                    {c.content}
                  </p>
                </div>

                <div className="border-t border-white/[0.08] pt-5 mt-auto">
                  <Link
                    href={c.actionHref}
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors group"
                  >
                    {c.actionLabel}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
