"use client";

import React, { useState } from "react";
import { CheckCircle, Loader2, Calendar, ArrowRight, ShieldCheck, Clock, MessageSquare } from "lucide-react";
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
      <div className="p-8 sm:p-12 rounded-3xl border border-emerald-400/30 bg-[#061a12]/80 text-center max-w-xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.15)]">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(40,223,160,0.2)]">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-3">Demonstration Request Confirmed</h2>
        <p className="text-sm text-[#b8c9bd] mb-6 leading-relaxed">
          {successData.message}
        </p>
        <div className="p-4 rounded-xl bg-[#010804] border border-emerald-500/20 text-xs text-[#b8c9bd] mb-8 font-mono">
          Reference Code: <span className="text-emerald-300 font-bold">{successData.referenceId}</span>
        </div>
        <p className="text-xs text-[#b8c9bd]/70">
          We will review your business profile and reach out via your preferred channel within 2 business hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
          {submitError}
        </div>
      )}

      {/* Hidden Honeypot */}
      <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
            Your Full Name <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("fullName")}
            placeholder="Dr. Sarah Jenkins"
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-colors"
          />
          {errors.fullName && <p className="text-[11px] text-red-400 mt-1 font-mono">{errors.fullName.message}</p>}
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
            Work Email Address <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("workEmail")}
            type="email"
            placeholder="sarah@cityclinic.co.uk"
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-colors"
          />
          {errors.workEmail && <p className="text-[11px] text-red-400 mt-1 font-mono">{errors.workEmail.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
            Business Name <span className="text-emerald-400">*</span>
          </label>
          <input
            {...register("businessName")}
            placeholder="City Aesthetic & Dental"
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/40 transition-colors"
          />
          {errors.businessName && <p className="text-[11px] text-red-400 mt-1 font-mono">{errors.businessName.message}</p>}
        </div>

        {/* Business Type / Industry */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
            Industry Vertical <span className="text-emerald-400">*</span>
          </label>
          <select
            {...register("businessType")}
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 transition-colors"
          >
            <option value="Beauty & Salons">Hair Salons &amp; Beauty Studios</option>
            <option value="Medical & Dental">Dental &amp; Aesthetic Clinics</option>
            <option value="Gyms & Fitness Studios">Gyms &amp; Boutique Fitness</option>
            <option value="Wellness & Spas">Day Spas &amp; Wellness Centers</option>
            <option value="Professional & Trades">Professional Services &amp; Trades</option>
            <option value="Other">Other Service Business</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
            Phone / WhatsApp Number
          </label>
          <input
            {...register("phone")}
            placeholder="+44 7700 900077"
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 transition-colors"
          />
        </div>

        {/* Business Size */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">Team Size</label>
          <select
            {...register("businessSize")}
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 transition-colors"
          >
            <option value="Solo (1 staff)">Solo Practitioner (1 staff)</option>
            <option value="2–5 staff">Small Team (2–5 staff)</option>
            <option value="6–15 staff">Growing Practice (6–15 staff)</option>
            <option value="16+ staff">Multi-Location (16+ staff)</option>
          </select>
        </div>

        {/* Preferred Channel */}
        <div>
          <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">Preferred Contact</label>
          <select
            {...register("preferredContact")}
            className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 transition-colors"
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
      </div>

      {/* Primary Automation Goal */}
      <div>
        <label className="block text-xs font-mono text-emerald-200/90 mb-1.5 uppercase tracking-wider">
          Primary Operational Problem to Solve
        </label>
        <select
          {...register("primaryNeed")}
          className="w-full px-4 py-3 rounded-xl bg-[#010804] border border-emerald-500/25 text-white text-sm outline-none focus:border-emerald-400/60 transition-colors"
        >
          <option value="WhatsApp AI Booking">Automate after-hours bookings on WhatsApp &amp; Instagram</option>
          <option value="Missed Calls & Triage">Eliminate phone tag and repetitive FAQ answering</option>
          <option value="Calendar Double Booking Prevention">Two-way Google / Outlook calendar sync without double-bookings</option>
          <option value="Reduce No-Shows">Automate intake forms, deposit collection &amp; reminders</option>
          <option value="Multi-Location Routing">Centralize multi-staff and multi-room scheduling</option>
        </select>
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 w-4 h-4 rounded border-emerald-500/30 bg-[#010804] text-emerald-400 focus:ring-emerald-400/40"
          />
          <span className="text-xs text-[#b8c9bd] leading-relaxed">
            I agree to receive a tailored product demonstration and follow-up from StarX Flow in accordance with the{" "}
            <a href="/privacy" className="text-emerald-400 underline hover:text-emerald-300" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            . We never share your data or send spam.
          </span>
        </label>
        {errors.consent && <p className="text-[11px] text-red-400 mt-1 font-mono">{errors.consent.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="spatial-btn-primary w-full py-4 text-base"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Scheduling Your Demonstration...</span>
          </>
        ) : (
          <>
            <span>Request Tailored Demonstration</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-6 text-[11px] text-[#b8c9bd]/70 pt-2 font-mono">
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
