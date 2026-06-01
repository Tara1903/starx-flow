import { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: `WhatsApp Automation | ${SEO_CONFIG.siteName}`,
  description: 'Automate WhatsApp conversations with AI agents using StarX Flow.',
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/use-cases/whatsapp-automation`,
  },
};

export default function WhatsAppAutomation() {
  return (
    <>
      <Script id="schema" type="application/ld+json">
        {JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "WhatsApp Automation",
          "description": "Automate WhatsApp conversations with AI agents using StarX Flow."
        }
      )}
      </Script>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
        <Navbar />
        <main id="main-content" className="flex-1 pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">WhatsApp Automation with AI</h1>
            <p className="text-xl text-zinc-400 mb-8">
              StarX-Flow is an AI workflow automation platform that lets businesses create, deploy, and manage AI-powered WhatsApp automations without extensive coding.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">What It Is</h2>
                <p className="text-zinc-300">
                  Instantly connect your WhatsApp Business account to an intelligent AI Receptionist that understands context, handles complex inquiries, and books appointments natively.
                </p>
              </div>
              <div className="glass-panel p-8 rounded-3xl border border-emerald-500/20">
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <ul className="space-y-3 text-zinc-300">
                  <li>1. Connect your Meta App credentials.</li>
                  <li>2. Train your AI with your business knowledge base.</li>
                  <li>3. Deploy directly to your WhatsApp number.</li>
                  <li>4. Watch as the AI handles inbound leads 24/7.</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-16 glass-panel p-8 rounded-3xl border border-emerald-500/20">
               <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>
               <ul className="space-y-3 text-zinc-300">
                 <li>• Reach customers where they already are: WhatsApp.</li>
                 <li>• Reduce response times to under 2 seconds.</li>
                 <li>• Handle unlimited concurrent conversations effortlessly.</li>
               </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

