import React from "react";
import { motion } from "motion/react";
import {
  Users,
  ShoppingCart,
  BarChart2,
  Smartphone,
  Monitor,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Settings,
  Shield,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router";

export default function Product() {
  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      {/* Background glow */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full z-0 pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            The StarX Flow Platform
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight text-white mb-8 leading-[1.05]"
          >
            Your complete direct <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
              customer system.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Stop relying on third-party aggregators. Build your own premium
            ordering experience, own your customer data, and increase your
            margins by up to 30%.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-4 rounded-full text-base font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto bg-zinc-900/50 border border-white/10 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
              Book a Demo
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-5xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden mb-32 relative ring-1 ring-white/5"
        >
          {/* Mac window header */}
          <div className="bg-[#111] px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="mx-auto bg-white/5 text-zinc-500 text-xs px-3 py-1 rounded-md flex items-center gap-2">
              <Lock className="w-3 h-3" /> admin.starxflow.com
            </div>
          </div>

          {/* Skeleton UI for Dashboard */}
          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-2">
              <div className="w-full h-8 bg-white/5 rounded-md mb-6" />
              <div className="w-full h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-md" />
              <div className="w-full h-8 bg-white/5 rounded-md" />
              <div className="w-full h-8 bg-white/5 rounded-md" />
              <div className="w-full h-8 bg-white/5 rounded-md" />
            </div>
            {/* Main Content */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="w-48 h-8 bg-white/5 rounded-md" />
                <div className="w-32 h-8 bg-white/5 rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
              </div>
              <div className="flex-1 bg-white/5 rounded-xl w-full" />
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Core Modules
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Everything you need to run your business smoothly without the
              manual overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              id="tour-order-management"
              className="p-10 rounded-3xl bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-start gap-6 relative group"
            >
              <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShoppingCart className="text-emerald-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Order Management
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Streamline your entire operation in one place. Accept, manage,
                  and dispatch orders directly without aggregator interference.
                  Real-time status updates sync automatically to the customer.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Real-time sync",
                    "Automated dispatching",
                    "Custom statuses",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              id="tour-customer-database"
              className="p-10 rounded-3xl bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-start gap-6 relative group"
            >
              <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Users className="text-emerald-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Customer Database
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Own the data. Know your customers' preferences, purchase
                  history, and contact details to build lasting relationships
                  rather than renting access to them.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Unified profiles",
                    "Purchase history tracking",
                    "Segmentation",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              id="tour-analytics"
              className="p-10 rounded-3xl bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-start gap-6 relative group"
            >
              <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BarChart2 className="text-emerald-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Analytics & Insights
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Make data-driven decisions with real-time insights into your
                  revenue, top products, and customer behavior. Export reports
                  in one click.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "Revenue tracking",
                    "Product performance",
                    "Custom dashboards",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-10 rounded-3xl bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-start gap-6 group">
              <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Smartphone className="text-emerald-400" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Native Mobile App
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Manage your business on the go. Our mobile app keeps you
                  connected with direct push notifications for every new order
                  and customer message.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    "iOS & Android support",
                    "Push notifications",
                    "Offline mode support",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Section */}
        <div className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl skew-y-3 transform-gpu hover:skew-y-0 transition-transform duration-500">
                <div className="flex flex-col gap-4">
                  {[
                    {
                      title: "New order from Sarah L.",
                      time: "Just now",
                      val: "+$142.50",
                    },
                    {
                      title: "Inventory alert: Product X",
                      time: "5m ago",
                      val: "12 left",
                    },
                    {
                      title: "New customer signed up",
                      time: "1h ago",
                      val: "+1 User",
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {n.title}
                        </span>
                        <span className="text-zinc-500 text-xs">{n.time}</span>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold">
                        {n.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                Automation that works for you.
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Set up rules to automatically dispatch orders, send marketing
                messages based on purchase history, and update inventory across
                all channels simultaneously.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">
                      Trigger-based Actions
                    </h4>
                    <p className="text-sm text-zinc-400">
                      If X happens, do Y. Build complex flows without writing
                      code.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">
                      Omnichannel Sync
                    </h4>
                    <p className="text-sm text-zinc-400">
                      Manage multiple physical locations and digital storefronts
                      from one hub.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">
                      Enterprise-grade Security
                    </h4>
                    <p className="text-sm text-zinc-400">
                      Your customer data is encrypted and securely stored.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-[#0A0A0A] border border-white/10 rounded-[3rem] p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_60%)] pointer-events-none" />
          <h2 className="text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter relative z-10 leading-tight">
            Ready to take control?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Join thousands of businesses who have migrated to StarX Flow and
            reclaimed their margins.
          </p>
          <button className="bg-white text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-zinc-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] relative z-10">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

// Dummy Icon Component Since it was missing in imports
function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
