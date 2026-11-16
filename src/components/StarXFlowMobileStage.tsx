"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MobileStageProps {
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  activeWorkflowTab: string;
  onSelectWorkflowTab: (tab: string) => void;
  onCycleWorkflowTab: () => void;
  activeChallengeIdx: number;
  onSelectChallenge: (idx: number) => void;
  activeOrbitalIdx: number;
  onSelectOrbitalNode: (idx: number, name?: string) => void;
  onPulseAllNodes: () => void;
  onOpenModal: (mode: string, planOrTitle?: string, customSubtitle?: string) => void;
  onOpenCapability: (idx: number) => void;
  onScrollToSection: (id: string) => void;
}

const workflowTabsData: Record<string, {
  sideTitle: string;
  sideDesc: string;
  phoneHeader: string;
  phoneStatus: string;
  incomingText: string;
  botPrompt: string;
  confirmedTitle: string;
}> = {
  whatsapp: {
    sideTitle: '24/7 WhatsApp Bookings',
    sideDesc: 'Turn enquiries into confirmed appointments automatically, anytime, day or night.',
    phoneHeader: 'Your Business',
    phoneStatus: 'Online • Instant AI',
    incomingText: 'Hi! Can I book a consultation for this week?',
    botPrompt: 'Sure! Here are verified open slots:',
    confirmedTitle: 'Booking Confirmed'
  },
  ai: {
    sideTitle: 'AI-Powered Client Triage',
    sideDesc: 'Instantly answer FAQs, qualify service needs, and recommend the right specialist.',
    phoneHeader: 'StarX AI Concierge',
    phoneStatus: 'AI Active • Instant Reply',
    incomingText: 'Do you have evening slots this week?',
    botPrompt: 'Yes! I found 3 priority openings for you:',
    confirmedTitle: 'AI Triage Complete'
  },
  scheduling: {
    sideTitle: 'Multi-Staff Calendar Sync',
    sideDesc: 'Real-time two-way sync across Google, Outlook, and rosters with zero double-bookings.',
    phoneHeader: 'Smart Scheduler',
    phoneStatus: '4 Providers Synced',
    incomingText: 'Can I reschedule to Tuesday?',
    botPrompt: 'Tap a verified conflict-free slot below:',
    confirmedTitle: 'Calendar Synced'
  },
  crm: {
    sideTitle: 'Unified Service CRM & History',
    sideDesc: 'Every chat, intake form, and booking linked automatically to one client profile.',
    phoneHeader: 'Client CRM Profile',
    phoneStatus: '100% Direct Ownership',
    incomingText: 'Same treatment as my last visit please!',
    botPrompt: 'Loaded your preferences! Pick a time:',
    confirmedTitle: 'CRM Record Updated'
  }
};

const challengeList = [
  {
    title: 'Missed enquiries',
    desc: 'StarX Flow responds on WhatsApp in under 2 seconds, 24/7—capturing 100% of leads.',
    nodeIdx: 2
  },
  {
    title: 'Manual bookings',
    desc: 'Clients pick live slots directly inside WhatsApp without back-and-forth phone calls.',
    nodeIdx: 0
  },
  {
    title: 'Scheduling conflicts',
    desc: 'Real-time multi-provider calendar locking guarantees zero double-bookings.',
    nodeIdx: 4
  },
  {
    title: 'No-shows',
    desc: 'Automated WhatsApp reminders and 1-tap rescheduling keep your daily roster full.',
    nodeIdx: 5
  }
];

const capabilitiesList = [
  {
    title: '24/7 WhatsApp Bookings',
    subtitle: 'Native conversational booking flow inside WhatsApp with instant slot selection and calendar locking.'
  },
  {
    title: 'No-Show Prevention',
    subtitle: 'Automated 24h and 2h WhatsApp reminders with one-tap confirmation or instant waitlist backfill.'
  },
  {
    title: 'Google Review Booster',
    subtitle: 'Automatically sends a personalized review link via WhatsApp 1 hour after appointment completion.'
  },
  {
    title: 'Staff Calendar Sync',
    subtitle: 'Two-way real-time sync with Google Calendar, Apple iCloud, and Outlook for every team member.'
  },
  {
    title: 'WhatsApp Intake Forms',
    subtitle: 'Collect client preferences, consent forms, and consultation notes right inside the chat thread.'
  },
  {
    title: 'Unified Service CRM & Audit Trail',
    subtitle: 'Complete chronological history of every message, booking, provider note, and visit outcome.'
  }
];

const orbitalNodesList = [
  { id: 0, label: 'Bookings', icon: 'calendar' },
  { id: 1, label: 'Customers', icon: 'users' },
  { id: 2, label: 'Communication', icon: 'chat' },
  { id: 3, label: 'Operations', icon: 'chart' },
  { id: 4, label: 'Scheduling', icon: 'clock' },
  { id: 5, label: 'Automation', icon: 'sync' },
];

export function StarXFlowMobileStage({
  selectedSlot,
  onSelectSlot,
  activeWorkflowTab,
  onSelectWorkflowTab,
  onCycleWorkflowTab,
  activeChallengeIdx,
  onSelectChallenge,
  activeOrbitalIdx,
  onSelectOrbitalNode,
  onPulseAllNodes,
  onOpenModal,
  onOpenCapability,
  onScrollToSection,
}: MobileStageProps) {
  const [selectedDay, setSelectedDay] = useState(11);
  const currentTab = workflowTabsData[activeWorkflowTab] || workflowTabsData.whatsapp;

  return (
    <div className="starx-mobile-stage w-full relative z-10 text-[#f3fbf7] overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Dynamic Ambient Background Illumination */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(40, 223, 160, 0.16) 0%, rgba(5, 25, 17, 0.05) 55%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute top-[850px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ========================================================================= */}
      {/* 2.1 HERO RECONSTRUCTION (Mobile Purpose-Built Composition)                */}
      {/* ========================================================================= */}
      <section 
        id="hero-mobile-section" 
        className="relative scroll-mt-24 pt-24 pb-12 px-4 sm:px-6 flex flex-col items-center text-center"
      >
        {/* Brand/Product Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 mb-4 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-300 uppercase">
            THE INTELLIGENT BUSINESS ENVIRONMENT
          </span>
        </div>

        {/* Editorial Main Headline */}
        <h1 className="font-editorial text-[38px] sm:text-[44px] font-normal leading-[1.04] tracking-tight text-[#f3fbf7] max-w-[360px] mx-auto m-0">
          Run Your Business <br />
          on <span className="font-semibold text-white drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">One Flow</span>
        </h1>

        {/* Supporting Value Proposition */}
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#c6e8d6]/90 max-w-[330px] mx-auto font-sans font-normal">
          AI-powered communication, bookings, and operations — connected in one intelligent environment.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-[340px] mx-auto">
          <button
            type="button"
            onClick={() => onOpenModal('signup', 'Full Suite')}
            className="w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer shadow-[0_4px_24px_rgba(74,222,128,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.75)]"
            style={{
              background: 'linear-gradient(180deg, #bcf8db 0%, #73dfaa 48%, #47ba82 100%)',
              color: '#042115',
              border: '1.2px solid rgba(210, 255, 232, 0.85)',
            }}
          >
            <span>Get Started</span>
            <span className="text-base font-bold">→</span>
          </button>

          <button
            type="button"
            onClick={() => onScrollToSection('action-mobile-section')}
            className="w-full h-12 rounded-full font-medium text-sm text-[#f0fdf6] flex items-center justify-center gap-2.5 transition-colors bg-[#082015]/80 hover:bg-[#0c2f1f] border border-emerald-400/40 backdrop-blur-md active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          >
            <span>See It in Action</span>
            <svg className="w-5 h-5 text-emerald-300" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#86efac" strokeWidth="1.3" strokeOpacity="0.7"/>
              <path d="M8.5 7L13 10L8.5 13V7Z" fill="#ecfdf5"/>
            </svg>
          </button>
        </div>

        {/* Supporting Capability Indicators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-[#d1fae5]/90">
          <button 
            type="button"
            onClick={() => { onSelectWorkflowTab('whatsapp'); onScrollToSection('action-mobile-section'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071d14]/70 border border-emerald-500/25 text-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>WhatsApp Bookings</span>
          </button>
          <button 
            type="button"
            onClick={() => { onSelectWorkflowTab('scheduling'); onScrollToSection('action-mobile-section'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071d14]/70 border border-emerald-500/25 text-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Scheduling</span>
          </button>
          <button 
            type="button"
            onClick={() => { onSelectWorkflowTab('crm'); onScrollToSection('action-mobile-section'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071d14]/70 border border-emerald-500/25 text-emerald-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Customer CRM</span>
          </button>
        </div>

        {/* ======================================================================= */}
        {/* 2.2 MOBILE PRODUCT VISUALISATION (Readable, Art-Directed Interface)     */}
        {/* ======================================================================= */}
        <div className="mt-8 w-full max-w-[360px] mx-auto relative">
          {/* Architectural Glass Showcase Base */}
          <div className="rounded-3xl p-4 sm:p-5 relative bg-gradient-to-b from-[#0a261c]/90 via-[#04150f]/95 to-[#020b08] border border-emerald-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(40,223,160,0.15)]">
            
            {/* Top Specular Edge Glow */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

            {/* 1. Primary WhatsApp Chat Surface */}
            <div className="rounded-2xl p-3.5 bg-[#051a11]/90 border border-emerald-400/30 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {/* WhatsApp Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_12px_rgba(74,222,128,0.5)] flex-shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white leading-tight">StarX AI Receptionist</div>
                    <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online • Instant Reply</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-200/60">Verified Meta API</span>
              </div>

              {/* Chat Thread */}
              <div className="mt-3.5 space-y-3 text-left">
                {/* Incoming Message */}
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#082418] border border-emerald-500/25 p-2.5 shadow-sm">
                  <p className="text-xs text-[#f3fbf7] leading-relaxed m-0 font-normal">
                    Hi! Can I book an appointment for this week?
                  </p>
                  <span className="text-[9px] text-emerald-200/50 mt-1 block text-right font-mono">9:41 AM</span>
                </div>

                {/* Outgoing Bot Prompt + Slot Pills */}
                <div className="max-w-[92%] ml-auto rounded-2xl rounded-tr-sm bg-[#092e1e]/95 border border-emerald-400/40 p-2.5 shadow-md">
                  <p className="text-xs text-white font-medium leading-tight mb-2 m-0">
                    Sure! Here are verified open slots:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {['Tue, 10:00 AM', 'Tue, 2:00 PM', 'Wed, 11:00 AM'].map((slot) => {
                      const isActive = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => onSelectSlot(slot)}
                          className={cn(
                            "w-full py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-between transition-all cursor-pointer",
                            isActive
                              ? "bg-gradient-to-r from-emerald-400 to-mint-bright text-[#042115] font-semibold shadow-[0_0_14px_rgba(74,222,128,0.6)]"
                              : "bg-[#061e14] text-emerald-200 hover:bg-[#0a2e1f] border border-emerald-500/30"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#042115]" : "bg-emerald-400")} />
                            <span>{slot}</span>
                          </span>
                          <span className="text-[10px] opacity-80">{isActive ? "Selected ✓" : "Available"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Floating Secondary Layers (AI Confirmation & Customer Sync) */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-left">
              {/* AI Confirmation Pill */}
              <div className="rounded-xl p-2.5 bg-[#072016]/85 border border-emerald-400/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white">Booking Confirmed</span>
                  <span className="w-4 h-4 rounded-full bg-emerald-400 text-[#042115] font-bold text-[10px] flex items-center justify-center flex-shrink-0">✓</span>
                </div>
                <div className="text-[10.5px] text-emerald-300 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Synced to Calendar</span>
                </div>
              </div>

              {/* Customer Sync Pill */}
              <div className="rounded-xl p-2.5 bg-[#072016]/85 border border-emerald-400/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                <div className="text-xs font-semibold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-mint-bright" />
                  <span>Customer Card</span>
                </div>
                <div className="text-[11px] text-emerald-200 font-medium mt-1 truncate">
                  • {selectedSlot}
                </div>
              </div>
            </div>

            {/* 3. Interactive Mini Calendar Preview */}
            <div className="mt-3 rounded-xl p-3 bg-[#04160e]/80 border border-emerald-500/25 text-center">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-200/90 mb-2">
                <span className="flex items-center gap-1 text-white font-semibold">
                  <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  November 2026
                </span>
                <span className="text-[10px] text-emerald-300">Live Provider Lock</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[11px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <span key={i} className="text-emerald-400/60 font-semibold text-[10px]">{day}</span>
                ))}
                {[8, 9, 10, 11, 12, 13, 14].map((d) => {
                  const isSel = selectedDay === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={cn(
                        "h-6 rounded-full flex items-center justify-center font-medium transition-all cursor-pointer",
                        isSel
                          ? "bg-emerald-400 text-black font-bold shadow-[0_0_10px_#34d399]"
                          : "text-emerald-100/90 hover:bg-emerald-500/20"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Scroll to Explore Indicator */}
        <button
          type="button"
          onClick={() => onScrollToSection('challenge-mobile-section')}
          className="mt-8 flex flex-col items-center gap-1.5 text-emerald-300/80 hover:text-emerald-200 transition-colors group cursor-pointer"
        >
          <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase">SCROLL TO EXPLORE</span>
          <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 2.3 DAILY CHALLENGE & CONNECTED OPERATIONS                                */}
      {/* ========================================================================= */}
      <section 
        id="challenge-mobile-section" 
        className="relative scroll-mt-24 py-14 px-4 sm:px-6 border-t border-emerald-500/15"
      >
        {/* Top Eyebrow & Headline: The Challenge */}
        <div className="text-left mb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#5eead4] uppercase mb-1.5">
            THE DAILY CHALLENGE
          </div>
          <h2 className="font-editorial text-[32px] sm:text-[36px] font-normal leading-[1.06] text-[#f4fbf7] m-0">
            Running a business <br />
            shouldn’t feel fragmented.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
            When enquiries, calendar bookings, and follow-ups live in separate silos, revenue leaks every day.
          </p>
        </div>

        {/* 4 Problem Indicator Cards in 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {challengeList.map((c, idx) => {
            const isAct = activeChallengeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectChallenge(idx)}
                className={cn(
                  "p-3.5 rounded-2xl flex flex-col items-start text-left transition-all cursor-pointer border min-h-[110px]",
                  isAct
                    ? "bg-[#0b2b1d] border-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.35)] scale-[1.02]"
                    : "bg-[#061911]/85 border-emerald-500/25 hover:border-emerald-400/50"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2">
                  {idx === 0 && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                <div className="text-xs font-semibold text-white leading-tight">{c.title}</div>
                <div className="text-[10.5px] text-emerald-200/70 mt-1 line-clamp-2 leading-tight font-normal">
                  {c.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Transition Conduit */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="h-8 w-[1.5px] bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
          <div className="px-3 py-1 rounded-full bg-[#082216] border border-emerald-400/40 text-[11px] font-semibold text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.25)] flex items-center gap-1.5">
            <span>Synchronized Autopilot</span>
            <span className="text-emerald-400 font-bold">↓</span>
          </div>
          <div className="h-8 w-[1.5px] bg-gradient-to-t from-emerald-400 to-transparent animate-pulse" />
        </div>

        {/* The StarX Flow Way: Connected Operations */}
        <div className="text-left mb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#6ee7a8] uppercase mb-1.5">
            THE STARX FLOW WAY
          </div>
          <h2 className="font-editorial text-[32px] sm:text-[36px] font-normal leading-[1.06] text-[#f4fbf7] m-0">
            From scattered tasks to <br />
            a <span className="text-emerald-300 font-medium">connected</span> operation.
          </h2>
        </div>

        {/* Central Core Sphere Interactive Trigger */}
        <div className="rounded-3xl p-5 bg-gradient-to-b from-[#061e14]/90 via-[#03130d]/95 to-[#010a06] border border-emerald-500/35 relative text-center">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <button
              type="button"
              onClick={onPulseAllNodes}
              className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-mint-bright shadow-[0_0_40px_rgba(74,222,128,0.7)] flex items-center justify-center cursor-pointer transition-transform active:scale-95 border-2 border-emerald-200"
              title="Click to synchronize all connected operations"
            >
              <svg className="w-10 h-10 text-[#042115] fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z"/>
              </svg>
            </button>
            <div className="absolute -inset-2 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
          </div>
          <div className="text-xs font-semibold text-white tracking-wide uppercase">StarX Flow Core Intelligence</div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">Tap sphere to synchronize all 6 operational nodes</div>

          {/* 6 Connected Operations Grid */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {orbitalNodesList.map((node) => {
              const isNodeAct = activeOrbitalIdx === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectOrbitalNode(node.id, node.label)}
                  className={cn(
                    "p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border",
                    isNodeAct
                      ? "bg-emerald-500/25 border-emerald-300 shadow-[0_0_15px_rgba(74,222,128,0.4)] scale-105"
                      : "bg-[#071d14]/70 border-emerald-500/25 hover:border-emerald-400/40"
                  )}
                >
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center mb-1", isNodeAct ? "text-emerald-200" : "text-emerald-400")}>
                    {node.icon === 'calendar' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    )}
                    {node.icon === 'users' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      </svg>
                    )}
                    {node.icon === 'chat' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    )}
                    {node.icon === 'chart' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    )}
                    {node.icon === 'clock' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    )}
                    {node.icon === 'sync' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-white truncate">{node.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.4 PRODUCT WORKFLOW SHOWCASE                                             */}
      {/* ========================================================================= */}
      <section 
        id="action-mobile-section" 
        className="relative scroll-mt-24 py-14 px-4 sm:px-6 border-t border-emerald-500/15"
      >
        <div className="text-left mb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#6ee7a8] uppercase mb-1.5">
            SEE IT IN ACTION
          </div>
          <h2 className="font-editorial text-[32px] sm:text-[36px] font-normal leading-[1.06] text-[#f4fbf7] m-0">
            Real workflows. <br />
            Real business impact.
          </h2>
        </div>

        {/* Workflow Tabs: Horizontal Touch Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4">
          {[
            { id: 'whatsapp', label: 'WhatsApp Bookings' },
            { id: 'ai', label: 'AI Communication' },
            { id: 'scheduling', label: 'Scheduling' },
            { id: 'crm', label: 'CRM & History' }
          ].map((tab) => {
            const isTabAct = activeWorkflowTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectWorkflowTab(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 border",
                  isTabAct
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#042115] border-emerald-200 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                    : "bg-[#061e14]/75 text-emerald-200/90 hover:text-white border-emerald-500/30"
                )}
              >
                {isTabAct && <span className="w-1.5 h-1.5 rounded-full bg-[#042115]" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Workflow Feature Card */}
        <div className="rounded-2xl p-4 bg-[#061d13]/85 border border-emerald-400/30 mb-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white m-0">{currentTab.sideTitle}</h3>
            <span className="text-xs text-emerald-400 font-bold">0{Object.keys(workflowTabsData).indexOf(activeWorkflowTab) + 1} / 04</span>
          </div>
          <p className="mt-1.5 text-xs text-emerald-100/80 leading-relaxed m-0">
            {currentTab.sideDesc}
          </p>
          <button
            type="button"
            onClick={onCycleWorkflowTab}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Next Workflow Preview</span>
            <span>→</span>
          </button>
        </div>

        {/* Realistic Mobile Phone Mockup */}
        <div className="w-full max-w-[340px] mx-auto rounded-3xl p-3.5 bg-gradient-to-b from-[#082217] via-[#04140d] to-[#010805] border border-emerald-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative">
          
          {/* Phone Bezel Top Bar */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-emerald-500/20 text-[10px] text-emerald-200/70 font-mono">
            <span>9:41</span>
            <div className="w-16 h-3 rounded-full bg-black/60 border border-emerald-500/20" />
            <span>100% ⚡</span>
          </div>

          {/* App Header Inside Phone */}
          <div className="flex items-center gap-2 py-2 px-1 text-left">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[#042115] font-bold text-xs flex-shrink-0">
              SX
            </div>
            <div>
              <div className="text-xs font-semibold text-white leading-tight">{currentTab.phoneHeader}</div>
              <div className="text-[10px] text-emerald-300 font-medium">{currentTab.phoneStatus}</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="mt-2 space-y-2.5 text-left">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#061d13] border border-emerald-500/25 p-2 text-xs text-emerald-50">
              {currentTab.incomingText}
            </div>

            <div className="max-w-[90%] ml-auto rounded-2xl rounded-tr-sm bg-[#0a2f1f] border border-emerald-400/40 p-2.5 text-xs text-white">
              <p className="m-0 mb-2 font-medium">{currentTab.botPrompt}</p>
              <div className="flex flex-col gap-1.5">
                {['Tue, 10:00 AM', 'Tue, 2:00 PM', 'Wed, 11:00 AM'].map((slot) => {
                  const isAct = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onSelectSlot(slot)}
                      className={cn(
                        "w-full py-1 px-2.5 rounded-full text-[11px] font-medium flex items-center justify-between cursor-pointer",
                        isAct
                          ? "bg-emerald-400 text-black font-semibold shadow-[0_0_10px_#34d399]"
                          : "bg-[#06180f] text-emerald-200 border border-emerald-500/30"
                      )}
                    >
                      <span>{slot}</span>
                      <span>{isAct ? '✓' : 'Book'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floating Confirmation Result */}
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/40 flex items-center justify-between text-left">
            <div>
              <div className="text-xs font-semibold text-emerald-200">{currentTab.confirmedTitle}</div>
              <div className="text-[10.5px] text-emerald-300/80">• {selectedSlot} verified</div>
            </div>
            <span className="w-5 h-5 rounded-full bg-emerald-400 text-[#042115] font-bold text-xs flex items-center justify-center">✓</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.1 CORE CAPABILITIES (Refined 2-Column Mobile Grid)                       */}
      {/* ========================================================================= */}
      <section 
        id="capabilities-mobile-section" 
        className="relative scroll-mt-24 py-14 px-4 sm:px-6 border-t border-emerald-500/15"
      >
        <div className="text-left mb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#6ee7a8] uppercase mb-1.5">
            CORE CAPABILITIES
          </div>
          <h2 className="font-editorial text-[30px] sm:text-[34px] font-normal leading-[1.06] text-[#f4fbf7] m-0">
            Everything you need, <br />
            working together.
          </h2>
        </div>

        {/* 6 Capabilities in Touch 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {capabilitiesList.map((cap, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenCapability(idx)}
              className="p-3.5 rounded-2xl bg-[#061a12]/85 border border-emerald-500/25 hover:border-emerald-400/60 transition-all flex flex-col items-start text-left cursor-pointer active:scale-95 shadow-sm min-h-[115px]"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-2.5">
                {idx === 0 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                )}
                {idx === 1 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                )}
                {idx === 2 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                )}
                {idx === 3 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                )}
                {idx === 4 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                )}
                {idx === 5 && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>
                  </svg>
                )}
              </div>
              <div className="text-xs font-semibold text-white leading-tight">{cap.title}</div>
              <div className="text-[10px] text-emerald-300 font-medium mt-1">Tap for details →</div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.2 SIMPLE PREDICTABLE PRICING (Vertically Stacked Mobile Plans)           */}
      {/* ========================================================================= */}
      <section 
        id="pricing-mobile-section" 
        className="relative scroll-mt-24 py-14 px-4 sm:px-6 border-t border-emerald-500/15"
      >
        <div className="text-left mb-6">
          <div className="text-xs font-semibold tracking-[0.2em] text-[#6ee7a8] uppercase mb-1.5">
            SIMPLE, PREDICTABLE PRICING
          </div>
          <h2 className="font-editorial text-[30px] sm:text-[34px] font-normal leading-[1.06] text-[#f4fbf7] m-0">
            Choose the right plan <br />
            for your business.
          </h2>
        </div>

        {/* 3 Trust Badges */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Zero Double-Booking Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>100% Direct Client Ownership</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Predictable Flat-Rate Pricing</span>
          </div>
        </div>

        {/* Stacked Pricing Plans */}
        <div className="space-y-4">
          {/* Plan 1: Solo / Small Business */}
          <div className="rounded-2xl p-5 bg-[#061911]/90 border border-emerald-500/30 text-left relative shadow-lg">
            <div className="text-sm font-semibold text-white">Solo / Small Business</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$29</span>
              <span className="text-xs text-emerald-200/80">/ month</span>
            </div>
            <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
              Everything you need to run bookings, customers, and operations in one place.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>1 WhatsApp Business Number</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>1 Provider Calendar Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>24/7 Automated Booking Flow</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => onOpenModal('signup', 'Solo / Small Business — $29/mo')}
              className="mt-4 w-full h-11 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(180deg, #bcf8db 0%, #73dfaa 48%, #47ba82 100%)',
                color: '#042115',
                border: '1.2px solid rgba(210, 255, 232, 0.85)',
              }}
            >
              <span>Get Started</span>
              <span>→</span>
            </button>
          </div>

          {/* Plan 2: Multi-Provider Group */}
          <div className="rounded-2xl p-5 bg-[#082418]/95 border-2 border-emerald-400/50 text-left relative shadow-[0_8px_32px_rgba(74,222,128,0.25)]">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#042115] text-[10px] font-bold uppercase tracking-wider mb-2">
              Most Popular Clinic Choice
            </div>
            <div className="text-sm font-semibold text-white">Multi-Provider Group</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$99</span>
              <span className="text-xs text-emerald-200/80">/ month</span>
            </div>
            <p className="mt-2 text-xs text-emerald-100/80 leading-relaxed">
              Built for teams with multiple providers, calendars, and higher booking volume.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-emerald-200">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Up to 10 Provider Calendars</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Multi-Staff Roster &amp; Conflict Locks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Automated Google Review Booster</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>WhatsApp Intake &amp; Consent Forms</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => onOpenModal('signup', 'Multi-Provider Group — $99/mo')}
              className="mt-4 w-full h-11 rounded-full font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(180deg, #bcf8db 0%, #73dfaa 48%, #47ba82 100%)',
                color: '#042115',
                border: '1.2px solid rgba(210, 255, 232, 0.85)',
              }}
            >
              <span>Get Started</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
