"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Calendar, Settings, Zap } from "lucide-react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { GlassCard } from "./ui/GlassCard";
import { MOTION_EASE, VIEWPORT_CONFIG } from "../lib/motionVariants";

export function HowItWorks() {
  const prefersReduced = useReducedMotion();
  const steps = [
    {
      number: "01",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      title: "Connect Your Calendars",
      desc: "Sync Google Calendar, Outlook, and your booking availability in two clicks to keep staff rosters synchronized in real-time.",
    },
    {
      number: "02",
      icon: <Settings className="w-6 h-6 text-emerald-400" />,
      title: "Configure Services",
      desc: "Input your service menus, pricing, team rosters, and common FAQs. StarX trains on your exact operational rules in minutes.",
    },
    {
      number: "03",
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Activate AI Receptionist",
      desc: "Launch your 24/7 WhatsApp & web AI receptionist. Capture incoming leads, lock appointments, and trigger automated follow-ups.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 border-y border-white/5 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <ScrollReveal
          direction="up"
          className="flex flex-col items-center text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-6">
            <Sparkles size={12} className="text-emerald-400" />
            Onboarding Setup
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-5 text-white">
            Launch in under{" "}
            <span className="text-gradient-green">10 minutes.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl font-medium leading-relaxed">
            You do not need an engineering team to automate your front desk.
            Connect your channels and go live with deterministic safeguards.
          </p>
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-500/15 via-emerald-400/45 to-emerald-500/15 pointer-events-none"
          />
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} direction="up" delay={i * 0.1}>
              <GlassCard
                variant="obsidian"
                hover
                className="p-8 h-full flex flex-col items-start text-left relative overflow-hidden"
              >
                <span
                  aria-hidden="true"
                  className="text-7xl font-bold text-white/[0.04] absolute -top-2 right-4 select-none pointer-events-none"
                >
                  {step.number}
                </span>

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(16,185,129,0.14)]">
                  {step.icon}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed font-medium text-sm sm:text-base">
                  {step.desc}
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
