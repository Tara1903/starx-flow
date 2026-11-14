"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { LiquidGlassOTPModalView } from "./ui/OTPInput";
import {
  X,
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Compass,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { useShield } from "../lib/shield";

interface SignupModalProps {
  onClose: () => void;
}

export function SignupModal({ onClose }: SignupModalProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  // Global UI Store
  const authMode = useUIStore((state) => state.authMode);
  const setAuthMode = useUIStore((state) => state.setAuthMode);
  const isFirstVisitPrompt = useUIStore((state) => state.isFirstVisitPrompt);

  // Local Form States
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [signupMethod, setSignupMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form Fields - Signup
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Operation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 8-Digit OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpChars, setOtpChars] = useState<string[]>(Array(8).fill(""));

  // Auth Store Methods
  const signInWithPassword = useAuthStore((state) => state.signInWithPassword);
  const signUpWithPassword = useAuthStore((state) => state.signUpWithPassword);
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  // Shield Bot Protection & Honeypot
  const shield = useShield();
  const [honeypot, setHoneypot] = useState("");

  // Mark first-visit prompt dismissed when user skips or closes
  const dismissGuest = () => {
    try {
      localStorage.setItem("starx_auth_prompt_dismissed_v1", "true");
    } catch {
      // Storage unavailable
    }
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && !isVerifying) {
        dismissGuest();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isSubmitting, isVerifying]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    if (loginMethod === "otp") {
      setIsSubmitting(true);
      const { error } = await sendOtp(loginEmail.trim(), undefined, "login");
      setIsSubmitting(false);

      if (error) {
        setSubmitError(error);
      } else {
        setSentEmail(loginEmail.trim());
        setOtpSent(true);
        setResendCooldown(60);
        setOtpChars(Array(8).fill(""));
      }
      return;
    }

    if (!loginPassword) {
      setSubmitError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithPassword(loginEmail.trim(), loginPassword);
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    dismissGuest();
    router.push("/dashboard");
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (honeypot) return;
    const score = shield.getScore();
    if (score < 20) {
      setSubmitError("Verification required. Please refresh.");
      return;
    }

    if (!signupName.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setSubmitError("Please enter a valid work email.");
      return;
    }

    if (signupMethod === "otp") {
      setIsSubmitting(true);
      const { error } = await sendOtp(signupEmail.trim(), { owner_name: signupName.trim() }, "signup");
      setIsSubmitting(false);

      if (error) {
        setSubmitError(error);
      } else {
        setSentEmail(signupEmail.trim());
        setOtpSent(true);
        setResendCooldown(60);
        setOtpChars(Array(8).fill(""));
      }
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setSubmitError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpWithPassword(signupEmail.trim(), signupPassword, { owner_name: signupName.trim() });
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    dismissGuest();
    router.push("/setup/account");
  };

  // Resend 8-Digit OTP handler
  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await sendOtp(sentEmail, undefined, authMode === "signup" ? "signup" : "login");
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setResendCooldown(60);
      setOtpChars(Array(8).fill(""));
    }
  };

  // Submit & Verify 8-Digit Numeric OTP
  const triggerVerification = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpChars.join("")).replace(/\D/g, "");
    if (code.length !== 8) {
      setSubmitError("Please enter all 8 digits of your verification code.");
      return;
    }

    setIsVerifying(true);
    setSubmitError(null);

    const startTime = Date.now();
    const { error, isNewUser } = await verifyOtp(sentEmail, code);
    const elapsed = Date.now() - startTime;
    const remainingDelay = Math.max(0, 1400 - elapsed);
    if (remainingDelay > 0) {
      await new Promise((r) => setTimeout(r, remainingDelay));
    }

    setIsVerifying(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      dismissGuest();
      if (authMode === "signup" || isNewUser) {
        router.push("/setup/account");
      } else {
        router.push("/dashboard");
      }
    }, 1600);
  };

  // ─── 8-DIGIT OTP VERIFICATION SCREEN (REFERENCE 05 LIQUID GLASS VIEW) ───
  if (otpSent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isVerifying) dismissGuest();
        }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-modal-title"
          className="relative w-full max-w-lg glass-card-obsidian rounded-3xl overflow-hidden border border-emerald-500/25 shadow-[0_30px_90px_rgba(0,0,0,0.92),0_0_55px_rgba(16,185,129,0.18)]"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Top Close button */}
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={dismissGuest}
              disabled={isVerifying}
              aria-label="Close verification modal"
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-30"
            >
              <X size={18} />
            </button>
          </div>

          <LiquidGlassOTPModalView
            otpChars={otpChars}
            setOtpChars={(next) => {
              setSubmitError(null);
              setOtpChars(next);
            }}
            email={sentEmail}
            isVerifying={isVerifying}
            isSuccess={isSuccess}
            submitError={submitError}
            resendCooldown={resendCooldown}
            onResend={handleResend}
            isResending={isSubmitting}
            onVerify={(code) => triggerVerification(code)}
            onChangeEmail={() => {
              setOtpSent(false);
              setSubmitError(null);
              setOtpChars(Array(8).fill(""));
            }}
            onClose={dismissGuest}
          />
        </motion.div>
      </motion.div>
    );
  }

  // ─── GLASSY LOGIN FORM V2 (DIRECT MATCH TO REFERENCE VIDEO) ───
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) dismissGuest();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={false}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0.92, y: 8 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-[840px] my-auto bg-[#07130d]/92 backdrop-blur-3xl rounded-[32px] overflow-hidden border border-white/[0.14] shadow-[0_32px_100px_rgba(0,0,0,0.92),0_0_60px_rgba(16,185,129,0.12)] flex flex-col"
      >
        {/* Subtle Ambient Emerald Accent Spotlights */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent z-30" />
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />

        {/* Top Header Controls: Brand, Continue as Guest & Close Button */}
        <div className="relative z-30 flex items-center justify-between px-6 sm:px-8 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Sparkles size={14} />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              StarX <span className="text-emerald-400">Flow</span>
            </span>
            <span className="sr-only">Welcome to StarX Flow!</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={dismissGuest}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all cursor-pointer"
            >
              <Compass size={12} />
              <span>{isFirstVisitPrompt ? "Skip for now • Continue as Guest" : "Continue as Guest"}</span>
            </button>

            <button
              type="button"
              onClick={dismissGuest}
              disabled={isSubmitting}
              aria-label="Close modal"
              className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Segmented Capsule Switcher (< 768px) */}
        <div className="flex md:hidden px-6 pt-2 pb-1">
          <div className="grid grid-cols-2 w-full p-1 bg-white/[0.04] border border-white/10 rounded-2xl relative">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setSubmitError(null);
              }}
              className={cn(
                "relative z-10 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center",
                authMode === "login" ? "text-emerald-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {authMode === "login" && (
                <motion.div
                  layoutId="mobile-auth-tab"
                  className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/40 rounded-xl -z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setSubmitError(null);
              }}
              className={cn(
                "relative z-10 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center",
                authMode === "signup" ? "text-emerald-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {authMode === "signup" && (
                <motion.div
                  layoutId="mobile-auth-tab"
                  className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/40 rounded-xl -z-10 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              Create Account
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mx-6 sm:mx-8 mt-2 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium flex items-center justify-between"
          >
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-200 text-sm ml-2 cursor-pointer"
            >
              &times;
            </button>
          </motion.div>
        )}

        {/* ─── DUAL-COLUMN SLIDING OVERLAY ARENA (DESKTOP >= 768px) ─── */}
        <div className="relative min-h-[470px] overflow-hidden rounded-b-[32px]">
          <div className="hidden md:block relative w-full h-[470px]">
            {/* ─── LEFT COLUMN: LOGIN FORM (Exact Match to Video trans_015.png) ─── */}
            <motion.div
              initial={false}
              animate={{
                opacity: authMode === "login" ? 1 : 0.15,
                x: authMode === "login" ? 0 : -14,
                scale: authMode === "login" ? 1 : 0.985,
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "absolute top-0 left-0 w-1/2 h-full px-8 lg:px-10 py-7 flex flex-col justify-between",
                authMode === "login"
                  ? "pointer-events-auto z-10"
                  : "pointer-events-none select-none z-0"
              )}
            >
              <div>
                <h2 id="auth-modal-title" className="text-2xl font-extrabold text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 mb-3">
                  Sign in to access your dashboard
                </p>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setSubmitError(null);
                    const { error } = await signInWithGoogle();
                    setIsSubmitting(false);
                    if (error) setSubmitError(error);
                  }}
                  disabled={isSubmitting}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mb-2.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Method Selector Tabs: Password vs 8-Digit OTP */}
                <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/10 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("password");
                      setSubmitError(null);
                    }}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      loginMethod === "password"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <Lock size={12} />
                    <span>Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      setSubmitError(null);
                    }}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      loginMethod === "otp"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <KeyRound size={12} />
                    <span>8-Digit OTP</span>
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  {/* Underline Input 1: Username / Email */}
                  <div>
                    <div className="relative flex items-center border-b border-white/15 pb-2 group">
                      <User size={16} className="text-zinc-400 group-focus-within:text-emerald-400 transition-colors duration-200 mr-3 shrink-0" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Email or Username"
                        required
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                      />
                      <span className="absolute bottom-[-1px] left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-300 w-0 group-focus-within:w-full transition-all duration-300 ease-out" />
                    </div>
                  </div>

                  {/* Underline Input 2: Password (or OTP notification) */}
                  {loginMethod === "password" ? (
                    <div>
                      <div className="relative flex items-center border-b border-white/15 pb-2 group">
                        <Lock size={16} className="text-zinc-400 group-focus-within:text-emerald-400 transition-colors duration-200 mr-3 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password"
                          required
                          className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none pr-7"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <span className="absolute bottom-[-1px] left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-300 w-0 group-focus-within:w-full transition-all duration-300 ease-out" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <KeyRound size={14} className="shrink-0 text-emerald-400" />
                      <span>An 8-digit verification code will be sent to your email.</span>
                    </div>
                  )}

                  {/* Action Button: Rounded Glass Pill matching Video */}
                  <div className="pt-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      type="submit"
                      data-testid="login-submit-btn"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-emerald-500 hover:text-black border border-white/25 hover:border-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] disabled:opacity-50"
                    >
                      <span>{loginMethod === "otp" ? "Send 8-Digit Verification Code" : "Login"}</span>
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Bottom Navigation Links matching Video */}
              <div className="space-y-2 text-center text-xs text-zinc-400 pt-4 border-t border-white/[0.06]">
                <div>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    data-testid="switch-to-signup-btn"
                    onClick={() => {
                      setAuthMode("signup");
                      setSubmitError(null);
                    }}
                    className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod((prev) => (prev === "password" ? "otp" : "password"));
                      setSubmitError(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors cursor-pointer"
                  >
                    {loginMethod === "password" ? "Prefer 8-Digit Numeric OTP?" : "Use Password Instead"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ─── RIGHT COLUMN: CREATE ACCOUNT FORM (Exact Match to Video frame_001.png) ─── */}
            <motion.div
              initial={false}
              animate={{
                opacity: authMode === "signup" ? 1 : 0.15,
                x: authMode === "signup" ? 0 : 14,
                scale: authMode === "signup" ? 1 : 0.985,
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "absolute top-0 left-1/2 w-1/2 h-full px-10 py-8 flex flex-col justify-between",
                authMode === "signup"
                  ? "pointer-events-auto z-10"
                  : "pointer-events-none select-none z-0"
              )}
            >
              <div>
                <h2 id="auth-modal-title" className="text-2xl font-extrabold text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 mb-3">
                  Start your 14-day free trial &bull; No credit card required
                </p>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setSubmitError(null);
                    const { error } = await signInWithGoogle();
                    setIsSubmitting(false);
                    if (error) setSubmitError(error);
                  }}
                  disabled={isSubmitting}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mb-3"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {/* Underline Input 1: Full Name */}
                  <div>
                    <div className="relative flex items-center border-b border-white/15 pb-2 group">
                      <User size={16} className="text-zinc-400 group-focus-within:text-emerald-400 transition-colors duration-200 mr-3 shrink-0" />
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                      />
                      <span className="absolute bottom-[-1px] left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-300 w-0 group-focus-within:w-full transition-all duration-300 ease-out" />
                    </div>
                  </div>

                  {/* Underline Input 2: Work Email */}
                  <div>
                    <div className="relative flex items-center border-b border-white/15 pb-2 group">
                      <Mail size={16} className="text-zinc-400 group-focus-within:text-emerald-400 transition-colors duration-200 mr-3 shrink-0" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Work Email"
                        required
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                      />
                      <span className="absolute bottom-[-1px] left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-300 w-0 group-focus-within:w-full transition-all duration-300 ease-out" />
                    </div>
                  </div>

                  {/* Underline Input 3: Create Password */}
                  {signupMethod === "password" ? (
                    <div>
                      <div className="relative flex items-center border-b border-white/15 pb-2 group">
                        <Lock size={16} className="text-zinc-400 group-focus-within:text-emerald-400 transition-colors duration-200 mr-3 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create Password"
                          required
                          minLength={6}
                          className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none pr-7"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <span className="absolute bottom-[-1px] left-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-300 w-0 group-focus-within:w-full transition-all duration-300 ease-out" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <KeyRound size={14} className="shrink-0 text-emerald-400" />
                      <span>An 8-digit verification code will be sent to your email.</span>
                    </div>
                  )}

                  {/* Honeypot field */}
                  <input
                    type="text"
                    name="website_pot"
                    value={honeypot}
                    onChange={(e) => {
                      setHoneypot(e.target.value);
                      shield.setHoneypot(e.target.value.length > 0);
                    }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
                  />

                  {/* Action Button: Rounded Glass Pill matching Video */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      type="submit"
                      data-testid="signup-submit-btn"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-emerald-500 hover:text-black border border-white/25 hover:border-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] disabled:opacity-50"
                    >
                      <span>{signupMethod === "otp" ? "Send 8-Digit OTP" : "Sign Up"}</span>
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Bottom Navigation Links matching Video */}
              <div className="space-y-2 text-center text-xs text-zinc-400 pt-3 border-t border-white/[0.06]">
                <div>
                  Already a Member?{" "}
                  <button
                    type="button"
                    data-testid="switch-to-login-btn"
                    onClick={() => {
                      setAuthMode("login");
                      setSubmitError(null);
                    }}
                    className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupMethod((prev) => (prev === "password" ? "otp" : "password"));
                      setSubmitError(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors cursor-pointer"
                  >
                    {signupMethod === "password" ? "Prefer 8-Digit Numeric OTP?" : "Use Password Instead"}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ─── LAYER 3: PHYSICAL SLIDING FROSTED GLASS OVERLAY PANEL (HERO MOTION) ─── */}
            <motion.div
              initial={false}
              animate={{ x: authMode === "login" ? "100%" : "0%" }}
              transition={
                prefersReduced
                  ? { duration: 0.01 }
                  : {
                      type: "spring",
                      stiffness: 220,
                      damping: 27,
                      mass: 0.8,
                    }
              }
              className="hidden md:flex absolute top-0 left-0 w-1/2 h-full z-20 flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[#0c281b]/95 via-[#071912]/92 to-[#030906]/95 backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.16)]"
            >
              {/* Dynamic Specular Edge Highlights with smooth crossfade */}
              <motion.div
                animate={{ opacity: authMode === "signup" ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-emerald-300 via-white/70 to-emerald-400/20 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              />
              <motion.div
                animate={{ opacity: authMode === "login" ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-emerald-300 via-white/70 to-emerald-400/20 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              />

              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-[70px] pointer-events-none" />

              {/* Dynamic Content inside the Sliding Glass Panel */}
              <div className="relative z-10 w-full h-full">
                <AnimatePresence initial={false}>
                  {authMode === "signup" ? (
                    /* STATE A: WELCOME BACK! (Overlay on Left, revealing Create Account on Right) */
                    <motion.div
                      key="overlay-welcome-back"
                      initial={{ opacity: 0, x: -18, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: 18, filter: "blur(4px)" }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      <div className="space-y-4 mt-6">
                        <h3 className="text-3xl lg:text-4xl font-extrabold text-white tracking-wider leading-tight">
                          WELCOME BACK!
                        </h3>
                        <p className="text-xs lg:text-sm text-zinc-300/90 leading-relaxed max-w-[260px]">
                          Already a Member? Please Login with your credentials.
                        </p>
                      </div>

                      <div className="mb-4">
                        <motion.button
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          type="button"
                          data-testid="overlay-signin-btn"
                          onClick={() => {
                            setAuthMode("login");
                            setSubmitError(null);
                          }}
                          className="px-8 py-2.5 rounded-full border border-white/40 hover:border-emerald-400 hover:bg-emerald-500 hover:text-black text-white text-xs lg:text-sm font-bold uppercase tracking-wider transition-colors duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-2 group"
                        >
                          <span>Sign In</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    /* STATE B: HELLO, FRIEND! (Overlay on Right, revealing Login on Left) */
                    <motion.div
                      key="overlay-hello-friend"
                      initial={{ opacity: 0, x: 18, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -18, filter: "blur(4px)" }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 flex flex-col justify-between"
                    >
                      <div className="space-y-4 mt-6">
                        <h3 className="text-3xl lg:text-4xl font-extrabold text-white tracking-wider leading-tight">
                          HELLO, FRIEND!
                        </h3>
                        <p className="text-xs lg:text-sm text-zinc-300/90 leading-relaxed max-w-[260px]">
                          Enter your personal details and start your journey with us.
                        </p>
                      </div>

                      <div className="mb-4">
                        <motion.button
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          type="button"
                          data-testid="overlay-create-account-btn"
                          onClick={() => {
                            setAuthMode("signup");
                            setSubmitError(null);
                          }}
                          className="px-8 py-2.5 rounded-full border border-white/40 hover:border-emerald-400 hover:bg-emerald-500 hover:text-black text-white text-xs lg:text-sm font-bold uppercase tracking-wider transition-colors duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-2 group"
                        >
                          <span>Create Account</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
             MOBILE VIEW (< 768px): SINGLE RESPONSIVE CARD
             ════════════════════════════════════════════════════════════════ */}
          <div className="block md:hidden p-6">
            {authMode === "signup" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Start your 14-day free trial &bull; No credit card required
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="sr-only">
                    <button type="button" onClick={() => signInWithGoogle()}>Continue with Google</button>
                  </div>
                  <div className="relative flex items-center border-b border-white/20 focus-within:border-emerald-400 pb-2">
                    <User size={16} className="text-zinc-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                    />
                  </div>

                  <div className="relative flex items-center border-b border-white/20 focus-within:border-emerald-400 pb-2">
                    <Mail size={16} className="text-zinc-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Work Email"
                      required
                      className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                    />
                  </div>

                  {signupMethod === "password" ? (
                    <div className="relative flex items-center border-b border-white/20 focus-within:border-emerald-400 pb-2">
                      <Lock size={16} className="text-zinc-400 mr-3 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create Password"
                        required
                        minLength={6}
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none pr-7"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      An 8-digit verification code will be sent to your email.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer"
                  >
                    <span>{signupMethod === "otp" ? "Send 8-Digit OTP" : "Sign Up"}</span>
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-400 pt-2">
                  Already a Member?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-emerald-400 underline font-semibold"
                  >
                    Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Login
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sign in to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="sr-only">
                    <button type="button" onClick={() => setLoginMethod("password")}>Password</button>
                    <button type="button" onClick={() => setLoginMethod("otp")}>8-Digit OTP</button>
                  </div>
                  <div className="relative flex items-center border-b border-white/20 focus-within:border-emerald-400 pb-2">
                    <User size={16} className="text-zinc-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email or Username"
                      required
                      className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none"
                    />
                  </div>

                  {loginMethod === "password" ? (
                    <div className="relative flex items-center border-b border-white/20 focus-within:border-emerald-400 pb-2">
                      <Lock size={16} className="text-zinc-400 mr-3 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 text-sm outline-none pr-7"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      An 8-digit verification code will be sent to your email.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer"
                  >
                    <span>{loginMethod === "otp" ? "Send 8-Digit OTP" : "Login"}</span>
                  </button>
                </form>

                <div className="text-center text-xs text-zinc-400 pt-2">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className="text-emerald-400 underline font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
