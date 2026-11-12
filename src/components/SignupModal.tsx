"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { OTPInput } from "./ui/OTPInput";
import { GlassButton } from "./ui/GlassButton";
import { SuccessState } from "./ui/SuccessState";
import {
  X,
  ArrowRight,
  Loader2,
  ChevronDown,
  Mail,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import { useShield } from "../lib/shield";

const signupSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessType: z.string().min(1, "Please select a business type"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[0-9\s\-().]{7,20}$/, "Please enter a valid phone number"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SignupFormValues = z.infer<typeof signupSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

interface SignupModalProps {
  onClose: () => void;
}

export function SignupModal({ onClose }: SignupModalProps) {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // 8-character OTP state: 8 separate slots
  const [otpChars, setOtpChars] = useState<string[]>(Array(8).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);

  const shield = useShield();
  const [honeypot, setHoneypot] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      ownerName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting && !isVerifying) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, isSubmitting, isVerifying]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering OTP screen
  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [otpSent]);

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await signupForm.trigger(["businessName", "businessType"]);
      if (isValid) setStep(2);
    }
  };

  // Sign Up → Send 8-character OTP
  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const score = shield.getScore();
    if (score < 5) {
      setSentEmail(data.email);
      setOtpSent(true);
      setResendCooldown(60);
      setIsSubmitting(false);
      return;
    }

    const now = Date.now();
    if (now < lockedUntil) {
      setSubmitError("Too many attempts. Please wait 5 minutes.");
      setIsSubmitting(false);
      return;
    }

    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= 4) setLockedUntil(Date.now() + 5 * 60 * 1000);
      return next;
    });

    const { error } = await sendOtp(
      data.email,
      {
        business_name: data.businessName,
        owner_name: data.ownerName,
        business_type: data.businessType,
        phone: data.phone,
      },
      "signup"
    );

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setSentEmail(data.email);
      setOtpSent(true);
      setResendCooldown(60);
      setOtpChars(Array(8).fill(""));
    }
  };

  // Login → Send 8-character OTP
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const score = shield.getScore();
    if (score < 5) {
      setSentEmail(data.email);
      setOtpSent(true);
      setResendCooldown(60);
      setIsSubmitting(false);
      return;
    }

    const now = Date.now();
    if (now < lockedUntil) {
      setSubmitError("Too many attempts. Please wait 5 minutes.");
      setIsSubmitting(false);
      return;
    }

    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= 4) setLockedUntil(Date.now() + 5 * 60 * 1000);
      return next;
    });

    const { error } = await sendOtp(data.email, undefined, "login");

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setSentEmail(data.email);
      setOtpSent(true);
      setResendCooldown(60);
      setOtpChars(Array(8).fill(""));
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const signupData = signupForm.getValues();
    const metadata = !isLoginMode
      ? {
          business_name: signupData.businessName,
          owner_name: signupData.ownerName,
          business_type: signupData.businessType,
          phone: signupData.phone,
        }
      : undefined;

    const { error } = await sendOtp(sentEmail, metadata, isLoginMode ? "login" : "signup");
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setResendCooldown(60);
      setOtpChars(Array(8).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  // 8-Character Input Change Handler (Supports typing & paste)
  const handleCharChange = (index: number, value: string) => {
    setSubmitError(null);

    // If pasted full code (e.g. "A4K9-2P8M" or "A4K92P8M")
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 8).split("");
      const newOtp = [...otpChars];
      for (let i = 0; i < 8; i++) {
        if (chars[i]) newOtp[i] = chars[i];
      }
      setOtpChars(newOtp);

      const nextFocus = Math.min(chars.length, 7);
      inputRefs.current[nextFocus]?.focus();

      if (chars.length === 8) {
        triggerVerification(newOtp.join(""));
      }
      return;
    }

    const char = cleaned.slice(-1);
    const newOtp = [...otpChars];
    newOtp[index] = char;
    setOtpChars(newOtp);

    // Auto-advance to next input
    if (char && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 8 characters entered
    if (char && index === 7) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 8) {
        triggerVerification(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpChars[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Submit & Verify 8-Character OTP
  const triggerVerification = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpChars.join("")).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (code.length !== 8) {
      setSubmitError("Please enter all 8 characters of your verification code.");
      return;
    }

    setIsVerifying(true);
    setSubmitError(null);

    const { error, isNewUser } = await verifyOtp(sentEmail, code);

    setIsVerifying(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      if (!isLoginMode || isNewUser) {
        router.push("/setup/account");
      } else {
        router.push("/dashboard");
      }
    }, 800);
  };

  // ── 8-CHARACTER OTP VERIFICATION SCREEN ──
  if (otpSent) {
    const isCodeComplete = otpChars.join("").length === 8;
    const formattedCooldown = `00:${String(resendCooldown).padStart(2, "0")}`;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isVerifying) onClose();
        }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-modal-title"
          className="relative w-full max-w-lg glass-card-obsidian rounded-3xl overflow-hidden border border-emerald-500/25 shadow-[0_30px_90px_rgba(0,0,0,0.88),0_0_55px_rgba(16,185,129,0.14)]"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Header Actions */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setSubmitError(null);
                setOtpChars(Array(8).fill(""));
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Change Email</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              aria-label="Close verification modal"
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 sm:p-8 text-center">
            {isSuccess ? (
              <SuccessState
                title="Account Verified"
                description="Authentication complete. Preparing your StarX Flow workspace..."
              />
            ) : (
              <>
                {/* Shield Emblem */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.05, damping: 16 }}
                  className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center"
                >
                  <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-lg" />
                  <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/12 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_28px_rgba(16,185,129,0.28)]">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                </motion.div>

                <h3
                  id="otp-modal-title"
                  className="text-2xl font-bold text-white tracking-tight mb-2"
                >
                  Verify Your Account
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-1">
                  We&apos;ve sent an 8-character verification code to
                </p>
                <p className="text-sm font-semibold text-emerald-400 mb-6 font-mono break-all">
                  {sentEmail}
                </p>

                {/* Error Banner */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-red-500/12 border border-red-500/35 text-red-300 text-xs font-medium text-center"
                  >
                    {submitError}
                  </motion.div>
                )}

                {/* Reusable 8-Character OTP Input */}
                <div className="mb-6">
                  <OTPInput
                    value={otpChars}
                    onChange={(next) => {
                      setSubmitError(null);
                      setOtpChars(next);
                    }}
                    onComplete={(fullCode) => triggerVerification(fullCode)}
                    disabled={isVerifying || isSuccess}
                    error={Boolean(submitError)}
                    success={isSuccess}
                  />
                  <p className="text-[11px] text-zinc-500 mt-3">
                    Valid for 10 minutes &bull; Full code paste supported
                  </p>
                </div>

                {/* Verify CTA */}
                <GlassButton
                  type="button"
                  size="lg"
                  variant="primary"
                  magnetic
                  isLoading={isVerifying}
                  disabled={!isCodeComplete || isVerifying || isSuccess}
                  onClick={() => triggerVerification()}
                  className="w-full mb-4"
                >
                  <span>Verify &amp; Continue</span>
                  <ArrowRight size={16} />
                </GlassButton>

                {/* Resend Code */}
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <span>Didn&apos;t receive the code?</span>
                  {resendCooldown > 0 ? (
                    <span className="text-zinc-400 font-mono">
                      Resend code in <span className="text-emerald-400">{formattedCooldown}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={cn(isSubmitting && "animate-spin")} />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 18 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        className="relative w-full max-w-md glass-card-obsidian rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_28px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(16,185,129,0.12)] flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] relative z-10">
          <div>
            <h2 id="signup-modal-title" className="text-xl font-bold text-white tracking-tight">
              {isLoginMode ? "Sign In to StarX Flow" : "Start Free Trial"}
            </h2>
            {!isLoginMode && (
              <p className="text-xs text-zinc-400 mt-1">Step {step} of 2 &bull; 8-Character OTP</p>
            )}
            {isLoginMode && (
              <p className="text-xs text-zinc-400 mt-1">We&apos;ll send an 8-character verification code</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (signup only) */}
        {!isLoginMode && (
          <div className="w-full h-1 bg-white/[0.05]">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Error Banner */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mx-6 mt-4 p-3 rounded-xl bg-red-500/12 border border-red-500/30 text-red-300 text-xs font-medium"
          >
            {submitError}
          </motion.div>
        )}

        {/* Forms */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              /* ── LOGIN MODE ── */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="p-6 space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      {...loginForm.register("email")}
                      placeholder="you@company.com"
                      className={cn(
                        "w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm",
                        loginForm.formState.errors.email ? "border-red-500/60" : ""
                      )}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <GlassButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  magnetic
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  <span>Send 8-Character Code</span>
                  <ArrowRight size={16} />
                </GlassButton>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <GlassButton
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setSubmitError(null);
                    const { error } = await useAuthStore.getState().signInWithGoogle();
                    setIsSubmitting(false);
                    if (error) setSubmitError(error);
                  }}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </GlassButton>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(false); setSubmitError(null); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Need an account? Start Free Trial
                  </button>
                </div>
              </motion.form>
            ) : (
              /* ── SIGNUP MODE ── */
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className="flex flex-col"
              >
                <div className="p-6 space-y-4">
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Business Name
                          </label>
                          <input
                            type="text"
                            {...signupForm.register("businessName")}
                            placeholder="e.g. Acme Dental Clinic"
                            className={cn(
                              "glass-input w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500",
                              signupForm.formState.errors.businessName ? "border-red-500/50 focus:border-red-400" : ""
                            )}
                          />
                          {signupForm.formState.errors.businessName && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.businessName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Business Type
                          </label>
                          <div className="relative">
                            <select
                              {...signupForm.register("businessType")}
                              className={cn(
                                "glass-input w-full rounded-xl px-4 py-3 text-white text-sm appearance-none",
                                signupForm.formState.errors.businessType ? "border-red-500/50 focus:border-red-400" : ""
                              )}
                            >
                              <option value="" disabled className="bg-[#070d0b] text-zinc-400">Select your industry</option>
                              <option value="Beauty & Wellness" className="bg-[#070d0b] text-white">Beauty &amp; Wellness</option>
                              <option value="Medical & Dental" className="bg-[#070d0b] text-white">Medical &amp; Dental</option>
                              <option value="Consulting & Agency" className="bg-[#070d0b] text-white">Consulting &amp; Agency</option>
                              <option value="Home Services" className="bg-[#070d0b] text-white">Home Services</option>
                              <option value="Real Estate" className="bg-[#070d0b] text-white">Real Estate</option>
                              <option value="Fitness & Personal Training" className="bg-[#070d0b] text-white">Fitness &amp; Personal Training</option>
                              <option value="Hospitality & Dining" className="bg-[#070d0b] text-white">Hospitality &amp; Dining</option>
                              <option value="Other" className="bg-[#070d0b] text-white">Other</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                          </div>
                          {signupForm.formState.errors.businessType && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.businessType.message}</p>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Owner / Manager Name
                          </label>
                          <input
                            type="text"
                            {...signupForm.register("ownerName")}
                            placeholder="John Doe"
                            className={cn(
                              "glass-input w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500",
                              signupForm.formState.errors.ownerName ? "border-red-500/50 focus:border-red-400" : ""
                            )}
                          />
                          {signupForm.formState.errors.ownerName && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.ownerName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            {...signupForm.register("email")}
                            placeholder="john@example.com"
                            className={cn(
                              "glass-input w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500",
                              signupForm.formState.errors.email ? "border-red-500/50 focus:border-red-400" : ""
                            )}
                          />
                          {signupForm.formState.errors.email && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            {...signupForm.register("phone")}
                            placeholder="+1 (555) 000-0000"
                            className={cn(
                              "glass-input w-full rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-500",
                              signupForm.formState.errors.phone ? "border-red-500/50 focus:border-red-400" : ""
                            )}
                          />
                          {signupForm.formState.errors.phone && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.phone.message}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-6 pt-2 border-t border-white/[0.06] flex flex-col gap-4 mt-2">
                  <div className="flex gap-3">
                    {step > 1 && (
                      <GlassButton
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => setStep(1)}
                        className="px-6"
                      >
                        Back
                      </GlassButton>
                    )}

                    {step < 2 ? (
                      <GlassButton
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        <span>Continue</span>
                        <ArrowRight size={16} />
                      </GlassButton>
                    ) : (
                      <GlassButton
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Send 8-Character Code
                      </GlassButton>
                    )}
                  </div>

                  {step === 2 && (
                    <>
                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-white/[0.08]"></div>
                        <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or</span>
                        <div className="flex-grow border-t border-white/[0.08]"></div>
                      </div>

                      <GlassButton
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={async () => {
                          setIsSubmitting(true);
                          setSubmitError(null);
                          const { error } = await useAuthStore.getState().signInWithGoogle();
                          setIsSubmitting(false);
                          if (error) setSubmitError(error);
                        }}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </GlassButton>
                    </>
                  )}
                </div>

                <div className="text-center pb-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(true); setSubmitError(null); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                  <p className="text-center text-[10px] text-zinc-500">No credit card required &bull; 8-Character Secure Verification</p>
                </div>

                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => {
                    setHoneypot(e.target.value);
                    shield.setHoneypot(e.target.value.length > 0);
                  }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden', opacity: 0 }}
                />
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
