"use client";

import React, { useState } from "react";
import { LiquidGlassOTPModalView, OTPInput } from "@/components/ui/OTPInput";
import { GlassButton } from "@/components/ui/GlassButton";
import { motion } from "motion/react";
import { ShieldCheck, Sparkles, RefreshCw, Smartphone } from "lucide-react";

export default function OTPVerifyDemoPage() {
  const [otpChars, setOtpChars] = useState<string[]>(Array(8).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(45);

  const simulateVerification = async (codeToTest?: string) => {
    const full = (codeToTest || otpChars.join("")).replace(/\D/g, "");
    if (full.length !== 8) {
      setSubmitError("Please enter all 8 digits.");
      return;
    }

    setSubmitError(null);
    setIsVerifying(true);

    // Orbiting validation animation plays for 1.8s
    await new Promise((r) => setTimeout(r, 1800));

    setIsVerifying(false);

    // If test code is invalid (e.g. 99999999)
    if (full === "99999999" || full.startsWith("999")) {
      setSubmitError("Invalid verification code. Please check and try again.");
    } else {
      setIsSuccess(true);
    }
  };

  const handleReset = () => {
    setOtpChars(Array(8).fill(""));
    setIsVerifying(false);
    setIsSuccess(false);
    setSubmitError(null);
  };

  const simulateValid = () => {
    handleReset();
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8"];
    setOtpChars(digits);
    simulateVerification("12345678");
  };

  const simulateLeadingZeroes = () => {
    handleReset();
    const digits = ["0", "0", "1", "2", "3", "4", "5", "6"];
    setOtpChars(digits);
    simulateVerification("00123456");
  };

  const simulateInvalid = () => {
    handleReset();
    const digits = ["9", "9", "9", "9", "9", "9", "9", "9"];
    setOtpChars(digits);
    simulateVerification("99999999");
  };

  return (
    <div className="min-h-screen bg-[#050807] text-white flex flex-col items-center justify-start pt-16 sm:pt-24 pb-36 px-3 sm:px-8 relative overflow-y-auto">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Demo Controls Bar */}
      <div className="z-10 mb-8 max-w-xl w-full flex flex-wrap items-center justify-center gap-2.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs">
        <span className="text-zinc-400 font-semibold px-2 flex items-center gap-1.5">
          <Sparkles size={14} className="text-emerald-400" />
          Reference 05 Demo Controls:
        </span>
        <button
          type="button"
          onClick={simulateValid}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-medium transition-colors cursor-pointer"
        >
          Valid (12345678)
        </button>
        <button
          type="button"
          onClick={simulateLeadingZeroes}
          className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-medium transition-colors cursor-pointer"
        >
          Leading Zeroes (00123456)
        </button>
        <button
          type="button"
          onClick={simulateInvalid}
          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-medium transition-colors cursor-pointer"
        >
          Invalid (Error Shake)
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-zinc-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* The Liquid Glass 8-Digit OTP Modal Card (Reference 05) */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg glass-card-obsidian rounded-3xl overflow-hidden border border-emerald-500/25 shadow-[0_30px_90px_rgba(0,0,0,0.92),0_0_55px_rgba(16,185,129,0.18)]"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <LiquidGlassOTPModalView
          otpChars={otpChars}
          setOtpChars={(next) => {
            setSubmitError(null);
            setOtpChars(next);
          }}
          email="security@starx-flow.com"
          isVerifying={isVerifying}
          isSuccess={isSuccess}
          submitError={submitError}
          resendCooldown={resendCooldown}
          onResend={() => setResendCooldown(60)}
          onVerify={(code) => simulateVerification(code)}
          onClose={handleReset}
        />
      </motion.div>

      {/* Info Label */}
      <p className="z-10 text-xs text-zinc-500 mt-6 text-center max-w-sm">
        Video Reference 05 Implementation &bull; Exactly 8 numeric digits &bull; Liquid Glass orbital verification &amp; emerald success ripple
      </p>
    </div>
  );
}
