"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  Sparkles,
  Layers,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export function IntegrationsClient() {
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const prefersReduced = useReducedMotion();

  const liveIntegrations = [
    {
      name: "Google Calendar",
      category: "Calendar & Scheduling",
      status: "LIVE & VERIFIED",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      description:
        "Official OAuth2 authorization flow granting real-time bi-directional availability checks and instant event booking into Google Calendar v3 accounts.",
      capabilities: [
        "Checks multi-staff availability in under 300ms",
        "Locks appointments directly into your Google Calendar",
        "Respects personal blockouts, vacations, and existing appointments",
      ],
      authType: "OAuth 2.0 (Google Identity Services)",
    },
    {
      name: "Microsoft Outlook & Office 365",
      category: "Calendar & Scheduling",
      status: "LIVE & VERIFIED",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      description:
        "Microsoft Graph API integration supporting business Exchange, Office 365, and Outlook calendars with delegated permission scoping.",
      capabilities: [
        "Bi-directional synchronization with Microsoft Exchange calendars",
        "Supports organizational multi-provider room schedules",
        "Automatic timezone conversion and attendee invite dispatch",
      ],
      authType: "OAuth 2.0 (Microsoft Identity Platform)",
    },
    {
      name: "Meta WhatsApp Cloud API",
      category: "Conversational Messaging",
      status: "LIVE & VERIFIED",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      description:
        "Direct integration with Meta's official WhatsApp Business Cloud API. Normalizes incoming messages and executes autonomous 24/7 client booking conversations.",
      capabilities: [
        "HMAC-SHA256 cryptographic signature verification on every payload",
        "E.164 international phone number normalization",
        "Automated booking confirmations and Google review boosters",
      ],
      authType: "Official Meta Webhooks & Cloud API Tokens",
    },
    {
      name: "Instagram Direct Messaging",
      category: "Social Lead Capture",
      status: "LIVE & VERIFIED",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      description:
        "Meta Graph API connection for professional Instagram business accounts. Automates inbound DM lead triage and schedules appointments without leaving Instagram.",
      capabilities: [
        "Captures inbound Story replies and direct message inquiries",
        "Qualifies prospective clients and checks availability",
        "Routes complex or high-value inquiries to human staff",
      ],
      authType: "Meta Graph API (Instagram Messaging Webhooks)",
    },
    {
      name: "Stripe Billing & Checkout",
      category: "Payments & Invoicing",
      status: "LIVE & VERIFIED",
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      description:
        "Stripe hosted checkout integration supporting secure merchant subscription billing and optional upfront appointment deposit collection.",
      capabilities: [
        "Generates secure Stripe Checkout sessions with tenant metadata",
        "Webhook event processing for subscription activation and renewals",
        "Zero payment card data stored on StarX Flow servers (PCI-DSS compliant)",
      ],
      authType: "Stripe API & Webhook Secret Validation",
    },
    {
      name: "Resend Transactional Email",
      category: "Email & Notifications",
      status: "LIVE & VERIFIED",
      icon: <Mail className="w-6 h-6 text-emerald-400" />,
      description:
        "Transactional email infrastructure for dispatching instant calendar booking receipts, reminder notices, and staff cancellation alerts.",
      capabilities: [
        "Verified DKIM/SPF domain sending for high deliverability",
        "Instant delivery of ICS calendar invite attachments",
        "Delivery receipt and open tracking via Resend webhooks",
      ],
      authType: "Resend API & Domain Verification",
    },
  ];

  const inDevelopment = [
    {
      name: "Square POS & Appointments",
      category: "Point of Sale & Booking",
      status: "IN DEVELOPMENT",
      description:
        "Two-way synchronization with Square POS inventories and appointment calendars. Currently undergoing sandbox API testing for Phase 5 release.",
    },
    {
      name: "Clover POS",
      category: "Point of Sale",
      status: "PLANNED",
      description:
        "Roster and employee shift synchronization with Clover retail and salon POS terminals. Slated for future development.",
    },
    {
      name: "Twilio Voice Telephony",
      category: "Inbound Calling",
      status: "IN DEVELOPMENT",
      description:
        "Conversational AI audio streams for automated phone reception. Currently operating in private internal alpha testing.",
    },
  ];

  const faqs = [
    {
      q: "Does connecting my calendar give StarX Flow access to personal emails?",
      a: "No. StarX Flow requests strictly scoped permissions (Calendars.ReadWrite) via official Google and Microsoft OAuth consent screens. We never request, read, or store your private emails, Google Drive files, or personal contacts.",
    },
    {
      q: "How does StarX Flow prevent two clients from booking the exact same time slot?",
      a: "When a customer requests a booking, StarX Flow queries your connected calendar in real time. Before confirming, it writes a PostgreSQL exclusion constraint lock into your isolated tenant database, rejecting any concurrent attempt for the same provider time window.",
    },
    {
      q: "Do I need a Meta Developer account to use the WhatsApp integration?",
      a: "No. Merchants connect their WhatsApp Business account through our streamlined onboarding wizard (/setup/whatsapp) using official Meta embedded signup.",
    },
    {
      q: "Can I disconnect an integration at any time?",
      a: "Yes. All integrations can be disconnected immediately from your dashboard with one click. When disconnected, OAuth tokens are permanently revoked and deleted from our database.",
    },
  ];

  return (
    <div className="pt-32 lg:pt-40 pb-20 lg:pb-28 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Background Emerald Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(40, 223, 160, 0.16) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-emerald-300">Verified Integrations Directory</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Ecosystem &amp; Authorized APIs
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.08]">
            Connect your core tools. <br />
            <span className="text-gradient-emerald">Without aggregator middleman fees.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#b8c9bd] font-normal leading-relaxed max-w-3xl mx-auto">
            StarX Flow integrates directly with enterprise calendar APIs, Meta messaging networks, and payment infrastructure through authorized OAuth2 protocols.
          </p>
        </div>

        {/* Direct Answer Block */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl mb-20 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(40,223,160,0.12)]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-2xl border border-emerald-400/30 text-emerald-300 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="font-editorial text-xl md:text-2xl font-bold text-white mb-2">
                Key Takeaway: Verified Integrations Directory
              </h2>
              <p className="text-sm md:text-base text-[#b8c9bd] leading-relaxed font-normal">
                StarX Flow natively integrates with <strong>Google Calendar (v3 API)</strong> and <strong>Microsoft Outlook (Graph API)</strong> for real-time two-way appointment scheduling; <strong>Meta WhatsApp Cloud API</strong> and <strong>Instagram Direct</strong> for conversational front-desk automation; <strong>Stripe</strong> for flat-rate merchant billing and deposit processing; and <strong>Resend</strong> for transactional email confirmations. All connections are isolated via tenant-scoped OAuth2 tokens with zero third-party data sharing.
              </p>
            </div>
          </div>
        </div>

        {/* Live Integrations Grid */}
        <div className="mb-24">
          <h2 className="font-editorial text-2xl md:text-4xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            Live &amp; Verified Integrations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {liveIntegrations.map((item) => (
              <div
                key={item.name}
                className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between border-emerald-500/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-emerald-500/15 rounded-2xl border border-emerald-400/30">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#b8c9bd] uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-white mb-3 tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[#b8c9bd] font-normal leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-emerald-500/20 pt-6 mt-auto">
                  <div className="text-xs font-mono font-bold text-emerald-200 uppercase tracking-wider mb-3">Capabilities:</div>
                  <ul className="space-y-2 text-xs text-[#b8c9bd] font-normal mb-4">
                    {item.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_6px_#34d399]" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] font-mono text-emerald-400/80 pt-3 border-t border-emerald-500/15">
                    Auth: {item.authType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations In Development */}
        <div className="mb-24">
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            Integrations In Development &amp; Sandbox Testing
          </h2>
          <p className="text-[#b8c9bd] text-sm font-normal mb-8">
            In accordance with our strict product transparency policy, these integrations are in active development or sandbox testing and will be released in future milestone updates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {inDevelopment.map((item) => (
              <div key={item.name} className="glass-panel p-6 rounded-2xl border-emerald-500/15 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#b8c9bd] uppercase tracking-wider">{item.category}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-xs text-[#b8c9bd] font-normal leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Integration &amp; Security Questions
            </h2>
            <p className="text-[#b8c9bd] text-base font-normal">
              Understand how data moves securely between StarX Flow and your external business tools.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="glass-panel rounded-2xl border-emerald-500/20 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-base md:text-lg text-white hover:text-emerald-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm md:text-base text-[#b8c9bd] font-normal leading-relaxed border-t border-emerald-500/15 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="glass-panel max-w-5xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center mb-8 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Connect your calendar in under 5 minutes
          </h2>
          <p className="text-lg text-[#b8c9bd] mb-9 max-w-2xl mx-auto leading-relaxed font-normal">
            No developer setup required. Connect your Google Calendar or Outlook account with official one-click OAuth.
          </p>
          <button
            type="button"
            onClick={openSignup}
            className="spatial-btn-primary"
          >
            Connect Your Calendar in 5 Minutes
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
