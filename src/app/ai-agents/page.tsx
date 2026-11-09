import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, Bot, Calendar, ArrowRight, 
  ShieldCheck, Zap, Layers, Cpu, Users, HelpCircle 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Agents for Business Automation | Autonomous Workforce | StarX-Flow',
  description: 'Deploy autonomous AI agents that perform real business actions: scheduling appointments, updating CRM records, processing orders, and orchestrating operational workflows.',
  alternates: {
    canonical: getCanonicalUrl('/ai-agents'),
  },
  openGraph: {
    title: `AI Agents for Business Automation | ${SEO_CONFIG.siteName}`,
    description: 'Deploy autonomous AI agents that perform real business actions: scheduling appointments, updating CRM records, and orchestrating workflows.',
    url: getCanonicalUrl('/ai-agents'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'AI Agents for Business' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `AI Agents for Business Automation | ${SEO_CONFIG.siteName}`,
    description: 'Deploy autonomous AI agents for customer communication, scheduling, and workflow execution.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What are AI agents for business?",
    answer: "AI agents for business are autonomous software entities powered by large language models that understand context, evaluate goals, and execute real actions through tool calling and API integrations — such as booking calendar slots, looking up customer history, or updating CRM tags."
  },
  {
    question: "How do StarX-Flow AI agents differ from standard AI chatbots?",
    answer: "Standard chatbots only return static text or basic answers. StarX-Flow AI agents possess executable operational tools: they can query live Google Calendar availability, execute ISO-8601 conflict checks, create verified appointments, update customer profiles, and trigger automated event workflows."
  },
  {
    question: "What tools and actions can the AI agents perform?",
    answer: "Our agents feature strictly validated Zod schemas for: checkCalendarAvailability, bookAppointment, modifyAppointment, cancelAppointment, lookupCustomer, updateCustomerProfile, and getOrderStatus."
  },
  {
    question: "What happens if an AI agent encounters an ambiguous request?",
    answer: "The agent asks clarifying questions to gather required parameters. If the request remains outside its operational policy or knowledge boundary, it gracefully transfers control to a human team member in the unified dashboard."
  },
  {
    question: "Do I need engineering skills or Python to configure AI agents?",
    answer: "No. While developer frameworks like LangChain or AutoGen require code, StarX-Flow provides a complete, visual no-code interface where you configure roles, tone, knowledge, and tool permissions in minutes."
  }
];

export default function AIAgentsPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Agents for Business Automation",
      description: "Autonomous AI agents and workforce for business operations, scheduling, and customer communication.",
      url: getCanonicalUrl('/ai-agents'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "AI Agents", item: getCanonicalUrl('/ai-agents') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StarX-Flow Autonomous AI Agents",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Autonomous AI agents with tool calling capabilities for calendar booking, CRM updates, and workflow execution.",
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
          id={`schema-agents-${i}`}
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
              <li className="text-zinc-200 font-medium">AI Agents</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Cpu className="w-4 h-4" />
              Autonomous Action & Tool Execution Engine
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Autonomous AI Agents <br />
              <span className="text-emerald-400">That Execute Real Business Actions</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Move beyond basic chatbots. StarX-Flow deploys autonomous AI agents that converse, check schedules, write to calendars, update CRM records, and trigger operational workflows.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-10 shadow-lg">
              <strong className="text-emerald-400 block mb-2 font-semibold">Direct Answer:</strong>
              AI agents for business are autonomous software programs powered by large language models that understand context, evaluate goals, and call external tools and APIs to achieve specific operational results. In StarX-Flow, AI agents perform real actions including verifying calendar availability, scheduling appointments, updating customer records in the CRM, and triggering automated follow-ups across WhatsApp and Instagram.
            </div>

            <LandingCTAButtons primaryText="Deploy Your AI Agents" secondaryText="Explore Agent Scenarios" secondaryHref="/scenarios/ai-agents" />
          </div>

          {/* Tool Calling Execution Architecture */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
              <h2 className="text-3xl font-bold text-center mb-6">
                How StarX-Flow Agents Execute Operational Tools
              </h2>
              <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
                Our multi-tier engine utilizes function calling with strict Zod validation schemas to execute business operations safely.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="text-emerald-400 font-mono text-sm mb-2 font-bold">1. Tool Call Intent</div>
                  <h3 className="font-semibold text-white mb-2">Intent Detection</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Customer: &quot;Can I book an appointment for Friday at 3 PM?&quot; — Agent detects intent and invokes <code>checkCalendarAvailability</code>.
                  </p>
                </div>

                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="text-emerald-400 font-mono text-sm mb-2 font-bold">2. Schema Validation</div>
                  <h3 className="font-semibold text-white mb-2">Conflict Resolution</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    The agent calls Google Calendar API, verifies slot availability, locks the time window, and executes <code>bookAppointment</code>.
                  </p>
                </div>

                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                  <div className="text-emerald-400 font-mono text-sm mb-2 font-bold">3. Database Action</div>
                  <h3 className="font-semibold text-white mb-2">CRM Synchronization</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Customer record is created or merged via <code>IdentityResolver</code>, and confirmation is sent back in under 2 seconds.
                  </p>
                </div>
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
                Deploy an Autonomous AI Workforce Today
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Setup your AI agents in under 5 minutes with our visual dashboard. Start your 14-day free trial.
              </p>
              <LandingCTAButtons primaryText="Activate AI Agents Free" secondaryText="View Workflow Engine" secondaryHref="/business-workflow-automation" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Related Automation Capabilities
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/business-workflow-automation" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">Business Workflow Automation</Link>
              <Link href="/whatsapp-ai-chatbot" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">WhatsApp AI Chatbot</Link>
              <Link href="/compare/starx-flow-vs-zapier" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">StarX-Flow vs Zapier</Link>
              <Link href="/pricing" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">View Pricing Plans</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
