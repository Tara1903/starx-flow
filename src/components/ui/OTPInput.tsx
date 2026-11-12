"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { otpCellVariants } from "../../lib/motionVariants";

export interface OTPInputProps {
  value: string[];
  onChange: (nextChars: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Reusable strictly 8-character alphanumeric OTP input component.
 * Matches StarX Flow OTP backend contract (`23456789ABCDEFGHJKMNPQRSTUVWXYZ`).
 */
export function OTPInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  success = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const chars = Array.from({ length: 8 }, (_, i) => value[i] || "");

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    // Handle multi-character paste or autofill
    if (cleaned.length > 1) {
      const next = [...chars];
      const slice = cleaned.slice(0, 8 - index);
      for (let i = 0; i < slice.length; i++) {
        next[index + i] = slice[i];
      }
      onChange(next);
      const nextFocus = Math.min(index + slice.length, 7);
      inputRefs.current[nextFocus]?.focus();

      const full = next.join("");
      if (full.length === 8 && onComplete) {
        onComplete(full);
      }
      return;
    }

    const char = cleaned.slice(-1);
    const next = [...chars];
    next[index] = char;
    onChange(next);

    if (char && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    const full = next.join("");
    if (char && full.length === 8 && onComplete) {
      onComplete(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      if (!chars[index] && index > 0) {
        const next = [...chars];
        next[index - 1] = "";
        onChange(next);
        inputRefs.current[index - 1]?.focus();
      } else if (chars[index]) {
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
    if (disabled) return;
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!cleaned) return;

    // If pasted full 8-char code, always start from cell 0 for frictionless UX
    const startIdx = cleaned.length >= 8 ? 0 : index;
    const next = [...chars];
    for (let i = 0; i < 8 - startIdx && i < cleaned.length; i++) {
      next[startIdx + i] = cleaned[i];
    }
    onChange(next);
    const nextFocus = Math.min(startIdx + cleaned.length, 7);
    inputRefs.current[nextFocus]?.focus();

    const full = next.join("");
    if (full.length === 8 && onComplete) {
      onComplete(full);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <motion.div
        variants={prefersReduced ? undefined : otpCellVariants}
        animate={error && !prefersReduced ? "error" : undefined}
        role="group"
        aria-label="8-character verification code input"
        aria-describedby="otp-keyboard-hint"
        className={cn("flex items-center justify-center gap-1.5 sm:gap-2 w-full", className)}
      >
      {chars.map((char, idx) => {
        const isFocused = focusedIndex === idx;
        const isFilled = Boolean(char);
        return (
          <React.Fragment key={idx}>
            <motion.div
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
                success && !prefersReduced
                  ? { delay: idx * 0.04 }
                  : undefined
              }
              className="flex-1 min-w-0 max-w-[46px]"
            >
              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="text"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                aria-label={`Verification code character ${idx + 1} of 8`}
                maxLength={8}
                disabled={disabled}
                value={char}
                onFocus={(e) => {
                  setFocusedIndex(idx);
                  e.target.select();
                }}
                onBlur={() => setFocusedIndex(null)}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={(e) => handlePaste(idx, e)}
                className={cn(
                  "w-full h-12 sm:h-14 text-center text-base sm:text-xl font-mono font-bold rounded-xl outline-none transition-all duration-150 uppercase select-all",
                  "bg-[#070f0c]/90 backdrop-blur-md border text-white",
                  error
                    ? "border-red-500/70 text-red-200 shadow-[0_0_16px_rgba(239,68,68,0.28)]"
                    : success
                    ? "border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : isFocused
                    ? "border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.35)] bg-[#0b1713]"
                    : isFilled
                    ? "border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.18)]"
                    : "border-white/12 hover:border-white/25",
                  disabled && "opacity-60 cursor-not-allowed"
                )}
              />
            </motion.div>
            {idx === 3 && (
              <span
                aria-hidden="true"
                className="text-zinc-500 font-bold text-sm sm:text-base px-0.5 select-none flex-shrink-0"
              >
                -
              </span>
            )}
          </React.Fragment>
        );
      })}
      </motion.div>
      <p id="otp-keyboard-hint" className="sr-only">
        Enter or paste your 8-character alphanumeric code. Use left and right arrow keys to move between characters.
      </p>
      <div aria-live="assertive" className="sr-only">
        {error ? "Verification code invalid or rejected. Please check the characters and try again." : success ? "Verification code accepted." : ""}
      </div>
    </div>
  );
}
