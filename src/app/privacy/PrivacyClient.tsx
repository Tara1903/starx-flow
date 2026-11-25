"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function PrivacyClient() {
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
          <span className="text-emerald-300">Privacy Policy</span>
        </nav>

        <div className="mb-14">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Data Protection &amp; Governance
          </div>
          <h1 className="font-editorial text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Privacy <span className="text-gradient-emerald">Policy</span>
          </h1>
          <p className="text-[#b8c9bd] font-mono text-xs">Last updated: November 15, 2026 • Compliant with GDPR Articles 17 &amp; 20</p>
        </div>

        <div className="glass-panel p-8 md:p-14 rounded-[2.5rem] border-emerald-400/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.1)]">
          <div className="space-y-12">
            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                We collect information that you provide directly to us when creating a merchant account, connecting your calendars, or communicating with customer care. This includes your name, verified work email address, business phone number, staff rosters, service menus, and calendar availability.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">2. Tenant Isolation &amp; Zero Cross-Merchant Training</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                Every merchant organization is isolated by PostgreSQL Row Level Security (RLS) policies. Your client conversations, booking schedules, and intake waiver records are never shared with or exposed to any other business. We strictly do not use merchant client conversations to train public or external AI models.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">3. Data Security, Transport &amp; Storage Encryption</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                All data in transit is encrypted using TLS 1.3 with HTTP Strict Transport Security (HSTS) enforced across all endpoints. Persistent database records are encrypted at rest with AES-256. Webhooks from Meta WhatsApp Cloud API and Instagram Direct are validated cryptographically with HMAC-SHA256 signatures.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">4. WhatsApp, Meta &amp; Messaging Integrations</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow interfaces directly with Meta&apos;s official WhatsApp Business Cloud API and Instagram Messaging API. Messages sent by clients to your business channels are processed solely to execute automated scheduling, answer merchant FAQs, and confirm appointments. You retain complete ownership of your customer list and conversation records.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">5. Google Calendar API &amp; Limited Use Disclosure</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal mb-4">
                When you choose to connect Google Calendar, StarX Flow requests only the permissions required for scheduling automation (<span className="font-mono text-emerald-300 text-sm">calendar.readonly</span> and <span className="font-mono text-emerald-300 text-sm">calendar.events</span>):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal mb-4">
                <li>Reading available calendars and busy time blocks solely to compute conflict-free appointment slots.</li>
                <li>Creating, updating, and canceling booking events on your selected calendar at a customer&apos;s or merchant&apos;s explicit request.</li>
                <li>Google OAuth access and refresh tokens are encrypted at rest with AES-256-GCM and can be revoked at any time via Workspace Settings or your Google Account permissions.</li>
              </ul>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements. Google Workspace data is never sold, used for advertising, or used to train generalized AI models.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">6. Programmatic GDPR Rights (Export &amp; Erasure)</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                Under GDPR Articles 17 and 20, merchants and their consumers possess the right to data portability and complete erasure. StarX Flow provides automated API endpoints (/api/gdpr/export and /api/gdpr/delete) allowing instant JSON export and irreversible cascade deletion of all personal data upon request.
              </p>
            </section>

            <section>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4">7. Contact Security &amp; Privacy Engineering</h2>
              <p className="text-base md:text-lg text-[#b8c9bd] leading-relaxed font-normal">
                For questions regarding this Privacy Policy or to submit compliance requests, please email our security officer at{" "}
                <a href="mailto:privacy@starx-flow.runs-on.dev" className="text-emerald-400 underline font-mono">
                  privacy@starx-flow.runs-on.dev
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
