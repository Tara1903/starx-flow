import { Metadata } from 'next';
import { getPageMeta, SEO_CONFIG } from '@/lib/seoConfig';
import { ProductClient } from './ProductClient';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = getPageMeta('/product');
  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/product`,
    },
    openGraph: {
      title: pageMeta.title,
      description: pageMeta.description,
      url: `${SEO_CONFIG.siteUrl}/product`,
    },
  };
}

export default function ProductPage() {
  return <ProductClient />;
}
