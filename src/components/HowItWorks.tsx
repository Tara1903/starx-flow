import React from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, Settings, Zap } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      title: "Connect Your Calendars",
      desc: "Sync Google Calendar, Outlook, and your POS systems in just two clicks. Keep your staff availability synchronized in real-time.",
    },
    {
      number: "02",
      icon: <Settings className="w-6 h-6 text-emerald-400" />,
      title: "Configure Services",
      desc: "Input your service menus, pricing, team rosters, and common questions. Our AI trains on your exact operational rules in under 5 minutes.",
    },
    {
      number: "03",
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Activate AI Receptionist",
      desc: "Launch your custom 24/7 WhatsApp AI receptionist. Instantly capture incoming leads, schedule appointments, and follow up.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 bg-black border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
            <Sparkles size={10} className="text-emerald-400" />
            Onboarding Setup
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-white">
            Launch in under <span className="text-gradient-silver">10 minutes.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl font-medium leading-relaxed">
            You don't need an engineering team to automate your front desk. We've built an operational workflow that integrates directly into your day-to-day.
          </p>
        </motion.div>

        <div className="relative">
          {/* Subtle connecting line */}
          <div className="absolute top-[32px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Large Number Background */}
                <div className="text-[120px] leading-none font-bold text-white/5 absolute -top-12 left-1/2 -translate-x-1/2 select-none pointer-events-none group-hover:text-white/10 transition-colors duration-500">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                  {step.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed relative z-10 font-medium max-w-[280px] mx-auto text-sm">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
