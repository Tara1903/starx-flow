import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { FeaturesClient } from './FeaturesClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/features');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/features`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/features`,
    },
  };
}

export default function FeaturesPage() {
  return <FeaturesClient />;
}
