import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { PresentationViewerClient } from './PresentationViewerClient';

type Props = {
  params: Promise<{ deckId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deckId } = await params;
  const pageMeta = getPageMeta(`/resources/${deckId}`);
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: getCanonicalUrl(`/resources/${deckId}`),
    },
    openGraph: {
      title: `${pageMeta.title} | ${SEO_CONFIG.siteName}`,
      description: pageMeta.description,
      url: getCanonicalUrl(`/resources/${deckId}`),
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

export default async function PresentationViewerPage({ params }: Props) {
  await params;
  return <PresentationViewerClient />;
}
