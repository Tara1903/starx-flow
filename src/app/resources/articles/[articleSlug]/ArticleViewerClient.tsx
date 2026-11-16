"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle,
  Copy,
  Check
} from "lucide-react";
import { useUIStore } from "../../../../store/uiStore";
import { GlassPanel } from "../../../../components/ui/GlassPanel";

import { articleSchema } from '../../../../components/seo/SchemaMarkup';

interface ArticleData {
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  intro: string;
  sections: {
    heading: string;
    paragraphs: string[];
    listItems?: string[];
    snippet?: {
      title: string;
      code: string;
    };
  }[];
  metrics: {
    label: string;
    value: string;
    sub: string;
  }[];
}

const ARTICLES_DATABASE: Record<string, ArticleData> = {
  "calendar-integration": {
    title: "Why Polling APIs Cause Double-Bookings: How Real-Time Webhooks Protect Service Calendars",
    category: "Integrations & Concurrency",
    readTime: "6 min read",
    date: "November 2026",
    author: "StarX-Flow Engineering Team",
    intro: "Most scheduling widgets check external calendars on 10 to 15-minute polling cycles. In a busy clinic, gym, or salon, a 15-minute sync delay is a serious liability: multiple clients can book the same provider slot simultaneously. In this technical runbook, we explain how bi-directional webhook synchronization and database exclusion constraints eliminate double-bookings at the engine level.",
    sections: [
      {
        heading: "1. The Inherent Fragility of Polling-Interval Scheduling",
        paragraphs: [
          "Legacy scheduling software relies on polling: scheduled background jobs that request calendar data every few minutes. When two customers attempt to book the same therapist or dental chair during that sync window, both requests appear valid to the client software.",
          "By the time the system attempts to write the second event to Google Calendar, an irreconcilable conflict occurs. Staff are forced to call or message the client to reschedule, damaging customer trust and increasing administrative friction."
        ]
      },
      {
        heading: "2. Real-Time Bi-Directional Webhooks: Google Calendar & Microsoft Outlook",
        paragraphs: [
          "StarX-Flow replaces polling loops with event-driven webhooks. When an appointment is scheduled or modified on Google Calendar or Microsoft Outlook, an authorized webhook event notifies StarX-Flow within milliseconds.",
          "The autonomous AI receptionist references live availability via official APIs (Google Calendar v3 and Microsoft Graph API), checking provider capacity, lunch breaks, and buffer times before offering any time slot to a customer on WhatsApp or Instagram."
        ],
        snippet: {
          title: "Calendar Availability Check Trace",
          code: "[API Query: checkCalendarAvailability]\nProvider: 'Dr. Martinez' | Date: '2026-11-12'\nWorking Hours: 09:00 - 17:00\nGoogle Calendar Events:\n- 10:00 - 10:45 (Confirmed Cleaning)\n- 12:30 - 13:30 (Lunch Blockout)\nAvailable Slots Offered to WhatsApp Client:\n[09:00, 11:00, 14:00, 15:30]"
        }
      },
      {
        heading: "3. Database Exclusion Constraints: Concurrency Defense at the PostgreSQL Engine",
        paragraphs: [
          "Even with real-time webhooks, network concurrency can allow two incoming messages to target the same slot simultaneously. To guarantee absolute concurrency defense, StarX-Flow enforces PostgreSQL btree_gist exclusion constraints on appointment timestamp ranges.",
          "If two booking transactions for the same provider overlap, the PostgreSQL database engine immediately rejects the second transaction with a unique exclusion error. The AI receptionist gracefully offers the client the next available alternative slot in real time, preventing duplicate calendar writes."
        ]
      }
    ],
    metrics: [
      { label: "Sync Latency", value: "<300ms", sub: "event-driven webhook execution" },
      { label: "Concurrency Defense", value: "PostgreSQL", sub: "btree_gist exclusion constraints" },
      { label: "Supported Calendars", value: "Google & Outlook", sub: "two-way OAuth 2.0 authorization" }
    ]
  },
  "clinic-receptionist": {
    title: "Deploying AI Receptionists in Medical Practices: Administrative Guardrails and Triage",
    category: "Clinical AI & Operations",
    readTime: "7 min read",
    date: "November 2026",
    author: "StarX-Flow Product & Clinical Architecture Team",
    intro: "Dental practices, physical therapy clinics, and medical offices face a delicate balancing act: they must eliminate missed patient inquiries while upholding patient data privacy and safety boundaries. This runbook details how to configure conversational AI receptionists for administrative logistics without crossing clinical lines.",
    sections: [
      {
        heading: "1. Administrative Logistics vs. Medical Diagnoses: The Boundary Rule",
        paragraphs: [
          "In healthcare administration, conversational AI must strictly focus on administrative logistics: scheduling appointments, sharing clinic locations, confirming operating hours, and explaining cancellation policies. AI should never solicit, record, or attempt to diagnose medical symptoms over public messaging networks.",
          "StarX-Flow enforces prompt-level safety boundaries and RAG context retrieval. The assistant draws facts exclusively from verified merchant practice profiles and redirects clinical questions to licensed human practitioners."
        ]
      },
      {
        heading: "2. The Critical Symptom Escalation & Emergency Handoff Protocol",
        paragraphs: [
          "When a patient texts about severe symptoms—such as chest pain, sudden vision loss, severe dental bleeding, or acute trauma—the software must immediately halt automated conversation.",
          "Our system scans inbound text for clinical emergency trigger terms. When triggered, the assistant immediately advises the patient to seek urgent medical attention, alerts the clinic's staff dashboard with an audible chime, and routes the thread for human takeover."
        ],
        snippet: {
          title: "Clinical Emergency Escalation Script",
          code: "Patient: 'Hey, I had an extraction this morning and my jaw is bleeding heavily and throbbing.'\nAI Assistant: 'I am routing your message to our clinical staff immediately. Our practice manager has been notified.\n\nIf you are experiencing a life-threatening medical emergency, please call 911 or visit the nearest emergency room. A clinic staff member will text you directly here shortly.'\n[SYSTEM TRIGGER: Priority Alert dispatched to Dental Staff Dashboard]"
        }
      },
      {
        heading: "3. Two-Way Provider Calendar Synchronization & Room Allocation",
        paragraphs: [
          "To book effectively, the assistant must understand provider specialties, treatment durations, and operatory chair availability. Connecting Google Calendar or Microsoft Outlook ensures that routine cleanings, initial consultations, and follow-ups are booked with the correct staff member and room buffer.",
          "Client records and appointments are isolated in your dedicated tenant database with Row Level Security, ensuring patient contact information is never shared or aggregated across practices."
        ]
      }
    ],
    metrics: [
      { label: "Administrative Coverage", value: "24/7/365", sub: "hours, directions & bookings" },
      { label: "Emergency Escalation", value: "Instant", sub: "automated staff notification" },
      { label: "Data Isolation", value: "Row Level", sub: "PostgreSQL tenant boundary security" }
    ]
  },
  "google-reviews-seo": {
    title: "The Local SEO Review Engine: How Automated WhatsApp Follow-Ups Drive Google Map Pack Prominence",
    category: "Local SEO & Reputation",
    readTime: "5 min read",
    date: "November 2026",
    author: "StarX-Flow Growth & SEO Team",
    intro: "For local service businesses (gyms, dental clinics, beauty salons, med spas, and plumbers), ranking in the Google Map Pack (the top 3 local search results) is the single highest-converting organic discovery channel. In this guide, we analyze how post-service WhatsApp workflows dramatically improve review velocity.",
    sections: [
      {
        heading: "1. The Google Local Search Algorithm: Relevance, Distance & Prominence",
        paragraphs: [
          "Google Maps determines local ranking through three primary signals: Distance, Relevance, and Prominence. While a business cannot control searcher Distance, it has immense influence over Prominence.",
          "Prominence is heavily weighted by total review count, average numerical rating, and the consistency (velocity) of fresh customer reviews. Local businesses with steady, recent positive reviews consistently rank in the Map Pack, capturing up to 4x more inbound calls than competitors ranked below position 3."
        ]
      },
      {
        heading: "2. The Golden '2-Hour' Post-Checkout Follow-Up Window",
        paragraphs: [
          "Timing is decisive in customer feedback collection. Email review requests sent 2 or 3 days after a visit are routinely ignored, marked as promotions, or deleted. By contrast, text messaging achieves open rates exceeding 90%.",
          "StarX-Flow automatically detects appointment completion. Exactly 2 hours after a customer checks out, the system sends a personalized, courteous WhatsApp message thanking the client and providing a direct, 1-click link to your Google Business Profile review dialog."
        ],
        snippet: {
          title: "Post-Service Review Prompt Script",
          code: "[Automated Trigger: +2 Hours Post-Appointment]\nAI: 'Hi Alex! Thank you for visiting Apex Wellness today. We hope you had a wonderful session with David! 🌸\n\nIf you have 10 seconds, sharing your experience on Google supports our local team immensely:\nhttps://g.page/r/your-business-id/review\n\nHave a fantastic week!'"
        }
      },
      {
        heading: "3. Private Merchant Feedback Gates vs. Public Review Links",
        paragraphs: [
          "Not every customer interaction goes perfectly. Sometimes a client experiences an unexpected delay or leaves feeling neutral.",
          "StarX-Flow includes an optional feedback gate. The assistant can ask the customer to rate their experience inside the chat. High ratings receive the direct Google review link, while lower ratings trigger a prompt for private feedback that routes directly to the owner's private inbox, allowing staff to resolve concerns before negative reviews are posted publicly."
        ]
      }
    ],
    metrics: [
      { label: "Optimal Request Timing", value: "2 Hours", sub: "post-service checkout trigger" },
      { label: "Message Visibility", value: ">90%", sub: "direct WhatsApp open rates" },
      { label: "Reputation Protection", value: "Two-Tier", sub: "private feedback gate mechanism" }
    ]
  },
  "gym-onboarding": {
    title: "How Gyms Can Automate Member Onboarding & Retention",
    category: "Member Engagement",
    readTime: "6 min read",
    date: "November 2026",
    author: "StarX-Flow Growth Team",
    intro: "Boutique gyms and wellness clubs lose prospective members between the initial trial signup and their first physical visit. In this guide, we break down how automated WhatsApp onboarding sequences secure class bookings, collect waivers, and convert trials to long-term memberships on autopilot.",
    sections: [
      {
        heading: "1. The 'Waiver Leak' Administrative Bottleneck",
        paragraphs: [
          "In traditional gym operations, a prospective member signs up for a free trial online and is expected to fill out a PDF waiver, or stand in line at the front desk for 10 minutes during their first visit. This administrative friction causes drop-offs.",
          "By syncing your member calendar to StarX-Flow, you can trigger an instant WhatsApp workflow the second a trial is registered. The AI assistant greets the user, answers initial class concerns, and sends a secure signature link directly in chat."
        ]
      },
      {
        heading: "2. The First-Class Prep Conversation",
        paragraphs: [
          "Automating class prep answers ensures new members arrive confident and prepared. Our recommended dialogue model answers parking queries, locker rules, and dress codes instantly."
        ]
      }
    ],
    metrics: [
      { label: "Delivery Channel", value: "WhatsApp", sub: "direct mobile engagement" },
      { label: "Calendar Sync", value: "Live", sub: "Google & Outlook integration" },
      { label: "Waiver Collection", value: "Automated", sub: "pre-arrival digital links" }
    ]
  },
  "spa-no-shows": {
    title: "Reducing Spa & Salon No-Shows via WhatsApp Chatbots",
    category: "Operations",
    readTime: "5 min read",
    date: "November 2026",
    author: "StarX-Flow Operations Team",
    intro: "For high-end spas and salons, empty treatment rooms represent lost revenue that can never be recovered. When a client forgets an appointment, the therapist sits idle while overhead remains fixed. Learn how interactive double-confirmation WhatsApp threads secure calendar rosters automatically.",
    sections: [
      {
        heading: "1. The Cost of Empty Treatment Slots",
        paragraphs: [
          "For a boutique salon or wellness spa charging premium hourly rates, no-shows directly drain monthly revenue. Standard email reminders are frequently ignored or buried in promotions tabs.",
          "Interactive text messaging achieves rapid open rates, with most responses arriving within minutes. Moving confirmation workflows to WhatsApp bridges the communication gap instantly."
        ]
      },
      {
        heading: "2. Constructing the 24-Hour Double Confirmation Bot",
        paragraphs: [
          "A double-confirmation script requires an active response, prompting the client to confirm attendance or reschedule on the spot, freeing up slots for waitlisted clients if they need to cancel."
        ]
      }
    ],
    metrics: [
      { label: "Confirmation Method", value: "Interactive", sub: "1-click reply options" },
      { label: "Calendar Sync", value: "Instant", sub: "opens slots for re-booking" },
      { label: "Deposit Trigger", value: "Stripe", sub: "optional upfront retainer" }
    ]
  },
  "scaling-failures": {
    title: "Why Local Service Businesses Fail to Scale (And How to Fix It)",
    category: "Strategy",
    readTime: "7 min read",
    date: "November 2026",
    author: "StarX-Flow Operations Team",
    intro: "Boutique wellness centers, clinics, and service providers often hit a growth ceiling. Despite high demand, revenue plateaus and administrative expenses rise. In this operational breakdown, we examine how front-office friction limits scalability and how automation unlocks growth.",
    sections: [
      {
        heading: "1. The Front-Desk Bottleneck & Administrative Drag",
        paragraphs: [
          "In a typical service business, much of a receptionist's day is consumed by answering simple, repetitive questions: 'How much is a session?', 'Do you have openings today?', 'Where is your clinic located?'. This represents administrative drag.",
          "By automating routine front-office workflows, you can redirect human staff to high-value customer service."
        ]
      },
      {
        heading: "2. Decoupling Revenue from Administrative Headcount",
        paragraphs: [
          "To scale efficiently, you must decouple business growth from front-desk payroll. StarX-Flow operates 24/7 on a flat monthly subscription, providing an always-on reservation desk that scales with client volume."
        ]
      }
    ],
    metrics: [
      { label: "Pricing Model", value: "Flat-Rate", sub: "zero per-booking fees" },
      { label: "Coverage Window", value: "24/7/365", sub: "instant inquiry responses" },
      { label: "Provider Buffers", value: "Custom", sub: "prevents schedule overlaps" }
    ]
  }
};
export function ArticleViewerClient() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const router = useRouter();
  const openSignup = useUIStore((state) => state.openSignup);
  const [isCopied, setIsCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch article from local DB
  const article = articleSlug ? ARTICLES_DATABASE[articleSlug] : null;

  // Track scroll progress for reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!article) {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col items-center justify-center text-center relative overflow-hidden font-sans">
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(40, 223, 160, 0.1) 0%, transparent 70%)" }}
        />
        <h2 className="text-3xl font-bold text-white mb-4">Article Not Found</h2>
        <p className="text-zinc-400 mb-8 max-w-md">
          The operations runbook you are looking for does not exist or has been relocated to another slug.
        </p>
        <Link href="/resources" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 lg:pt-40 pb-24 min-h-screen relative overflow-hidden bg-[#020a07] text-[#f0f5ef]">
      {/* Scroll Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-[#8fffd0] z-50 transition-all duration-75 shadow-[0_0_8px_#34d399]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Atmospheric Glowing Backgrounds */}
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
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/resources"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#b8c9bd] hover:text-emerald-300 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-emerald-400" />
            <span>Back to Resources</span>
          </Link>
          <div className="flex items-center gap-2 text-[#b8c9bd]/70 text-xs font-mono uppercase tracking-wider">
            <span>Resources</span>
            <ChevronRight size={12} className="text-emerald-500/40" />
            <span>Guides</span>
            <ChevronRight size={12} className="text-emerald-500/40" />
            <span className="text-emerald-300 font-semibold">{article.category}</span>
          </div>
        </div>

        {/* Article Title & Metadata Header */}
        <div className="border-b border-emerald-500/20 pb-10 mb-12 text-left">
          <div className="spatial-pill-badge mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            {article.category}
          </div>
          <h1 className="font-editorial text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#b8c9bd] font-mono">
            <span className="flex items-center gap-1.5">
              <User size={15} className="text-emerald-400" /> {article.author}
            </span>
            <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-emerald-400" /> {article.readTime}
            </span>
            <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" />
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={15} className="text-emerald-400" /> {article.date}
            </span>
          </div>
        </div>

        {/* Grid Layout: Article Left / Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Article Body Column */}
          <article className="lg:col-span-8 text-left">
            <div className="flex flex-col gap-8">
              
              {/* Introduction Lead Paragraph */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-400/30 border-l-4 border-l-emerald-400 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <p className="text-base sm:text-lg text-white font-normal leading-relaxed">
                  {article.intro}
                </p>
              </div>

              {/* Dynamic Sections rendering */}
              {article.sections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-4 mt-4">
                  <h3 className="font-editorial text-2xl md:text-3xl font-bold text-white tracking-tight border-b border-emerald-500/15 pb-2">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-[#b8c9bd] font-normal text-base leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {/* Bullet points if any */}
                  {section.listItems && (
                    <ul className="flex flex-col gap-2.5 my-2 list-none pl-1">
                      {section.listItems.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-2.5 text-[#b8c9bd] text-sm md:text-base">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Script/Snippet Mock if any */}
                  {section.snippet && (
                    <div className="border border-emerald-500/25 rounded-2xl bg-[#010804] p-5 font-mono text-xs my-4 shadow-xl overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] text-emerald-300 pb-2 border-b border-emerald-500/20 mb-3 font-semibold tracking-wider uppercase">
                        <span>{section.snippet.title}</span>
                        <span>starx-flow-trace</span>
                      </div>
                      <pre className="text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre-wrap text-left break-words">
                        {section.snippet.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              {/* Action Closing */}
              <div className="mt-10 border-t border-emerald-500/20 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="spatial-btn-secondary py-2.5 px-5 text-xs font-mono"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {isCopied ? "Link Copied!" : "Copy Article Link"}
                </button>
                <span className="text-[#b8c9bd]/70 text-xs font-mono">
                  Verified Runbook • Published by StarX Flow OS
                </span>
              </div>

            </div>
          </article>

          {/* Sticky Widgets Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="sticky top-32 flex flex-col gap-6 text-left">
              
              {/* Strategic Metrics Widget */}
              <div className="glass-panel p-6 sm:p-7 rounded-[2rem] border-emerald-500/20 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
                <h4 className="font-editorial text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Key Target Metrics
                </h4>
                <div className="flex flex-col gap-5">
                  {article.metrics.map((metric, idx) => (
                    <div key={idx} className="pb-4 border-b border-emerald-500/15 last:border-0 last:pb-0">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#b8c9bd] block mb-1">
                        {metric.label}
                      </span>
                      <span className="text-2xl md:text-3xl font-black text-emerald-300 block font-mono">
                        {metric.value}
                      </span>
                      <span className="text-xs text-[#b8c9bd] font-normal block mt-0.5">
                        {metric.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Signup Action CTA */}
              <div className="glass-panel p-6 sm:p-7 rounded-[2rem] border-emerald-400/30 text-center flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
                <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 mx-auto shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="font-editorial text-white font-bold text-xl mb-1.5">Put Bookings On Autopilot</h4>
                  <p className="text-[#b8c9bd] text-xs leading-relaxed font-normal">
                    Implement the exact runbook triggers described in this guide for your clinic, gym, spa, or salon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openSignup}
                  className="spatial-btn-primary w-full py-3.5 text-xs font-semibold"
                >
                  Start 14-Day Free Trial
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
