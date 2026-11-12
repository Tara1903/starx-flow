"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ScrollReveal } from "./ui/ScrollReveal";
import { GlassCard } from "./ui/GlassCard";
import { MOTION_EASE, VIEWPORT_CONFIG } from "../lib/motionVariants";

export function Problem() {
  const prefersReduced = useReducedMotion();
  const painPoints = [
    {
      title: "Missed Bookings",
      desc: "Over 62% of calls to local businesses go unanswered during busy hours or after-hours, leading directly to lost clients.",
    },
    {
      title: "Juggling Admin Tasks",
      desc: "Manually managing booking links, reminder texts, calendar syncs, and intake forms wastes hours of high-value staff time.",
    },
    {
      title: "Leaked Leads",
      desc: "No automated follow-ups to convert class trial signups, rescue no-shows, or consistently gather 5-star Google reviews.",
    },
  ];

  return (
    <section
      id="platform"
      className="py-24 lg:py-32 px-6 relative z-10 bg-black overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] -translate-y-1/4 translate-x-1/4 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          {/* Left Side: Pain Points */}
          <ScrollReveal direction="up" className="lg:col-span-7">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-white leading-[1.08]">
              Your front desk{" "}
              <span className="block text-gradient-silver">
                is leaking revenue.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-12 max-w-xl font-medium">
              When you are treating a patient, teaching a class, or styling
              hair, unanswered calls and late text replies go straight to your
              competitors.
            </p>

            <div className="space-y-8">
              {painPoints.map((item, i) => (
                <motion.div
                  key={i}
                  initial={prefersReduced ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEWPORT_CONFIG}
                  transition={{ duration: 0.42, delay: i * 0.08, ease: MOTION_EASE.premium }}
                  className="flex gap-6 items-start group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-emerald-500/35 group-hover:bg-emerald-500/10 group-hover:scale-105 flex items-center justify-center text-sm font-bold text-emerald-400 transition-all duration-200 flex-shrink-0">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-xl tracking-tight mb-1.5 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-md">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Side: Hero Glass Metric */}
          <ScrollReveal direction="scale" delay={0.15} className="lg:col-span-5">
            <GlassCard
              variant="obsidian"
              glow
              className="p-10 md:p-14 text-center flex flex-col items-center justify-center"
            >
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
                Cost of Unanswered Inquiries
              </span>
              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter mb-5 tabular-nums">
                $48,590
              </h3>
              <motion.div
                initial={prefersReduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VIEWPORT_CONFIG}
                transition={{ duration: 0.5, delay: 0.2, ease: MOTION_EASE.premium }}
                className="w-12 h-1 bg-gradient-to-r from-emerald-500/80 to-teal-400/60 mx-auto mb-6 rounded-full origin-center"
              />
              <p className="text-zinc-300 text-base sm:text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
                Average annual revenue lost to missed calls and unfollowed
                no-shows
              </p>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
