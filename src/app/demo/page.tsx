import { Metadata } from 'next';
import Link from 'next/link';
import { getPageMeta, SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { DemoPageClient } from './DemoPageClient';
import { Sparkles, Bot, Calendar, Shield, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/demo');
  const canonicalUrl = getCanonicalUrl('/demo');

  return {
    title: {
      absolute: pageMeta.title,
    },
    description: pageMeta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      type: 'website',
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${pageMeta.title} | ${SEO_CONFIG.siteName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMeta.title,
      description: pageMeta.description,
      images: [SEO_CONFIG.defaultOgImage],
    },
  };
}

export default function DemoPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SEO_CONFIG.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Book a Demonstration',
        item: `${SEO_CONFIG.siteUrl}/demo`,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SEO_CONFIG.siteUrl}/demo#webpage`,
    url: `${SEO_CONFIG.siteUrl}/demo`,
    name: 'Book a StarX-Flow Live Product Demonstration',
    description: 'Schedule a tailored walkthrough of StarX-Flow AI front-desk automation for salons, clinics, and appointment businesses.',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SEO_CONFIG.siteUrl}/#website`,
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 text-white">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-300 font-medium">Demo</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Live 1-on-1 Demonstration
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                See Your AI Front Desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">In Action</span>
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Discover how StarX-Flow automates customer inquiries, captures after-hours bookings, and syncs directly with your calendar in real time.
              </p>
            </div>

            {/* What you will experience */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                What We Cover in 15 Minutes
              </h2>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">Live WhatsApp & Chat Triage</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Watch the AI answer your practice's specific pricing, services, and FAQ questions with zero hallucinations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">Conflict-Free Calendar Booking</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Experience two-way Google Calendar synchronization that locks appointment slots instantly without double-booking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">Seamless Human Handoff</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    See how staff receive real-time notifications whenever a customer requires human intervention or clinical triage.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="p-4 rounded-2xl border border-white/5 bg-zinc-950/60 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero Obligation Guarantee
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                This is a consultation tailored to your business operations. We do not use high-pressure sales tactics.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
              <h2 className="text-lg font-bold text-white mb-1">Schedule Your Demonstration</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Tell us about your business so we can prepare your actual services and FAQs before the call.
              </p>

              <DemoPageClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
