import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Plus, Minus, ArrowRight, Calculator, Hourglass, DollarSign } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Pricing() {
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI Calculator State
  const [ticketValue, setTicketValue] = useState<number>(80);
  const [missedLeads, setMissedLeads] = useState<number>(20);

  // Calculations
  const bookingSuccessRate = 0.75; // 75% capture rate of missed calls/texts via WhatsApp AI
  const revenueRecovered = Math.round(ticketValue * missedLeads * bookingSuccessRate);
  const hoursReclaimed = Math.round(missedLeads * 1.5); // 1.5 hours of intake form management + reminders + callbacks saved per lead

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
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 px-6 min-h-screen relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] atmo-glow atmo-glow-emerald opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
          >
            Transparent Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Flat subscriptions. <br className="hidden md:block" />
            <span className="text-gradient-silver">
              No booking commissions.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium"
          >
            Choose a plan that matches your booking volume. Save time, recover missed calls, and run a modern front desk.
          </motion.p>
        </div>

        {/* Interactive ROI Calculator Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 md:p-12 border border-white/10 backdrop-blur-md mb-20 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[inset_0_1px_0_rgba(16,185,129,0.3)]">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Lead & Time Recovery ROI Calculator</h3>
              <p className="text-zinc-400 text-sm font-medium mt-1">Estimate how much revenue and admin time StarX Flow will reclaim for you.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Inputs */}
            <div className="space-y-10">
              {/* Average Ticket Slider */}
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-zinc-400 uppercase tracking-wider">Average Session Value</span>
                  <span className="text-white bg-white/10 px-3 py-1 rounded-full">${ticketValue}</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="300" 
                  step="5" 
                  value={ticketValue}
                  onChange={(e) => setTicketValue(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-bold">
                  <span>$30</span>
                  <span>$150</span>
                  <span>$300</span>
                </div>
              </div>

              {/* Missed Leads Slider */}
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-zinc-400 uppercase tracking-wider">Est. Missed Calls / Month</span>
                  <span className="text-white bg-white/10 px-3 py-1 rounded-full">{missedLeads} inquiries</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5" 
                  value={missedLeads}
                  onChange={(e) => setMissedLeads(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-bold">
                  <span>5 leads</span>
                  <span>50 leads</span>
                  <span>100 leads</span>
                </div>
              </div>
            </div>

            {/* Right Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              <div className="glass-focus border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-3 right-3 text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
                  <DollarSign size={18} />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3">Est. Monthly Recovery</p>
                <p className="text-4xl font-extrabold text-emerald-400 tracking-tight mb-3">${revenueRecovered.toLocaleString()}</p>
                <span className="text-xs text-emerald-500/80 font-medium leading-relaxed">Conservative 75% capture rate via WhatsApp AI assistant.</span>
              </div>

              <div className="glass-focus p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-3 right-3 text-zinc-400 bg-white/5 p-2 rounded-xl">
                  <Hourglass size={18} />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3">Staff Hours Saved</p>
                <p className="text-4xl font-extrabold text-white tracking-tight mb-3">{hoursReclaimed} hrs</p>
                <span className="text-xs text-zinc-500 font-medium leading-relaxed">Saves 1.5 hours of reminders & callbacks per lead.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32 items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className={`relative p-8 md:p-10 rounded-[2rem] border ${plan.popular ? "glass-hero border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.25)] scale-100 lg:scale-105 z-20 bg-zinc-950/90" : "glass-card border-white/10 z-10 opacity-80 hover:opacity-100 transition-opacity"} flex flex-col backdrop-blur-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] whitespace-nowrap">
                  Most Popular
                </div>
              )}
              {plan.popular && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none rounded-[2rem]" />
              )}

              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-zinc-400 text-xs font-medium mb-6 min-h-[40px] leading-relaxed">
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-bold tracking-tight text-white font-sans">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 font-medium mb-1">/month</span>
                </div>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Billed monthly
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-10 relative z-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                      <Check size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 font-medium text-sm leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={openSignup}
                data-magnetic={plan.popular ? "true" : undefined}
                className={`w-full py-4 rounded-full font-bold text-sm transition-all relative z-10 ${plan.popular ? "bg-emerald-500 text-black hover:bg-emerald-400 focus:ring-4 focus:ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] premium-glow premium-glow-hover" : "glass-card text-white hover:bg-white/10"}`}
              >
                Start 14-Day Trial
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-zinc-400 font-medium text-lg">
              Everything you need to know about the product and calendar setups.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card border border-white/5 rounded-2xl overflow-hidden transition-colors hover:bg-white/5"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-white font-bold text-lg">
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-300 ${openFaq === i ? "rotate-180 bg-white/10" : "bg-transparent"}`}
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
                      <div className="p-6 pt-0 text-zinc-400 text-base leading-relaxed font-medium">
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
        <div className="max-w-5xl mx-auto glass-panel border border-emerald-500/20 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-[0_20px_80px_-20px_rgba(16,185,129,0.2)] bg-zinc-950/80 mb-12">
          <div className="absolute inset-0 atmo-glow atmo-glow-emerald opacity-30 mix-blend-screen" />
          <h2 className="text-4xl sm:text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Still have questions?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Need to double-check custom calendar flows or complex vertical configurations? Get in touch with our solutions engineers.
          </p>
          <button 
            onClick={openSignup}
            data-magnetic
            className="glass-panel text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white/10 transition-all relative z-10 inline-flex items-center gap-2 group"
          >
            Get in touch <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
