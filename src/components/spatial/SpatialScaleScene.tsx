"use client";

import React from "react";
import { UserCheck, Building2, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { SpatialScrollScene } from "./SpatialScrollScene";
import { SpatialSectionHeader } from "./SpatialSectionHeader";
import { SpatialGlassCard } from "./SpatialGlassCard";
import { useUIStore } from "@/store/uiStore";

export function SpatialScaleScene() {
  const { openSignup } = useUIStore();

  return (
    <SpatialScrollScene
      id="scale"
      sceneNumber="06"
      ambientBeam="top"
      className="border-t border-white/5"
    >
      <SpatialSectionHeader
        badge="SCENE 06 // PURPOSE-BUILT FOR YOUR SCALE"
        badgeIcon={<Sparkles size={13} className="text-emerald-400" />}
        titlePrefix="Architected for"
        titleHighlight="solo operators"
        titleSuffix="and growing practices."
        subtitle="Whether you operate a single treatment chair or manage a 10-practitioner wellness clinic, StarX Flow adapts with predictable flat pricing."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* SEGMENT 1: Solo Operators & Boutique Practices */}
        <SpatialGlassCard
          variant="primary"
          hoverTilt={true}
          glow={true}
          className="p-8 sm:p-10 rounded-3xl border border-emerald-500/25 flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Solo Practitioners &amp; Small Practices
                </h3>
                <p className="text-xs text-emerald-300 font-mono uppercase tracking-wider">
                  Dentists, Solo Therapists, Coaches, Estheticians
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
              When you are in the treatment room, your front desk doesn't go dark. Your AI receptionist answers questions, checks your Google Calendar, books slots, and sends intake waivers automatically.
            </p>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
              {[
                "Under 10-minute setup with zero coding",
                "Reclaim 15+ hours of weekly admin time",
                "Starts at just $29/mo flat — no booking commissions",
                "Two-way Google Calendar & Outlook synchronization",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openSignup}
            className="w-full py-3 px-4 rounded-xl spatial-glass-crystal hover:bg-emerald-500/20 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-emerald-500/30 transition-all group"
          >
            <span>Start Solo Operator Trial</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </SpatialGlassCard>

        {/* SEGMENT 2: Growing Practices & Multi-Provider Centers */}
        <SpatialGlassCard
          variant="secondary"
          hoverTilt={true}
          glow={true}
          className="p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-emerald-500/30 flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Multi-Staff Clinics &amp; Centers
                </h3>
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                  Dental Clinics, Medical Spas, Multi-Coach Gyms
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
              Coordinate complex staff rosters across multiple treatment rooms. Route inquiries by practitioner specialty, balance booking loads, and sync with Square &amp; Clover POS.
            </p>

            <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
              {[
                "Multi-practitioner calendar routing & room allocation",
                "Square & Clover POS synchronization",
                "Google Review Booster lifting clinic local search rank",
                "Predictable flat rates ($59 - $99/mo) with zero commission take",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openSignup}
            className="w-full py-3 px-4 rounded-xl spatial-glass-secondary hover:bg-white/[0.08] text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/10 transition-all group"
          >
            <span>Explore Multi-Provider Plans</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </SpatialGlassCard>

      </div>
    </SpatialScrollScene>
  );
}
