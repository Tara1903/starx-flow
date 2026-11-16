"use client";

import React from "react";
import {
  MessageSquare,
  RefreshCw,
  Users,
  Star,
  ClipboardCheck,
  CreditCard,
  Sliders,
  ShieldAlert,
  Smartphone,
  Check,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export function FeaturesClient() {
  const openSignup = useUIStore((state) => state.openSignup);

  const mainFeatures = [
    {
      icon: <MessageSquare className="text-emerald-400" size={28} />,
      title: "24/7 WhatsApp AI Assistant",
      desc: "Let clients message naturally on WhatsApp to book slots, reschedule appointments, and ask FAQs. Zero front desk delays, zero missed callers.",
      points: [
        "Instant natural-language booking and scheduling in 30+ languages.",
        "Synchronizes automatically with multiple team members & calendars.",
        "Collects intake details and digital waivers natively inside the chat flow.",
      ],
      badge: "CONVERSATIONAL COMMERCE",
      snippetTitle: "WhatsApp Assistant Live Session",
      mockMessages: [
        { sender: "customer", text: "Hi! Can I book a 60-min Deep Tissue massage tomorrow after 4 PM?" },
        { sender: "ai", text: "Hello! We have slots open at 4:30 PM with Sarah or 5:15 PM with Michael. Which therapist do you prefer?" },
        { sender: "customer", text: "Sarah at 4:30 PM works great!" },
        { sender: "ai", text: "Locked in! Sarah K. • Deep Tissue • 4:30 PM. I've sent your calendar invite and intake link." },
      ],
    },
    {
      icon: <RefreshCw className="text-emerald-400" size={28} />,
      title: "Multi-Calendar Sync Infrastructure",
      desc: "Real-time bi-directional synchronization across Google Calendar and Microsoft Outlook rosters, backed by PostgreSQL exclusion constraint locks.",
      points: [
        "Matches appointments with specific staff capacity and buffer windows.",
        "Sends instant calendar invites, SMS alerts, and email confirmations.",
        "Handles easy 1-click rescheduling updates natively with zero double-bookings.",
      ],
      badge: "TWO-WAY CALENDAR ENGINE",
      snippetTitle: "Real-Time Sync Protocol",
      mockSyncs: [
        { name: "Google Calendar", status: "Connected • 0.2s sync latency", active: true },
        { name: "Microsoft Outlook 365", status: "Connected • Bi-directional lock", active: true },
        { name: "Square POS / Clover Schedulers", status: "Connected • Webhook active", active: true },
      ],
    },
    {
      icon: <Users className="text-emerald-400" size={28} />,
      title: "Direct CRM & Customer Ownership",
      desc: "Own your client list, booking records, session history tags, and review statistics without aggregator fees or marketplace commissions.",
      points: [
        "Maintains deep profile cards and custom intake records automatically.",
        "Tracks client booking frequency, lifetime value, and no-show flags.",
        "Triggers targeted follow-ups to re-engage inactive clients automatically.",
      ],
      badge: "ZERO COMMISSION CRM",
      snippetTitle: "Client Intelligence Profile",
      mockProfile: {
        name: "Elena Rostova",
        tag: "VIP Member • 14 Sessions",
        history: "Deep Tissue • Hydro-Facial • Reflexology",
        satisfaction: "100% On-Time • 5★ Google Review",
      },
    },
  ];

  const subFeatures = [
    {
      icon: <Star className="text-emerald-400" size={22} />,
      title: "Google Review Booster",
      desc: "Automatically message happy clients post-session to request 5-star ratings and scale local SEO rankings.",
    },
    {
      icon: <ClipboardCheck className="text-emerald-400" size={22} />,
      title: "WhatsApp Intake Forms",
      desc: "Send digital waiver links, health questionnaires, and gym registration forms automatically prior to visits.",
    },
    {
      icon: <CreditCard className="text-emerald-400" size={22} />,
      title: "Secure Retainers & Deposits",
      desc: "Collect secure slot deposits, session retainers, and package invoices over WhatsApp with zero friction.",
    },
    {
      icon: <Sliders className="text-emerald-400" size={22} />,
      title: "Multi-Staff Rostering",
      desc: "Assign and balance shifts across dozens of trainers, therapists, dentists, or stylists seamlessly.",
    },
    {
      icon: <ShieldAlert className="text-emerald-400" size={22} />,
      title: "Strict Tenant Privacy & RLS",
      desc: "Client records and waivers are protected with PostgreSQL Row Level Security (RLS) and TLS 1.3 transport encryption.",
    },
    {
      icon: <Smartphone className="text-emerald-400" size={22} />,
      title: "Responsive Admin Hub",
      desc: "Review live bookings, conversation feeds, and staff schedules seamlessly on iPhone, Android, and Desktop.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-28 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(40, 223, 160, 0.16) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/3 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-28">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Core Capabilities &amp; Architecture
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            Everything you need to <br className="hidden md:block" />
            <span className="text-gradient-emerald">
              automate &amp; scale operations.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#b8c9bd] max-w-2xl mx-auto font-normal leading-relaxed">
            From 24/7 WhatsApp AI intake assistants to real-time calendar synchronization, StarX Flow gives service businesses enterprise-grade infrastructure out of the box.
          </p>
        </div>

        {/* Hero Feature Showcase (Alternating Rows) */}
        <div className="space-y-24 lg:space-y-32 mb-32">
          {mainFeatures.map((feature, idx) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                idx % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-12 lg:gap-16`}
            >
              {/* Copy Side */}
              <div className="w-full lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 font-mono text-xs uppercase tracking-wider mb-5">
                  {feature.badge}
                </div>
                <h2 className="font-editorial text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-lg text-[#b8c9bd] leading-relaxed mb-8 font-normal">
                  {feature.desc}
                </p>
                <ul className="space-y-4 text-sm font-medium">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-3.5 text-emerald-100/90">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-300" />
                      </div>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Glass Mockup Side */}
              <div className="w-full lg:w-1/2">
                <div className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-3xl relative overflow-hidden border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs text-emerald-300 uppercase tracking-wider">
                        {feature.snippetTitle}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#b8c9bd]">Active • TLS 1.3</span>
                  </div>

                  {/* Dynamic Inner Visual Based on Feature */}
                  {feature.mockMessages && (
                    <div className="space-y-3.5 font-sans">
                      {feature.mockMessages.map((msg, mIdx) => (
                        <div
                          key={mIdx}
                          className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                              msg.sender === "customer"
                                ? "bg-emerald-900/60 border border-emerald-400/40 text-emerald-100 rounded-tr-sm"
                                : "bg-[#061a12]/90 border border-emerald-500/25 text-[#f0f5ef] rounded-tl-sm shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                            }`}
                          >
                            {msg.sender === "ai" && (
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-emerald-400 font-mono uppercase">
                                <Bot size={12} /> StarX Receptionist
                              </div>
                            )}
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.mockSyncs && (
                    <div className="space-y-3 font-sans">
                      {feature.mockSyncs.map((sync, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-4 rounded-xl bg-[#061a12]/70 border border-emerald-500/25"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-emerald-400" />
                            <div>
                              <div className="text-sm font-semibold text-white">{sync.name}</div>
                              <div className="text-xs text-[#b8c9bd]">{sync.status}</div>
                            </div>
                          </div>
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {feature.mockProfile && (
                    <div className="space-y-4 font-sans">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-[#061a12]/70 border border-emerald-500/25">
                        <div>
                          <div className="text-base font-bold text-white">{feature.mockProfile.name}</div>
                          <div className="text-xs font-mono text-emerald-300">{feature.mockProfile.tag}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs">
                          Verified
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/15 text-xs text-[#b8c9bd] space-y-2">
                        <div><strong className="text-emerald-200">History:</strong> {feature.mockProfile.history}</div>
                        <div><strong className="text-emerald-200">Metric:</strong> {feature.mockProfile.satisfaction}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Grid: 6 Pillars */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-editorial text-3xl md:text-5xl font-bold text-white mb-4">
              More built-in power
            </h2>
            <p className="text-[#b8c9bd] font-normal text-base sm:text-lg">
              Enterprise features included standard across all tiers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {subFeatures.map((feature) => (
              <div
                key={feature.title}
                className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-emerald-400/50 transition-all shadow-[0_0_15px_rgba(40,223,160,0.12)]">
                    {feature.icon}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[#b8c9bd] text-sm font-normal leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-12 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Put front desk operations on autopilot
          </h2>
          <p className="text-lg text-[#b8c9bd] mb-9 max-w-2xl mx-auto leading-relaxed font-normal">
            Unlock all the tools you need to capture direct client bookings and accelerate clinic, gym, or salon capacity.
          </p>
          <button
            type="button"
            onClick={openSignup}
            className="spatial-btn-primary"
          >
            Start Your 14-Day Free Trial
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
