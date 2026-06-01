import { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';
import { IndustryPageClient } from './IndustryPageClient';
import { industryData } from './industryData';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: { industryId: string } }): Promise<Metadata> {
  const data = industryData[params.industryId];
  if (!data) {
    return {
      title: `AI Receptionist | ${SEO_CONFIG.siteName}`,
    };
  }

  return {
    title: `${data.heroTitle} | ${SEO_CONFIG.siteName}`,
    description: data.heroSubtitle,
    alternates: {
      canonical: `${SEO_CONFIG.siteUrl}/industries/${params.industryId}`,
    },
    openGraph: {
      title: `${data.heroTitle} | ${SEO_CONFIG.siteName}`,
      description: data.heroSubtitle,
      url: `${SEO_CONFIG.siteUrl}/industries/${params.industryId}`,
    },
  };
}

export default function IndustryPage({ params }: { params: { industryId: string } }) {
  const data = industryData[params.industryId];
  
  return (
    <>
      {data && (
        <Script id="schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": data.heroTitle,
            "description": data.heroSubtitle
          })}
        </Script>
      )}
      <IndustryPageClient />
    </>
  );
}
