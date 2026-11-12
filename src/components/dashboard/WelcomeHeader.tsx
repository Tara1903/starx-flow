"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { liquidSpring } from "../../lib/motionVariants";

export function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      data-cursor-spotlight="true"
      className="liquid-glass glass-hero liquid-glass-sheen rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none relative overflow-hidden"
    >
      {/* Internal emerald aurora wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-12 w-72 h-72 rounded-full opacity-35 blur-3xl animate-glow-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.42) 0%, rgba(16,185,129,0.12) 50%, transparent 75%)",
        }}
      />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-400/25 text-[11px] font-bold text-emerald-300 uppercase tracking-widest backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <motion.span
            animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          </motion.span>
          <span>Operational Hub</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mt-2.5 sm:text-3xl">
          {getGreeting()},{" "}
          <span className="text-gradient-green">{user?.name || "Partner"}</span>
        </h2>

        <p className="text-xs text-zinc-300/80 mt-1.5 max-w-[500px] leading-relaxed">
          Managing automations for{" "}
          <span className="text-white font-semibold">
            {user?.businessName || "My Business"}
          </span>
          {user?.businessType ? ` (${user.businessType})` : ""}. All
          communication channels are operational.
        </p>
      </div>

      {/* Security Status Liquid Glass Pill */}
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        transition={liquidSpring}
        className="relative z-10 liquid-glass rounded-2xl flex items-center gap-3.5 px-4 py-3.5 border border-emerald-400/30 max-w-xs md:self-center shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(16,185,129,0.15)]"
      >
        <div className="relative w-10 h-10 rounded-xl bg-emerald-500/18 border border-emerald-400/35 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.28),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <span className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-ping opacity-40" />
          <ShieldCheck className="w-5 h-5 relative z-10" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white">AI Agent Shield</p>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-0.5">
            Security &amp; credentials 100% active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
