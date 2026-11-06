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
      title: `${pageMeta.title} | ${SEO_CONFIG.siteName}`,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/features`,
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

export default function FeaturesPage() {
  return <FeaturesClient />;
}
