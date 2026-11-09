"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useUIStore } from "@/store/uiStore";

export function IntegrationsClient() {
  const openSignup = useUIStore((state) => state.openSignup);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const liveIntegrations = [
    {
      name: "Google Calendar",
      category: "Calendar & Scheduling",
      status: "LIVE & VERIFIED",
      statusColor: "emerald",
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
      statusColor: "emerald",
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
      statusColor: "emerald",
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
      statusColor: "emerald",
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
      statusColor: "emerald",
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      description:
        "Stripe hosted checkout integration supporting secure merchant subscription billing and optional upfront appointment deposit collection.",
      capabilities: [
        "Generates secure Stripe Checkout sessions with tenant metadata",
        "Webhook event processing for subscription activation and renewals",
        "Zero payment card data stored on StarX-Flow servers (PCI-DSS compliant)",
      ],
      authType: "Stripe API & Webhook Secret Validation",
    },
    {
      name: "Resend Transactional Email",
      category: "Email & Notifications",
      status: "LIVE & VERIFIED",
      statusColor: "emerald",
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
      q: "Does connecting my calendar give StarX-Flow access to personal emails?",
      a: "No. StarX-Flow requests strictly scoped permissions (Calendars.ReadWrite) via official Google and Microsoft OAuth consent screens. We never request, read, or store your private emails, Google Drive files, or personal contacts.",
    },
    {
      q: "How does StarX-Flow prevent two clients from booking the exact same time slot?",
      a: "When a customer requests a booking, StarX-Flow queries your connected calendar in real time. Before confirming, it writes a PostgreSQL exclusion constraint lock into your isolated tenant database, rejecting any concurrent attempt for the same provider time window.",
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
    <div className="pt-32 lg:pt-40 pb-20 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Background Ambience */}
      <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] atmo-glow atmo-glow-emerald opacity-15 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] atmo-glow atmo-glow-soft opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Verified Integrations Directory</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Ecosystem & APIs
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-tight">
            Connect your core tools. <br />
            <span className="text-gradient-silver">Without aggregator middleman fees.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto">
            StarX-Flow integrates directly with enterprise calendar APIs, Meta messaging networks, and payment infrastructure through authorized OAuth2 protocols.
          </p>
        </div>

        {/* Direct Answer Block (AEO / GEO Extraction) */}
        <GlassPanel tier="panel" className="p-8 md:p-10 rounded-3xl mb-20 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Key Takeaway: Verified Integrations</h2>
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
                StarX-Flow natively integrates with <strong>Google Calendar (v3 API)</strong> and <strong>Microsoft Outlook (Graph API)</strong> for real-time two-way appointment scheduling; <strong>Meta WhatsApp Cloud API</strong> and <strong>Instagram Direct</strong> for conversational front-desk automation; <strong>Stripe</strong> for flat-rate merchant billing and deposit processing; and <strong>Resend</strong> for transactional email confirmations. All calendar and messaging connections are isolated via tenant-scoped OAuth2 tokens with zero third-party data sharing.
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Live Integrations Grid */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            Live & Verified Integrations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveIntegrations.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 rounded-3xl flex flex-col justify-between border border-white/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 mt-auto">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Capabilities:</div>
                  <ul className="space-y-2 text-xs text-zinc-400 font-medium mb-4">
                    {item.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[11px] font-semibold text-zinc-500 pt-2 border-t border-white/5">
                    Auth: {item.authType}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integrations In Development */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
            Integrations In Development & Roadmap
          </h2>
          <p className="text-zinc-400 text-sm font-medium mb-8">
            In accordance with our strict product transparency policy, these integrations are planned or in sandbox testing and are not yet available on production accounts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {inDevelopment.map((item, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-950/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.category}</span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full uppercase">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Integration & Security Questions
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              Understand how data moves securely between StarX-Flow and your external tools.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-base md:text-lg text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm md:text-base text-zinc-400 font-medium leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <button
            onClick={openSignup}
            className="bg-emerald-500 text-black px-8 py-4 rounded-full text-base font-bold hover:bg-emerald-400 transition-all inline-flex items-center gap-2"
          >
            Connect Your Calendar in 5 Minutes <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
