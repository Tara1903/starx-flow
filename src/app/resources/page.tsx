import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { ResourcesClient } from './ResourcesClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/resources');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/resources`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/resources`,
    },
  };
}

export default function ResourcesPage() {
  return <ResourcesClient />;
}
