"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Cpu, 
  Calendar, 
  Bell, 
  UserCheck, 
  ShieldAlert, 
  GitBranch,
  Terminal,
  Layers
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { useUIStore } from "@/store/uiStore";
import { VIEWPORT_CONFIG } from "@/lib/motionVariants";

export function HowItWorksClient() {
  const openSignup = useUIStore((state) => state.openSignup);

  const workflowSteps = [
    {
      step: "01",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      title: "Multi-Channel Ingestion & Cryptographic Authentication",
      badge: "Ingestion Gateway",
      description:
        "When a prospective client sends a message via WhatsApp, Instagram Direct, or your website chat, the webhook hits StarX-Flow's Ingestion Gateway (/api/whatsapp/webhook).",
      details: [
        "Cryptographic HMAC-SHA256 signature validation against Meta App Secret",
        "Sliding-window idempotency cache (15-min TTL) eliminates duplicate delivery replays",
        "Payload normalized into a canonical event object with E.164 phone formatting",
      ],
      codeSnippet: `POST /api/whatsapp/webhook HTTP/1.1
Header: x-hub-signature-256: sha256=4f3a...
Payload: { "object": "whatsapp_business_account", "entry": [...] }
=> Ingestion Gateway: HMAC Validated -> Normalized to CanonicalInboundEvent`,
    },
    {
      step: "02",
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      title: "Context & Identity Resolution in Private CRM",
      badge: "Tenant Resolution",
      description:
        "The gateway resolves the merchant's isolated organization tenant and maps the sender's identifier to a unified customer record in the database.",
      details: [
        "Resolves existing customer history across phone, email, and social handle",
        "Loads active conversation thread and previous appointment context",
        "Retrieves merchant working hours, staff rosters, and cancellation policies",
      ],
      codeSnippet: `SELECT * FROM channel_identities WHERE external_user_id = '+15550199'
=> Customer Lead ID #8492 resolved: "Alex Chen" (2 previous visits, no flags)`,
    },
    {
      step: "03",
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "Retrieval-Augmented Intelligence & Tool Execution",
      badge: "AI Orchestrator",
      description:
        "The AI Receptionist references your private business knowledge base to formulate natural-language responses and calls structured server-side tools.",
      details: [
        "RAG retrieves verified service durations, prices, and prep requirements",
        "Strict prompt sandboxing prevents prompt injection or role modification",
        "Executes checkCalendarAvailability tool against Google Calendar or Microsoft Outlook",
      ],
      codeSnippet: `AI Orchestrator Call: checkCalendarAvailability({
  organizationId: "org_7721",
  serviceName: "Initial Dental Exam & Cleaning",
  date: "2026-11-12"
})
=> Returns available slots: [09:30, 11:00, 14:30] with Dr. Martinez`,
    },
    {
      step: "04",
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      title: "Atomic Concurrency Locking & 2-Way Calendar Sync",
      badge: "Double-Booking Defense",
      description:
        "Once the client confirms their desired time slot, StarX-Flow locks the appointment simultaneously into your connected calendar and your private database.",
      details: [
        "PostgreSQL btree_gist exclusion constraint on timestamp ranges blocks slot collisions",
        "Creates confirmed event via Google Calendar v3 API or Microsoft Graph API",
        "Dispatches instant WhatsApp confirmation and optional Stripe deposit checkout link",
      ],
      codeSnippet: `BEGIN TRANSACTION;
INSERT INTO appointments (org_id, provider_id, time_range) VALUES (...);
-- PostgreSQL exclusion constraint verifies zero overlap across staff rosters
COMMIT;
=> Google Calendar Event Created: Event ID #gcal_99182 locked.`,
    },
    {
      step: "05",
      icon: <Bell className="w-6 h-6 text-emerald-400" />,
      title: "Automated Post-Booking Lifecycle & Review Engine",
      badge: "Operational Follow-Up",
      description:
        "StarX-Flow automates pre-arrival forms, sends timely appointment reminders, and follows up post-service to drive Google Business Profile reviews.",
      details: [
        "Dispatches digital intake waiver link 24 hours prior to visit",
        "Sends interactive WhatsApp confirmation prompt 2 hours prior",
        "Triggers Google Review Booster message 2 hours post-checkout to capture 5-star ratings",
      ],
      codeSnippet: `[Cron Trigger: +2 Hours Post-Appointment]
"Hey Alex! Thanks for visiting today. If you loved your treatment, 
sharing feedback on Google helps our local staff immensely: [Review-Link]"`,
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
          <span className="text-zinc-300">How It Works</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
            <Layers size={12} className="text-emerald-400" />
            Technical Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-tight">
            How StarX-Flow operates. <br />
            <span className="text-gradient-silver">From inbound message to calendar lock.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto">
            Discover the technical pipeline that transforms conversational messaging on WhatsApp and Instagram into confirmed appointments with zero double-bookings.
          </p>
        </div>

        {/* Direct Answer Summary Block (AEO / GEO Extraction) */}
        <GlassPanel tier="panel" className="p-8 md:p-10 rounded-3xl mb-20 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Key Takeaway: The 5-Stage Automated Booking Lifecycle</h2>
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
                StarX-Flow operates an event-driven automation lifecycle: <strong>(1) Inbound Ingestion</strong> validates Meta HMAC-SHA256 signatures and checks idempotency; <strong>(2) CRM Resolution</strong> identifies client history and tenant working hours; <strong>(3) AI Orchestration</strong> references private RAG knowledge documents to answer FAQs and check live provider availability; <strong>(4) Concurrency Locking</strong> writes atomic PostgreSQL exclusion locks and creates two-way calendar events in Google Calendar or Outlook; and <strong>(5) Post-Booking Lifecycle</strong> dispatches digital intake forms, confirmations, and automated Google Review requests.
              </p>
            </div>
          </div>
        </GlassPanel>

        {/* Step-by-Step Workflow Runbook */}
        <div className="space-y-12 mb-24">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Step Header */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{step.step}</span>
                    <span className="text-xs font-bold text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-2 pt-2 text-xs md:text-sm text-zinc-300 font-medium">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Technical Execution Snippet */}
                <div className="lg:col-span-7 bg-black/80 rounded-2xl p-5 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto shadow-2xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-emerald-400" />
                      <span>Pipeline Execution Trace</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400/80">Stage {step.step} Active</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-[11px] md:text-xs text-emerald-400/90 font-mono">
                    {step.codeSnippet}
                  </pre>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Human Escalation Safeguard Section */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 mb-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              The Intelligent Human Handoff Safeguard
            </h2>
            <p className="text-sm md:text-base text-zinc-300 font-normal leading-relaxed">
              Automation should never trap your customers in an endless loop. If a client expresses frustration, asks for a human manager, or mentions clinical urgency, StarX-Flow immediately pauses automated AI responses, alerts your desktop and staff dashboard with an audible chime, and transitions the thread to manual human control.
            </p>
          </div>
        </div>

        {/* Technical Limitations & Prerequisites */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Technical Prerequisites & API Constraints
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              We believe in total transparency regarding third-party platform rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-2">Meta 24-Hour Window</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Under Meta business policies, free-form customer service messages can only be sent within 24 hours of the user&apos;s last inbound message. Beyond 24 hours, pre-approved Meta message templates are required.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-2">Calendar Permission Scopes</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                StarX-Flow requires Calendars.ReadWrite permission on Google Calendar or Microsoft Outlook to read availability and insert event blocks.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-2">Meta Phone Number Rules</h3>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                To connect a phone number to the WhatsApp Cloud API, that number must not be currently registered on the personal or standard WhatsApp Business mobile app.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <GlassButton
            size="lg"
            variant="primary"
            magnetic
            onClick={openSignup}
          >
            Deploy Your AI Front Desk <ArrowRight size={18} />
          </GlassButton>
        </div>

      </div>
    </div>
  );
}
