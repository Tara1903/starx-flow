"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  UserCheck, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  MessageSquare,
  Sparkles
} from "lucide-react";

export function DualSegmentValue() {
  return (
    <section className="py-20 px-6 relative z-10 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
            <Sparkles size={12} className="text-emerald-400" />
            Purpose-Built For Your Scale
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Engineered for <span className="text-emerald-400">Solo Operators</span> and <span className="text-white">Growing Practices</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400">
            Whether you operate a solo clinic chair or coordinate a multi-staff wellness center, StarX-Flow provides the exact operational infrastructure you need without commission markups.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Small Business Segment Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Small Businesses & Solo Practices</h3>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Dentists, Salons, Coaches, Solo Therapists</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                Eliminate missed appointments when you are busy treating clients. StarX-Flow acts as your full-time digital front desk with zero setup complexity.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">5-Minute Plug-and-Play Setup:</span>
                    <span className="text-sm text-zinc-400 ml-1">Connect your Google Calendar, paste your services and FAQs, and go live instantly.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">0% Booking Commission:</span>
                    <span className="text-sm text-zinc-400 ml-1">Flat subscription pricing. You keep 100% of your service revenue with zero per-booking penalties.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Direct Chat Booking:</span>
                    <span className="text-sm text-zinc-400 ml-1">Clients book in seconds on WhatsApp and Instagram without downloading specialized marketplace apps.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">24/7 After-Hours Coverage:</span>
                    <span className="text-sm text-zinc-400 ml-1">Never lose an evening or weekend lead. AI captures and confirms slots while your front office is closed.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-medium">Starter plan from €29/mo • 14-day free trial</span>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                Start Free Trial
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Medium Business Segment Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Multi-Provider & Growing Groups</h3>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Clinics, Studios, Multi-Location Practices</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-8">
                Coordinate complex team schedules, manage room resources, and maintain enterprise data privacy with deterministic concurrency safeguards.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Zero Double-Booking Guarantee:</span>
                    <span className="text-sm text-zinc-400 ml-1">Database-level PostgreSQL exclusion constraints serialize simultaneous booking requests.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">PostgreSQL Row-Level Security:</span>
                    <span className="text-sm text-zinc-400 ml-1">Cryptographically isolated multi-tenant architecture on Supabase with GDPR export endpoints.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Multi-Staff Roster Synchronization:</span>
                    <span className="text-sm text-zinc-400 ml-1">Real-time two-way synchronization with Google Calendar and Microsoft Outlook across all team members.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white">Deterministic Human Escalation:</span>
                    <span className="text-sm text-zinc-400 ml-1">Intent triggers instantly flag high-priority inquiries and notify human desk staff with full conversation telemetry.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-medium">Pro plan from €97/mo • Enterprise RLS security</span>
              <Link
                href="/security"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
              >
                Inspect Architecture
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
