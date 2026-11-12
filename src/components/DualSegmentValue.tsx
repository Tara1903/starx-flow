"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Lock,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { ScrollReveal } from "./ui/ScrollReveal";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";

export function DualSegmentValue() {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <section className="py-20 lg:py-28 px-6 relative z-10 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal
          direction="up"
          className="text-center max-w-3xl mx-auto mb-14 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-4">
            <Sparkles size={12} className="text-emerald-400" />
            Purpose-Built For Your Scale
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
            Engineered for{" "}
            <span className="text-gradient-green">Solo Operators</span> and{" "}
            <span className="text-white">Growing Practices</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400">
            Whether you operate a solo clinic chair or coordinate a multi-staff
            wellness center, StarX Flow provides the exact operational
            infrastructure you need without commission markups.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Small Business Segment Card */}
          <ScrollReveal direction="left">
            <GlassCard
              variant="obsidian"
              hover
              className="p-8 md:p-10 h-full flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Small Businesses &amp; Solo Practices
                    </h3>
                    <p className="text-xs text-emerald-300/80 uppercase tracking-wider font-semibold">
                      Dentists, Salons, Coaches, Solo Therapists
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                  Eliminate missed appointments when you are busy treating
                  clients. StarX Flow acts as your full-time digital front desk
                  with streamlined calendar synchronization.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        5-Minute Core Setup:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Connect your Google Calendar or Outlook, configure your
                        services and FAQs, and test your AI receptionist in
                        seconds.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        0% Booking Commission:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Flat subscription pricing. You keep 100% of your service
                        revenue with zero per-booking deductions.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Direct Chat Booking:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Clients book in seconds on WhatsApp, Instagram, or Web
                        without downloading specialized marketplace apps.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        24/7 After-Hours Coverage:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Never lose an evening or weekend lead. AI captures and
                        confirms slots while your front office is closed.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-zinc-400 font-medium">
                  Starter plan from €29/mo • 14-day free trial
                </span>
                <GlassButton
                  size="sm"
                  variant="primary"
                  onClick={openSignup}
                  className="w-full sm:w-auto"
                >
                  Start Free Trial
                  <ArrowRight size={14} />
                </GlassButton>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Multi-Provider Segment Card */}
          <ScrollReveal direction="right">
            <GlassCard
              variant="obsidian"
              hover
              className="p-8 md:p-10 h-full flex flex-col justify-between border-teal-500/20"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Multi-Provider &amp; Growing Groups
                    </h3>
                    <p className="text-xs text-teal-300/80 uppercase tracking-wider font-semibold">
                      Clinics, Studios, Multi-Location Practices
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                  Coordinate team schedules, manage buffer times, and maintain
                  enterprise data privacy with deterministic database
                  concurrency safeguards.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Zero Double-Booking Guarantee:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Database-level PostgreSQL exclusion constraints
                        serialize simultaneous booking requests.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        PostgreSQL Row-Level Security:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Cryptographically isolated multi-tenant architecture on
                        Supabase with automated GDPR export endpoints.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Two-Way Calendar Synchronization:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Real-time webhook integration with Google Calendar and
                        Microsoft Outlook for synchronized provider
                        availability.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Deterministic Human Escalation:
                      </span>
                      <span className="text-sm text-zinc-400 ml-1">
                        Intent triggers instantly flag high-priority inquiries
                        and notify human desk staff with full conversation
                        telemetry.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-zinc-400 font-medium">
                  Pro plan from €97/mo • Enterprise RLS security
                </span>
                <Link
                  href="/security"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-emerald-500/15 text-white hover:text-emerald-300 font-semibold text-xs uppercase tracking-wider transition-all border border-white/15 hover:border-emerald-500/35"
                >
                  Inspect Architecture
                  <ArrowRight size={14} />
                </Link>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
