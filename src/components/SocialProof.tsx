import React from "react";
import { motion } from "motion/react";

export function SocialProof() {
  const metrics = [
    "10M+ bookings",
    "8,500+ businesses",
    "98.6% AI accuracy",
    "<2s response time"
  ];

  return (
    <section className="py-16 relative z-20 overflow-hidden border-y border-white/5 surface-primary">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center relative z-10">
        <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
          Trusted by 3,000+ local gyms, clinics, salons, and coaching centers
        </p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative flex overflow-hidden group mb-16">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap gap-20 items-center px-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-2xl tracking-tight text-zinc-300 font-bold uppercase">Ironwood Fitness</span>
              <span className="text-2xl tracking-tighter text-zinc-400 font-serif italic">Apex Chiropractic</span>
              <span className="text-2xl tracking-widest text-zinc-300 font-light uppercase">Aura Salon & Spa</span>
              <span className="text-2xl tracking-tight text-zinc-400 font-bold uppercase">Summit Coaching</span>
              <span className="text-2xl tracking-widest text-zinc-300 font-medium italic uppercase">Zenith Spas</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Metric Strip */}
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {metrics.map((metric, i) => (
            <div 
              key={i} 
              className="glass-panel px-5 py-2.5 rounded-full flex items-center gap-3 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-sm font-medium text-zinc-300 tracking-wide">{metric}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
