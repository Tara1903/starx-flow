import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { IntegrationsClient } from './IntegrationsClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/integrations');
  const canonicalUrl = getCanonicalUrl('/integrations');

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageMeta.title} | ${SEO_CONFIG.siteName}`,
      description: pageMeta.description,
      url: canonicalUrl,
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
      title: `${pageMeta.title} | ${SEO_CONFIG.siteName}`,
      description: pageMeta.description,
      images: [SEO_CONFIG.defaultOgImage],
    },
  };
}

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
