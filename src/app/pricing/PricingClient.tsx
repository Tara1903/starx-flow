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
import { ScrollReveal } from "../../components/ui/ScrollReveal";
import { CANONICAL_PLANS } from "@/lib/plans";

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
      name: CANONICAL_PLANS.starter.name,
      price: `$${CANONICAL_PLANS.starter.price}`,
      desc: CANONICAL_PLANS.starter.description,
      features: CANONICAL_PLANS.starter.features,
    },
    {
      name: CANONICAL_PLANS.growth.name,
      price: `$${CANONICAL_PLANS.growth.price}`,
      desc: CANONICAL_PLANS.growth.description,
      features: CANONICAL_PLANS.growth.features,
      popular: true,
    },
    {
      name: CANONICAL_PLANS.pro.name,
      price: `$${CANONICAL_PLANS.pro.price}`,
      desc: CANONICAL_PLANS.pro.description,
      features: CANONICAL_PLANS.pro.features,
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
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-28 px-4 sm:px-6 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Emerald Ambient Glows */}
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center max-w-4xl mx-auto mb-14 lg:mb-18">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Transparent Subscriptions
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white mb-6 leading-[1.08]">
            Flat subscriptions.{" "}
            <span className="block text-zinc-100">
              No booking commissions.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Choose a plan that matches your booking volume. Save time, recover missed calls, and run a modern autonomous front desk.
          </p>
        </ScrollReveal>

        {/* Interactive ROI Calculator Block */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="glass-panel max-w-4xl mx-auto p-6 sm:p-8 md:p-12 mb-20 relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-white/[0.08] flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Calculator size={22} />
              </div>
              <div>
                <h2 className="font-editorial text-2xl font-normal text-white tracking-tight">
                  Lead &amp; Time Recovery Calculator
                </h2>
                <p className="text-zinc-400 text-sm font-normal mt-0.5">
                  Estimate how much revenue and admin time StarX Flow will reclaim for you each month.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
              {/* Left Sliders */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between font-normal text-sm">
                    <span className="text-zinc-400 text-xs font-mono">
                      Average Ticket Value
                    </span>
                    <span className="text-emerald-300 bg-[#061911] border border-white/[0.08] px-3 py-1 rounded-full text-xs font-mono">
                      ${ticketValue}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    aria-label="Average Ticket Value"
                    value={ticketValue}
                    onChange={(e) => setTicketValue(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-950/60 border border-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-[#28dfa0]"
                  />
                  <div className="flex justify-between text-xs text-emerald-200/50 font-mono">
                    <span>$30</span>
                    <span>$150</span>
                    <span>$300</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between font-normal text-sm">
                    <span className="text-zinc-400 text-xs font-mono">
                      Est. Missed Calls / Month
                    </span>
                    <span className="text-emerald-300 bg-[#061911] border border-white/[0.08] px-3 py-1 rounded-full text-xs font-mono">
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
                    className="w-full h-2 bg-emerald-950/60 border border-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-[#28dfa0]"
                  />
                  <div className="flex justify-between text-xs text-emerald-200/50 font-mono">
                    <span>5 leads</span>
                    <span>50 leads</span>
                    <span>100 leads</span>
                  </div>
                </div>
              </div>

              {/* Right Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                <div className="rounded-2xl bg-[#061911] border border-white/[0.08] p-6 flex flex-col justify-between shadow-lg">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs text-emerald-400 font-mono">
                      Est. Monthly Recovery
                    </p>
                    <div className="text-emerald-300 bg-emerald-500/10 p-2 rounded-xl flex-shrink-0">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="text-4xl font-normal text-[#8fffd0] tracking-tight tabular-nums mb-2 font-mono">
                    ${revenueRecovered.toLocaleString()}
                  </p>
                  <span className="text-xs text-zinc-400 font-normal leading-relaxed">
                    Conservative 75% capture rate via WhatsApp AI assistant.
                  </span>
                </div>

                <div className="rounded-2xl bg-[#061a12]/60 border border-white/[0.06] p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-xs text-zinc-400 font-mono">
                      Staff Hours Saved
                    </p>
                    <div className="text-zinc-300 bg-white/5 p-2 rounded-xl flex-shrink-0">
                      <Hourglass size={18} />
                    </div>
                  </div>
                  <p className="text-4xl font-normal text-white tracking-tight tabular-nums mb-2 font-mono">
                    {hoursReclaimed} hrs
                  </p>
                  <span className="text-xs text-zinc-400 font-normal leading-relaxed">
                    Saves 1.5 hours of manual reminders &amp; callbacks per lead.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-6xl mx-auto mb-28 items-stretch">
          {plans.map((plan, idx) => (
            <ScrollReveal key={plan.name} direction="up" delay={idx * 0.08}>
              <div
                className={`glass-panel glass-panel-hover relative p-8 md:p-9 h-full flex flex-col ${
                  plan.popular
                    ? "border-emerald-400/40 shadow-2xl md:scale-[1.02] z-10"
                    : "border-white/[0.08]"
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex w-fit mb-4 px-3 py-1 rounded-full bg-emerald-400 text-[#041f13] text-xs font-medium shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="mb-7">
                  <h3 className="font-editorial text-2xl font-normal text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm font-normal mb-6 min-h-[40px] leading-relaxed">
                    {plan.desc}
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className="text-5xl font-light tracking-tight text-white font-mono">
                      {plan.price}
                    </span>
                    <span className="text-zinc-400 font-normal mb-1">/month</span>
                  </div>
                  <p className="text-emerald-400 text-xs font-mono">
                    Billed monthly • Zero commissions
                  </p>
                </div>

                <div className="flex-1 space-y-3.5 mb-9">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/30">
                        <Check size={12} className="text-emerald-300" />
                      </div>
                      <span className="text-emerald-100/90 font-normal text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.popular ? (
                  <button
                    type="button"
                    onClick={openSignup}
                    className="spatial-btn-primary w-full"
                  >
                    Start 14-Day Free Trial
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openSignup}
                    className="spatial-btn-secondary w-full"
                  >
                    Start 14-Day Free Trial
                  </button>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-white mb-3">
              Frequently asked questions
            </h2>
            <p className="text-[#b8c9bd] font-normal text-base sm:text-lg">
              Everything you need to know about subscriptions, calendars, and setup.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className="glass-panel overflow-hidden transition-colors hover:border-emerald-400/40"
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
                    className={`w-8 h-8 rounded-full border border-emerald-400/25 flex items-center justify-center flex-shrink-0 transition-colors ${
                      openFaq === i
                        ? "bg-emerald-500/25 border-emerald-400/50 text-emerald-200"
                        : "bg-[#061a12] text-[#b8c9bd]"
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
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#b8c9bd] text-sm sm:text-base leading-relaxed font-normal">
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
        <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-8 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Still have questions?
          </h2>
          <p className="text-lg text-[#b8c9bd] mb-9 max-w-2xl mx-auto leading-relaxed font-normal">
            Need to double-check custom calendar flows or complex vertical configurations? Get in touch with our solutions engineers.
          </p>
          <button
            type="button"
            onClick={openSignup}
            className="spatial-btn-primary"
          >
            Get in touch with an engineer
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
