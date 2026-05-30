import React from "react";
import { motion } from "motion/react";
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
  Lock
} from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Product() {
  const openSignup = useUIStore((state) => state.openSignup);

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      {/* Background glow */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] atmo-glow atmo-glow-emerald opacity-20 z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            The StarX Flow OS
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-[5.5rem] font-bold tracking-tight text-white mb-8 leading-[1.05]"
          >
            Your complete AI front desk <br className="hidden md:block" />
            <span className="text-gradient-silver">
              operating system.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto mb-10 font-medium"
          >
            Stop losing bookings to busy phone lines. Deploy 24/7 WhatsApp AI receptionists, sync multi-staff calendars, and aggregate patient/client details into a high-converting customer CRM.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={openSignup}
              data-magnetic
              className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-4 rounded-full text-base font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 premium-glow premium-glow-hover"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={openSignup}
              data-magnetic
              className="w-full sm:w-auto glass-panel px-8 py-4 rounded-full text-base font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Book a Demo
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-5xl mx-auto glass-hero glass-inner-sheen glass-edge-light rounded-[2rem] overflow-hidden mb-32 relative shadow-2xl"
        >
          {/* Mac window header */}
          <div className="bg-black/40 px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="mx-auto bg-white/5 text-zinc-500 text-xs px-3 py-1 rounded-md flex items-center gap-2 font-semibold">
              <Lock className="w-3 h-3" /> crm.starxflow.com
            </div>
          </div>

          {/* Skeleton UI for Dashboard */}
          <div className="flex h-[500px] bg-black/60">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-2 bg-black/20">
              <div className="w-full h-8 bg-white/5 rounded-md mb-6 flex items-center px-3 gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">StarX Flow OS</span>
              </div>
              <div className="w-full h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400 flex items-center px-3 gap-2">
                <Calendar size={14} /> Bookings
              </div>
              <div className="w-full h-8 hover:bg-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white flex items-center px-3 gap-2 transition-colors">
                <Users size={14} /> Client CRM
              </div>
              <div className="w-full h-8 hover:bg-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white flex items-center px-3 gap-2 transition-colors">
                <BarChart2 size={14} /> Analytics
              </div>
              <div className="w-full h-8 hover:bg-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white flex items-center px-3 gap-2 transition-colors">
                <RefreshCw size={14} /> Integrations
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="w-48 h-8 bg-white/5 rounded-md" />
                <div className="w-32 h-8 bg-white/5 rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Bookings</span>
                  <span className="text-2xl font-bold text-white">1,248</span>
                </div>
                <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Leads Recovered</span>
                  <span className="text-2xl font-bold text-white">284</span>
                </div>
                <div className="h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 blur-xl rounded-full" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider relative z-10">No-Show Prevention</span>
                  <span className="text-2xl font-bold text-white relative z-10">98.8%</span>
                </div>
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 w-full p-6 flex flex-col gap-3">
                <div className="w-1/3 h-4 bg-white/10 rounded" />
                <div className="w-full h-2 bg-white/5 rounded mt-4" />
                <div className="w-full h-2 bg-white/5 rounded" />
                <div className="w-full h-2 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Core <span className="text-gradient-silver">Modules</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg">
              Everything you need to automate bookings and capture customer data without manual admin work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[2rem] flex flex-col items-start gap-6 relative group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="text-emerald-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  WhatsApp AI Receptionist
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6 font-medium text-sm">
                  Put scheduling on auto. Our 24/7 AI Receptionist chats naturally over WhatsApp to book clients, reschedule appointments, answer service queries, and secure intakes.
                </p>
                <ul className="space-y-3 mb-8 text-sm font-semibold">
                  {[
                    "24/7 instant scheduling responses",
                    "Answers complex pricing & service FAQs",
                    "Seamless multi-staff selection rules",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[2rem] flex flex-col items-start gap-6 relative group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users className="text-emerald-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  Unified Customer CRM
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6 font-medium text-sm">
                  Own your client profiles. Gather session histories, staff preferences, payment tags, and contact details in a single dashboard to maximize direct client retention.
                </p>
                <ul className="space-y-3 mb-8 text-sm font-semibold">
                  {[
                    "Comprehensive visitor session records",
                    "Custom client profile tags & waivers",
                    "Direct retention list targeting",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[2rem] flex flex-col items-start gap-6 relative group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BarChart2 className="text-emerald-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  Operational Insights
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6 font-medium text-sm">
                  Make data-driven staff and capacity decisions. Instantly track monthly leads captured, booking rates, staff utilization grids, and unrecovered call revenues.
                </p>
                <ul className="space-y-3 mb-8 text-sm font-semibold">
                  {[
                    "Unrecovered revenue metrics",
                    "Staff calendar utilization logs",
                    "Review acquisition velocity",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[2rem] flex flex-col items-start gap-6 relative group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <RefreshCw className="text-emerald-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  Staff Calendar Sync
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6 font-medium text-sm">
                  Two-way sync that never fails. Instantly lock and update calendar availability across Google, Outlook, Square, and Clover systems across your entire team.
                </p>
                <ul className="space-y-3 mb-8 text-sm font-semibold">
                  {[
                    "Two-way Square & Clover POS integrations",
                    "Google Calendar & Outlook support",
                    "Double-booking protection system",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 atmo-glow atmo-glow-emerald opacity-30" />
              <div className="glass-panel glass-edge-light rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl sm:skew-y-3 transform-gpu hover:skew-y-0 transition-transform duration-500">
                <div className="flex flex-col gap-4">
                  {[
                    {
                      title: "New appointment from Sarah L.",
                      time: "Just now - Balayage Styling",
                      val: "+$160.00",
                    },
                    {
                      title: "Intake form completed: James C.",
                      time: "5m ago - Chiropractic Intake",
                      val: "Complete",
                    },
                    {
                      title: "5-Star Review Booster triggered",
                      time: "1h ago - David Chen (Ironwood Gym)",
                      val: "Triggered",
                    },
                  ].map((n, i) => (
                     <div
                      key={i}
                      className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">
                          {n.title}
                        </span>
                        <span className="text-zinc-400 text-xs mt-1">{n.time}</span>
                      </div>
                      <span className="text-emerald-400 text-sm font-extrabold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {n.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                Front desk automation that <span className="text-gradient-silver">syncs with real workflows.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-10 font-medium text-lg">
                Establish custom rules to collect digital waivers before visits, route specific booking types to specific staff, and trigger review requests via WhatsApp after appointments close.
              </p>
              <ul className="space-y-6 font-semibold text-sm">
                <li className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">
                      Event-Based Triggers
                    </h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-sm">
                      Instantly text pre-appointment waivers or post-visit review requests automatically.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">
                      Multi-Staff Rosters
                    </h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-sm">
                      Manage calendars for dozens of personal trainers, therapists, or stylists from a single dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-lg">
                      HIPAA-Compliant Encryptions
                    </h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-sm">
                      Secure client details, intake waivers, and health questionnaires natively.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto glass-panel border border-emerald-500/20 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-[0_20px_80px_-20px_rgba(16,185,129,0.3)] bg-zinc-950/80">
          <div className="absolute inset-0 atmo-glow atmo-glow-emerald opacity-40 mix-blend-screen" />
          <h2 className="text-4xl sm:text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Ready to scale bookings?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Join thousands of service businesses who have automated their scheduling and front desk workflows.
          </p>
          <button 
            onClick={openSignup}
            data-magnetic
            className="bg-emerald-500 text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-emerald-400 transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] relative z-10 premium-glow premium-glow-hover flex items-center gap-2 mx-auto"
          >
            Start Your Free Trial <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
}
