import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, Bot, Calendar, ArrowRight, Zap, 
  ShieldCheck, Layers, MessageSquare, Clock, Users, HelpCircle 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Automation for Business | Autonomous Operating System | StarX-Flow',
  description: 'Deploy AI business automation in under 5 minutes. StarX-Flow unifies 24/7 conversational AI, WhatsApp booking, Google Calendar sync, and operational workflows.',
  alternates: {
    canonical: getCanonicalUrl('/ai-automation'),
  },
  openGraph: {
    title: `AI Automation for Business | ${SEO_CONFIG.siteName}`,
    description: 'Deploy AI business automation in under 5 minutes. Unify conversational AI, WhatsApp booking, Google Calendar sync, and workflows.',
    url: getCanonicalUrl('/ai-automation'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'AI Automation for Business' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `AI Automation for Business | ${SEO_CONFIG.siteName}`,
    description: 'Deploy AI business automation in under 5 minutes. Unify conversational AI, WhatsApp booking, and workflows.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What is AI business automation?",
    answer: "AI business automation is the application of large language models, generative AI, and autonomous software agents to handle customer communication, appointment booking, CRM updates, and repetitive operational tasks without manual human effort."
  },
  {
    question: "How does StarX-Flow differ from traditional automation tools like Zapier?",
    answer: "Traditional tools like Zapier connect APIs via rigid 'if-this-then-that' rules requiring multi-step configurations and separate subscriptions. StarX-Flow is an all-in-one autonomous AI operating system featuring native conversational AI on WhatsApp and Instagram, a RAG knowledge engine, real-time two-way calendar booking, and an omnichannel team inbox."
  },
  {
    question: "How quickly can my business deploy StarX-Flow?",
    answer: "Most businesses go live in under 5 minutes: connect your calendar (Google Calendar or Outlook), upload your services and FAQs into the knowledge base, and pair your WhatsApp or Instagram account."
  },
  {
    question: "What language models power StarX-Flow's AI automation?",
    answer: "StarX-Flow utilizes a resilient multi-tier LLM architecture combining Google Gemini 2.0 Flash for low-latency reasoning with NVIDIA NIM (DeepSeek v4.1 Flash), backed by an autonomous deterministic rule engine to ensure zero downtime."
  },
  {
    question: "Does StarX-Flow require any software downloads for my clients?",
    answer: "No. Your clients interact with your business naturally using the messaging apps they already have on their phones, such as WhatsApp and Instagram, or via your website chat widget."
  }
];

export default function AIAutomationPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Automation for Business",
      description: "Autonomous AI business automation platform for modern businesses.",
      url: getCanonicalUrl('/ai-automation'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "AI Automation", item: getCanonicalUrl('/ai-automation') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SEO_CONFIG.siteName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "AI business automation platform automating customer care, calendar scheduling, and business workflows.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "49",
        highPrice: "297",
        offerCount: "3"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer }
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      {jsonLd.map((schema, i) => (
        <Script
          key={i}
          id={`schema-ai-automation-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs md:text-sm text-zinc-400">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-zinc-200 font-medium">AI Automation</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Sparkles className="w-4 h-4" />
              The Autonomous AI Operating System
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              AI Automation for Business: <br />
              <span className="text-emerald-400">From Leads to Completed Workflows</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Automate inbound customer communications, appointment bookings, calendar management, and operational tasks 24/7 with zero code.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-10 shadow-lg">
              <strong className="text-emerald-400 block mb-2 font-semibold">Direct Definition:</strong>
              AI business automation is the application of generative language models and autonomous software agents to handle repetitive customer communication, appointment booking, CRM updates, and operational tasks without human intervention. StarX-Flow delivers turnkey AI business automation by unifying WhatsApp, Instagram, Google Calendar, and workflow logic into a single zero-code platform.
            </div>

            <LandingCTAButtons primaryText="Start 14-Day Free Trial" secondaryText="Test Live AI Chat" />
          </div>

          {/* The Problem Section */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-6">
                Why Manual Front-Desk Operations Hurt Business Growth
              </h2>
              <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
                Traditional businesses lose 20% to 40% of prospective clients due to missed calls, delayed replies, and scheduling friction.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold mb-4">
                    42%
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">Unanswered Inquiries</h3>
                  <p className="text-zinc-400 text-sm">
                    Inbound calls and WhatsApp messages that arrive while staff are busy or after hours go straight to competitors.
                  </p>
                </div>

                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                    $2.5k
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">High Staff Overhead</h3>
                  <p className="text-zinc-400 text-sm">
                    Paying receptionists simply to answer repetitive FAQs ("Where are you located?") and input dates manually drains margins.
                  </p>
                </div>

                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4">
                    15+ hrs
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">Lost Weekly Admin</h3>
                  <p className="text-zinc-400 text-sm">
                    Back-and-forth messaging trying to find mutually agreeable calendar times wastes hours of productive staff time every week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Capabilities Grid */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Core Capabilities of StarX-Flow AI Automation
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Everything required to run an autonomous customer communication and booking engine out of the box.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Omnichannel Messaging</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Deploy conversational AI agents natively across WhatsApp, Instagram Direct, Web Chat, and Email with unified message history.
                </p>
                <Link href="/whatsapp-ai-chatbot" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore WhatsApp Chatbot <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Autonomous Calendar Booking</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Check availability, verify time slot conflicts, and write confirmed bookings directly to Google Calendar and Microsoft Outlook 365.
                </p>
                <Link href="/features" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  See Calendar Sync <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">RAG Knowledge Retrieval</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Ground responses in your business documents, price sheets, and policies. The AI answers nuanced questions with 100% accuracy.
                </p>
                <Link href="/ai-customer-support" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Learn About RAG Support <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer Identity CRM</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Automatically link phone numbers, emails, and social handles into unified lead profiles with tags, notes, and booking histories.
                </p>
                <Link href="/product" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore CRM Features <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Event-Driven Workflows</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Trigger automated appointment reminders, follow-up messages, Google Review requests, and staff alerts based on real events.
                </p>
                <Link href="/business-workflow-automation" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore Workflow Engine <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Human-in-the-Loop Handoff</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Staff can jump into any live thread with a single click. The AI immediately pauses and cedes control, resuming whenever toggled.
                </p>
                <Link href="/pricing" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  View Flat-Rate Plans <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Deploy AI Automation in 3 Simple Steps
              </h2>
              <p className="text-zinc-400">
                Zero complex coding. Zero API engineering. Live in 5 minutes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Connect Your Calendars & Channels</h3>
                  <p className="text-zinc-400 text-sm">
                    Link your Google Calendar or Outlook 365 account with one click. Authorize your WhatsApp Business number or Instagram Direct page.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Upload Your Business Profile & FAQs</h3>
                  <p className="text-zinc-400 text-sm">
                    Paste your services, duration, staff rosters, and common questions. StarX-Flow automatically indexes your documents for retrieval.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Go Live and Capture Leads 24/7</h3>
                  <p className="text-zinc-400 text-sm">
                    Your AI receptionist immediately begins answering inquiries, qualifying leads, and confirming bookings in under 2 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group glass-panel rounded-2xl border border-white/10 p-6 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-white">
                    <span>{faq.question}</span>
                    <span className="text-emerald-400 transition-transform group-open:rotate-180">↓</span>
                  </summary>
                  <p className="mt-4 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Conversion CTA Block */}
          <div className="max-w-4xl mx-auto text-center glass-panel p-12 md:p-16 rounded-[2.5rem] border border-emerald-500/20 relative overflow-hidden mb-16">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Automate Your Business Operations?
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Join thousands of modern businesses capturing more bookings and saving 15+ hours weekly with StarX-Flow.
              </p>
              <LandingCTAButtons primaryText="Claim Your 14-Day Free Trial" secondaryText="Talk With Our AI" />
            </div>
          </div>

          {/* Related Industry Pages */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Industry-Specific AI Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/industries/dentist" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Dental Clinics</Link>
              <Link href="/industries/barber" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Salons & Barbers</Link>
              <Link href="/industries/plumber" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Plumbers & Contractors</Link>
              <Link href="/industries/med-spa" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Med Spas & Wellness</Link>
              <Link href="/industries/personal-trainer" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Fitness Coaches</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
