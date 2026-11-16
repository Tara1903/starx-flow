"use client";

import React, { useState } from "react";
import { Check, ArrowRight, ShieldCheck, Zap, Sparkles, HelpCircle, ChevronDown } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { CANONICAL_PLANS } from "@/lib/plans";

export function LusionPricingSection() {
  const { openSignup } = useUIStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      id: "solo",
      name: CANONICAL_PLANS.starter.name,
      price: `$${CANONICAL_PLANS.starter.price}`,
      period: "/ month",
      desc: CANONICAL_PLANS.starter.description,
      features: CANONICAL_PLANS.starter.features,
      popular: false,
      btnId: "btn-plan-solo",
      planTag: "Starter Tier",
    },
    {
      id: "growth",
      name: CANONICAL_PLANS.growth.name,
      price: `$${CANONICAL_PLANS.growth.price}`,
      period: "/ month",
      desc: CANONICAL_PLANS.growth.description,
      features: CANONICAL_PLANS.growth.features,
      popular: true,
      btnId: "btn-plan-growth",
      planTag: "Most Popular",
    },
    {
      id: "pro",
      name: CANONICAL_PLANS.pro.name,
      price: `$${CANONICAL_PLANS.pro.price}`,
      period: "/ month",
      desc: CANONICAL_PLANS.pro.description,
      features: CANONICAL_PLANS.pro.features,
      popular: false,
      btnId: "btn-plan-pro",
      planTag: "Full Suite",
    },
  ];

  const faqs = [
    {
      q: "Do you take any commission or percentage of my booking revenue?",
      a: "Zero. Unlike booking marketplaces that take 15% to 30% of every appointment, StarX Flow charges a flat monthly software subscription. 100% of your service revenue and client deposits go directly to your Stripe account.",
    },
    {
      q: "How does the two-way calendar sync prevent double bookings?",
      a: "StarX Flow continuously synchronizes bidirectionally with Google Calendar, Apple iCloud, and Microsoft Outlook. When you or a team member blocks out personal time or adds an offline client, those slots are instantly locked and removed from available WhatsApp openings.",
    },
    {
      q: "Can I connect my existing WhatsApp Business number?",
      a: "Yes. You can connect your existing WhatsApp Business number or pair an official Meta WhatsApp Business Cloud API number in under 3 minutes via our guided pairing setup.",
    },
    {
      q: "What happens if a client asks an unusual question?",
      a: "StarX Flow is trained on your exact service menu, pricing, staff qualifications, and FAQs. If an inquiry exceeds its knowledge, it gracefully tags the message for human review and notifies your staff without making up answers.",
    },
    {
      q: "Can I cancel or upgrade my plan anytime?",
      a: "Yes. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel at any time directly in your account dashboard.",
    },
  ];

  return (
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-emerald-500/10">
      {/* Living Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-600/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
            Predictable & Transparent
          </div>
          <h2 className="font-lusion-display text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight">
            Simple Flat Pricing. <br />
            <span className="text-gradient-emerald font-normal">
              Zero Booking Commissions.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/70 font-normal leading-relaxed">
            All plans include full 24/7 autonomous WhatsApp receptionist capabilities, unlimited clients, two-way calendar synchronization, and a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div id="scene-pricing-comparison" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((p) => (
            <div
              key={p.id}
              id={`pricing-card-${p.id}`}
              className={`starx-glass-panel p-8 sm:p-10 flex flex-col justify-between relative transition-all duration-300 ${
                p.popular
                  ? "border-emerald-400/50 shadow-[0_0_35px_rgba(16,185,129,0.25)] bg-gradient-to-b from-[#09251a]/70 to-[#04130d]/90 md:-translate-y-2"
                  : "border-emerald-500/20 hover:border-emerald-500/40"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-400 text-black text-[11px] font-bold font-mono tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-black" />
                  <span>Recommended</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <span className="text-xs font-mono text-emerald-300/70">{p.planTag}</span>
                </div>

                <div className="mt-6 mb-4 flex items-baseline gap-1">
                  <span className="font-lusion-display text-5xl font-light text-white tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-xs font-mono text-emerald-200/60">{p.period}</span>
                </div>

                <p className="text-xs text-emerald-100/70 min-h-[36px] leading-relaxed">
                  {p.desc}
                </p>

                <div className="w-full h-px bg-emerald-500/15 my-6" />

                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase text-emerald-300/80 tracking-wider">
                    Included Capabilities:
                  </span>
                  <ul className="space-y-2.5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-emerald-100/85">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  id={p.btnId}
                  type="button"
                  onClick={() => openSignup()}
                  className={`w-full justify-center text-xs sm:text-sm ${
                    p.popular ? "starx-btn-primary" : "starx-btn-secondary"
                  }`}
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
                <div className="text-[10px] text-center font-mono text-emerald-200/50 mt-2.5">
                  No credit card required to start
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing FAQ Section */}
        <div id="scene-faq" className="max-w-3xl mx-auto pt-8 border-t border-emerald-500/10">
          <div className="text-center mb-10">
            <h3 className="font-lusion-display text-2xl sm:text-3xl text-white font-light">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/60 mt-1">
              Everything you need to know about billing, calendar synchronization, and onboarding.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="starx-glass-panel overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-medium text-white hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-emerald-100/75 leading-relaxed border-t border-emerald-500/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
