"use client";
import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ShieldCheck, CalendarCheck, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";

export function Testimonials() {
  const commitments = [
    {
      title: "Zero Double-Booking Guarantee",
      badge: "Concurrency Locked",
      icon: <CalendarCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Real-time two-way synchronization with Google Calendar and Microsoft Outlook, reinforced with PostgreSQL exclusion constraint locks at the database engine level to mathematically prevent overlapping slot bookings.",
      actionLabel: "View Calendar Architecture",
      actionHref: "/how-it-works",
      margin: "mt-0",
    },
    {
      title: "100% Direct Client Ownership",
      badge: "Zero Marketplace Lock-in",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      content:
        "Unlike marketplace directories that pool your clients into public aggregators and cross-sell competitors, StarX-Flow stores your contacts, conversations, and appointments in your private tenant database with Row Level Security.",
      actionLabel: "View Security Architecture",
      actionHref: "/security",
      margin: "lg:mt-8",
    },
    {
      title: "Predictable Flat-Rate Pricing",
      badge: "0% Commission Deductions",
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      content:
        "StarX-Flow charges a flat monthly software subscription ($29 to $99/mo) with no per-booking fees or hidden percentages. When your clinic, gym, or salon grows, your software bill remains flat and predictable.",
      actionLabel: "View Transparent Pricing",
      actionHref: "/pricing",
      margin: "lg:mt-16",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 relative z-10 bg-black/40 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Platform Guarantees
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-white leading-tight">
            Engineered for trust. <br />
            <span className="text-gradient-silver">Built for operational independence.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-medium">
            Independent service businesses depend on precision booking and client trust. Here are the core technical guarantees built into StarX-Flow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {commitments.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className={`glass-card p-8 rounded-3xl flex flex-col justify-between ${c.margin} relative border border-white/10`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    {c.icon}
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                    {c.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-base text-zinc-300 font-normal leading-relaxed mb-8">
                  {c.content}
                </p>
              </div>

              <div className="border-t border-white/5 pt-6 mt-auto">
                <Link
                  href={c.actionHref}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <span>{c.actionLabel}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
