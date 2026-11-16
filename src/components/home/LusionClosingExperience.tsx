"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, CalendarCheck, Zap, Database, Lock, CheckCircle2, Sparkles } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

export function LusionClosingExperience() {
  const router = useRouter();
  const { openSignup } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  const guarantees = [
    {
      title: "Zero Double-Booking Guarantee",
      subtitle: "Concurrency Locked",
      desc: "Real-time two-way synchronization with Google Calendar and Outlook, backed by database-level exclusion constraint locking to mathematically prevent overlapping slot bookings.",
      icon: <CalendarCheck className="w-5 h-5 text-emerald-400" />,
      link: "/how-it-works",
      linkLabel: "View Calendar Engine →",
    },
    {
      title: "100% Direct Client Ownership",
      subtitle: "Zero Marketplace Lock-in",
      desc: "Unlike booking directories that pool your clients into public aggregators and cross-sell competitors, StarX Flow stores your contacts and conversations in your private tenant database with Row Level Security.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      link: "/security",
      linkLabel: "View Security Architecture →",
    },
    {
      title: "Predictable Flat-Rate Pricing",
      subtitle: "0% Commission Deductions",
      desc: "StarX Flow charges a flat monthly software subscription ($29 to $99/mo) with no per-booking fees or hidden percentages. When your clinic, gym, or salon grows, your software bill remains flat.",
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      link: "/pricing",
      linkLabel: "View Transparent Plans →",
    },
  ];

  const integrations = [
    "Meta WhatsApp Cloud API",
    "Google Calendar API",
    "Microsoft Graph Calendar",
    "Apple iCloud Calendar",
    "Stripe Connect",
    "Polar Billing",
  ];

  return (
    <div id="scene-final-cta-footer" className="relative border-t border-emerald-500/10">
      {/* ======================================================= */}
      {/* SCENE 7: SOCIAL PROOF & PLATFORM GUARANTEES             */}
      {/* ======================================================= */}
      <section className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="max-w-3xl space-y-4 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
                Architectural Integrity & Trust
              </span>
            </div>
            <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Engineered with Enterprise Principles. <br />
              <span className="text-gradient-emerald font-normal">
                Dedicated to Independent Operators.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
              We believe appointment-based businesses deserve software that respects their client relationships, protects their revenue, and guarantees data independence.
            </p>
          </div>

          {/* 3 Guarantees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {guarantees.map((g, idx) => (
              <div
                key={idx}
                className="starx-glass-panel p-8 flex flex-col justify-between group hover:border-emerald-400/40 transition-all duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-6 group-hover:scale-110 transition-transform">
                    {g.icon}
                  </div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    {g.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-3">
                    {g.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
                    {g.desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-emerald-500/10 mt-6">
                  <Link
                    href={g.link}
                    className="text-xs font-mono text-emerald-300 group-hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{g.linkLabel}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Verified Integrations Bar */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/15 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-300/80">
              Verified Platform Integrations:
            </span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-emerald-100/75">
              {integrations.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* SCENE 9: CLOSING EXPERIENCE & EMERALD BEACON             */}
      {/* ======================================================= */}
      <section className="py-24 sm:py-36 relative overflow-hidden border-t border-emerald-500/10">
        {/* Massive Radiant Emerald Focal Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[180px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
          {/* Distinctive Emerald Spatial Singularity Icon */}
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] rotate-45 animate-pulse">
              <Sparkles className="w-10 h-10 text-emerald-200 -rotate-45" />
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-emerald-400/15 blur-lg pointer-events-none" />
          </div>

          {/* Monumental Closing Statement */}
          <h2 className="font-lusion-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]">
            Ready to Automate Your Operations <br />
            <span className="text-gradient-emerald font-normal">
              with Intelligent Precision?
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-emerald-100/75 max-w-2xl mx-auto font-normal leading-relaxed">
            Join hundreds of forward-thinking clinics, wellness spas, and appointment businesses running their autonomous front desk on StarX Flow.
          </p>

          {/* Prominent Conversion CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="btn-closing-signup"
              type="button"
              onClick={() => {
                if (isLoggedIn) router.push("/dashboard");
                else openSignup();
              }}
              className="starx-btn-primary gap-3 text-base !py-4 !px-8 shadow-[0_0_40px_rgba(52,211,153,0.4)]"
            >
              <span>{isLoggedIn ? "Access Dashboard" : "Start 14-Day Free Trial"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              href="/demo"
              className="starx-btn-secondary gap-2 text-base !py-4 !px-7"
            >
              <span>Request Guided Demo</span>
            </Link>
          </div>

          <div className="pt-2 text-xs font-mono text-emerald-200/50">
            No credit card required • Connects in 3 minutes • Dedicated onboarding support
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* ARCHITECTURAL FOOTER                                    */}
      {/* ======================================================= */}
      <footer className="border-t border-emerald-500/15 bg-[#020805] text-white pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-500/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">
                StarX <span className="font-light text-emerald-400">Flow</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/60 max-w-sm leading-relaxed">
              The autonomous operating system for appointment-based businesses. Seamless 24/7 WhatsApp AI communication, two-way multi-staff calendar sync, and direct client CRM.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.98% Uptime)</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-300">
              Product & Flow
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/70">
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#connected-environment" className="hover:text-white transition-colors">
                  Connected Ecosystem
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Transparent Pricing
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-300">
              Industries
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/70">
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Medical & Health Clinics
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Fitness & Gym Studios
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Hair & Beauty Salons
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Day Spas & Wellness
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Executive Coaching
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-300">
              Trust & Legal
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About StarX Flow
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Resources & Guides
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/50 gap-4">
          <div>
            © {new Date().getFullYear()} StarX Flow Inc. All rights reserved. Built for high-volume appointment businesses.
          </div>
          <div className="font-mono text-[11px] text-emerald-400/80">
            San Francisco, CA • Global WhatsApp Network
          </div>
        </div>
      </footer>
    </div>
  );
}
