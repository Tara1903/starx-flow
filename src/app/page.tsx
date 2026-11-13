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
import { AuthRedirect } from '@/components/AuthRedirect';

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
    <div className="bg-black min-h-screen flex flex-col pb-24">
      <AuthRedirect to="/dashboard" />
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      
      {/* 1. Flagship Animated Hero */}
      <Hero />
      
      {/* 2. Verified Ecosystem Social Proof */}
      <SocialProof />

      {/* 3. The Front Desk Problem & Lost Revenue Analysis */}
      <Problem />

      {/* 4. Deterministic 3-Step Setup Progression */}
      <HowItWorks />

      {/* 5. Comprehensive Bento Platform Benefits */}
      <Benefits />

      {/* 6. Dual-Segment Value Proposition (Solo & Growing Practices) */}
      <DualSegmentValue />

      {/* 7. Authority Proof & Customer Case Testimonials */}
      <Testimonials />

      {/* 8. Conversion Call to Action */}
      <CTA />

      {/* 9. AI Discovery Engine & Semantic Structured Content */}
      <AIContent />
    </div>
  );
}
