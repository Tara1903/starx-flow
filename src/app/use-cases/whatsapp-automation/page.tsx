import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

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

        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link href="/whatsapp-ai-chatbot" className="hover:text-emerald-400 transition-colors">WhatsApp AI Chatbot</Link></li>
                <li>/</li>
                <li className="text-emerald-300 font-semibold">Use Cases</li>
              </ol>
            </nav>

            {/* Hero Header */}
            <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-20">
              <div className="spatial-pill-badge mb-6">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Enterprise Inbound Triage
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
                WhatsApp Automation <br />
                <span className="text-gradient-emerald">with Autonomous AI</span>
              </h1>
              <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
                StarX-Flow is an AI workflow automation platform that lets businesses create, deploy, and manage AI-powered WhatsApp automations without extensive coding.
              </p>
            </div>

            {/* Split Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
              <div className="glass-panel glass-panel-hover p-8 border-emerald-500/20">
                <h2 className="font-editorial text-2xl font-bold mb-4 text-white">What It Is</h2>
                <p className="text-[#b8c9bd] leading-relaxed text-sm">
                  Instantly connect your WhatsApp Business account to an intelligent AI Receptionist that understands context, handles complex inquiries, and books appointments natively.
                </p>
              </div>
              <div className="glass-panel glass-panel-hover p-8 border-emerald-500/20">
                <h2 className="font-editorial text-2xl font-bold mb-4 text-white">How It Works</h2>
                <ul className="space-y-3 text-[#b8c9bd] text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">01.</span>
                    <span>Connect your Meta App credentials.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">02.</span>
                    <span>Train your AI with your business knowledge base.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">03.</span>
                    <span>Deploy directly to your WhatsApp number.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">04.</span>
                    <span>Watch as the AI handles inbound leads 24/7.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* CTA Container */}
            <div className="glass-panel p-8 sm:p-12 border-emerald-400/30 max-w-3xl mx-auto text-center shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.12)]">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold mb-4 text-white">Deploy WhatsApp AI Automation</h2>
              <p className="text-[#b8c9bd] mb-8 text-sm sm:text-base max-w-xl mx-auto font-normal">
                Connect your business number and see how conversational AI captures leads while you sleep.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/whatsapp-ai-chatbot"
                  className="spatial-btn-primary w-full sm:w-auto"
                >
                  Explore WhatsApp AI Features
                </Link>
                <Link
                  href="/pricing"
                  className="spatial-btn-secondary w-full sm:w-auto"
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
