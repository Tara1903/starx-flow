import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { AboutClient } from './AboutClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/about');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/about`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/about`,
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
