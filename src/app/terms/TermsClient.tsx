"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function TermsClient() {
  return (
    <div className="pt-32 lg:pt-40 pb-20 min-h-screen relative z-10 bg-[#020a07] text-[#f0f5ef] overflow-hidden">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(40, 223, 160, 0.16) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 80%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-emerald-300">Terms of Service</span>
        </nav>

        <div className="mb-14">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Merchant Operating Agreement
          </div>
          <h1 className="font-editorial text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Terms of <span className="text-gradient-emerald">Service</span>
          </h1>
          <p className="text-[#b8c9bd] font-mono text-xs">Last updated: November 15, 2026 • Effective upon account creation</p>
        </div>

        <div className="glass-panel p-8 md:p-14 rounded-[2.5rem] border-emerald-400/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.1)]">
          <div className="space-y-12">
            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                By creating an account, connecting third-party calendars, or utilizing StarX Flow software, you enter into a binding agreement with StarX Flow (&ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) and agree to abide by these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">2. Description of Platform &amp; Services</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow provides an autonomous conversational front desk operating system that integrates with Meta WhatsApp Cloud API, Instagram Direct, Google Calendar, and Microsoft Outlook to automate appointment bookings, customer intake, and operational communications.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">3. Flat Subscriptions &amp; Zero Commission Policy</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow operates strictly on transparent monthly software subscription tiers ($29 Starter, $59 Growth, $99 Pro). We charge zero percent (0%) commissions on appointments booked, services completed, or revenue processed through your platform.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">4. Merchant Ownership of Client Data</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                You retain 100% intellectual property and commercial ownership of your client lists, appointment histories, intake waiver records, and conversation logs. StarX Flow never sells, aggregates, or monetizes merchant customer data.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">5. Third-Party Messaging Platform Compliance</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                Merchants connecting WhatsApp or Instagram channels agree to operate in strict compliance with Meta Commercial Policies and WhatsApp Business Messaging rules. Automated spamming, unsolicited mass marketing, or deceptive communications are strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">6. Subscription Cancellation &amp; Data Deletion</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                You may cancel your monthly subscription at any time with one click in your billing settings. Upon cancellation, your OAuth calendar access tokens are revoked immediately, and you may export or trigger permanent deletion of your tenant database records via our GDPR management tools.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
