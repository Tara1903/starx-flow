"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, ShieldCheck, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { otpCellVariants } from "../../lib/motionVariants";

export interface OTPInputProps {
  /** Array of 8 numeric characters (strings '0'-'9' or empty string '') */
  value: string[];
  /** Callback fired whenever digits change. Always passes array of 8 string digits. */
  onChange: (nextChars: string[]) => void;
  /** Callback fired when all 8 digits are entered. Passes full 8-digit string. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string | null;
  success?: boolean;
  isVerifying?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Premium 8-Digit Liquid Glass OTP Input Component.
 * Faithfully reproduces the interaction, visual depth, pulsing cursor,
 * and entry animations demonstrated in Video Reference 05.
 * Strictly 8 numeric digits ('0'-'9'). Preserves leading zeroes as string.
 */
export function OTPInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  errorMessage,
  success = false,
  isVerifying = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const prefersReduced = useReducedMotion();
  const inputGroupId = useId();

  // Normalize exactly 8 slots as strings
  const chars = Array.from({ length: 8 }, (_, i) => {
    const raw = value[i] ?? "";
    return typeof raw === "string" ? raw.slice(0, 1) : String(raw).slice(0, 1);
  });

  // Auto-focus first input on mount if requested
  useEffect(() => {
    if (autoFocus && !disabled && !isVerifying && !success) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled, isVerifying, success]);

  // Handle single character change or paste inside a specific cell
  const handleCellChange = (index: number, raw: string) => {
    if (disabled || isVerifying || success) return;

    // Strictly numeric: strip anything that is not 0-9
    const digitsOnly = raw.replace(/\D/g, "");

    // Multi-digit paste or autofill event
    if (digitsOnly.length > 1) {
      const next = [...chars];
      const startIdx = digitsOnly.length >= 8 ? 0 : index;
      const slice = digitsOnly.slice(0, 8 - startIdx);

      for (let i = 0; i < slice.length; i++) {
        next[startIdx + i] = slice[i];
      }
      onChange(next);

      const nextFocus = Math.min(startIdx + slice.length, 7);
      inputRefs.current[nextFocus]?.focus();

      const fullCode = next.join("");
      if (fullCode.length === 8 && onComplete) {
        onComplete(fullCode);
      }
      return;
    }

    // Single digit input
    const nextDigit = digitsOnly.slice(-1);
    const next = [...chars];
    next[index] = nextDigit;
    onChange(next);

    if (nextDigit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = next.join("");
    if (nextDigit && fullCode.length === 8 && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isVerifying || success) return;

    if (e.key === "Backspace") {
      if (!chars[index] && index > 0) {
        // Move to previous cell and clear it
        const next = [...chars];
        next[index - 1] = "";
        onChange(next);
        inputRefs.current[index - 1]?.focus();
      } else if (chars[index]) {
        // Clear current cell
        const next = [...chars];
        next[index] = "";
        onChange(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 7) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || isVerifying || success) return;

    const pastedText = e.clipboardData.getData("text");
    const digitsOnly = pastedText.replace(/\D/g, "");
    if (!digitsOnly) return;

    // If 8 or more digits pasted, distribute from slot 0 for optimal user convenience
    const startIdx = digitsOnly.length >= 8 ? 0 : index;
    const next = [...chars];
    const slice = digitsOnly.slice(0, 8 - startIdx);

    for (let i = 0; i < slice.length; i++) {
      next[startIdx + i] = slice[i];
    }
    onChange(next);

    const nextFocus = Math.min(startIdx + slice.length, 7);
    inputRefs.current[nextFocus]?.focus();

    const fullCode = next.join("");
    if (fullCode.length === 8 && onComplete) {
      onComplete(fullCode);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* 8-Cell Input Grid */}
      <motion.div
        role="group"
        aria-label="8-digit numeric verification code"
        aria-describedby={`${inputGroupId}-hint`}
        animate={error && !prefersReduced ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : undefined}
        transition={{ duration: 0.42, ease: "easeInOut" }}
        className={cn(
          "flex items-center justify-center gap-1 sm:gap-2 w-full max-w-[440px] mx-auto select-none",
          className
        )}
      >
        {chars.map((digit, idx) => {
          const isFocused = focusedIndex === idx;
          const isFilled = Boolean(digit);

          return (
            <motion.div
              key={idx}
              variants={prefersReduced ? undefined : otpCellVariants}
              animate={
                error && !prefersReduced
                  ? "error"
                  : success && !prefersReduced
                  ? "success"
                  : isFilled && !prefersReduced
                  ? "filled"
                  : "empty"
              }
              transition={
                success && !prefersReduced ? { delay: idx * 0.035 } : undefined
              }
              className="relative flex-1 min-w-0 max-w-[42px] sm:max-w-[48px]"
            >
              {/* Glass Input Card */}
              <div
                onClick={() => {
                  if (!disabled && !isVerifying && !success) {
                    inputRefs.current[idx]?.focus();
                  }
                }}
                className={cn(
                  "relative w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200 cursor-text",
                  "bg-white/[0.04] backdrop-blur-xl border",
                  // Error State
                  error
                    ? "border-rose-500/80 bg-rose-500/[0.08] text-rose-200 shadow-[0_0_22px_rgba(244,63,94,0.38)]"
                    // Success State
                    : success
                    ? "border-emerald-400 bg-emerald-500/[0.12] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                    // Focused / Active Cell State
                    : isFocused
                    ? "border-emerald-400 bg-emerald-500/[0.08] ring-2 ring-emerald-500/30 shadow-[0_0_22px_rgba(16,185,129,0.4)]"
                    // Filled Cell State
                    : isFilled
                    ? "border-emerald-500/50 bg-white/[0.07] shadow-[0_0_12px_rgba(16,185,129,0.18)]"
                    // Default Inactive Empty State
                    : "border-white/12 hover:border-white/25 hover:bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Active Top Edge Liquid Highlight Accent */}
                {isFocused && !error && !success && (
                  <motion.div
                    layoutId="otp-active-glow-top"
                    className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}

                {/* Animated Pulsing Beam Cursor (Reference Frame 001/002) */}
                {isFocused && !isFilled && !disabled && !isVerifying && !success && (
                  <motion.span
                    animate={
                      prefersReduced
                        ? { opacity: 1 }
                        : { opacity: [1, 0, 1] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 0.85,
                      ease: "easeInOut",
                    }}
                    className="w-[2px] h-5 sm:h-6 bg-emerald-400 rounded-full pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  />
                )}

                {/* Digit Entry Display with Spring Scale Transition */}
                <AnimatePresence mode="popLayout">
                  {isFilled && (
                    <motion.span
                      key={`digit-${idx}-${digit}`}
                      initial={prefersReduced ? false : { scale: 0.7, opacity: 0.92, y: 2 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0.92 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className={cn(
                        "text-lg sm:text-2xl font-mono font-bold select-none",
                        error
                          ? "text-rose-200"
                          : success
                          ? "text-emerald-300"
                          : "text-white"
                      )}
                    >
                      {digit}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Native Underlying Accessible Input */}
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  id={`${inputGroupId}-cell-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${idx + 1} of 8`}
                  maxLength={8}
                  disabled={disabled || isVerifying || success}
                  value={digit}
                  onFocus={(e) => {
                    setFocusedIndex(idx);
                    e.target.select();
                  }}
                  onBlur={() => setFocusedIndex(null)}
                  onChange={(e) => handleCellChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={(e) => handlePaste(idx, e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text select-all"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <p id={`${inputGroupId}-hint`} className="sr-only">
        Enter your 8-digit numeric verification code. Preserves leading zeroes. Focus moves forward automatically.
      </p>

      {/* Error Message Announcement */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-medium text-center"
        >
          <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}

export interface LiquidGlassOTPModalViewProps {
  /** 8-character string or array of 8 characters */
  otpChars: string[];
  setOtpChars: (chars: string[]) => void;
  email: string;
  isVerifying: boolean;
  isSuccess: boolean;
  submitError: string | null;
  resendCooldown: number;
  onResend: () => void;
  isResending?: boolean;
  onVerify: (code?: string) => void;
  onChangeEmail?: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * Full Complete Liquid Glass OTP Verification Experience.
 * Exactly matches Reference Video 05:
 * 1. Sheet handle bar at top
 * 2. Responsive 8-cell liquid glass inputs with active glowing border and pulsing cursor
 * 3. Immediate automatic verification transition on 8th digit
 * 4. Mesmerizing revolving orbital ring animation with 8 rotating cells
 * 5. Smooth inward convergence into glowing emerald checkmark badge
 * 6. Radiant expanding ripple wave with twinkling green particle dots
 * 7. "Verified successfully" headline + "Verified & Secured 🔒" bottom badge
 * 8. Error shake with crimson glow & resend countdown
 */
export function LiquidGlassOTPModalView({
  otpChars,
  setOtpChars,
  email,
  isVerifying,
  isSuccess,
  submitError,
  resendCooldown,
  onResend,
  isResending = false,
  onVerify,
  onChangeEmail,
  onClose,
  title,
  subtitle,
}: LiquidGlassOTPModalViewProps) {
  const prefersReduced = useReducedMotion();
  const formattedCooldown = `00:${String(resendCooldown).padStart(2, "0")}`;

  // Orbit radius for the 8 revolving cells during verification
  const orbitRadius = 88; // px

  return (
    <div className="relative w-full p-6 sm:p-8 text-center">
      {/* Top Sheet Drag Handle (Matches Reference Video Header) */}
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

      {/* Dynamic Header */}
      <div className="mb-6 space-y-1.5">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-header"
              initial={{ opacity: 0.92, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.92, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Verified successfully
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Your account has been verified.
              </p>
            </motion.div>
          ) : isVerifying ? (
            <motion.div
              key="verifying-header"
              initial={{ opacity: 0.92, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.92, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Verifying your code
              </h3>
              <p className="text-sm text-emerald-400/80 font-mono mt-1">
                Validating 8-digit security key...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="default-header"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.92, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {title || "Let's verify your account"}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto mt-1">
                {subtitle ||
                  "We've sent an 8-digit code to your email. It'll auto-verify once entered."}
              </p>
              {email && (
                <p className="text-xs font-semibold text-emerald-400 font-mono pt-1 break-all">
                  {email}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Animation Arena */}
      <div className="relative min-h-[220px] sm:min-h-[240px] flex items-center justify-center my-4 overflow-hidden">
        <AnimatePresence>
          {/* ── STATE 1: SUCCESS CHECKMARK & RIPPLE BADGE (Reference Frames 018-020) ── */}
          {isSuccess ? (
            <motion.div
              key="success-arena"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="relative flex flex-col items-center justify-center py-6"
            >
              {/* Expanding Radial Ripple Waves */}
              <motion.div
                animate={{ scale: [0.8, 2.3], opacity: [0.8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeOut",
                }}
                className="absolute w-24 h-24 rounded-full border border-emerald-400/60 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [0.8, 2.8], opacity: [0.5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  delay: 0.45,
                  ease: "easeOut",
                }}
                className="absolute w-24 h-24 rounded-full border border-emerald-400/40 pointer-events-none"
              />

              {/* Ambient Emerald Glow Backdrop */}
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

              {/* Central Emerald Badge */}
              <motion.div
                initial={{ scale: 0.7, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#0c2419]/90 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_45px_rgba(16,185,129,0.6)] backdrop-blur-xl"
              >
                <Check size={38} className="text-white stroke-[3.5] drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              </motion.div>

              {/* Verified & Secured Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-6 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              >
                <span>Verified &amp; Secured</span>
                <Lock size={13} className="text-emerald-400 ml-0.5" />
              </motion.div>
            </motion.div>
          ) : isVerifying ? (
            /* ── STATE 2: REVOLVING ORBITAL VERIFICATION (Reference Frames 008-016) ── */
            <motion.div
              key="verifying-orbit-arena"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="relative w-64 h-64 flex items-center justify-center"
            >
              {/* Dashed Circular Orbit Track */}
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-500/30 pointer-events-none" />
              <div className="absolute w-28 h-28 rounded-full border border-emerald-500/15 pointer-events-none" />
              <div className="absolute w-20 h-20 rounded-full bg-emerald-500/15 blur-xl animate-pulse pointer-events-none" />

              {/* Sweeping Radar Arc */}
              {!prefersReduced && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  className="absolute w-44 h-44 rounded-full border-t-2 border-emerald-400/70 pointer-events-none shadow-[0_0_18px_rgba(16,185,129,0.4)]"
                />
              )}

              {/* Revolving Wheel with 8 Orbiting Liquid Cells */}
              <motion.div
                animate={prefersReduced ? undefined : { rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 4.4,
                  ease: "linear",
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {Array.from({ length: 8 }).map((_, idx) => {
                  const angleDeg = idx * 45 - 90; // 8 cells: 0, 45, 90, 135, 180, 225, 270, 315 deg
                  const rad = (angleDeg * Math.PI) / 180;
                  const x = Math.round(orbitRadius * Math.cos(rad));
                  const y = Math.round(orbitRadius * Math.sin(rad));
                  const digit = otpChars[idx] || String(idx + 1);

                  return (
                    <motion.div
                      key={`orbit-cell-${idx}`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className="absolute w-10 h-10 rounded-xl bg-[#0a1c15]/95 border border-emerald-400/70 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.35)] backdrop-blur-md"
                    >
                      {/* Counter-rotate text so digits stay upright while orbiting */}
                      <motion.span
                        animate={prefersReduced ? undefined : { rotate: -360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 4.4,
                          ease: "linear",
                        }}
                        className="text-sm font-mono font-bold text-white select-none"
                      >
                        {digit}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Center Lock Core */}
              <div className="relative z-10 w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Lock size={16} className="text-emerald-400" />
              </div>
            </motion.div>
          ) : (
            /* ── STATE 3: 8-DIGIT LIQUID GLASS INPUT ROW (Reference Frames 001-007) ── */
            <motion.div
              key="input-row-arena"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.92, y: -6 }}
              transition={{ duration: 0.22 }}
              className="w-full flex flex-col items-center justify-center"
            >
              <OTPInput
                value={otpChars}
                onChange={setOtpChars}
                onComplete={onVerify}
                disabled={isVerifying || isSuccess}
                error={Boolean(submitError)}
                errorMessage={submitError}
                success={isSuccess}
                isVerifying={isVerifying}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions (Didn't receive code? Resend) */}
      {!isSuccess && (
        <div className="pt-2 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-400">
            <span>Didn&apos;t receive the code?</span>
            {resendCooldown > 0 ? (
              <span className="font-mono text-zinc-400">
                Resend in <span className="text-emerald-400 font-semibold">{formattedCooldown}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                disabled={isResending || isVerifying}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={cn(isResending && "animate-spin")} />
                <span>Resend</span>
              </button>
            )}
          </div>

          {onChangeEmail && (
            <button
              type="button"
              onClick={onChangeEmail}
              disabled={isVerifying}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Wrong email? Click to change
            </button>
          )}
        </div>
      )}
    </div>
  );
}
