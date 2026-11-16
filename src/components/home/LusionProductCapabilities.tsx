"use client";

import React, { useState } from "react";
import { MessageSquare, Calendar, Users, Shield, Zap, Star, ArrowRight, Check, X, Bell, FileText, CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

interface Capability {
  id: string;
  tag: string;
  title: string;
  headline: string;
  description: string;
  points: string[];
  interfaceType: "whatsapp" | "calendar" | "crm" | "reviews";
  stat: string;
  statLabel: string;
}

export function LusionProductCapabilities() {
  const { openSignup } = useUIStore();
  const [activeTab, setActiveTab] = useState<string>("whatsapp");
  const [modalCap, setModalCap] = useState<Capability | null>(null);

  const capabilities: Capability[] = [
    {
      id: "whatsapp",
      tag: "CONVERSATIONAL BOOKINGS",
      title: "24/7 WhatsApp Bookings",
      headline: "Turn Enquiries into Confirmed Appointments Inside the Chat",
      description: "Clients never leave WhatsApp to open a clunky third-party website or download an app. StarX Flow guides them through treatment selection, specialist preference, and slot booking in natural language.",
      points: [
        "Instant reply in < 2 seconds, day or night",
        "Direct integration with WhatsApp Business API",
        "Enforces appointment buffers and specialist schedules",
        "Automated calendar invitations sent immediately"
      ],
      interfaceType: "whatsapp",
      stat: "< 2s",
      statLabel: "Average Automated Response Time"
    },
    {
      id: "calendar",
      tag: "TWO-WAY SYNCHRONIZATION",
      title: "Multi-Staff Calendar Sync",
      headline: "Zero Double-Bookings Across All Team Members & Platforms",
      description: "Two-way real-time calendar synchronization across Google Calendar, Apple iCloud, and Microsoft Outlook. When a doctor, trainer, or stylist blocks personal time, StarX Flow adjusts availability instantly.",
      points: [
        "Real-time locking prevents concurrent bookings",
        "Individual staff working hours, breaks, and vacations",
        "Supports multi-location business operations",
        "Instant rescheduling and slot release logic"
      ],
      interfaceType: "calendar",
      stat: "100%",
      statLabel: "Conflict-Free Booking Guarantee"
    },
    {
      id: "crm",
      tag: "CUSTOMER DATA OWNERSHIP",
      title: "Unified Service CRM & History",
      headline: "Complete Client Audit Trail Under Your Direct Ownership",
      description: "Every WhatsApp conversation, booking record, treatment note, and intake waiver is tied to a single client profile. You own 100% of your data—never trapped in an extractive marketplace.",
      points: [
        "Complete chronological interaction ledger",
        "Intake forms & medical/health waivers attached to profile",
        "Direct Stripe billing history and lifetime value calculation",
        "Zero marketplace platform fees or client poaching"
      ],
      interfaceType: "crm",
      stat: "0%",
      statLabel: "Platform Commission Fees"
    },
    {
      id: "reviews",
      tag: "AUTOMATED REPUTATION",
      title: "Google Review & Retention Engine",
      headline: "Automatically Collect 5-Star Reviews from Happy Clients",
      description: "One hour after a successful appointment, StarX Flow sends a warm WhatsApp follow-up asking for feedback. Delighted clients receive a direct 1-tap Google Review link, boosting your local search ranking.",
      points: [
        "Timed dispatch ensures high review completion",
        "Smart routing: intercepts unhappy clients before public review",
        "Drives local Google Maps pack placement",
        "Boosts recurring client re-booking by 35%"
      ],
      interfaceType: "reviews",
      stat: "+42%",
      statLabel: "Average Increase in Google Reviews"
    }
  ];

  const current = capabilities.find(c => c.id === activeTab) || capabilities[0];

  return (
    <section id="capabilities" className="relative py-24 sm:py-32 border-t border-emerald-500/10">
      {/* Living Atmospheric Glow */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-14">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
              Core Verified Capabilities
            </span>
          </div>
          <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Engineered for Precision. <br />
            <span className="text-gradient-emerald font-normal">
              Built for Seamless Operations.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
            Explore the verified capabilities that make StarX Flow the operating system for premium clinics, wellness centers, and high-volume appointment businesses.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-emerald-500/10">
          {capabilities.map((cap) => {
            const isActive = activeTab === cap.id;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setActiveTab(cap.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105"
                    : "bg-emerald-950/40 text-emerald-200/80 hover:text-white hover:bg-emerald-900/40 border border-emerald-500/20"
                }`}
              >
                {cap.title}
              </button>
            );
          })}
        </div>

        {/* Featured Capability Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center starx-glass-panel p-8 sm:p-12 relative overflow-hidden">
          {/* Left: Capability Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 uppercase">
              {current.tag}
            </div>
            <h3 className="font-lusion-display text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight leading-snug">
              {current.headline}
            </h3>
            <p className="text-sm sm:text-base text-emerald-100/75 leading-relaxed">
              {current.description}
            </p>

            <ul className="space-y-3 pt-2">
              {current.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-emerald-100/90">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-300" />
                  </div>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => openSignup()}
                className="starx-btn-primary text-xs sm:text-sm !py-2.5 !px-5"
              >
                <span>Activate {current.title}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>

              <button
                type="button"
                onClick={() => setModalCap(current)}
                className="text-xs sm:text-sm text-emerald-300 hover:text-white underline underline-offset-4 font-mono transition-colors"
              >
                View Technical Specs →
              </button>
            </div>
          </div>

          {/* Right: Authentic Interactive Interface Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {current.interfaceType === "whatsapp" && (
              <div className="w-full max-w-sm bg-[#081710] border border-emerald-500/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                      SX
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">StarX AI Receptionist</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Online • Instant Reply</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-emerald-950/60 text-emerald-100 p-3 rounded-2xl rounded-tl-xs border border-emerald-500/20 max-w-[85%]">
                    Hi Sarah! Welcome back to Apex Wellness. What service can we book for you today?
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-100 p-3 rounded-2xl rounded-tr-xs border border-emerald-400/30 max-w-[85%] ml-auto text-right">
                    Do you have openings for a 60min Deep Tissue massage tomorrow afternoon?
                  </div>
                  <div className="bg-emerald-950/60 text-emerald-100 p-3 rounded-2xl rounded-tl-xs border border-emerald-500/20 max-w-[85%]">
                    Yes! Marcus Vance has priority openings at <strong>2:00 PM</strong> and <strong>4:30 PM</strong>.
                    <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-400 text-black font-semibold text-[10px]">
                        ✓ Book 2:00 PM
                      </span>
                      <span className="px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        4:30 PM
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono text-emerald-400/70 text-center">
                  Verified WhatsApp Business API Stream • 1.4s response
                </div>
              </div>
            )}

            {current.interfaceType === "calendar" && (
              <div className="w-full max-w-sm bg-[#081710] border border-emerald-500/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="text-xs font-semibold text-white">Provider Availability Sync</div>
                  <span className="text-[10px] font-mono text-emerald-400">4 Providers Connected</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/25 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Dr. Marcus Vance</div>
                      <div className="text-[10px] text-emerald-300">Chiropractic & Wellness</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                      Synced (Google)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/25 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Elena Rostova</div>
                      <div className="text-[10px] text-emerald-300">Acupuncture Therapy</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                      Synced (Outlook)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/25 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">David Chen</div>
                      <div className="text-[10px] text-emerald-300">Physical Therapy</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                      Synced (iCloud)
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] font-mono text-emerald-400/70 text-center">
                  Live 2-Way Lock Active • Zero Overlaps
                </div>
              </div>
            )}

            {current.interfaceType === "crm" && (
              <div className="w-full max-w-sm bg-[#081710] border border-emerald-500/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                      SK
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Sarah Jenkins</div>
                      <div className="text-[10px] text-emerald-300 font-mono">Client ID #SX-8842</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                    VIP Client
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/10">
                    <div className="text-[9px] text-emerald-300/60">LIFETIME VISITS</div>
                    <div className="font-semibold text-emerald-200 mt-0.5">8 Sessions</div>
                  </div>
                  <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/10">
                    <div className="text-[9px] text-emerald-300/60">LIFETIME VALUE</div>
                    <div className="font-semibold text-emerald-200 mt-0.5">$1,160.00</div>
                  </div>
                </div>
                <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-100/75">
                  <strong>Specialist Notes:</strong> Focus on upper thoracic tension. Prefers unscented massage oil. Health intake signed Nov 2026.
                </div>
                <div className="text-[10px] font-mono text-emerald-400/70 text-center">
                  Direct Ownership • HIPAA & SOC2 Compliant Ledger
                </div>
              </div>
            )}

            {current.interfaceType === "reviews" && (
              <div className="w-full max-w-sm bg-[#081710] border border-emerald-500/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="text-xs font-semibold text-white">Google Review Automation</div>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                <div className="bg-emerald-950/60 border border-emerald-500/25 p-3 rounded-2xl text-xs text-emerald-100 space-y-2">
                  <p>
                    "Hi Sarah! Thank you for visiting Apex Wellness today with Marcus. How was your treatment?"
                  </p>
                  <div className="p-2 bg-emerald-400/10 rounded-lg border border-emerald-400/30 flex items-center justify-between">
                    <span className="font-semibold text-emerald-300">★ 5.0 - Excellent</span>
                    <span className="text-[10px] text-emerald-400 underline font-mono">Leave Google Review →</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400/70 text-center">
                  Dispatched 1 Hour Post-Session • Auto Google Maps Boost
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accessible Detail Dialog for Module Specifications */}
      {modalCap && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="bg-[#06140e] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setModalCap(null)}
              aria-label="Close dialog"
              className="absolute top-5 right-5 text-emerald-300/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                MODULE SPECIFICATION
              </span>
              <h4 className="text-2xl font-semibold text-white mt-1">
                {modalCap.title}
              </h4>
              <p className="text-sm text-emerald-100/70 mt-2">
                {modalCap.description}
              </p>
            </div>

            <div className="space-y-2 border-t border-emerald-500/20 pt-4">
              <div className="text-xs font-mono uppercase text-emerald-300">Operational Verification:</div>
              {modalCap.points.map((pt, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-emerald-100/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalCap(null);
                  openSignup();
                }}
                className="w-full starx-btn-primary justify-center text-sm"
              >
                Enable in 14-Day Trial →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
