"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, Loader2, Sparkles, Calendar, ArrowRight, ShieldCheck, Clock, MessageSquare } from "lucide-react";
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

export function DemoPageClient() {
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
      businessType: "Beauty & Salons",
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

  if (successData) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Demonstration Request Confirmed</h2>
        <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
          {successData.message}
        </p>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400 mb-8 font-mono">
          Reference Code: <span className="text-emerald-400 font-semibold">{successData.referenceId}</span>
        </div>
        <p className="text-xs text-zinc-500">
          We will review your business profile and reach out via your preferred channel within 2 business hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {submitError}
        </div>
      )}

      {/* Hidden Honeypot */}
      <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Your Full Name <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("fullName")}
            placeholder="Dr. Sarah Jenkins"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          />
          {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Work Email Address <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("workEmail")}
            type="email"
            placeholder="sarah@cityclinic.co.uk"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          />
          {errors.workEmail && <p className="text-[11px] text-red-400 mt-1">{errors.workEmail.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Business Name <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("businessName")}
            placeholder="City Aesthetic & Dental"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          />
          {errors.businessName && <p className="text-[11px] text-red-400 mt-1">{errors.businessName.message}</p>}
        </div>

        {/* Business Type / Industry */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Industry Vertical <span className="text-emerald-400">*</span>
          </label>
          <select
            {...register("businessType")}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="Beauty & Salons">Hair Salons & Beauty Studios</option>
            <option value="Medical & Dental">Dental & Aesthetic Clinics</option>
            <option value="Gyms & Fitness Studios">Gyms & Boutique Fitness</option>
            <option value="Wellness & Spas">Day Spas & Wellness Centers</option>
            <option value="Professional & Trades">Professional Services & Trades</option>
            <option value="Other">Other Service Business</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Phone / WhatsApp Number
          </label>
          <input
            {...register("phone")}
            placeholder="+44 7700 900077"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Business Size */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Team Size</label>
          <select
            {...register("businessSize")}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="Solo (1 staff)">Solo Practitioner (1 staff)</option>
            <option value="2–5 staff">Small Team (2–5 staff)</option>
            <option value="6–15 staff">Growing Practice (6–15 staff)</option>
            <option value="16+ staff">Multi-Location (16+ staff)</option>
          </select>
        </div>

        {/* Preferred Channel */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Preferred Contact</label>
          <select
            {...register("preferredContact")}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
      </div>

      {/* Primary Automation Goal */}
      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          Primary Operational Problem to Solve
        </label>
        <select
          {...register("primaryNeed")}
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
        >
          <option value="WhatsApp AI Booking">Automate after-hours bookings on WhatsApp & Instagram</option>
          <option value="Missed Calls & Triage">Eliminate phone tag and repetitive FAQ answering</option>
          <option value="Calendar Double Booking Prevention">Two-way Google / Outlook calendar sync without double-bookings</option>
          <option value="Reduce No-Shows">Automate intake forms, deposit collection & reminders</option>
          <option value="Multi-Location Routing">Centralize multi-staff and multi-room scheduling</option>
        </select>
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
          />
          <span className="text-xs text-zinc-400 leading-relaxed">
            I agree to receive a tailored product demonstration and follow-up from the StarX-Flow team in accordance with the{" "}
            <a href="/privacy" className="text-emerald-400 underline hover:text-emerald-300" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            . We never share your data or send spam.
          </span>
        </label>
        {errors.consent && <p className="text-[11px] text-red-400 mt-1">{errors.consent.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scheduling Your Demonstration...</span>
          </>
        ) : (
          <>
            <span>Request Tailored Demonstration</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-6 text-[11px] text-zinc-500 pt-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> 15-Minute Tailored Walkthrough
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No Credit Card Required
        </span>
      </div>
    </form>
  );
}
