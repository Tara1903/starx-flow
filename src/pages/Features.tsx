import React from "react";
import { motion } from "motion/react";
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
  ArrowRight
} from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Features() {
  const openSignup = useUIStore((state) => state.openSignup);

  const mainFeatures = [
    {
      icon: <MessageSquare className="text-emerald-400" size={32} />,
      title: "24/7 WhatsApp AI Assistant",
      desc: "Let clients message naturally on WhatsApp to book slots, reschedule appointments, and ask FAQs. Zero front desk delays, zero manual calls.",
      points: [
        "Replies instantly (under 2 seconds) in multiple languages.",
        "Synchronizes automatically with multiple team members.",
        "Collects intake details natively inside the chat flow.",
      ],
      image: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
    {
      icon: <RefreshCw className="text-emerald-400" size={32} />,
      title: "Multi-Calendar Sync Infrastructure",
      desc: "A single scheduler synced in real-time across Clover, Square POS, Google Calendars, and Outlook rosters. Safe against double bookings.",
      points: [
        "Matches appointments with specific staff capacity.",
        "Sends instant calendar invites and email receipts.",
        "Handles easy 1-click scheduling updates natively.",
      ],
      image: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
    {
      icon: <Users className="text-emerald-400" size={32} />,
      title: "Direct CRM & Customer Ownership",
      desc: "Own your client list, booking records, session history tags, and review statistics without aggregator fees or middleman commissions.",
      points: [
        "Maintains deep profile cards and custom intake waivers.",
        "Tracks client booking frequency and no-show flags.",
        "Triggers targeted follow-ups to recover inactive clients.",
      ],
      image: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
  ];

  const subFeatures = [
    {
      icon: <Star />,
      title: "Google Review Booster",
      desc: "Automatically message happy clients post-session to request 5-star ratings and scale reviews.",
    },
    {
      icon: <ClipboardCheck />,
      title: "WhatsApp Intake Forms",
      desc: "Send digital waiver links, health questionnaires, and gym registration forms automatically prior to visits.",
    },
    {
      icon: <CreditCard />,
      title: "Secure Deposits",
      desc: "Collect secure slot deposits, session retainers, and package invoices over WhatsApp.",
    },
    {
      icon: <Sliders />,
      title: "Multi-Staff Rostering",
      desc: "Assign and balance shifts across dozens of trainers, therapists, dentists, or stylists.",
    },
    {
      icon: <ShieldAlert />,
      title: "HIPAA-Compliant Security",
      desc: "Rest assured that all patient information and digital waivers are fully secure.",
    },
    {
      icon: <Smartphone />,
      title: "Responsive Admin Hub",
      desc: "Review bookings, message feeds, and staff schedules on iPhone, Android, and Desktop.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[1000px] h-[1000px] atmo-glow atmo-glow-emerald opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
          >
            Capabilities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Everything you need to <br className="hidden md:block" />
            <span className="text-gradient-silver">
              automate & scale.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium"
          >
            From WhatsApp AI intake assistants to advanced calendar configurations, StarX Flow gives you enterprise-grade merchant infrastructure out of the box.
          </motion.p>
        </div>

        {/* Hero Feature Showcase */}
        <div className="mb-32">
          {mainFeatures.map((feature, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${idx % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16 mb-24 last:mb-0`}
            >
              <div className="w-full lg:w-1/2">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8 font-medium">
                  {feature.desc}
                </p>
                <ul className="space-y-4 font-semibold text-sm">
                  {feature.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-zinc-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="w-full lg:w-1/2">
                <div
                  className="aspect-square md:aspect-[4/3] w-full rounded-[2rem] glass-hero glass-inner-sheen glass-edge-light relative overflow-hidden"
                  style={{
                    background: feature.image,
                  }}
                >
                  {/* Abstract Mockup inside the box */}
                  <div className="absolute inset-4 lg:inset-8 border border-white/5 bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-black/40">
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-4 opacity-50">
                      <div className="w-1/2 h-6 bg-white/5 rounded-md" />
                      <div className="w-full h-32 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full mix-blend-screen" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 h-20 bg-white/5 rounded-xl" />
                        <div className="flex-1 h-20 bg-white/5 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              More out of the box
            </h2>
            <p className="text-zinc-400 font-medium">
              Enterprise features standard on all growth plans.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="glass-card p-8 rounded-3xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-emerald-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto glass-panel border border-emerald-500/20 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-[0_20px_80px_-20px_rgba(16,185,129,0.3)] bg-zinc-950/80 mb-12">
          <div className="absolute inset-0 atmo-glow atmo-glow-emerald opacity-40 mix-blend-screen" />
          <h2 className="text-4xl sm:text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Put operations on autopilot
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Unlock all the tools you need to build direct client channels and accelerate your clinic, gym, or salon capacity.
          </p>
          <button 
            onClick={openSignup}
            data-magnetic
            className="bg-emerald-500 text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-emerald-400 transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] relative z-10 premium-glow premium-glow-hover flex items-center gap-2 mx-auto group"
          >
            Start Your Free Trial{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
