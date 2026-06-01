import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { PresentationViewerClient } from './PresentationViewerClient';

export async function generateMetadata({ params }: { params: { deckId: string } }): Promise<Metadata> {
  const pageMeta = getPageMeta(`/resources/${params.deckId}`);
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/resources/${params.deckId}`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/resources/${params.deckId}`,
    },
  };
}

export default function PresentationViewerPage() {
  return <PresentationViewerClient />;
}
