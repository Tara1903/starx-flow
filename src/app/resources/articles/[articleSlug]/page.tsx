import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { ArticleViewerClient } from './ArticleViewerClient';

export async function generateMetadata({ params }: { params: { articleSlug: string } }): Promise<Metadata> {
  const pageMeta = getPageMeta(`/resources/articles/${params.articleSlug}`);
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/resources/articles/${params.articleSlug}`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/resources/articles/${params.articleSlug}`,
      type: 'article',
    },
  };
}

export default function ArticleViewerPage() {
  return <ArticleViewerClient />;
}
