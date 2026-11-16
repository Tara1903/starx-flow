"use client";

import React from "react";
import {
  Users,
  Calendar,
  BarChart2,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  MessageSquare,
  Lock,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export function ProductClient() {
  const openSignup = useUIStore((state) => state.openSignup);
  const openDemo = useUIStore((state) => state.openDemo);

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
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            The Autonomous Front Desk OS
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.08]">
            Your complete AI front desk <br className="hidden md:block" />
            <span className="text-gradient-emerald">
              operating system.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
            Stop losing bookings to busy phone lines. Deploy 24/7 WhatsApp AI receptionists, sync multi-staff calendars, and aggregate patient and client details into a high-converting private CRM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              type="button"
              onClick={openSignup}
              className="spatial-btn-primary w-full sm:w-auto"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={openDemo}
              className="spatial-btn-secondary w-full sm:w-auto"
            >
              Book an Architecture Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview UI */}
        <div className="w-full max-w-5xl mx-auto glass-panel rounded-[2rem] overflow-hidden mb-32 relative shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(40,223,160,0.15)] border-emerald-400/30">
          {/* Mac window header */}
          <div className="bg-[#010a05] px-5 py-3.5 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="bg-[#061a12] border border-emerald-500/25 text-[#b8c9bd] font-mono text-xs px-4 py-1 rounded-full flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" /> starx-flow.runs-on.dev/dashboard
            </div>
            <div className="w-12 text-right">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />
            </div>
          </div>

          {/* Interactive UI for Dashboard Mockup */}
          <div className="flex flex-col md:flex-row h-auto md:h-[500px] bg-[#020d08]">
            {/* Sidebar */}
            <div className="w-full md:w-60 border-r border-emerald-500/20 p-5 flex flex-col gap-2 bg-[#010804]">
              <div className="w-full h-9 bg-emerald-500/10 border border-emerald-400/25 rounded-xl mb-4 flex items-center px-3 gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" />
                <span className="text-xs text-white font-mono font-bold tracking-wider">StarX Flow OS</span>
              </div>
              <div className="w-full h-9 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-semibold text-emerald-300 flex items-center px-3 gap-2.5">
                <Calendar size={14} className="text-emerald-400" /> Bookings &amp; Schedule
              </div>
              <div className="w-full h-9 rounded-xl text-xs font-medium text-[#b8c9bd] hover:bg-emerald-500/10 hover:text-white flex items-center px-3 gap-2.5 transition-colors">
                <Users size={14} /> Client CRM &amp; History
              </div>
              <div className="w-full h-9 rounded-xl text-xs font-medium text-[#b8c9bd] hover:bg-emerald-500/10 hover:text-white flex items-center px-3 gap-2.5 transition-colors">
                <BarChart2 size={14} /> Recovery Analytics
              </div>
              <div className="w-full h-9 rounded-xl text-xs font-medium text-[#b8c9bd] hover:bg-emerald-500/10 hover:text-white flex items-center px-3 gap-2.5 transition-colors">
                <RefreshCw size={14} /> Connected Calendars
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-white">Live Operations Dashboard</h3>
                  <p className="text-xs text-[#b8c9bd]">Automated front desk active across WhatsApp &amp; Instagram</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono">
                    ● Real-Time Sync
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-emerald-500/20">
                  <span className="text-[11px] text-[#b8c9bd] font-mono uppercase tracking-wider">Total Bookings</span>
                  <span className="text-3xl font-extrabold text-white font-mono mt-2">1,248</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-emerald-500/20">
                  <span className="text-[11px] text-[#b8c9bd] font-mono uppercase tracking-wider">Missed Calls Recovered</span>
                  <span className="text-3xl font-extrabold text-white font-mono mt-2">284</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-emerald-400/40 shadow-[0_0_20px_rgba(40,223,160,0.12)]">
                  <span className="text-[11px] text-emerald-300 font-mono uppercase tracking-wider">No-Show Prevention</span>
                  <span className="text-3xl font-extrabold text-[#8fffd0] font-mono mt-2">98.8%</span>
                </div>
              </div>

              {/* Live Activity Row */}
              <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 flex-1 flex flex-col justify-center gap-3">
                <div className="text-xs font-mono text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Recent Automated Actions
                </div>
                <div className="flex items-center justify-between text-xs text-[#b8c9bd] p-2.5 rounded-lg bg-black/40 border border-emerald-500/15">
                  <span>Confirmed 60m Deep Tissue • Elena Rostova</span>
                  <span className="font-mono text-emerald-300">Just now</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#b8c9bd] p-2.5 rounded-lg bg-black/40 border border-emerald-500/15">
                  <span>Google Review request sent • Marcus Vance</span>
                  <span className="font-mono text-[#b8c9bd]/70">4m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid: 4 Core Modules */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Core <span className="text-gradient-emerald">Modules</span>
            </h2>
            <p className="text-[#b8c9bd] max-w-2xl mx-auto font-normal text-lg">
              Everything required to automate bookings and capture client details without manual admin work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="glass-panel glass-panel-hover p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-6 border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-editorial text-2xl font-bold text-white mb-3">
                  WhatsApp AI Receptionist
                </h3>
                <p className="text-[#b8c9bd] leading-relaxed mb-6 font-normal text-sm sm:text-base">
                  Put scheduling on autopilot. Our 24/7 AI Receptionist chats naturally over WhatsApp to book clients, reschedule appointments, answer service queries, and secure digital intakes.
                </p>
                <ul className="space-y-3 mb-2 text-sm">
                  {[
                    "24/7 instant natural-language responses",
                    "Answers complex service pricing & prep FAQs",
                    "Seamless multi-staff selection & roster rules",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-emerald-100/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-6 border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-editorial text-2xl font-bold text-white mb-3">
                  Unified Customer CRM
                </h3>
                <p className="text-[#b8c9bd] leading-relaxed mb-6 font-normal text-sm sm:text-base">
                  Own your client profiles. Gather session histories, staff preferences, payment tags, and contact details in a single dashboard to maximize direct client retention without aggregator fees.
                </p>
                <ul className="space-y-3 mb-2 text-sm">
                  {[
                    "Comprehensive visitor session records",
                    "Custom client profile tags & digital waivers",
                    "Direct retention list messaging with 0% commissions",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-emerald-100/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-6 border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <BarChart2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-editorial text-2xl font-bold text-white mb-3">
                  Operational Insights
                </h3>
                <p className="text-[#b8c9bd] leading-relaxed mb-6 font-normal text-sm sm:text-base">
                  Make data-driven staff and capacity decisions. Instantly track monthly leads captured, booking rates, staff utilization grids, and unrecovered call revenues.
                </p>
                <ul className="space-y-3 mb-2 text-sm">
                  {[
                    "Unrecovered missed-call revenue analytics",
                    "Staff calendar capacity & utilization logs",
                    "5-star Google review acquisition velocity",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-emerald-100/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover p-8 md:p-10 rounded-[2rem] flex flex-col items-start gap-6 border-emerald-500/20">
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                <RefreshCw size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-editorial text-2xl font-bold text-white mb-3">
                  Staff Calendar Sync
                </h3>
                <p className="text-[#b8c9bd] leading-relaxed mb-6 font-normal text-sm sm:text-base">
                  Two-way sync that never fails. Instantly lock and update calendar availability across Google, Outlook, Square, and Clover systems across your entire provider team.
                </p>
                <ul className="space-y-3 mb-2 text-sm">
                  {[
                    "Google Calendar & Microsoft Outlook official OAuth",
                    "Square POS & Clover POS sync protocols",
                    "Double-booking prevention with exclusion locks",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-emerald-100/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Section */}
        <div className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.1)]">
                <div className="flex flex-col gap-4 font-sans">
                  {[
                    {
                      title: "New appointment from Sarah L.",
                      time: "Just now • Balayage Styling (120 min)",
                      val: "+$160.00",
                    },
                    {
                      title: "Digital intake waiver completed: James C.",
                      time: "5m ago • Chiropractic Intake Signed",
                      val: "Verified",
                    },
                    {
                      title: "5-Star Review Booster triggered",
                      time: "1h ago • David Chen (Ironwood Gym)",
                      val: "Dispatched",
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-5 bg-[#010804] rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-sm">
                          {n.title}
                        </span>
                        <span className="text-[#b8c9bd] text-xs mt-1 font-mono">{n.time}</span>
                      </div>
                      <span className="text-emerald-300 font-mono text-xs font-bold bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-400/30">
                        {n.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="font-editorial text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                Front desk automation that <span className="text-gradient-emerald">syncs with real workflows.</span>
              </h2>
              <p className="text-[#b8c9bd] leading-relaxed mb-10 font-normal text-base sm:text-lg">
                Establish custom rules to collect digital waivers before visits, route specific booking types to specific staff, and trigger review requests via WhatsApp after appointments close.
              </p>
              <ul className="space-y-6 text-sm">
                <li className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(40,223,160,0.12)]">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-base sm:text-lg font-editorial">
                      Event-Based Triggers
                    </h4>
                    <p className="text-sm text-[#b8c9bd] font-normal leading-relaxed">
                      Instantly text pre-appointment waivers or post-visit review requests automatically.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(40,223,160,0.12)]">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-base sm:text-lg font-editorial">
                      Multi-Staff Rosters
                    </h4>
                    <p className="text-sm text-[#b8c9bd] font-normal leading-relaxed">
                      Manage calendars for dozens of personal trainers, therapists, or stylists from a single dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(40,223,160,0.12)]">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-base sm:text-lg font-editorial">
                      Enterprise Encryption &amp; RLS
                    </h4>
                    <p className="text-sm text-[#b8c9bd] font-normal leading-relaxed">
                      Secure client details, intake waivers, and health questionnaires natively with TLS 1.3 and PostgreSQL isolation.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-8 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Ready to scale your business capacity?
          </h2>
          <p className="text-lg text-[#b8c9bd] mb-9 max-w-2xl mx-auto leading-relaxed font-normal">
            Join thousands of service businesses who have automated their scheduling and front desk workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={openSignup}
              className="spatial-btn-primary w-full sm:w-auto"
            >
              Start 14-Day Free Trial
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={openDemo}
              className="spatial-btn-secondary w-full sm:w-auto"
            >
              Book an Architecture Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
