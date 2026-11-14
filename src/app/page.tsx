import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { organizationSchema, softwareApplicationSchema, howToSchema } from '@/components/seo/SchemaMarkup';
import { AIContent } from '@/components/seo/AIContent';
import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { Problem } from '@/components/Problem';
import { HowItWorks } from '@/components/HowItWorks';
import { Benefits } from '@/components/Benefits';
import { DualSegmentValue } from '@/components/DualSegmentValue';
import { Testimonials } from '@/components/Testimonials';
import { CTA } from '@/components/CTA';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/');
  return {
    title: {
      absolute: pageMeta.title,
    },
    description: pageMeta.description,
    alternates: {
      canonical: SEO_CONFIG.siteUrl,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: SEO_CONFIG.siteUrl,
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: pageMeta.title,
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

export default function Home() {
  const jsonLd = [
    softwareApplicationSchema(),
    howToSchema([
      { name: 'Connect Your Calendar', text: 'Sync Google Calendar and Microsoft Outlook in one click.' },
      { name: 'Configure Your AI Receptionist', text: 'Enter your services, staff schedule, pricing, and FAQs.' },
      { name: 'Go Live on WhatsApp', text: 'Clients message your number. AI engages clients and books slots in real time.' }
    ])
  ];

  return (
    <div className="bg-black min-h-screen flex flex-col gap-12 lg:gap-16 pb-24">
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      
      {/* 1. Flagship Animated Hero */}
      <Hero />
      
      {/* 2. Verified Ecosystem Social Proof & Lost Revenue Analysis */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] [&_section]:!bg-transparent">
          <SocialProof />
          <Problem />
        </div>
      </div>

      {/* 3. Deterministic 3-Step Setup Progression & Core Capabilities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-hero rounded-[2.5rem] overflow-hidden border border-emerald-500/20 shadow-[0_24px_90px_rgba(0,0,0,0.7),0_0_50px_rgba(16,185,129,0.08)] [&_section]:!bg-transparent border-t-0">
          <HowItWorks />
          <Benefits />
        </div>
      </div>

      {/* 4. Dual-Segment Value Proposition (Solo & Growing Practices) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] [&_section]:!bg-transparent">
          <DualSegmentValue />
        </div>
      </div>

      {/* 5. Authority Proof & Customer Case Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-hero rounded-[2.5rem] overflow-hidden border border-emerald-500/20 shadow-[0_24px_90px_rgba(0,0,0,0.7),0_0_50px_rgba(16,185,129,0.08)] [&_section]:!bg-transparent">
          <Testimonials />
        </div>
      </div>

      {/* 6. Conversion Call to Action */}
      <CTA />

      {/* 7. AI Discovery Engine & Semantic Structured Content */}
      <AIContent />
    </div>
  );
}
