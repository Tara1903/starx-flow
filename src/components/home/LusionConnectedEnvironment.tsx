"use client";

import React, { useState } from "react";
import { MessageSquare, Bot, Calendar, CreditCard, BellRing, Database, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function LusionConnectedEnvironment() {
  const [activeNode, setActiveNode] = useState<number>(1);

  const nodes = [
    {
      id: 0,
      title: "1. Customer Inquiries",
      shortTitle: "WhatsApp Inquiries",
      subtitle: "Multi-channel entry",
      description: "Incoming leads from WhatsApp, Instagram DMs, and website chat are instantly ingested into one central queue without manual monitoring.",
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      metric: "100% captured",
      metricDetail: "Zero missed after-hours leads",
      sample: "Client: 'Do you have openings this Thursday for Marcus?'",
    },
    {
      id: 1,
      title: "2. AI Conversational Triage",
      shortTitle: "AI Concierge",
      subtitle: "Natural language processing",
      description: "StarX AI evaluates provider rosters, matches requested treatments, verifies scheduling constraints, and replies with available openings in 1.4s.",
      icon: <Bot className="w-5 h-5 text-emerald-400" />,
      metric: "1.4s response",
      metricDetail: "Trained on your business FAQs",
      sample: "AI: 'Yes! Marcus has openings at 2:00 PM and 4:30 PM. Shall I reserve 2:00 PM?'",
    },
    {
      id: 2,
      title: "3. Live Calendar Locking",
      shortTitle: "Calendar Sync",
      subtitle: "2-way conflict prevention",
      description: "Selected slots are instantly locked across Google Calendar, Apple iCloud, and Outlook. Buffers between sessions are enforced automatically.",
      icon: <Calendar className="w-5 h-5 text-emerald-400" />,
      metric: "0 conflicts",
      metricDetail: "Instant bidirectional synchronization",
      sample: "System: 'Slot locked on Marcus Vance roster. Confirmed on Google Calendar.'",
    },
    {
      id: 3,
      title: "4. Direct Payment & Deposits",
      shortTitle: "Stripe Connect",
      subtitle: "Zero platform commission",
      description: "Optional booking deposits or full prepayments are collected directly through Stripe. Funds go straight to your bank account with zero middleman deductions.",
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
      metric: "$0 commissions",
      metricDetail: "Direct merchant deposit capture",
      sample: "Stripe: '$50.00 deposit captured via Apple Pay. Payout routed to business account.'",
    },
    {
      id: 4,
      title: "5. Automated Intake & Reminders",
      shortTitle: "Intake & Reminders",
      subtitle: "Proactive no-show prevention",
      description: "24-hour and 2-hour WhatsApp reminders dispatch automatically with 1-tap confirmation or rescheduling. Digital intake forms collect health waivers in advance.",
      icon: <BellRing className="w-5 h-5 text-emerald-400" />,
      metric: "-78% no-shows",
      metricDetail: "Instant waitlist backfill",
      sample: "WhatsApp: 'Reminder: Marcus Vance tomorrow at 2:00 PM. Tap to confirm or reschedule.'",
    },
    {
      id: 5,
      title: "6. Unified CRM & Visit History",
      shortTitle: "Client CRM",
      subtitle: "Lifetime audit trail",
      description: "Every message, booking history, intake form, and provider note is consolidated into a permanent client profile under your complete direct ownership.",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      metric: "100% private",
      metricDetail: "Complete customer lifecycle ledger",
      sample: "Profile: 'Sarah K. • 4 lifetime visits • Deep Tissue preferred • Marcus Vance assigned.'",
    },
  ];

  const current = nodes[activeNode];

  return (
    <section
      id="connected-environment"
      className="relative py-24 sm:py-32 border-t border-emerald-500/10 overflow-hidden"
    >
      {/* Living Atmospheric Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
              Integrated Operational Architecture
            </span>
          </div>
          <h2 className="font-lusion-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
            Six Autonomous Pillars.{" "}
            <span className="text-gradient-emerald font-normal">
              One Synchronized Ecosystem.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
            Instead of stitching together 5 disconnected subscription tools with brittle webhooks, StarX Flow connects the entire customer journey into one cohesive real-time loop.
          </p>
        </div>

        {/* Interactive Pipeline & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Flow Nodes Selector */}
          <div className="lg:col-span-7 space-y-3">
            {nodes.map((node, index) => {
              const isActive = activeNode === index;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNode(index)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? "bg-emerald-950/60 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] translate-x-1"
                      : "bg-[#06140e]/40 border-emerald-500/15 hover:border-emerald-500/35 hover:bg-emerald-950/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                        isActive
                          ? "bg-emerald-400/20 text-emerald-300 scale-110"
                          : "bg-emerald-950/60 text-emerald-400/70 group-hover:text-emerald-300"
                      }`}
                    >
                      {node.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-sm sm:text-base font-semibold transition-colors ${
                          isActive ? "text-white" : "text-emerald-100/80 group-hover:text-white"
                        }`}
                      >
                        {node.title}
                      </h3>
                      <p className="text-xs text-emerald-200/50">
                        {node.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                        isActive
                          ? "bg-emerald-400/20 text-emerald-300 font-semibold border border-emerald-400/30"
                          : "text-emerald-200/40"
                      }`}
                    >
                      {node.metric}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isActive ? "text-emerald-300 translate-x-1" : "text-emerald-500/30 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Node Inspector Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="starx-glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                    {current.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                      Active Operational Node
                    </span>
                    <h4 className="text-lg font-semibold text-white">
                      {current.shortTitle}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-emerald-100/75 leading-relaxed">
                {current.description}
              </p>

              {/* Real-Time Event Simulation */}
              <div className="bg-[#030e09]/80 rounded-xl p-4 border border-emerald-500/20 space-y-2">
                <div className="text-[11px] font-mono text-emerald-400/80 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified Stream Event:</span>
                </div>
                <p className="text-xs font-mono text-emerald-200 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/10">
                  {current.sample}
                </p>
              </div>

              {/* Performance Indicator */}
              <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10">
                  <div className="text-emerald-300/60 text-[10px]">EFFICIENCY IMPACT</div>
                  <div className="text-sm font-semibold text-emerald-300 mt-1">
                    {current.metric}
                  </div>
                </div>
                <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10">
                  <div className="text-emerald-300/60 text-[10px]">SYSTEM STATUS</div>
                  <div className="text-sm font-semibold text-emerald-300 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Automated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
