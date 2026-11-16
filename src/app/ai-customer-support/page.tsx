import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, Bot, MessageSquare, Calendar, ArrowRight, 
  ShieldCheck, Clock, Users, HelpCircle, FileText, Zap 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Customer Support Software & Chatbots | StarX-Flow',
  description: 'Deliver instant 24/7 customer support across WhatsApp, Instagram, and Web. StarX-Flow resolves routine inquiries automatically with RAG knowledge retrieval and human handoff.',
  alternates: {
    canonical: getCanonicalUrl('/ai-customer-support'),
  },
  openGraph: {
    title: `AI Customer Support Software | ${SEO_CONFIG.siteName}`,
    description: 'Deliver instant 24/7 customer support across WhatsApp, Instagram, and Web. Grounded answers, calendar booking, and seamless human handoff.',
    url: getCanonicalUrl('/ai-customer-support'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'AI Customer Support Software' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `AI Customer Support Software | ${SEO_CONFIG.siteName}`,
    description: 'Instant 24/7 customer support across WhatsApp, Instagram, and Web with flat pricing.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What is AI customer support software?",
    answer: "AI customer support software uses large language models and Retrieval-Augmented Generation (RAG) to understand incoming customer questions and provide immediate, contextually accurate answers based on your company's documentation, knowledge bases, and FAQs."
  },
  {
    question: "How does StarX-Flow prevent AI hallucinations in customer service?",
    answer: "StarX-Flow enforces strict RAG grounding. The language model is provided with semantic chunks extracted directly from your verified business profile, price sheets, and policies. If a question falls outside the uploaded knowledge, the AI politely offers to transfer the conversation to a human team member."
  },
  {
    question: "Which communication channels are supported for customer support?",
    answer: "StarX-Flow provides native support for WhatsApp, Instagram Direct Messages, and embeddable Web Chat widgets (`/widget.js`), with inbound SMS and Email routing available."
  },
  {
    question: "How does human agent handoff work?",
    answer: "Whenever a customer asks for a human or an inquiry requires managerial judgment, the AI updates the conversation status to 'Needs Attention'. Staff can reply directly inside the unified dashboard inbox, automatically pausing the AI."
  },
  {
    question: "Does StarX-Flow charge per resolution like Intercom?",
    answer: "No. Unlike Intercom's $0.99 per resolution fee model, StarX-Flow uses transparent, flat-rate monthly pricing (€49 Starter, €97 Pro, €297 Enterprise) with generous conversation allowances and zero surprise resolution bills."
  }
];

export default function AICustomerSupportPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Customer Support Software & Chatbots",
      description: "Omnichannel AI customer support software with RAG knowledge retrieval and human-in-the-loop handoff.",
      url: getCanonicalUrl('/ai-customer-support'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "AI Customer Support", item: getCanonicalUrl('/ai-customer-support') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StarX-Flow AI Customer Support Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Conversational AI customer support software resolving inquiries 24/7 across WhatsApp, Instagram, and Web.",
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
          id={`schema-support-bot-${i}`}
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
              <li className="text-emerald-300 font-semibold">AI Customer Support</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              24/7 Omnichannel Customer Resolution
            </div>
            
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              Instant 24/7 AI Customer Support <br />
              <span className="text-gradient-emerald">Without Per-Resolution Fees</span>
            </h1>

            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Resolve up to 80% of repetitive customer inquiries instantly across WhatsApp, Instagram, and Web Chat with grounded RAG intelligence and seamless human handoff.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed mb-10 border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Direct Answer</span>
              </div>
              <p className="font-normal text-white/90">
                AI customer support software uses generative artificial intelligence and Retrieval-Augmented Generation (RAG) to understand customer inquiries and deliver accurate, context-aware answers from company documentation. StarX-Flow operates across WhatsApp, Instagram, and web chat, resolving up to 80% of routine inquiries automatically while smoothly escalating complex issues to human agents.
              </p>
            </div>

            <LandingCTAButtons primaryText="Deploy AI Support Free" secondaryText="Test AI Knowledge Engine" />
          </div>

          {/* Three Pillars of Modern AI Support */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">RAG Knowledge Engine</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  Upload PDF policies, service lists, and FAQs. The AI answers queries strictly using verified company facts with zero hallucinations.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Human-in-the-Loop Inbox</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  Monitor live AI conversations in a unified team inbox. Staff can take over with one click to handle VIP or sensitive requests.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Integrated Calendar Booking</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  Support conversations seamlessly transition into scheduled appointments, demos, or service calls without third-party links.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mb-24">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-center mb-10 flex items-center justify-center gap-3 text-white">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group glass-panel rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden border border-emerald-500/15"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-white">
                    <span>{faq.question}</span>
                    <span className="text-emerald-400 transition-transform group-open:rotate-180">↓</span>
                  </summary>
                  <p className="mt-4 text-[#b8c9bd] text-sm leading-relaxed border-t border-emerald-500/10 pt-4 font-normal">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Conversion CTA Block */}
          <div className="max-w-4xl mx-auto text-center glass-panel p-12 md:p-16 rounded-[2.5rem] border border-emerald-400/30 relative overflow-hidden mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.12)]">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-editorial text-3xl md:text-5xl font-bold mb-4 text-white">
                Upgrade Your Customer Support with 24/7 AI
              </h2>
              <p className="text-lg text-[#b8c9bd] max-w-2xl mx-auto mb-8 font-normal">
                Cut response times to under 2 seconds. Free up staff hours. Start your 14-day trial today.
              </p>
              <LandingCTAButtons primaryText="Start Free Support Trial" secondaryText="View Comparison with Intercom" secondaryHref="/compare/starx-flow-vs-intercom" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-emerald-500/15 pt-12 text-center">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#b8c9bd]/70 mb-6">
              Compare Support Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/compare/starx-flow-vs-intercom" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">StarX-Flow vs Intercom</Link>
              <Link href="/whatsapp-ai-chatbot" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">WhatsApp AI Chatbot</Link>
              <Link href="/ai-automation" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">AI Business Automation</Link>
              <Link href="/pricing" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">Explore Transparent Pricing</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
