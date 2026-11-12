"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { ScrollReveal } from "./ui/ScrollReveal";
import { GlassButton } from "./ui/GlassButton";

export function CTA() {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <section className="py-24 lg:py-36 px-6 relative z-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[900px] h-[440px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <ScrollReveal direction="scale">
          <div
            data-cursor-spotlight="true"
            className="glass-card-obsidian rounded-[2.5rem] p-10 sm:p-14 md:p-20 border border-emerald-500/25 shadow-[0_30px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(16,185,129,0.12)] flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-8">
              <Sparkles size={14} className="text-emerald-400" />
              Ready To Automate
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.06]">
              Stop losing clients to{" "}
              <span className="block text-gradient-green">
                unanswered calls.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-zinc-300 mb-10 font-medium tracking-tight leading-relaxed max-w-2xl">
              Deploy your AI receptionist in minutes and capture every lead,
              booking, and follow-up 24/7.
            </p>

            <GlassButton
              size="lg"
              variant="primary"
              magnetic
              magneticStrength="high"
              onClick={openSignup}
              className="px-9 py-4 text-base sm:text-lg group"
            >
              Claim Your Free AI Receptionist
              <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
            </GlassButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
