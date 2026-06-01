import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { organizationSchema, softwareApplicationSchema, howToSchema } from '@/components/seo/SchemaMarkup';
import { AIContent } from '@/components/seo/AIContent';
import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { Problem } from '@/components/Problem';
import { HowItWorks } from '@/components/HowItWorks';
import { Benefits } from '@/components/Benefits';
import { Testimonials } from '@/components/Testimonials';
import { CTA } from '@/components/CTA';
import { AuthRedirect } from '@/components/AuthRedirect';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: SEO_CONFIG.siteUrl,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: SEO_CONFIG.siteUrl,
    },
  };
}

export default function Home() {
  const jsonLd = [
    organizationSchema(),
    softwareApplicationSchema(),
    howToSchema([
      { name: 'Connect Your Calendar', text: 'Sync Google Calendar, Outlook, Square, or Clover in one click.' },
      { name: 'Configure Your AI Receptionist', text: 'Enter your services, staff schedule, pricing, and FAQs.' },
      { name: 'Go Live on WhatsApp', text: 'Clients message your number. AI books slots in under 2 seconds.' }
    ])
  ];

  return (
    <div className="bg-black min-h-screen flex flex-col gap-24 lg:gap-32 pb-32">
      <AuthRedirect to="/dashboard" />
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-panel rounded-[3rem] overflow-hidden [&_section]:!bg-transparent">
          <SocialProof />
          <Problem />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="glass-hero rounded-[3rem] overflow-hidden [&_section]:!bg-transparent border-t-0">
          <HowItWorks />
          <Benefits />
        </div>
      </div>

      <Testimonials />
      <CTA />
      <AIContent />
    </div>
  );
}
