"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, CheckCircle, Loader2, Sparkles, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const demoSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  workEmail: z.string().trim().email("Please enter a valid work email"),
  phone: z.string().trim().optional(),
  businessName: z.string().trim().min(2, "Business name is required"),
  businessType: z.string().min(1, "Please select an industry"),
  businessSize: z.string().min(1, "Please select business size"),
  primaryNeed: z.string().min(1, "Please select primary automation goal"),
  preferredContact: z.enum(["email", "whatsapp", "phone"]),
  website: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
  honeypot: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Consent is required to schedule your demonstration",
  }),
});

type DemoFormValues = z.infer<typeof demoSchema>;

interface DemoModalProps {
  onClose: () => void;
}

export function DemoModal({ onClose }: DemoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ referenceId: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      phone: "",
      businessName: "",
      businessType: "Gyms & Fitness Studios",
      businessSize: "2–10 staff",
      primaryNeed: "WhatsApp AI Booking",
      preferredContact: "email",
      website: "",
      notes: "",
      honeypot: "",
      consent: true,
    },
  });

  const preferredContact = watch("preferredContact");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, isSubmitting]);

  const onSubmit = async (data: DemoFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request.");
      }

      setSuccessData({
        referenceId: result.referenceId || "DEMO-CONFIRMED",
        message: result.message || "Your demonstration request has been received.",
      });
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-xl my-8 bg-zinc-950 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden"
      >
        {/* Atmosphere glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close demo modal"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        {successData ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 id="demo-modal-title" className="text-2xl font-bold text-white">
              Demonstration Confirmed
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              {successData.message}
            </p>
            <div className="inline-block px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
              Reference: {successData.referenceId}
            </div>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all"
              >
                Back to Site
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Calendar size={13} />
              <span>Personalized Walkthrough</span>
            </div>

            <h2 id="demo-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Request an Architecture Demo
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 mb-6 leading-relaxed">
              Explore how StarX-Flow automates your bookings, syncs with Google Calendar/Outlook, and handles customer care with zero double-booking risk.
            </p>

            {submitError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              {/* Honeypot field for bot trap */}
              <input
                type="text"
                {...register("honeypot")}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  {errors.fullName && <p className="text-red-400 text-[11px] mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Work Email *</label>
                  <input
                    type="email"
                    {...register("workEmail")}
                    placeholder="sarah@yourpractice.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  {errors.workEmail && <p className="text-red-400 text-[11px] mt-1">{errors.workEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Business Name *</label>
                  <input
                    type="text"
                    {...register("businessName")}
                    placeholder="e.g. Apex Health & Aesthetics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  {errors.businessName && <p className="text-red-400 text-[11px] mt-1">{errors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Industry Vertical *</label>
                  <select
                    {...register("businessType")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Gyms & Fitness Studios">Gyms & Fitness Studios</option>
                    <option value="Medical & Dental Clinics">Medical & Dental Clinics</option>
                    <option value="Hair & Beauty Salons">Hair & Beauty Salons</option>
                    <option value="Spa & Wellness Centers">Spa & Wellness Centers</option>
                    <option value="Hotels & Hospitality">Hotels & Hospitality</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Other Commercial Business">Other Commercial Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Team Size</label>
                  <select
                    {...register("businessSize")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Solo Practitioner">Solo Practitioner (1 staff)</option>
                    <option value="2–10 staff">Boutique Team (2–10 staff)</option>
                    <option value="11–50 staff">Growth Business (11–50 staff)</option>
                    <option value="50+ staff">Multi-Location / Enterprise (50+ staff)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Primary Automation Goal</label>
                  <select
                    {...register("primaryNeed")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="WhatsApp AI Booking">WhatsApp AI Direct Booking</option>
                    <option value="Instagram DM Lead Qualification">Instagram DM Lead Qualification</option>
                    <option value="Google Calendar & Outlook Sync">Real-Time Calendar Sync</option>
                    <option value="24/7 AI Receptionist & FAQ Care">24/7 AI Receptionist & Care</option>
                    <option value="Full Automation Operating System">Full Automation Operating System</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Preferred Contact Channel</label>
                  <select
                    {...register("preferredContact")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Direct Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Phone Number {preferredContact !== "email" && "*"}
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+44 7911 123456 or +353 87 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Website or Instagram Handle (Optional)</label>
                <input
                  type="text"
                  {...register("website")}
                  placeholder="https://yourbusiness.com or @yourbusiness"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("consent")}
                    className="mt-0.5 rounded bg-zinc-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-zinc-400 leading-tight">
                    I agree to allow StarX-Flow to contact me regarding this demonstration request. We respect your privacy and never sell or distribute your data.
                  </span>
                </label>
                {errors.consent && <p className="text-red-400 text-[11px] mt-1">{errors.consent.message}</p>}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Confirm Demo Request</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Zero obligation • 14-day evaluation included • GDPR compliant</span>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
