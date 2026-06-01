import { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Script from 'next/script';


export const metadata: Metadata = {
  title: `AI Agents Scenarios | ${SEO_CONFIG.siteName}`,
  description: 'Explore how AI Agents can automate your workflow, customer support, and sales with StarX Flow.',
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/scenarios/ai-agents`,
  },
};

export default function AIAgentsScenario() {
  return (
    <>
      <Script id="schema" type="application/ld+json">
        {JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "AI Agents Scenarios",
          "description": "Explore how AI Agents can automate your workflow, customer support, and sales with StarX Flow."
        }
      )}
      </Script>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
        <Navbar />
        <main id="main-content" className="flex-1 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">AI Agents for Workflow Automation</h1>
            <p className="text-xl text-zinc-400 mb-8">
              StarX-Flow is an AI workflow automation platform that lets businesses create, deploy, and manage AI-powered workflows and integrations from a single dashboard.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
                <ul className="space-y-3 text-zinc-300">
                  <li>• 24/7 Automated Support</li>
                  <li>• Human-like Conversational AI</li>
                  <li>• Seamless CRM Integration</li>
                  <li>• Multi-channel Deployment (WhatsApp, Web, IG)</li>
                </ul>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
                <ul className="space-y-3 text-zinc-300">
                  <li>• <strong>Customer Support:</strong> Resolve queries instantly.</li>
                  <li>• <strong>Lead Qualification:</strong> Capture and qualify leads before routing to sales.</li>
                  <li>• <strong>Appointment Booking:</strong> Sync calendars and schedule meetings.</li>
                  <li>• <strong>Order Tracking:</strong> Provide real-time updates to customers.</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-16 glass-panel p-8 rounded-3xl border border-emerald-500/20">
               <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>
               <ul className="space-y-3 text-zinc-300">
                 <li>• StarX-Flow automates AI workflows without code.</li>
                 <li>• Builds on leading LLMs for natural conversations.</li>
                 <li>• Integrates directly with tools like WhatsApp and Zapier.</li>
               </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}


