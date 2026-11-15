"use client";

import React from "react";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialGlassCard } from "./SpatialGlassCard";
import { GlassButton } from "../ui/GlassButton";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

export function SpatialConversionScene() {
  const { openSignup, openDemo } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  return (
    <SpatialScrollScene
      id="conversion"
      sceneNumber="10"
      ambientBeam="bottom"
      className="border-t border-white/5 pb-24 sm:pb-32"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10 spatial-content-protected">
        
        {/* Architectural Portal Glass Console */}
        <SpatialGlassCard
          variant="primary"
          hoverTilt={true}
          glow={true}
          className="rounded-[2.5rem] p-8 sm:p-14 md:p-20 border border-emerald-500/35 shadow-[0_32px_120px_rgba(0,0,0,0.95),0_0_80px_rgba(16,185,129,0.22)] flex flex-col items-center relative overflow-hidden"
        >
          {/* Internal Radiance Core */}
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)] blur-2xl pointer-events-none"
          />

          {/* Telemetry Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full spatial-glass-crystal text-xs font-semibold tracking-widest text-emerald-300 uppercase mb-8 shadow-[0_0_24px_rgba(16,185,129,0.25)] border border-emerald-500/30">
            <Sparkles size={13} className="text-emerald-400" />
            <span>SCENE 10 // THE HORIZON GATEWAY</span>
          </div>

          {/* Display Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-2xl">
            Stop losing appointments to{" "}
            <span className="text-gradient-green">unanswered calls.</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed max-w-2xl font-normal">
            Deploy your 24/7 autonomous receptionist in minutes. Capture every lead, eliminate no-shows, and sync staff calendars on autopilot.
          </p>

          {/* Action Console */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
            <GlassButton
              size="lg"
              variant="primary"
              magnetic
              magneticStrength="high"
              onClick={isLoggedIn ? () => (window.location.href = "/dashboard") : openSignup}
              className="w-full sm:w-auto px-9 py-4 text-base font-bold shadow-[0_0_40px_rgba(16,185,129,0.4)] group"
            >
              <span>{isLoggedIn ? "Enter Your Dashboard" : "Claim Your Free AI Receptionist"}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </GlassButton>

            {!isLoggedIn && (
              <GlassButton
                size="lg"
                variant="secondary"
                magnetic
                magneticStrength="low"
                onClick={openDemo}
                className="w-full sm:w-auto px-8 py-4 text-base"
              >
                <span>Schedule Walkthrough</span>
              </GlassButton>
            )}
          </div>

          {/* Assurances Checklist */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-zinc-300">
            {[
              "10-Minute Instant Setup",
              "14-Day Free Evaluation",
              "Zero Booking Fees",
              "Cancel Anytime",
            ].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </SpatialGlassCard>

      </div>
    </SpatialScrollScene>
  );
}
