import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { LandingCTAButtons } from '@/components/seo/LandingCTAButtons';
import { 
  Sparkles, CheckCircle2, Zap, Calendar, ArrowRight, 
  ShieldCheck, Layers, GitBranch, Bell, Clock, HelpCircle 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Workflow Automation Platform | StarX-Flow',
  description: 'Streamline your operations with event-driven business workflow automation. Connect customer communications, calendar schedules, CRM records, and automated tasks in one dashboard.',
  alternates: {
    canonical: getCanonicalUrl('/business-workflow-automation'),
  },
  openGraph: {
    title: `Business Workflow Automation Platform | ${SEO_CONFIG.siteName}`,
    description: 'Streamline operations with event-driven business workflow automation. Connect communications, calendars, and CRM records in one platform.',
    url: getCanonicalUrl('/business-workflow-automation'),
    images: [{ url: SEO_CONFIG.defaultOgImage, width: 1200, height: 630, alt: 'Business Workflow Automation Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Business Workflow Automation Platform | ${SEO_CONFIG.siteName}`,
    description: 'Event-driven business workflow automation connecting messaging, calendars, and CRMs.',
    images: [SEO_CONFIG.defaultOgImage],
  },
};

const faqs = [
  {
    question: "What is a business workflow automation platform?",
    answer: "A business workflow automation platform connects disparate business software, communications, and databases to automatically execute repetitive operational tasks based on pre-set triggers and conditions — eliminating manual busywork."
  },
  {
    question: "How does StarX-Flow's workflow builder work?",
    answer: "StarX-Flow features a visual trigger-condition-action workflow engine. You can define triggers (such as 'New WhatsApp Lead Captured' or 'Appointment Booked'), set logic conditions (e.g. 'Customer is VIP'), and execute actions (e.g. 'Send Confirmation SMS', 'Dispatch Google Review Request 2 hours after appointment', 'Alert Manager')."
  },
  {
    question: "Can StarX-Flow automate appointment reminders and review collection?",
    answer: "Yes. Our background job scheduler automatically coordinates automated 24-hour and 1-hour appointment reminders on WhatsApp, and schedules automated Google Review request messages following completed service appointments."
  },
  {
    question: "How is StarX-Flow different from Zapier or Make?",
    answer: "Zapier and Make are generic API connectors that require separate subscriptions for your chatbot, calendar, storage, and CRM. StarX-Flow is an integrated, cohesive AI business operating system with native conversational front ends, RAG document search, two-way calendar sync, and CRM built right in."
  },
  {
    question: "Can I customize workflows without coding?",
    answer: "Yes. StarX-Flow's workflow builder is 100% visual and no-code. Drag and drop triggers, define conditions, and set actions with simple dropdown selectors."
  }
];

export default function BusinessWorkflowAutomationPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Business Workflow Automation Platform",
      description: "Visual, event-driven business workflow automation platform connecting messaging, calendars, and customer data.",
      url: getCanonicalUrl('/business-workflow-automation'),
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SEO_CONFIG.siteUrl },
          { "@type": "ListItem", position: 2, name: "Business Workflow Automation", item: getCanonicalUrl('/business-workflow-automation') }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StarX-Flow Workflow Automation Engine",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Visual workflow automation platform for business process management, scheduling, and notifications.",
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
          id={`schema-workflow-${i}`}
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
              <li className="text-zinc-200 font-medium">Business Workflow Automation</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide mb-6">
              <Zap className="w-4 h-4" />
              Event-Driven Operational Automation
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Intelligent Business Workflow <br />
              <span className="text-emerald-400">Automation for Modern Operations</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              Eliminate repetitive manual tasks. Connect inbound customer chats, calendar schedules, CRM records, and automated notifications into one seamless operational engine.
            </p>

            {/* Direct Answer Box for AI Answer Engines */}
            <div className="text-left bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-6 text-zinc-300 text-base leading-relaxed mb-10 shadow-lg">
              <strong className="text-emerald-400 block mb-2 font-semibold">Direct Answer:</strong>
              A business workflow automation platform connects disparate business software tools, customer communications, and databases to execute operational tasks automatically based on defined triggers and conditions. StarX-Flow combines visual trigger-action workflow building with generative conversational AI, allowing businesses to automate lead routing, reminder dispatch, review collection, and appointment operations without complex engineering.
            </div>

            <LandingCTAButtons primaryText="Automate Your Workflows Free" secondaryText="Compare With Zapier" secondaryHref="/compare/starx-flow-vs-zapier" />
          </div>

          {/* Workflow Automation Features */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <GitBranch className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Visual Trigger-Action Builder</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Design complex business logic with no-code simplicity. Chain triggers, conditions, and actions into reliable workflows.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Automated Reminder Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Schedule automated WhatsApp and SMS appointment reminders 24h and 1h prior to slash costly customer no-shows.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Google & Outlook Sync</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Keep your entire team aligned. Automated calendar invitations and updates sync across Google and Microsoft ecosystems.
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
                Automate Your Daily Business Workflows
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-8">
                Save 15+ hours every week and eliminate human error. Start your 14-day free trial today.
              </p>
              <LandingCTAButtons primaryText="Start Free Automation Trial" secondaryText="Compare With Make" secondaryHref="/compare/starx-flow-vs-make" />
            </div>
          </div>

          {/* Cross Links */}
          <div className="max-w-4xl mx-auto border-t border-white/10 pt-12 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Compare Workflow Platforms
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/compare/starx-flow-vs-zapier" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">StarX-Flow vs Zapier</Link>
              <Link href="/compare/starx-flow-vs-make" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">StarX-Flow vs Make</Link>
              <Link href="/compare/starx-flow-vs-n8n" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">StarX-Flow vs n8n</Link>
              <Link href="/ai-automation" className="text-xs md:text-sm px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300">AI Automation for Business</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
