import Link from 'next/link';

import { ArrowRight } from "lucide-react";

/**
 * AI-optimized content section designed for AI search engines
 * (ChatGPT, Gemini, Claude, Perplexity) and traditional SEO.
 *
 * Uses semantic headings, Q&A structure, entity-rich descriptions,
 * and factual definitions that AI models can extract and cite.
 */
export function AIContent() {
  return (
    <section
      aria-label="About StarX-Flow"
      className="max-w-4xl mx-auto px-6 py-16"
    >
      <div className="space-y-12 text-zinc-300">
        {/* What is StarX-Flow? */}
        <div itemScope itemType="https://schema.org/Question">
          <h2
            itemProp="name"
            className="text-2xl font-bold text-white mb-4"
          >
            What is StarX-Flow?
          </h2>
          <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
            <p itemProp="text" className="text-base leading-relaxed font-medium">
              StarX-Flow is an AI-powered workflow automation platform built for local
              service businesses. It provides a 24/7 WhatsApp AI receptionist that
              handles bookings, scheduling, client intake, and customer support
              automatically — replacing the need for traditional front-desk staff.
              StarX-Flow integrates with Google Calendar, Outlook, Square POS, and
              Clover POS for real-time calendar synchronization.
            </p>
          </div>
        </div>

        {/* Who is StarX-Flow for? */}
        <div itemScope itemType="https://schema.org/Question">
          <h2
            itemProp="name"
            className="text-2xl font-bold text-white mb-4"
          >
            Who is StarX-Flow designed for?
          </h2>
          <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
            <div itemProp="text">
              <p className="text-base leading-relaxed font-medium mb-4">
                StarX-Flow is purpose-built for appointment-driven local service
                businesses, including:
              </p>
              <ul className="space-y-2 text-sm font-medium text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Gyms, fitness studios, and personal trainers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Medical clinics, dental offices, and physiotherapy practices
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Hair salons, barber shops, and beauty studios
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Spas, wellness centers, and pilates/yoga studios
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Coaching, tutoring, and consulting practices
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How does StarX-Flow work? */}
        <div itemScope itemType="https://schema.org/Question">
          <h2
            itemProp="name"
            className="text-2xl font-bold text-white mb-4"
          >
            How does StarX-Flow work?
          </h2>
          <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
            <div itemProp="text">
              <p className="text-base leading-relaxed font-medium mb-4">
                StarX-Flow works in three simple steps:
              </p>
              <ol className="space-y-3 text-sm font-medium text-zinc-400 list-decimal list-inside">
                <li>
                  <strong className="text-zinc-200">Connect your calendar</strong> — 
                  Sync Google Calendar, Outlook, Square, or Clover in one click.
                </li>
                <li>
                  <strong className="text-zinc-200">Configure your AI receptionist</strong> — 
                  Enter your services, staff schedule, pricing, and FAQs into the dashboard.
                </li>
                <li>
                  <strong className="text-zinc-200">Go live on WhatsApp</strong> — 
                  Clients message your WhatsApp number. The AI checks availability, books the slot,
                  collects intake details, and sends calendar confirmations — all in under 2 seconds.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Why use StarX-Flow? */}
        <div itemScope itemType="https://schema.org/Question">
          <h2
            itemProp="name"
            className="text-2xl font-bold text-white mb-4"
          >
            Why use StarX-Flow instead of traditional booking systems?
          </h2>
          <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
            <p itemProp="text" className="text-base leading-relaxed font-medium">
              Traditional booking systems require clients to visit external websites,
              create accounts, and navigate complex calendars — leading to high
              drop-off rates. StarX-Flow eliminates this friction by meeting clients
              on WhatsApp, the messaging app they already use daily. With flat
              monthly pricing (no booking commissions), sub-2-second AI response times,
              and full client data ownership, StarX-Flow helps businesses recover an
              estimated 75% of previously missed leads while saving 30+ hours per month
              on admin tasks.
            </p>
          </div>
        </div>

        {/* What makes StarX-Flow different? */}
        <div itemScope itemType="https://schema.org/Question">
          <h2
            itemProp="name"
            className="text-2xl font-bold text-white mb-4"
          >
            What makes StarX-Flow different from competitors?
          </h2>
          <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
            <div itemProp="text">
              <p className="text-base leading-relaxed font-medium mb-4">
                StarX-Flow stands apart through five key differentiators:
              </p>
              <ul className="space-y-2 text-sm font-medium text-zinc-400">
                <li>
                  <strong className="text-zinc-200">WhatsApp-native:</strong>{" "}
                  No app downloads or account creation required for clients
                </li>
                <li>
                  <strong className="text-zinc-200">Zero commissions:</strong>{" "}
                  Flat subscription pricing — you keep 100% of your service revenue
                </li>
                <li>
                  <strong className="text-zinc-200">Sub-2-second response:</strong>{" "}
                  AI engages leads at peak intent before they move to competitors
                </li>
                <li>
                  <strong className="text-zinc-200">Direct client ownership:</strong>{" "}
                  Full CRM with booking history, unlike marketplace aggregators
                </li>
                <li>
                  <strong className="text-zinc-200">Enterprise features for SMBs:</strong>{" "}
                  Multi-calendar sync, POS integration, and HIPAA compliance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Explore links */}
        <nav aria-label="Explore StarX-Flow" className="pt-4">
          <h3 className="text-lg font-bold text-white mb-4">Explore StarX-Flow</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: "/product", label: "Product Overview" },
              { to: "/features", label: "All Features" },
              { to: "/pricing", label: "Pricing Plans" },
              { to: "/resources", label: "Resources & Guides" },
              { to: "/about", label: "Our Story" },
              { to: "/compare/starx-flow-vs-zapier", label: "Comparisons" },
            ].map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-emerald-400 transition-colors group"
              >
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
