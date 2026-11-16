"use client";

import React from "react";
import { MessageSquare, CalendarCheck, Zap, TrendingUp, ShieldCheck, Clock } from "lucide-react";

export function LusionBrandStatement() {
  const metrics = [
    {
      value: "< 2s",
      label: "Instant Reply Speed",
      description: "Replies to every WhatsApp and web enquiry in real-time, capturing late-night appointments while you sleep.",
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "78%",
      label: "No-Show Reduction",
      description: "Automated 24h & 2h WhatsApp reminders with 1-tap confirmation keep daily rosters consistently full.",
      icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "0%",
      label: "Platform Cut or Commission",
      description: "Direct Stripe integration means 100% of your service fees and deposits deposit straight to your bank.",
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
    },
    {
      value: "100%",
      label: "Direct Client Ownership",
      description: "Every chat transcript, intake record, and client history remains completely private to your business.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section
      id="brand-statement"
      className="relative py-24 sm:py-32 border-t border-emerald-500/10"
    >
      {/* Living Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Editorial Section Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-px bg-emerald-400" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
            The Philosophy of Frictionless Growth
          </span>
        </div>

        {/* Large Editorial Brand Manifesto */}
        <div className="max-w-4xl space-y-6">
          <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.12] text-white tracking-tight">
            Appointment-based businesses don’t lose clients to competitors.{" "}
            <span className="text-gradient-emerald font-normal">
              They lose them to delayed replies and fragmented tools.
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-emerald-100/70 font-normal leading-relaxed max-w-3xl">
            When a prospective client sends a message at 9:00 PM, a 2-hour delay is the difference between a confirmed booking and a lost customer. StarX Flow unifies messaging, scheduling, and customer data into a single continuous intelligence layer that operates 24/7.
          </p>
        </div>

        {/* 4 Pillars Grid with Emerald Rim Lighting */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="starx-glass-panel p-6 sm:p-8 flex flex-col justify-between group hover:border-emerald-400/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {m.icon}
                </div>
                <div className="font-lusion-display text-4xl sm:text-5xl font-light text-white tracking-tight text-gradient-gold-emerald">
                  {m.value}
                </div>
                <h3 className="text-base font-semibold text-white mt-2 mb-2">
                  {m.label}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/65 leading-relaxed">
                  {m.description}
                </p>
              </div>
              <div className="w-full h-px bg-emerald-500/10 mt-6 group-hover:bg-emerald-500/30 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
