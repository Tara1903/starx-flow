import { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { ComparisonPageClient } from './ComparisonPageClient';

export async function generateMetadata({ params }: { params: { competitorId: string } }): Promise<Metadata> {
  const competitor = params.competitorId.charAt(0).toUpperCase() + params.competitorId.slice(1);
  return {
    title: `StarX Flow vs ${competitor} | ${SEO_CONFIG.siteName}`,
    description: `Compare StarX Flow and ${competitor}. See why StarX Flow is the best AI front desk for your business.`,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/compare/${params.competitorId}`,
    },
    openGraph: {
      title: `StarX Flow vs ${competitor}`,
      description: `Compare StarX Flow and ${competitor}. See why StarX Flow is the best AI front desk for your business.`,
      url: `${SEO_CONFIG.siteUrl}/compare/${params.competitorId}`,
    },
  };
}

export default function ComparisonPage() {
  return <ComparisonPageClient />;
}
