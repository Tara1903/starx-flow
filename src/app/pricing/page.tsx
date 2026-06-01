import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { PricingClient } from './PricingClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/pricing');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/pricing`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/pricing`,
    },
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
