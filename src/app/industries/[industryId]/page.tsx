import { Metadata } from 'next';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { IndustryPageClient } from './IndustryPageClient';
import { industryData } from './industryData';
import Script from 'next/script';

type Props = {
  params: Promise<{ industryId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industryId } = await params;
  const data = industryData[industryId];
  if (!data) {
    const formatted = industryId.charAt(0).toUpperCase() + industryId.slice(1);
    return {
      title: `AI Receptionist for ${formatted}s`,
      description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp with StarX-Flow.`,
      alternates: {
        canonical: getCanonicalUrl(`/industries/${industryId}`),
      },
      openGraph: {
        title: `AI Receptionist for ${formatted}s | ${SEO_CONFIG.siteName}`,
        description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp with StarX-Flow.`,
        url: getCanonicalUrl(`/industries/${industryId}`),
        images: [
          {
            url: SEO_CONFIG.defaultOgImage,
            width: 1200,
            height: 630,
            alt: `StarX-Flow for ${formatted}s`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `AI Receptionist for ${formatted}s | ${SEO_CONFIG.siteName}`,
        description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp with StarX-Flow.`,
        images: [SEO_CONFIG.defaultOgImage],
      },
    };
  }

  const cleanTitle = data.heroTitle.replace(/\s*\|\s*StarX[- ]?Flow.*$/i, '').trim();

  return {
    title: cleanTitle,
    description: data.heroSubtitle,
    alternates: {
      canonical: getCanonicalUrl(`/industries/${industryId}`),
    },
    openGraph: {
      title: `${cleanTitle} | ${SEO_CONFIG.siteName}`,
      description: data.heroSubtitle,
      url: getCanonicalUrl(`/industries/${industryId}`),
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanTitle} | ${SEO_CONFIG.siteName}`,
      description: data.heroSubtitle,
      images: [SEO_CONFIG.defaultOgImage],
    },
  };
}

export default async function IndustryPage({ params }: Props) {
  const { industryId } = await params;
  const data = industryData[industryId];
  
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
