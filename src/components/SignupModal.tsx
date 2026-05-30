import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Loader2, ChevronDown, Mail, CheckCircle } from "lucide-react";
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
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sendMagicLink = useAuthStore((state) => state.sendMagicLink);

  const shield = useShield();
  const [honeypot, setHoneypot] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [cooldown, setCooldown] = useState(false);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, isSubmitting]);

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await signupForm.trigger(["businessName", "businessType"]);
      if (isValid) setStep(2);
    }
  };

  // Sign Up → Send Magic Link with metadata
  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const score = shield.getScore();
    if (score < 5) {
      setSentEmail(data.email);
      setMagicLinkSent(true);
      setIsSubmitting(false);
      return;
    }

    const now = Date.now();
    if (now < lockedUntil) {
      setSubmitError("Too many attempts. Please wait 5 minutes.");
      setIsSubmitting(false);
      return;
    }
    if (cooldown) {
      setIsSubmitting(false);
      return;
    }

    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= 3) setLockedUntil(Date.now() + 5 * 60 * 1000);
      return next;
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);

    const { error } = await sendMagicLink(data.email, {
      business_name: data.businessName,
      owner_name: data.ownerName,
      business_type: data.businessType,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setSentEmail(data.email);
      setMagicLinkSent(true);
    }
  };

  // Login → Send Magic Link (no metadata)
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const score = shield.getScore();
    if (score < 5) {
      setSentEmail(data.email);
      setMagicLinkSent(true);
      setIsSubmitting(false);
      return;
    }

    const now = Date.now();
    if (now < lockedUntil) {
      setSubmitError("Too many attempts. Please wait 5 minutes.");
      setIsSubmitting(false);
      return;
    }
    if (cooldown) {
      setIsSubmitting(false);
      return;
    }

    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= 3) setLockedUntil(Date.now() + 5 * 60 * 1000);
      return next;
    });
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);

    const { error } = await sendMagicLink(data.email);

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
    } else {
      setSentEmail(data.email);
      setMagicLinkSent(true);
    }
  };

  // ── Magic Link Sent Screen ──
  if (magicLinkSent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md glass-panel rounded-2xl overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1, damping: 15 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20"
            >
              <Mail className="w-9 h-9 text-emerald-400" />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-2">
              We sent a magic login link to
            </p>
            <p className="text-sm font-semibold text-emerald-400 mb-6">{sentEmail}</p>
            <p className="text-xs text-zinc-500 leading-relaxed mb-8">
              Click the link in the email to access your dashboard. If you don't see it, check your spam folder.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium rounded-full py-3 transition-colors text-sm"
            >
              Close
            </button>
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md glass-panel rounded-2xl overflow-hidden ring-1 ring-emerald-500/10 flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLoginMode ? "Sign In to StarX Flow" : "Start Free Trial"}
            </h2>
            {!isLoginMode && (
              <p className="text-xs text-zinc-400 mt-1">Step {step} of 2</p>
            )}
            {isLoginMode && (
              <p className="text-xs text-zinc-400 mt-1">We'll send you a magic login link</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (signup only) */}
        {!isLoginMode && (
          <div className="w-full h-1 bg-zinc-900">
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
            className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
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
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email"
                      {...loginForm.register("email")}
                      placeholder="you@company.com"
                      className={cn(
                        "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg pl-11 pr-4 py-3 text-white transition-colors text-sm",
                        loginForm.formState.errors.email ? "border-red-500/50" : "border-white/10"
                      )}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-bold rounded-full py-3.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Send Magic Link <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    setSubmitError(null);
                    const { error } = await useAuthStore.getState().signInWithGoogle();
                    setIsSubmitting(false);
                    if (error) setSubmitError(error);
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-white/10 disabled:opacity-70 text-white font-medium rounded-full py-3.5 transition-all flex items-center justify-center gap-3 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(false); setSubmitError(null); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Don't have an account? Start a free trial
                  </button>
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
            ) : (
              /* ── SIGNUP MODE ── */
              <form key="signup-form" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="signup-step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Business Name
                          </label>
                          <input
                            {...signupForm.register("businessName")}
                            placeholder="E.g. Apex Massage Salon"
                            className={cn(
                              "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors text-sm",
                              signupForm.formState.errors.businessName ? "border-red-500/50" : "border-white/10"
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
                                "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white appearance-none transition-colors text-sm",
                                signupForm.formState.errors.businessType ? "border-red-500/50" : "border-white/10"
                              )}
                            >
                              <option value="" disabled>Select a business type</option>
                              <option value="Restaurant">Restaurant (e.g., Cafe, Pizzeria)</option>
                              <option value="Salon">Salon (e.g., Hair, Nails, Spa)</option>
                              <option value="Gym">Gym (e.g., Fitness Center, Yoga)</option>
                              <option value="Medical">Medical (e.g., Clinic, Dental)</option>
                              <option value="Agency">Agency (e.g., Real Estate, Consulting)</option>
                              <option value="Other">Other Services</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                          </div>
                          {signupForm.formState.errors.businessType && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.businessType.message}</p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="signup-step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Owner Name</label>
                          <input
                            {...signupForm.register("ownerName")}
                            placeholder="Full Name"
                            className={cn(
                              "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors text-sm",
                              signupForm.formState.errors.ownerName ? "border-red-500/50" : "border-white/10"
                            )}
                          />
                          {signupForm.formState.errors.ownerName && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.ownerName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                          <input
                            type="email"
                            {...signupForm.register("email")}
                            placeholder="you@company.com"
                            className={cn(
                              "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors text-sm",
                              signupForm.formState.errors.email ? "border-red-500/50" : "border-white/10"
                            )}
                          />
                          {signupForm.formState.errors.email && (
                            <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            {...signupForm.register("phone")}
                            placeholder="+44 7123 456789"
                            className={cn(
                              "w-full bg-[#111] border focus:border-emerald-500/50 outline-none rounded-lg px-4 py-3 text-white transition-colors text-sm",
                              signupForm.formState.errors.phone ? "border-red-500/50" : "border-white/10"
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

                <div className="p-6 pt-2 border-t border-white/5 flex flex-col gap-4 mt-2">
                  <div className="flex gap-4">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3 rounded-full text-zinc-400 hover:text-white font-medium hover:bg-white/5 transition-colors text-sm"
                      >
                        Back
                      </button>
                    )}

                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full py-3 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm"
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-bold rounded-full py-3 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Send Magic Link"}
                      </button>
                    )}
                  </div>

                  {step === 2 && (
                    <>
                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">Or</span>
                        <div className="flex-grow border-t border-zinc-800"></div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          setIsSubmitting(true);
                          setSubmitError(null);
                          const { error } = await useAuthStore.getState().signInWithGoogle();
                          setIsSubmitting(false);
                          if (error) setSubmitError(error);
                        }}
                        disabled={isSubmitting}
                        className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-white/10 disabled:opacity-70 text-white font-medium rounded-full py-3 transition-all flex items-center justify-center gap-3 text-sm"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </button>
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
                  <p className="text-center text-[10px] text-zinc-500">No credit card required · Passwordless login</p>
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
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
