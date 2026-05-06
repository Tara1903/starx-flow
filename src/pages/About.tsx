import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="pt-32 lg:pt-40 pb-16 lg:pb-24 min-h-screen relative overflow-hidden bg-black">
      <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-teal-500/10 blur-[150px] rounded-full z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Intro */}
        <div className="max-w-4xl mx-auto text-center mb-32 pt-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight text-white mb-10 leading-[1.05]"
          >
            Built for modern <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
              local businesses.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] shadow-2xl relative"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="space-y-8 text-xl md:text-2xl text-zinc-300 leading-relaxed font-light text-left md:text-center">
              <p>
                We believe businesses should own their customers, not platforms.
              </p>
              <p>
                StarX Flow was created to help local businesses take back
                control, increase their margins, and build stronger
                relationships with their customers by escaping the 30%
                aggregator tax.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-16 mb-32">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2">
              $500M+
            </span>
            <span className="text-zinc-500 text-sm tracking-wide uppercase">
              Processed
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2">
              12,000+
            </span>
            <span className="text-zinc-500 text-sm tracking-wide uppercase">
              Merchants
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2">
              45+
            </span>
            <span className="text-zinc-500 text-sm tracking-wide uppercase">
              Countries
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl md:text-5xl font-bold text-white mb-2">
              30%
            </span>
            <span className="text-zinc-500 text-sm tracking-wide uppercase">
              Avg. Margin Increase
            </span>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 lg:order-1 flex gap-4 h-[500px]">
            <div className="w-1/2 h-full pt-12">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600"
                alt="Local store"
                className="w-full h-full object-cover rounded-3xl opacity-80"
              />
            </div>
            <div className="w-1/2 h-full pb-12">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
                alt="Restaurant kitchen"
                className="w-full h-full object-cover rounded-3xl opacity-80"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
              The great unbundling of food and retail.
            </h2>
            <div className="space-y-6 text-lg text-zinc-400">
              <p>
                Five years ago, we ran a modest chain of coffee shops. We
                realized that while delivery platforms brought us orders, they
                were slowly eating away our profit margins and inserting
                themselves between us and our regulars.
              </p>
              <p>
                When we tried to set up our own direct ordering system, the
                existing tools were clunky, expensive to maintain, and hard for
                our customers to use.
              </p>
              <p>
                So we built StarX Flow. A frictionless, native-feeling system
                that lets any business spin up a direct channel in minutes. No
                30% take rates. No renting your own customers. Just pure, direct
                connection.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-16 text-center shadow-2xl">
          <h2 className="text-[3rem] md:text-[4.5rem] font-bold text-white mb-8 tracking-tighter leading-tight">
            Join our growing team
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            We're always looking for talented individuals who are passionate
            about empowering independent businesses.
          </p>
          <button className="bg-white/10 border border-white/10 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 mx-auto">
            View Open Positions <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
