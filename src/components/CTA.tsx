import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function CTA() {
  const openSignup = useUIStore((state) => state.openSignup);
  
  return (
    <section className="py-24 lg:py-40 px-6 relative z-20 overflow-hidden bg-black">
      {/* Immersive background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="atmo-glow atmo-glow-emerald w-[1000px] h-[500px] opacity-40 blur-[150px]" />
      </div>
      
      {/* Optional mesh/texture overlay for premium feel */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-screen" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold tracking-widest text-emerald-400 uppercase mb-8 backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400" />
            Final Call
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-tight">
            Stop losing clients to <br />
            <span className="text-gradient-green">unanswered calls.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-zinc-300 mb-12 font-medium tracking-tight leading-relaxed max-w-2xl">
            Deploy your AI receptionist in 5 minutes and capture every lead, 24/7.
          </p>
          
          <motion.button
            onClick={openSignup}
            data-magnetic
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 text-black px-12 py-6 rounded-full text-xl font-bold hover:bg-emerald-400 transition-all premium-glow premium-glow-hover flex items-center gap-3"
          >
            Claim Your Free AI Receptionist
            <Sparkles className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
