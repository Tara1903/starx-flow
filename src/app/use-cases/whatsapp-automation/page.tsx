import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';

export const metadata: Metadata = {
  title: 'WhatsApp Automation Use Cases & Lead Workflows | StarX-Flow',
  description: 'Automate WhatsApp conversations, lead generation, and appointment booking with AI agents using StarX-Flow.',
  alternates: {
    canonical: getCanonicalUrl('/use-cases/whatsapp-automation'),
  },
  openGraph: {
    title: `WhatsApp Automation | ${SEO_CONFIG.siteName}`,
    description: 'Automate WhatsApp conversations with AI agents using StarX-Flow.',
    url: getCanonicalUrl('/use-cases/whatsapp-automation'),
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `WhatsApp Automation | ${SEO_CONFIG.siteName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `WhatsApp Automation | ${SEO_CONFIG.siteName}`,
    description: 'Automate WhatsApp conversations with AI agents using StarX-Flow.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

export default function WhatsAppAutomation() {
  return (
    <>
      <Script id="schema-usecase-whatsapp" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "WhatsApp Automation Use Cases",
          "description": "Automate WhatsApp customer conversations and bookings with AI agents."
        })}
      </Script>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
        <div className="flex-1 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs md:text-sm text-zinc-400">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link href="/whatsapp-ai-chatbot" className="hover:text-emerald-400 transition-colors">WhatsApp AI Chatbot</Link></li>
                <li>/</li>
                <li className="text-zinc-200 font-medium">Use Cases</li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">WhatsApp Automation with AI</h1>
            <p className="text-xl text-zinc-300 mb-8 max-w-3xl">
              StarX-Flow is an AI workflow automation platform that lets businesses create, deploy, and manage AI-powered WhatsApp automations without extensive coding.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">What It Is</h2>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  Instantly connect your WhatsApp Business account to an intelligent AI Receptionist that understands context, handles complex inquiries, and books appointments natively.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <ul className="space-y-3 text-zinc-300 text-sm">
                  <li>1. Connect your Meta App credentials.</li>
                  <li>2. Train your AI with your business knowledge base.</li>
                  <li>3. Deploy directly to your WhatsApp number.</li>
                  <li>4. Watch as the AI handles inbound leads 24/7.</li>
                </ul>
              </div>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Deploy WhatsApp AI Automation</h2>
              <p className="text-zinc-300 mb-6 text-sm">
                Connect your business number and see how conversational AI captures leads while you sleep.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/whatsapp-ai-chatbot"
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all text-sm"
                >
                  Explore WhatsApp AI Features
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-white rounded-full transition-all text-sm"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
