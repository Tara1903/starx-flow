import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';

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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
        <div className="flex-1 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs md:text-sm text-zinc-400">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link href="/ai-agents" className="hover:text-emerald-400 transition-colors">AI Agents</Link></li>
                <li>/</li>
                <li className="text-zinc-200 font-medium">Scenarios</li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">AI Agents for Workflow Automation</h1>
            <p className="text-xl text-zinc-300 mb-8 max-w-3xl">
              StarX-Flow is an autonomous AI workflow automation platform that lets businesses create, deploy, and manage AI-powered agents and integrations from a single dashboard.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
                <ul className="space-y-3 text-zinc-300 text-sm">
                  <li>• 24/7 Automated Customer Support across WhatsApp, Instagram, and Web</li>
                  <li>• Dynamic Tool Calling: Real-time calendar slot reservation and conflict checks</li>
                  <li>• RAG Grounded Intelligence from custom business documents and FAQs</li>
                  <li>• Seamless Human Handoff with unified team inbox controls</li>
                </ul>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">Real Business Scenarios</h2>
                <ul className="space-y-3 text-zinc-300 text-sm">
                  <li>• <strong>Appointment Scheduling:</strong> Automatically checking Google Calendar and locking client slots</li>
                  <li>• <strong>Lead Qualification:</strong> Asking qualifying budget and service questions before booking</li>
                  <li>• <strong>Review Booster:</strong> Triggering automated Google review requests after visits</li>
                  <li>• <strong>Customer Care:</strong> Resolving service policies, directions, and hours instantly</li>
                </ul>
              </div>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20 max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Deploy Autonomous AI Agents Today</h2>
              <p className="text-zinc-300 mb-6">
                Ready to see how AI agents can transform your customer communication and operations?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/ai-agents"
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all"
                >
                  Explore AI Agents Overview
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-white rounded-full transition-all"
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
