import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, MessageSquare, Calendar, ArrowRight, 
  ShieldCheck, Clock, Users, HelpCircle, Smartphone, Zap 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'WhatsApp AI Chatbot & 24/7 Booking Assistant | StarX-Flow',
  description: 'Turn your WhatsApp into an autonomous 24/7 front desk. Answer customer questions, check real-time Google Calendar availability, and book appointments in under 2 seconds.',
  alternates: {
    canonical: getCanonicalUrl('/whatsapp-ai-chatbot'),
  },
  openGraph: {
    title: `WhatsApp AI Chatbot & Booking Assistant | ${SEO_CONFIG.siteName}`,
    description: 'Turn your WhatsApp into an autonomous 24/7 front desk. Answer questions, check Google Calendar availability, and book appointments automatically.',
    url: getCanonicalUrl('/whatsapp-ai-chatbot'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'WhatsApp AI Chatbot' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `WhatsApp AI Chatbot & Booking Assistant | ${SEO_CONFIG.siteName}`,
    description: 'Turn your WhatsApp into an autonomous 24/7 front desk with instant calendar booking.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What is a WhatsApp AI chatbot?",
    answer: "A WhatsApp AI chatbot is an intelligent conversational agent powered by large language models that connects to the official WhatsApp Business Cloud API. Unlike rigid button bots, StarX-Flow understands natural human speech, answers questions about your business, checks live calendar availability, and books appointments directly inside WhatsApp."
  },
  {
    question: "How does the WhatsApp AI chatbot connect to my calendar?",
    answer: "StarX-Flow provides one-click OAuth 2.0 integration with Google Calendar and Microsoft Outlook 365. When a customer requests an appointment, the AI checks for existing conflicts in real time, reserves the requested time slot, and instantly generates calendar invites for both you and your client."
  },
  {
    question: "Is this built on the official Meta WhatsApp Business API?",
    answer: "Yes. StarX-Flow connects strictly via the official Meta WhatsApp Cloud API. This guarantees your phone number is protected from bans, supports verified business green ticks, and complies with WhatsApp Business Messaging policies."
  },
  {
    question: "Can human staff take over conversations when needed?",
    answer: "Yes. StarX-Flow features an integrated omnichannel team inbox with a one-click 'Take Over' toggle. When a staff member steps in, the AI immediately pauses. Once the human conversation is resolved, the AI can be reactivated with a single click."
  },
  {
    question: "How does the AI know my pricing, hours, and policies?",
    answer: "Through our RAG (Retrieval-Augmented Generation) knowledge engine. You upload or paste your business profile, service catalog, price list, cancellation policy, and FAQs. The AI answers questions using only your verified business data, preventing hallucinations."
  }
];

export default function WhatsAppAIChatbotPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "WhatsApp AI Chatbot & Booking Assistant",
      description: "Autonomous WhatsApp AI chatbot for 24/7 appointment booking and customer support.",
      url: getCanonicalUrl('/whatsapp-ai-chatbot'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "WhatsApp AI Chatbot", item: getCanonicalUrl('/whatsapp-ai-chatbot') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StarX-Flow WhatsApp AI Chatbot",
      applicationCategory: "CommunicationApplication",
      operatingSystem: "Web, WhatsApp",
      description: "Autonomous 24/7 WhatsApp AI receptionist that answers FAQs and schedules appointments.",
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
          id={`schema-whatsapp-bot-${i}`}
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
              <li className="text-emerald-300 font-semibold">WhatsApp AI Chatbot</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Official Meta Cloud API Partner Integration
            </div>
            
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              The WhatsApp AI Chatbot <br />
              <span className="text-gradient-emerald">That Books Appointments in Under 2 Seconds</span>
            </h1>

            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Never miss a client booking again. StarX-Flow engages your WhatsApp contacts with human-like conversation, answers service inquiries, and confirms calendar appointments 24/7.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed mb-10 border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Direct Answer</span>
              </div>
              <p className="font-normal text-white/90">
                A WhatsApp AI chatbot is an automated conversational agent that connects to the WhatsApp Business API to interact with customers in natural human language. StarX-Flow provides an autonomous WhatsApp receptionist that synchronizes with Google Calendar and Microsoft Outlook to verify availability, prevent double bookings, qualify leads, and answer business FAQs in under two seconds.
              </p>
            </div>

            <LandingCTAButtons primaryText="Activate Your WhatsApp AI" secondaryText="Experience Live WhatsApp Demo" />
          </div>

          {/* Feature Comparison: Rigid Bots vs StarX-Flow Generative AI */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="text-center mb-12">
              <h2 className="font-editorial text-3xl md:text-4xl font-bold mb-4 text-white">
                Why Traditional WhatsApp Chatbots Fail
              </h2>
              <p className="text-[#b8c9bd] max-w-2xl mx-auto font-normal">
                Compare rigid decision trees with StarX-Flow&apos;s generative AI workforce.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-red-500/20 bg-red-950/10">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <span>✕</span> Legacy Decision-Tree Bots (ManyChat / WATI)
                </h3>
                <ul className="space-y-4 text-[#b8c9bd] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span>
                    <span><strong className="text-white">Rigid keyword buttons:</strong> Forces users to &quot;Press 1 for Pricing, 2 for Hours&quot;.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span>
                    <span><strong className="text-white">Breaks on typos:</strong> If a customer types a sentence naturally, the bot replies &quot;Sorry, I didn&apos;t understand.&quot;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span>
                    <span><strong className="text-white">No calendar intelligence:</strong> Cannot check live calendar availability or resolve booking conflicts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">✕</span>
                    <span><strong className="text-white">Sends static links:</strong> Forces the user out of WhatsApp to an impersonal Calendly or web link.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-emerald-400/30 bg-emerald-950/15 shadow-[0_0_25px_rgba(40,223,160,0.08)]">
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <span>✓</span> StarX-Flow Autonomous AI Receptionist
                </h3>
                <ul className="space-y-4 text-[#f0f5ef] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong className="text-white">Natural conversation:</strong> Understands complex inquiries, slang, and multiple service requests.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong className="text-white">Real-time calendar booking:</strong> Checks live Google Calendar / Outlook slots and books natively in chat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong className="text-white">RAG knowledge base:</strong> Answers questions using your exact prices, staff rosters, and cancellation policies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong className="text-white">Zero app downloads:</strong> Clients complete everything inside WhatsApp without registering accounts.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works on WhatsApp */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-emerald-500/20">
              <h2 className="font-editorial text-3xl font-bold text-center mb-12 text-white">
                The Inbound WhatsApp Customer Journey
              </h2>

              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div className="glass-panel glass-panel-hover p-6 border-emerald-500/15">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg shadow-[0_0_12px_rgba(40,223,160,0.15)]">
                    1
                  </div>
                  <h3 className="font-semibold text-white mb-2">Client Messages</h3>
                  <p className="text-[#b8c9bd] text-xs leading-relaxed">
                    Customer texts your WhatsApp number: &quot;Hey, do you have time for a haircut tomorrow afternoon?&quot;
                  </p>
                </div>

                <div className="glass-panel glass-panel-hover p-6 border-emerald-500/15">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg shadow-[0_0_12px_rgba(40,223,160,0.15)]">
                    2
                  </div>
                  <h3 className="font-semibold text-white mb-2">Calendar Check</h3>
                  <p className="text-[#b8c9bd] text-xs leading-relaxed">
                    The AI queries your Google Calendar in real time, verifies open slots between 14:00 and 17:00, and proposes times.
                  </p>
                </div>

                <div className="glass-panel glass-panel-hover p-6 border-emerald-500/15">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg shadow-[0_0_12px_rgba(40,223,160,0.15)]">
                    3
                  </div>
                  <h3 className="font-semibold text-white mb-2">Slot Confirmed</h3>
                  <p className="text-[#b8c9bd] text-xs leading-relaxed">
                    Client chooses 15:30. The AI writes the appointment, locks the calendar, and creates the CRM customer record.
                  </p>
                </div>

                <div className="glass-panel glass-panel-hover p-6 border-emerald-500/15">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-4 text-lg shadow-[0_0_12px_rgba(40,223,160,0.15)]">
                    4
                  </div>
                  <h3 className="font-semibold text-white mb-2">Auto Reminders</h3>
                  <p className="text-[#b8c9bd] text-xs leading-relaxed">
                    Automated WhatsApp reminders are scheduled for 24h and 1h prior, reducing costly no-shows by up to 70%.
                  </p>
                </div>
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
                Turn Your WhatsApp Into Your Highest-Converting Channel
              </h2>
              <p className="text-lg text-[#b8c9bd] max-w-2xl mx-auto mb-8 font-normal">
                Setup takes under 5 minutes. No technical background required. 14 days free.
              </p>
              <LandingCTAButtons primaryText="Start Free Trial on WhatsApp" secondaryText="Chat With the Bot" />
            </div>
          </div>

          {/* Competitor Cross-Links */}
          <div className="max-w-4xl mx-auto border-t border-emerald-500/15 pt-12 text-center">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#b8c9bd]/70 mb-6">
              Compare WhatsApp Automation Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/compare/starx-flow-vs-manychat" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">StarX-Flow vs ManyChat</Link>
              <Link href="/compare/starx-flow-vs-wati" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">StarX-Flow vs WATI</Link>
              <Link href="/compare/starx-flow-vs-respond-io" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">StarX-Flow vs Respond.io</Link>
              <Link href="/compare/starx-flow-vs-calendly" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">StarX-Flow vs Calendly</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
