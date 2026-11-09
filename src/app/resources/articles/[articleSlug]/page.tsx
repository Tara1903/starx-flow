import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { ArticleViewerClient } from './ArticleViewerClient';

type Props = {
  params: Promise<{ articleSlug: string }>;
};

export async function generateStaticParams() {
  return [
    { articleSlug: 'calendar-integration' },
    { articleSlug: 'clinic-receptionist' },
    { articleSlug: 'google-reviews-seo' },
    { articleSlug: 'gym-onboarding' },
    { articleSlug: 'spa-no-shows' },
    { articleSlug: 'scaling-failures' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params;
  const pageMeta = getPageMeta(`/resources/articles/${articleSlug}`);
  const canonicalUrl = getCanonicalUrl(`/resources/articles/${articleSlug}`);

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
      type: 'article',
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

export default async function ArticleViewerPage({ params }: Props) {
  await params;
  return <ArticleViewerClient />;
}
