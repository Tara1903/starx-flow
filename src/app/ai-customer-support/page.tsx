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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      {jsonLd.map((schema, i) => (
        <Script
          key={i}
          id={`schema-support-bot-${i}`}
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
              <li className="text-zinc-200 font-medium">AI Customer Support</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Bot className="w-4 h-4" />
              24/7 Omnichannel Customer Resolution
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Instant 24/7 AI Customer Support <br />
              <span className="text-emerald-400">Without Per-Resolution Fees</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Resolve up to 80% of repetitive customer inquiries instantly across WhatsApp, Instagram, and Web Chat with grounded RAG intelligence and seamless human handoff.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-10 shadow-lg">
              <strong className="text-emerald-400 block mb-2 font-semibold">Direct Answer:</strong>
              AI customer support software uses generative artificial intelligence and Retrieval-Augmented Generation (RAG) to understand customer inquiries and deliver accurate, context-aware answers from company documentation. StarX-Flow operates across WhatsApp, Instagram, and web chat, resolving up to 80% of routine inquiries automatically while smoothly escalating complex issues to human agents.
            </div>

            <LandingCTAButtons primaryText="Deploy AI Support Free" secondaryText="Test AI Knowledge Engine" />
          </div>

          {/* Three Pillars of Modern AI Support */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">RAG Knowledge Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Upload PDF policies, service lists, and FAQs. The AI answers queries strictly using verified company facts with zero hallucinations.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Human-in-the-Loop Inbox</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Monitor live AI conversations in a unified team inbox. Staff can take over with one click to handle VIP or sensitive requests.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Integrated Calendar Booking</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Support conversations seamlessly transition into scheduled appointments, demos, or service calls without third-party links.
                </p>
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
                Upgrade Your Customer Support with 24/7 AI
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Cut response times to under 2 seconds. Free up staff hours. Start your 14-day trial today.
              </p>
              <LandingCTAButtons primaryText="Start Free Support Trial" secondaryText="View Comparison with Intercom" secondaryHref="/compare/starx-flow-vs-intercom" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Compare Support Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/compare/starx-flow-vs-intercom" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">StarX-Flow vs Intercom</Link>
              <Link href="/whatsapp-ai-chatbot" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">WhatsApp AI Chatbot</Link>
              <Link href="/ai-automation" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">AI Business Automation</Link>
              <Link href="/pricing" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Explore Transparent Pricing</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
