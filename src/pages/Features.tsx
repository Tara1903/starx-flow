import React from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  Database,
  MessageCircle,
  LineChart,
  Zap,
  Globe,
  Settings,
  Shield,
  Smartphone,
  RefreshCcw,
  Check,
  ArrowRight,
} from "lucide-react";

export default function Features() {
  const mainFeatures = [
    {
      icon: <ShoppingBag className="text-emerald-400" size={32} />,
      title: "Direct Ordering Experience",
      desc: "Let customers order directly from your own platform without routing through third-party marketplaces. Zero commissions attached, 100% white-labeled.",
      image:
        "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
    {
      icon: <Database className="text-emerald-400" size={32} />,
      title: "Customer Ownership",
      desc: "Keep all your customer data. Build relationships, track lifetime value, and run targeted marketing campaigns customized to user behavior.",
      image:
        "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
    {
      icon: <MessageCircle className="text-emerald-400" size={32} />,
      title: "Native Messaging",
      desc: "Communicate with customers where they already are. Send automated status updates via email, SMS, and WhatsApp natively.",
      image:
        "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 100%)",
    },
  ];

  const subFeatures = [
    {
      icon: <LineChart />,
      title: "Real-time Analytics",
      desc: "Track conversions, cart abandonment, and customer LTV.",
    },
    {
      icon: <Zap />,
      title: "Lightning Setup",
      desc: "Import your menu or catalog in 1-click via CSV or API.",
    },
    {
      icon: <Globe />,
      title: "Global Payments",
      desc: "Accept 135+ currencies, Apple Pay, and Google Pay.",
    },
    {
      icon: <Settings />,
      title: "Custom Workflows",
      desc: "Set up auto-dispatch, or manual approval steps easily.",
    },
    {
      icon: <Shield />,
      title: "Fraud Protection",
      desc: "Enterprise-grade security and automated chargeback handling.",
    },
    {
      icon: <Smartphone />,
      title: "Responsive Storefront",
      desc: "Your store looks perfect on iPhone, Android, and Desktop.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md"
          >
            Capabilities
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-6 leading-[1.05]"
          >
            Everything you need to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
              grow direct.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium"
          >
            From storefront creation to advanced analytics, StarX Flow gives you
            enterprise tools without the enterprise price tag.
          </motion.p>
        </div>

        {/* Hero Feature Showcase */}
        <div className="mb-32">
          {mainFeatures.map((feature, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${idx % 2 !== 0 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16 mb-24 last:mb-0`}
            >
              <div className="w-full lg:w-1/2">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                  {feature.desc}
                </p>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-zinc-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      Benefit detail point goes here for context
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full lg:w-1/2">
                <div
                  className="aspect-square md:aspect-[4/3] w-full rounded-3xl border border-white/10 relative overflow-hidden"
                  style={{
                    background: feature.image,
                    backgroundColor: "#0a0a0a",
                  }}
                >
                  {/* Abstract Mockup inside the box */}
                  <div className="absolute inset-4 lg:inset-8 border border-white/5 bg-[#111] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0c0c0c]">
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                      <div className="w-3 h-3 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-4 opacity-50">
                      <div className="w-1/2 h-6 bg-white/5 rounded-md" />
                      <div className="w-full h-32 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                      <div className="flex gap-4">
                        <div className="flex-1 h-20 bg-white/5 rounded-xl" />
                        <div className="flex-1 h-20 bg-white/5 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              More out of the box
            </h2>
            <p className="text-zinc-400">
              Everything comes standard with all our plans.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#0c0c0c] border border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-emerald-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-[#0A0A0A] border border-white/10 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-2xl mb-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
          <h2 className="text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Experience the difference
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Unlock all the tools you need to build your direct channel and take
            ownership of your growth.
          </p>
          <button className="bg-white text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-zinc-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] relative z-10 group inline-flex items-center gap-2">
            Start Your Free Trial{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
