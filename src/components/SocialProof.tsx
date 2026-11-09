"use client";
import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, CalendarCheck, Database, Zap } from "lucide-react";

export function SocialProof() {
  const verifiedIntegrations = [
    "Meta WhatsApp Cloud API",
    "Google Calendar API",
    "Microsoft Graph Calendar",
    "Instagram Graph API",
    "Stripe Hosted Checkout",
    "Supabase Row Level Security",
  ];

  const architecturalPillars = [
    { label: "0% Booking Commission", icon: <Zap size={14} className="text-emerald-400" /> },
    { label: "Concurrency Exclusion Locks", icon: <CalendarCheck size={14} className="text-emerald-400" /> },
    { label: "100% Direct Client Ownership", icon: <Database size={14} className="text-emerald-400" /> },
    { label: "TLS 1.3 & At-Rest Encryption", icon: <ShieldCheck size={14} className="text-emerald-400" /> },
  ];

  return (
    <section className="py-16 relative z-20 overflow-hidden border-y border-white/5 surface-primary">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center relative z-10">
        <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
          Engineered for Independent Service & Appointment Businesses
        </p>
      </div>

      {/* Verified Integration Marquee */}
      <div className="relative flex overflow-hidden group mb-14">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div className="sr-only">
          Verified platform integrations include Meta WhatsApp Cloud API, Google Calendar, Microsoft Graph Calendar, Instagram Graph API, Stripe, and Supabase.
        </div>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          aria-hidden="true"
          transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap gap-16 items-center px-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {verifiedIntegrations.map((item, idx) => (
                <span
                  key={idx}
                  className="text-lg md:text-xl tracking-wider text-zinc-300 font-bold uppercase flex items-center gap-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  {item}
                </span>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Architectural Guarantee Strip */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-wrap justify-center gap-3 md:gap-5">
          {architecturalPillars.map((pillar, i) => (
            <div
              key={i}
              className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
            >
              {pillar.icon}
              <span className="text-xs md:text-sm font-semibold text-zinc-300 tracking-wide">
                {pillar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
