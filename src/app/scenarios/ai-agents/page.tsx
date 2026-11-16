import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { Bot, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Agents Scenarios & Use Cases | StarX-Flow',
  description: 'Explore how AI Agents automate workflows, customer support, and appointment scheduling with StarX-Flow.',
  alternates: {
    canonical: getCanonicalUrl('/scenarios/ai-agents'),
  },
  openGraph: {
    title: `AI Agents Scenarios | ${SEO_CONFIG.siteName}`,
    description: 'Explore how AI Agents automate workflows, customer support, and appointment scheduling with StarX-Flow.',
    url: getCanonicalUrl('/scenarios/ai-agents'),
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `AI Agents Scenarios | ${SEO_CONFIG.siteName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `AI Agents Scenarios | ${SEO_CONFIG.siteName}`,
    description: 'Explore how AI Agents automate workflows, customer support, and appointment scheduling with StarX-Flow.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

export default function AIAgentsScenario() {
  return (
    <>
      <Script id="schema-scenario-agents" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "AI Agents Scenarios",
          "description": "Explore how AI Agents automate workflows, customer support, and sales with StarX-Flow."
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
                <li><Link href="/ai-agents" className="hover:text-emerald-400 transition-colors">AI Agents</Link></li>
                <li>/</li>
                <li className="text-emerald-300 font-semibold">Scenarios</li>
              </ol>
            </nav>

            {/* Hero Header */}
            <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-20">
              <div className="spatial-pill-badge mb-6">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                Operational Autonomy
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
                AI Agents for <br />
                <span className="text-gradient-emerald">Workflow Automation</span>
              </h1>
              <p className="text-lg md:text-xl text-[#b8c9bd] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
                StarX-Flow is an autonomous AI workflow automation platform that lets businesses create, deploy, and manage AI-powered agents and integrations from a single dashboard.
              </p>
            </div>

            {/* Split Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
              <div className="glass-panel glass-panel-hover p-8 border-emerald-500/20">
                <h2 className="font-editorial text-2xl font-bold mb-4 text-white">Key Benefits</h2>
                <ul className="space-y-3 text-[#b8c9bd] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>24/7 Automated Customer Support</strong> across WhatsApp, Instagram, and Web</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Dynamic Tool Calling:</strong> Real-time calendar slot reservation and conflict checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>RAG Grounded Intelligence</strong> from custom business documents and FAQs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Seamless Human Handoff</strong> with unified team inbox controls</span>
                  </li>
                </ul>
              </div>
              <div className="glass-panel glass-panel-hover p-8 border-emerald-500/20">
                <h2 className="font-editorial text-2xl font-bold mb-4 text-white">Real Business Scenarios</h2>
                <ul className="space-y-3 text-[#b8c9bd] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono text-xs">01.</span>
                    <span><strong>Appointment Scheduling:</strong> Automatically checking Google Calendar and locking client slots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono text-xs">02.</span>
                    <span><strong>Lead Qualification:</strong> Asking qualifying budget and service questions before booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono text-xs">03.</span>
                    <span><strong>Review Booster:</strong> Triggering automated Google review requests after visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono text-xs">04.</span>
                    <span><strong>Customer Care:</strong> Resolving service policies, directions, and hours instantly</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* CTA Container */}
            <div className="glass-panel p-8 sm:p-12 border-emerald-400/30 max-w-3xl mx-auto text-center shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.12)]">
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold mb-4 text-white">Deploy Autonomous AI Agents Today</h2>
              <p className="text-[#b8c9bd] mb-8 text-sm sm:text-base max-w-xl mx-auto font-normal">
                Ready to see how AI agents can transform your customer communication and operations?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/ai-agents"
                  className="spatial-btn-primary w-full sm:w-auto"
                >
                  Explore AI Agents Overview
                </Link>
                <Link
                  href="/pricing"
                  className="spatial-btn-secondary w-full sm:w-auto"
                >
                  View Plans & Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
