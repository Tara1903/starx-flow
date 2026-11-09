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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      {jsonLd.map((schema, i) => (
        <Script
          key={i}
          id={`schema-instagram-bot-${i}`}
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
              <li className="text-zinc-200 font-medium">Instagram AI Automation</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-semibold tracking-wide mb-6">
              <Instagram className="w-4 h-4" />
              Official Meta Instagram Graph API Integration
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Convert Instagram Inquiries <br />
              <span className="text-emerald-400">Into Confirmed Bookings in Seconds</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Stop letting prospective clients wait hours for DM replies. StarX-Flow qualifies inbound leads, answers service questions, and schedules appointments 24/7 inside Instagram DMs.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-10 shadow-lg">
              <strong className="text-emerald-400 block mb-2 font-semibold">Direct Answer:</strong>
              Instagram DM automation enables businesses to respond to direct messages instantly, qualify incoming customer inquiries, and reserve calendar appointments using conversational AI. StarX-Flow connects to the official Meta Instagram Graph API to execute multi-turn conversations, check Google Calendar availability, and write verified bookings without manual human delay.
            </div>

            <LandingCTAButtons primaryText="Automate Your Instagram DMs" secondaryText="Explore Live Chat Demo" />
          </div>

          {/* Key Capabilities */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Built for High-Growth Instagram Profiles
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Turn your Instagram profile into an automated sales and appointment generation machine.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sub-2-Second DM Responses</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Respond to inbound DMs the instant they arrive. Capitalize on customer intent while your brand is top of mind.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Native Calendar Scheduling</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  No bio links or external forms. Clients browse availability and confirm slots directly inside the conversation.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Official Meta Compliance</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Full compliance with Instagram terms of service. Zero risk of account restriction, rate limiting, or shadowbans.
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
                Start Converting Instagram DMs Into Revenue
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Connect your professional Instagram account in 2 clicks. Start your 14-day free trial today.
              </p>
              <LandingCTAButtons primaryText="Activate Instagram AI Free" secondaryText="See Live Features" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Omnichannel Messaging Solutions
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/whatsapp-ai-chatbot" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">WhatsApp AI Chatbot</Link>
              <Link href="/ai-customer-support" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">AI Customer Support</Link>
              <Link href="/ai-automation" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">AI Business Automation</Link>
              <Link href="/pricing" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Transparent Pricing</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
