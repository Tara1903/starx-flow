import React from "react";
import { motion } from "motion/react";

export function Problem() {
  const painPoints = [
    {
      title: "Missed Bookings",
      desc: "Over 62% of calls to local businesses go unanswered during busy hours or after-hours, leading directly to lost clients."
    },
    {
      title: "Juggling Admin Tasks",
      desc: "Manually managing booking links, reminder texts, calendar syncs, and intake forms wastes hours of high-value staff time."
    },
    {
      title: "Leaked Leads",
      desc: "No automated follow-ups to convert class trial signups, rescue no-shows, or consistently gather 5-star Google reviews."
    }
  ];

  return (
    <section id="platform" className="py-24 lg:py-32 px-6 relative z-10 bg-black overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="atmo-glow atmo-glow-soft w-[600px] h-[600px] top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Pain Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 text-white leading-[1.1]">
              Your front desk <br className="hidden md:block" />
              <span className="text-gradient-silver">is leaking revenue.</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-16 max-w-xl font-medium">
              When you are treating a patient, teaching a class, or styling hair, unanswered calls and late text replies go straight to your competitors.
            </p>

            <div className="space-y-12">
              {painPoints.map((item, i) => (
                <div key={i} className="flex gap-8 items-start group">
                  <div className="text-2xl font-light text-zinc-700 group-hover:text-zinc-400 transition-colors duration-500 font-serif">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-xl tracking-tight mb-2">
                      {item.title}
                    </h4>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-md">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Single Large Statistic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative"
          >
            <div className="glass-panel p-12 md:p-16 rounded-[2rem] flex flex-col items-center justify-center text-center relative overflow-hidden group border border-zinc-800 bg-zinc-900/20">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <h3 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter mb-6 text-gradient-subtle">
                  $48,590
                </h3>
                <div className="w-12 h-1 bg-zinc-800 mx-auto mb-8 rounded-full" />
                <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
                  Average annual revenue lost to missed calls and no-shows
                </p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
