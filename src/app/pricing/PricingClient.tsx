"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Check,
  Plus,
  Minus,
  ArrowRight,
  Calculator,
  Hourglass,
  DollarSign,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlassButton } from "../../components/ui/GlassButton";
import { ScrollReveal } from "../../components/ui/ScrollReveal";

export function PricingClient() {
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  const [ticketValue, setTicketValue] = useState<number>(80);
  const [missedLeads, setMissedLeads] = useState<number>(20);

  const bookingSuccessRate = 0.75;
  const revenueRecovered = Math.round(ticketValue * missedLeads * bookingSuccessRate);
  const hoursReclaimed = Math.round(missedLeads * 1.5);

  const plans = [
    {
      name: "Starter",
      price: "$29",
      desc: "Ideal for solo wellness, coaching, or beauty practitioners.",
      features: [
        "1 WhatsApp AI Receptionist",
        "Up to 150 bookings/month",
        "Google Calendar & Outlook Sync",
        "Standard WhatsApp intake forms",
        "Basic CRM dashboards",
        "Email support",
      ],
    },
    {
      name: "Growth",
      price: "$59",
      desc: "Best for established gyms, clinics, and multi-staff salons/spas.",
      features: [
        "3 WhatsApp AI Receptionists",
        "Unlimited bookings/month",
        "Square & Clover POS syncs",
        "Google Review Booster automation",
        "Staff calendar utilization logs",
        "Priority email support",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      desc: "Best for local franchises and multi-location service groups.",
      features: [
        "Unlimited AI Receptionists",
        "Multi-location routing rules",
        "Dedicated WhatsApp numbers",
        "Custom database CRM integrations",
        "White-label calendar widgets",
        "24/7 dedicated manager support",
      ],
    },
  ];

  const faqs = [
    {
      q: "Do you charge a fee per booking?",
      a: "No. Unlike marketplace schedulers that charge fees or commissions per client booked, we charge a simple flat monthly subscription. You keep 100% of your service revenue.",
    },
    {
      q: "Can I connect my existing scheduling systems?",
      a: "Yes. StarX Flow syncs two-way with Square, Clover, Google Calendar, and Outlook, ensuring your staff availability is perfectly coordinated without double bookings.",
    },
    {
      q: "How does the WhatsApp AI Assistant book clients?",
      a: "Clients message your WhatsApp business number. The AI naturally checks availability, locks in the slot, collects intake details, and registers them directly in your calendar.",
    },
    {
      q: "Do I need technical skills to set it up?",
      a: "Not at all. You can easily enter your services, roster, and FAQs into our dashboard. The AI receptionist is fully configured and ready in under 10 minutes.",
    },
    {
      q: "How does the Google Review Booster work?",
      a: "Once an appointment is completed on your calendar, StarX Flow automatically follows up with the client over WhatsApp to ask for feedback, directing happy clients straight to your Google Business profile.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 px-4 sm:px-6 min-h-screen relative overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-300 uppercase mb-6">
            Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.06]">
            Flat subscriptions.{" "}
            <span className="block text-gradient-green">
              No booking commissions.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
            Choose a plan that matches your booking volume. Save time, recover missed calls, and run a modern front desk.
          </p>
        </ScrollReveal>

        {/* Interactive ROI Calculator Block */}
        <ScrollReveal direction="up" delay={0.1}>
          <GlassCard
            variant="premium"
            className="max-w-4xl mx-auto p-6 sm:p-8 md:p-12 mb-20 relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Calculator size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Lead &amp; Time Recovery ROI Calculator
                </h2>
                <p className="text-zinc-400 text-sm font-medium mt-0.5">
                  Estimate how much revenue and admin time StarX Flow will reclaim for you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
              {/* Left Sliders */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-zinc-300 uppercase tracking-wider text-xs">
                      Average Session Value
                    </span>
                    <span className="text-emerald-300 bg-emerald-500/12 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                      ${ticketValue}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    aria-label="Average Session Value"
                    value={ticketValue}
                    onChange={(e) => setTicketValue(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                    <span>$30</span>
                    <span>$150</span>
                    <span>$300</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-zinc-300 uppercase tracking-wider text-xs">
                      Est. Missed Calls / Month
                    </span>
                    <span className="text-emerald-300 bg-emerald-500/12 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                      {missedLeads} inquiries
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    aria-label="Estimated Missed Calls per Month"
                    value={missedLeads}
                    onChange={(e) => setMissedLeads(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-semibold">
                    <span>5 leads</span>
                    <span>50 leads</span>
                    <span>100 leads</span>
                  </div>
                </div>
              </div>

              {/* Right Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/30 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider">
                      Est. Monthly Recovery
                    </p>
                    <div className="text-emerald-400 bg-emerald-500/15 p-2 rounded-xl flex-shrink-0">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold text-emerald-400 tracking-tight tabular-nums mb-2">
                    ${revenueRecovered.toLocaleString()}
                  </p>
                  <span className="text-xs text-emerald-300/80 font-medium leading-relaxed">
                    Conservative 75% capture rate via WhatsApp AI assistant.
                  </span>
                </div>

                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider">
                      Staff Hours Saved
                    </p>
                    <div className="text-zinc-300 bg-white/[0.06] p-2 rounded-xl flex-shrink-0">
                      <Hourglass size={18} />
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold text-white tracking-tight tabular-nums mb-2">
                    {hoursReclaimed} hrs
                  </p>
                  <span className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Saves 1.5 hours of reminders &amp; callbacks per lead.
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-6xl mx-auto mb-28 items-stretch">
          {plans.map((plan, idx) => (
            <ScrollReveal key={plan.name} direction="up" delay={idx * 0.08}>
              <GlassCard
                variant={plan.popular ? "focal" : "premium"}
                sheen={Boolean(plan.popular)}
                hover
                glow={Boolean(plan.popular)}
                className={`relative p-8 md:p-9 h-full flex flex-col ${
                  plan.popular
                    ? "border-emerald-500/50 md:scale-[1.03] z-10"
                    : "border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex w-fit mb-4 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-[#02120c] text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    Most Popular
                  </div>
                )}

                <div className="mb-7">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium mb-6 min-h-[40px] leading-relaxed">
                    {plan.desc}
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-zinc-400 font-medium mb-1">/month</span>
                  </div>
                  <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    Billed monthly • Zero commissions
                  </p>
                </div>

                <div className="flex-1 space-y-3.5 mb-9">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                        <Check size={12} className="text-emerald-400" />
                      </div>
                      <span className="text-zinc-200 font-medium text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <GlassButton
                  size="lg"
                  variant={plan.popular ? "primary" : "secondary"}
                  magnetic={Boolean(plan.popular)}
                  onClick={openSignup}
                  className="w-full"
                >
                  Start 14-Day Trial
                </GlassButton>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Frequently asked questions
            </h2>
            <p className="text-zinc-400 font-medium text-base sm:text-lg">
              Everything you need to know about the product and calendar setups.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className="glass-card-obsidian border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-emerald-500/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                >
                  <span className="text-white font-semibold text-base sm:text-lg">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0 transition-colors ${
                      openFaq === i
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <GlassCard
          variant="focal"
          glow
          sheen
          className="max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-8"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Still have questions?
          </h2>
          <p className="text-lg text-zinc-300 mb-9 max-w-2xl mx-auto leading-relaxed font-medium">
            Need to double-check custom calendar flows or complex vertical configurations? Get in touch with our solutions engineers.
          </p>
          <GlassButton size="lg" variant="primary" magnetic onClick={openSignup}>
            Get in touch
            <ArrowRight size={18} />
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}
