import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Plus, Minus, ArrowRight } from "lucide-react";
import { useSignup } from "../App";

export default function Pricing() {
  const { openSignup } = useSignup();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: "Starter",
      price: "€29",
      desc: "For local businesses starting out.",
      features: [
        "Storefront builder",
        "Up to 100 orders/month",
        "WhatsApp integration",
        "Basic reporting",
        "Standard support",
      ],
    },
    {
      name: "Growth",
      price: "€59",
      desc: "For scaling delivery operations.",
      features: [
        "Advanced analytics & dashboards",
        "Unlimited orders",
        "Customer database & CRM",
        "Marketing automations",
        "Priority email support",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: "€99",
      desc: "For enterprise level control.",
      features: [
        "Full system API access",
        "Custom domain & white-label",
        "Multi-location support",
        "Dedicated account manager",
        "24/7 Priority support",
      ],
    },
  ];

  const faqs = [
    {
      q: "Do you charge a commission per order?",
      a: "No. Unlike aggregators that take 20-30% of every order, we charge a flat monthly fee. You keep 100% of your revenue.",
    },
    {
      q: "Can I use my own domain name?",
      a: "Yes, custom domains are available on the Pro plan. On Starter and Growth, you receive a customizable starxflow.com subdomain.",
    },
    {
      q: "How does the WhatsApp integration work?",
      a: "Customers can order directly via a WhatsApp chat interface, and statuses are automatically updated and sent to their WhatsApp. No app download required.",
    },
    {
      q: "Can I cancel at any time?",
      a: "Yes, there are no long-term contracts. You can cancel your subscription at any time without penalty.",
    },
    {
      q: "Do I need to hire a developer?",
      a: "Not at all. StarX Flow is fully no-code. You can set up your storefront, manage products, and dispatch orders from our intuitive dashboard.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 px-6 min-h-screen relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
          >
            Transparent Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Simple, honest <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
              pricing for everyone.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium"
          >
            Stop paying 30% to delivery apps. Pay a flat monthly fee and keep
            100% of your profits.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className={`relative p-8 md:p-10 rounded-3xl border ${plan.popular ? "bg-[#0c0c0c] border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)] scale-100 md:scale-105 z-20" : "bg-[#0c0c0c] border-white/5 z-10 opacity-80 hover:opacity-100 transition-opacity"} flex flex-col backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 font-medium mb-1">/month</span>
                </div>
                <p className="text-emerald-400 text-xs font-medium">
                  Billed annually
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 font-medium text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={openSignup}
                className={`w-full py-4 rounded-full font-bold transition-all ${plan.popular ? "bg-emerald-500 text-black hover:bg-emerald-400 focus:ring-4 focus:ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/5 text-white hover:bg-white/10"}`}
              >
                Start 14-Day Trial
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison (Optional for larger impact) */}

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-zinc-400">
              Everything you need to know about the product and billing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-white font-medium text-lg">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-300 ${openFaq === i ? "rotate-180 bg-white/5" : "bg-transparent"}`}
                  >
                    {openFaq === i ? (
                      <Minus size={16} className="text-white" />
                    ) : (
                      <Plus size={16} className="text-white" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-zinc-400 leading-relaxed">
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
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-[#0A0A0A] border border-white/10 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Still have questions?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Can't find the answer you're looking for? Please chat to our
            friendly team.
          </p>
          <button className="bg-white/10 border border-white/10 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white hover:text-black transition-all relative z-10 inline-flex items-center gap-2">
            Get in touch <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
