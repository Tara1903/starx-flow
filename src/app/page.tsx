import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { softwareApplicationSchema, howToSchema } from '@/components/seo/SchemaMarkup';
import { AIContent } from '@/components/seo/AIContent';
import { StarXFlowLanding } from '@/components/StarXFlowLanding';

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
    <div className="bg-[#020b08] min-h-screen flex flex-col relative overflow-hidden">
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* Verified Pixel-Perfect Studio Stage Implementation */}
      <StarXFlowLanding />

      {/* AI Discovery Engine & Semantic Structured Content (Preserved for SEO crawlers) */}
      <div className="sr-only" aria-hidden="true">
        <AIContent />
      </div>
    </div>
  );
}
