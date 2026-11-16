"use client";

import React, { useEffect, useState } from "react";
import { StarXCoreCanvas } from "../spatial/StarXCoreCanvas";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function LusionHeroScene() {
  const router = useRouter();
  const { openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const [stage, setStage] = useState<number>(0);

  // Scene 0: Cinematic entrance sequence
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);  // Atmosphere & 3D Core
    const t2 = setTimeout(() => setStage(2), 350);  // Headline reveal
    const t3 = setTimeout(() => setStage(3), 600);  // Supporting text & CTAs
    const t4 = setTimeout(() => setStage(4), 850);  // Floating cards & Scroll invitation

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handlePrimaryCTA = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      openSignup();
    }
  };

  const handleExploreScroll = () => {
    const el = document.getElementById("brand-statement");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-28 pb-12 overflow-hidden"
    >
      {/* Background Living Ambient Glow */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none transition-opacity duration-1000 ${
          stage >= 1 ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto relative z-10">
        {/* Left Column: Monumental Editorial Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 pt-4 lg:pt-0">
          {/* Eyebrow Label */}
          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              stage >= 1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>The Autonomous Front Desk</span>
            </div>
          </div>

          {/* Expressive Editorial Headline */}
          <h1
            className={`font-lusion-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] leading-[0.98] tracking-tight text-white transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              stage >= 2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Run Your Business <br />
            <span className="text-gradient-emerald font-normal">on One Flow.</span>
          </h1>

          {/* Concise Product Statement */}
          <p
            className={`text-base sm:text-lg md:text-xl text-emerald-100/75 max-w-xl font-normal leading-relaxed transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              stage >= 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            AI-powered WhatsApp communication, smart multi-staff scheduling, and direct client CRM — synchronized into one continuous intelligent ecosystem.
          </p>

          {/* Primary Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              stage >= 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <button
              id="btn-hero-primary"
              type="button"
              onClick={handlePrimaryCTA}
              className="starx-btn-primary gap-3 text-base shadow-[0_0_30px_rgba(52,211,153,0.35)]"
            >
              <span>{isLoggedIn ? "Open Your Workspace" : "Start 14-Day Free Trial"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="btn-hero-secondary"
              type="button"
              onClick={handleExploreScroll}
              className="starx-btn-secondary gap-2 text-base"
            >
              <span>Explore Capabilities</span>
              <ChevronDown className="w-4 h-4 text-emerald-300" />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div
            className={`pt-3 flex flex-wrap items-center gap-6 text-xs text-emerald-200/60 font-mono transition-all duration-1000 ${
              stage >= 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Setup Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Stripe Capture (0% Cuts)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connects in 3 Minutes</span>
            </div>
          </div>
        </div>

        {/* Right Column: Monumental 3D StarX Spatial Core */}
        <div
          className={`lg:col-span-5 h-[420px] sm:h-[480px] lg:h-[560px] relative flex items-center justify-center transition-all duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            stage >= 1
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-12"
          }`}
        >
          {/* Real-Time Three.js Canvas Container */}
          <div className="w-full h-full relative z-10">
            <StarXCoreCanvas />
          </div>

          {/* Floating Live Operational Card (Demonstrates Instant Sync) */}
          <div
            className={`absolute bottom-4 -left-4 sm:left-4 z-20 starx-glass-panel p-4 max-w-xs animate-float-gentle transition-all duration-1000 ${
              stage >= 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Live Booking Confirmed</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                    1.4s
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/70">
                  Sarah K. • Deep Tissue • Tue 2:00 PM
                </p>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synced to Google Calendar & CRM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Invitation */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center transition-all duration-1000 ${
          stage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <button
          type="button"
          onClick={handleExploreScroll}
          className="group flex flex-col items-center gap-2 text-emerald-200/50 hover:text-emerald-300 transition-colors cursor-pointer"
          aria-label="Scroll to explore features"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.25em]">
            Scroll to Enter Journey
          </span>
          <div className="w-5 h-8 rounded-full border border-emerald-500/30 flex items-start justify-center p-1 group-hover:border-emerald-400 transition-colors">
            <div className="w-1.5 h-2 rounded-full bg-emerald-400 animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
