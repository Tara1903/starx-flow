import { Metadata } from 'next';
import Link from 'next/link';
import { getPageMeta, SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { DemoPageClient } from './DemoPageClient';
import { Bot, Calendar, Shield, Clock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

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
    name: 'Book a StarX Flow Live Product Demonstration',
    description: 'Schedule a tailored walkthrough of StarX Flow AI front-desk automation for salons, clinics, and appointment businesses.',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SEO_CONFIG.siteUrl}/#website`,
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[#020a07] pt-32 lg:pt-40 pb-24 text-[#f0f5ef] relative overflow-hidden">
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

      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#b8c9bd]/70 uppercase tracking-widest mb-10">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-300">Book Demonstration</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Proof */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="spatial-pill-badge mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Live 1-on-1 Walkthrough
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                See Your AI Front Desk <span className="text-gradient-emerald">In Action</span>
              </h1>
              <p className="text-[#b8c9bd] text-sm md:text-base leading-relaxed font-normal">
                Discover how StarX Flow automates customer inquiries, captures after-hours bookings, and syncs directly with your calendar in real time.
              </p>
            </div>

            {/* What you will experience */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                What We Cover in 15 Minutes
              </h2>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border-emerald-500/20">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(40,223,160,0.15)]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Live WhatsApp &amp; Chat Triage</h3>
                  <p className="text-xs text-[#b8c9bd] leading-normal font-normal">
                    Watch the AI answer your practice&apos;s specific pricing, services, and FAQ questions with zero hallucinations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border-emerald-500/20">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(40,223,160,0.15)]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Conflict-Free Calendar Booking</h3>
                  <p className="text-xs text-[#b8c9bd] leading-normal font-normal">
                    Experience two-way Google Calendar synchronization that locks appointment slots instantly without double-booking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel border-emerald-500/20">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(40,223,160,0.15)]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Seamless Human Handoff</h3>
                  <p className="text-xs text-[#b8c9bd] leading-normal font-normal">
                    See how staff receive real-time notifications whenever a customer requires human intervention or clinical triage.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-[#010804] text-xs text-[#b8c9bd] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Zero Obligation Guarantee
              </div>
              <p className="text-xs text-[#b8c9bd]/80 leading-relaxed font-normal">
                This is a tailored operational consultation. We do not use high-pressure sales tactics.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-10 rounded-3xl border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(40,223,160,0.15)]">
              <h2 className="font-editorial text-2xl font-bold text-white mb-1">Schedule Your Demonstration</h2>
              <p className="text-xs text-[#b8c9bd] mb-6">
                Tell us about your business so we can prepare your actual services and FAQs before the walkthrough.
              </p>

              <DemoPageClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
