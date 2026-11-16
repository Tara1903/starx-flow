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
    <div className="min-h-screen bg-[#020a07] text-[#f0f5ef] flex flex-col font-sans selection:bg-emerald-500/30 pt-32 lg:pt-40 pb-24 relative overflow-hidden">
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

      {jsonLd.map((schema, i) => (
        <Script
          key={i}
          id={`schema-ai-automation-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-emerald-300 font-semibold">AI Automation</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              The Autonomous AI Operating System
            </div>
            
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              AI Automation for Business: <br />
              <span className="text-gradient-emerald">From Inbound Leads to Calendar Lock</span>
            </h1>

            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Automate inbound customer communications, appointment bookings, calendar management, and operational tasks 24/7 with zero code.
            </p>

            {/* Direct Answer Box */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed mb-10 border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Direct Definition</span>
              </div>
              <p className="font-normal text-white/90">
                AI business automation is the application of generative language models and autonomous software agents to handle repetitive customer communication, appointment booking, CRM updates, and operational tasks without human intervention. StarX Flow delivers turnkey AI business automation by unifying WhatsApp, Instagram, Google Calendar, and workflow logic into a single zero-code platform.
              </p>
            </div>

            <LandingCTAButtons primaryText="Start 14-Day Free Trial" secondaryText="Test Live AI Chat" />
          </div>

          {/* The Problem Section */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-emerald-500/25 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8)]">
              <h2 className="font-editorial text-2xl md:text-4xl font-bold text-center text-white mb-4">
                Why Manual Front-Desk Operations Hurt Business Growth
              </h2>
              <p className="text-[#b8c9bd] text-center max-w-2xl mx-auto mb-12 font-normal">
                Traditional businesses lose 20% to 40% of prospective clients due to missed calls, delayed replies, and scheduling friction.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#010804] p-6 rounded-2xl border border-red-500/20">
                  <div className="w-10 h-10 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center font-bold mb-4 font-mono">
                    42%
                  </div>
                  <h3 className="font-editorial font-bold text-lg text-white mb-2">Unanswered Inquiries</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Inbound calls and WhatsApp messages that arrive while staff are busy or after hours go straight to competitors.
                  </p>
                </div>

                <div className="bg-[#010804] p-6 rounded-2xl border border-amber-500/20">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center font-bold mb-4 font-mono">
                    $2.5k
                  </div>
                  <h3 className="font-editorial font-bold text-lg text-white mb-2">High Staff Overhead</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Paying receptionists simply to answer repetitive FAQs (&quot;Where are you located?&quot;) and input dates manually drains margins.
                  </p>
                </div>

                <div className="bg-[#010804] p-6 rounded-2xl border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold mb-4 font-mono">
                    15+ hrs
                  </div>
                  <h3 className="font-editorial font-bold text-lg text-white mb-2">Lost Weekly Admin</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Back-and-forth messaging trying to find mutually agreeable calendar times wastes hours of productive staff time every week.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Capabilities Grid */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-16">
              <h2 className="font-editorial text-3xl md:text-5xl font-bold text-white mb-4">
                Core Capabilities of StarX Flow AI Automation
              </h2>
              <p className="text-[#b8c9bd] max-w-2xl mx-auto font-normal">
                Everything required to run an autonomous customer communication and booking engine out of the box.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-7">
              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Omnichannel Messaging</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  Deploy conversational AI agents natively across WhatsApp, Instagram Direct, Web Chat, and Email with unified message history.
                </p>
                <Link href="/whatsapp-ai-chatbot" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore WhatsApp Chatbot <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Autonomous Calendar Booking</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  Check availability, verify time slot conflicts, and write confirmed bookings directly to Google Calendar and Microsoft Outlook 365.
                </p>
                <Link href="/features" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  See Calendar Sync <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">RAG Knowledge Retrieval</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  Ground responses in your business documents, price sheets, and policies. The AI answers nuanced questions with 100% accuracy.
                </p>
                <Link href="/ai-customer-support" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Learn About RAG Support <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Customer Identity CRM</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  Automatically link phone numbers, emails, and social handles into unified lead profiles with tags, notes, and booking histories.
                </p>
                <Link href="/product" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore CRM Features <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Event-Driven Workflows</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
                  Trigger automated appointment reminders, follow-up messages, Google Review requests, and staff alerts based on real events.
                </p>
                <Link href="/business-workflow-automation" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Explore Workflow Engine <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="glass-panel glass-panel-hover p-8 rounded-3xl border-emerald-500/20">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-6 border border-emerald-400/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-white mb-3">Human-in-the-Loop Handoff</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed mb-4 font-normal">
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
              <h2 className="font-editorial text-3xl md:text-4xl font-bold text-white mb-4">
                Deploy AI Automation in 3 Simple Steps
              </h2>
              <p className="text-[#b8c9bd] font-normal">
                Zero complex coding. Zero API engineering. Live in 5 minutes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-[#020a07] font-black font-mono flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-white mb-1">Connect Your Calendars &amp; Channels</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Link your Google Calendar or Outlook 365 account with one click. Authorize your WhatsApp Business number or Instagram Direct page.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-[#020a07] font-black font-mono flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-white mb-1">Upload Your Business Profile &amp; FAQs</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Paste your services, duration, staff rosters, and common questions. StarX Flow automatically indexes your documents for retrieval.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-2xl border-emerald-500/20 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-[#020a07] font-black font-mono flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-white mb-1">Go Live and Capture Leads 24/7</h3>
                  <p className="text-[#b8c9bd] text-sm font-normal">
                    Your AI receptionist immediately begins answering inquiries, qualifying leads, and confirming bookings in under 2 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-center text-white mb-10 flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group glass-panel rounded-2xl border-emerald-500/20 p-6 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-white">
                    <span className="font-editorial">{faq.question}</span>
                    <span className="text-emerald-400 transition-transform group-open:rotate-180">↓</span>
                  </summary>
                  <p className="mt-4 text-[#b8c9bd] text-sm leading-relaxed border-t border-emerald-500/15 pt-4 font-normal">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Conversion CTA Block */}
          <div className="max-w-4xl mx-auto text-center glass-panel p-10 sm:p-14 rounded-[2.5rem] border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)] relative overflow-hidden mb-16">
            <div className="relative z-10">
              <h2 className="font-editorial text-3xl md:text-5xl font-bold mb-4 text-white">
                Ready to Automate Your Business Operations?
              </h2>
              <p className="text-lg text-[#b8c9bd] max-w-2xl mx-auto mb-8 font-normal">
                Join thousands of modern businesses capturing more bookings and saving 15+ hours weekly with StarX Flow.
              </p>
              <LandingCTAButtons primaryText="Claim Your 14-Day Free Trial" secondaryText="Talk With Our AI" />
            </div>
          </div>

          {/* Related Industry Pages */}
          <div className="max-w-4xl mx-auto border-t border-emerald-500/20 pt-12 text-center">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#b8c9bd] mb-6">
              Industry-Specific AI Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/industries/dental-clinics" className="text-xs font-mono px-4 py-2 rounded-full bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 text-[#b8c9bd] hover:text-white transition-all">Dental Clinics</Link>
              <Link href="/industries/barbershops" className="text-xs font-mono px-4 py-2 rounded-full bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 text-[#b8c9bd] hover:text-white transition-all">Salons &amp; Barbers</Link>
              <Link href="/industries/wellness-spas" className="text-xs font-mono px-4 py-2 rounded-full bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 text-[#b8c9bd] hover:text-white transition-all">Spas &amp; Wellness</Link>
              <Link href="/industries/gyms-fitness" className="text-xs font-mono px-4 py-2 rounded-full bg-[#010804] hover:bg-emerald-500/10 border border-emerald-500/20 text-[#b8c9bd] hover:text-white transition-all">Fitness &amp; Gyms</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
