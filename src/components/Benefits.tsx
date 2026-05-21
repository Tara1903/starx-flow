import React from "react";
import { motion } from "motion/react";
import { 
  CalendarDays, ShieldCheck, Star, 
  RefreshCw, ClipboardList, Database, HeartHandshake
} from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: <CalendarDays className="w-6 h-6 text-emerald-400" />,
      title: "24/7 WhatsApp Bookings",
      desc: "Enable clients to schedule, reschedule, or cancel slots late at night when your front desk is closed.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "No-Show Prevention",
      desc: "Auto-send smart confirmation invites and 24-hour reminders directly over WhatsApp to secure bookings.",
    },
    {
      icon: <Star className="w-6 h-6 text-emerald-400" />,
      title: "Google Review Booster",
      desc: "Automatically follow up with clients post-session to request 5-star reviews and increase search rankings.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      title: "Staff Calendar Sync",
      desc: "Real-time, two-way sync with Google Calendar, Outlook, Square, and Clover across all staff members.",
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-emerald-400" />,
      title: "WhatsApp Intake Forms",
      desc: "Deliver digital waiver links, health questionnaires, and gym registration forms automatically prior to visits.",
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "Unified Service CRM",
      desc: "Aggregate client session histories, staff notes, and scheduling labels in a beautiful unified dashboard.",
    },
  ];

  return (
    <section id="metrics" className="py-24 lg:py-32 px-6 relative z-10 bg-black/20 overflow-hidden">
      {/* Background mesh glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="atmo-glow atmo-glow-emerald w-[800px] h-[800px] top-1/4 -left-[20%] opacity-30" />
        <div className="atmo-glow atmo-glow-soft w-[600px] h-[600px] bottom-1/4 -right-[10%] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
            <HeartHandshake size={10} className="text-emerald-400" />
            Core Capabilities
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
            Engineered for <span className="text-gradient-silver">Operational Excellence.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Stop losing leads to manual administration. Let AI and native automation scale your booking capacity and drive repeat visits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl group cursor-pointer"
            >
              <div className="w-12 h-12 surface-primary border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                {b.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">{b.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm font-medium">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
