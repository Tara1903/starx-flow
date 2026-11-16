import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, MessageSquare, Calendar, ArrowRight, 
  ShieldCheck, Instagram, Zap, Users, HelpCircle 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Instagram DM AI Automation & Chatbot | StarX-Flow',
  description: 'Automate Instagram Direct Messages with conversational AI. StarX-Flow qualifies inbound leads, answers product questions, and schedules appointments directly inside Instagram DMs.',
  alternates: {
    canonical: getCanonicalUrl('/instagram-ai-automation'),
  },
  openGraph: {
    title: `Instagram DM AI Automation & Chatbot | ${SEO_CONFIG.siteName}`,
    description: 'Automate Instagram Direct Messages with conversational AI. Qualify inbound leads, answer product FAQs, and book appointments inside Instagram DMs.',
    url: getCanonicalUrl('/instagram-ai-automation'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'Instagram DM AI Automation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Instagram DM AI Automation & Chatbot | ${SEO_CONFIG.siteName}`,
    description: 'Automate Instagram Direct Messages with conversational AI. Qualify leads and book appointments 24/7.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What is Instagram DM AI automation?",
    answer: "Instagram DM AI automation allows businesses, creators, and brands to automatically answer incoming direct messages, qualify prospective clients, and schedule appointments using conversational artificial intelligence connected via the official Meta Instagram Graph API."
  },
  {
    question: "Will automated Instagram DMs risk my account getting shadowbanned?",
    answer: "No. StarX-Flow integrates strictly through the official Meta Instagram Graph API with authorized webhooks. We do not use unofficial scrapers, headless browsers, or unofficial reverse-engineered tools that violate Instagram's terms of service."
  },
  {
    question: "Can StarX-Flow book appointments directly inside Instagram DMs?",
    answer: "Yes. The AI agent converses naturally with leads, checks your real-time Google Calendar or Outlook schedule, proposes open time slots, and confirms bookings directly inside the Instagram message thread."
  },
  {
    question: "How does the AI handle story mentions and post comments?",
    answer: "When a customer interacts with your profile or sends a DM referencing a story, StarX-Flow detects the incoming message and responds instantly with personalized answers grounded in your business knowledge base."
  },
  {
    question: "Can my team see Instagram DMs alongside WhatsApp messages?",
    answer: "Yes. StarX-Flow unifies Instagram DMs, WhatsApp chats, and Web chat into a single unified team inbox. Staff can view the full conversation history and take over live at any moment."
  }
];

export default function InstagramAIAutomationPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Instagram DM AI Automation & Chatbot",
      description: "Conversational AI automation for Instagram Direct Messages, lead qualification, and appointment booking.",
      url: getCanonicalUrl('/instagram-ai-automation'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "Instagram AI Automation", item: getCanonicalUrl('/instagram-ai-automation') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StarX-Flow Instagram DM AI Automation",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Instagram",
      description: "Official Meta API-powered Instagram DM conversational AI chatbot for automated customer care and scheduling.",
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
          id={`schema-instagram-bot-${i}`}
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
              <li className="text-emerald-300 font-semibold">Instagram AI Automation</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
            <div className="spatial-pill-badge mb-6">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              Official Meta Instagram Graph API Integration
            </div>
            
            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              Convert Instagram Inquiries <br />
              <span className="text-gradient-emerald">Into Confirmed Bookings in Seconds</span>
            </h1>

            <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Stop letting prospective clients wait hours for DM replies. StarX-Flow qualifies inbound leads, answers service questions, and schedules appointments 24/7 inside Instagram DMs.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left glass-panel p-6 sm:p-8 text-[#b8c9bd] text-sm md:text-base leading-relaxed mb-10 border-emerald-400/30 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_25px_rgba(40,223,160,0.12)]">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Direct Answer</span>
              </div>
              <p className="font-normal text-white/90">
                Instagram DM automation enables businesses to respond to direct messages instantly, qualify incoming customer inquiries, and reserve calendar appointments using conversational AI. StarX-Flow connects to the official Meta Instagram Graph API to execute multi-turn conversations, check Google Calendar availability, and write verified bookings without manual human delay.
              </p>
            </div>

            <LandingCTAButtons primaryText="Automate Your Instagram DMs" secondaryText="Explore Live Chat Demo" />
          </div>

          {/* Key Capabilities */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-16">
              <h2 className="font-editorial text-3xl md:text-5xl font-bold mb-4 text-white">
                Built for High-Growth Instagram Profiles
              </h2>
              <p className="text-[#b8c9bd] max-w-2xl mx-auto font-normal">
                Turn your Instagram profile from a passive photo grid into an autonomous customer acquisition and appointment booking engine.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Sub-2-Second DM Responses</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  Respond to inbound DMs the instant they arrive. Capitalize on customer intent while your brand is top of mind.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(40,223,160,0.15)]">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Native Calendar Scheduling</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  No bio links or external forms. Clients browse availability and confirm slots directly inside the conversation.
                </p>
              </div>

              <div className="glass-panel glass-panel-hover p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Official Meta Compliance</h3>
                <p className="text-[#b8c9bd] text-sm leading-relaxed">
                  Full compliance with Instagram terms of service. Zero risk of account restriction, rate limiting, or shadowbans.
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
                Start Converting Instagram DMs Into Revenue
              </h2>
              <p className="text-lg text-[#b8c9bd] max-w-2xl mx-auto mb-8 font-normal">
                Connect your professional Instagram account in 2 clicks. Start your 14-day free trial today.
              </p>
              <LandingCTAButtons primaryText="Activate Instagram AI Free" secondaryText="See Live Features" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-emerald-500/15 pt-12 text-center">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#b8c9bd]/70 mb-6">
              Omnichannel Messaging Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/whatsapp-ai-chatbot" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">WhatsApp AI Chatbot</Link>
              <Link href="/ai-customer-support" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">AI Customer Support</Link>
              <Link href="/ai-automation" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">AI Business Automation</Link>
              <Link href="/pricing" className="text-xs md:text-sm px-4 py-2 rounded-full glass-panel hover:border-emerald-400/40 text-[#b8c9bd] hover:text-white transition-all">Transparent Pricing</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
