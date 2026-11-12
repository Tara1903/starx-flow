"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, CalendarCheck, Database, Zap } from "lucide-react";
import { useInViewport, useIsDocumentVisible } from "../hooks/useMotionVisibility";
import { MOTION_EASE, VIEWPORT_CONFIG } from "../lib/motionVariants";

export function SocialProof() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inViewport = useInViewport(sectionRef, "120px", true);
  const isDocVisible = useIsDocumentVisible();
  const shouldScroll = !prefersReduced && inViewport && isDocVisible;

  const verifiedIntegrations = [
    "Meta WhatsApp Cloud API",
    "Google Calendar API",
    "Microsoft Graph Calendar",
    "Instagram Graph API",
    "Polar Hosted Billing",
    "Supabase Row Level Security",
  ];

  const architecturalPillars = [
    {
      label: "0% Booking Commission",
      icon: <Zap size={14} className="text-emerald-400" />,
    },
    {
      label: "Concurrency Exclusion Locks",
      icon: <CalendarCheck size={14} className="text-emerald-400" />,
    },
    {
      label: "100% Direct Client Ownership",
      icon: <Database size={14} className="text-emerald-400" />,
    },
    {
      label: "TLS 1.3 & At-Rest Encryption",
      icon: <ShieldCheck size={14} className="text-emerald-400" />,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 relative z-20 overflow-hidden border-y border-white/5 surface-primary"
    >
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center relative z-10">
        <p className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Engineered for Independent Service &amp; Appointment Businesses
        </p>
      </div>

      {/* Verified Integration Marquee */}
      <div className="relative flex overflow-hidden group mb-12">
        <div className="absolute top-0 left-0 w-24 sm:w-36 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 sm:w-36 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div className="sr-only">
          Verified platform integrations include Meta WhatsApp Cloud API, Google
          Calendar, Microsoft Graph Calendar, Instagram Graph API, Polar
          billing, and Supabase.
        </div>

        <motion.div
          animate={shouldScroll ? { x: ["0%", "-50%"] } : { x: "0%" }}
          aria-hidden="true"
          transition={
            shouldScroll
              ? { duration: 34, ease: "linear", repeat: Infinity }
              : { duration: 0.01 }
          }
          className="flex whitespace-nowrap gap-14 items-center px-8 opacity-65 hover:opacity-100 transition-opacity duration-500"
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {verifiedIntegrations.map((item, idx) => (
                <span
                  key={idx}
                  className="text-base sm:text-lg tracking-wider text-zinc-300 font-semibold uppercase flex items-center gap-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  {item}
                </span>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Architectural Guarantee Strip */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_CONFIG}
          transition={{ duration: 0.42, ease: MOTION_EASE.premium }}
          className="flex flex-wrap justify-center gap-3"
        >
          {architecturalPillars.map((pillar, i) => (
            <div
              key={i}
              className="glass-card-obsidian px-4 py-2 rounded-full flex items-center gap-2.5 border border-emerald-500/20 hover:border-emerald-400/45 transition-colors"
            >
              {pillar.icon}
              <span className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide">
                {pillar.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
