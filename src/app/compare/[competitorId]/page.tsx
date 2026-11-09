import { Metadata } from 'next';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { ComparisonPageClient } from './ComparisonPageClient';
import { comparisonData } from './comparisonData';
import Script from 'next/script';

type Props = {
  params: Promise<{ competitorId: string }>;
};

export async function generateStaticParams() {
  return Object.keys(comparisonData).map((competitorId) => ({
    competitorId,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitorId } = await params;
  const data = comparisonData[competitorId];
  
  if (!data) {
    const formatted = competitorId
      .replace(/^starx-flow-vs-/i, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      title: `StarX-Flow vs ${formatted}`,
      description: `Compare StarX-Flow with ${formatted}. Discover the AI receptionist and automated WhatsApp front desk for local businesses.`,
      alternates: {
        canonical: getCanonicalUrl(`/compare/${competitorId}`),
      },
      openGraph: {
        title: `StarX-Flow vs ${formatted} | ${SEO_CONFIG.siteName}`,
        description: `Compare StarX-Flow with ${formatted}. Discover the AI receptionist and automated WhatsApp front desk for local businesses.`,
        url: getCanonicalUrl(`/compare/${competitorId}`),
        images: [
          {
            url: SEO_CONFIG.defaultOgImage,
            width: 1200,
            height: 630,
            alt: `StarX-Flow vs ${formatted}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `StarX-Flow vs ${formatted} | ${SEO_CONFIG.siteName}`,
        description: `Compare StarX-Flow with ${formatted}. Discover the AI receptionist and automated WhatsApp front desk for local businesses.`,
        images: [SEO_CONFIG.defaultOgImage],
      },
    };
  }

  // Strip redundant trailing brand suffix and replace any internal pipes with an en-dash
  const cleanTitle = data.title
    .replace(/\s*\|\s*StarX[- ]?Flow.*$/i, '')
    .replace(/\s*\|\s*/g, ' — ')
    .trim();

  return {
    title: cleanTitle,
    description: data.description,
    alternates: {
      canonical: getCanonicalUrl(`/compare/${competitorId}`),
    },
    openGraph: {
      title: `${cleanTitle} | ${SEO_CONFIG.siteName}`,
      description: data.description,
      url: getCanonicalUrl(`/compare/${competitorId}`),
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
      description: data.description,
      images: [SEO_CONFIG.defaultOgImage],
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { competitorId } = await params;
  const data = comparisonData[competitorId];

  const schemas: Record<string, unknown>[] = [];

  if (data) {
    // 1. WebPage Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: data.title,
      description: data.description,
      url: getCanonicalUrl(`/compare/${competitorId}`),
      isPartOf: {
        "@type": "WebSite",
        name: SEO_CONFIG.siteName,
        url: SEO_CONFIG.siteUrl,
      },
    });

    // 2. BreadcrumbList Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SEO_CONFIG.siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Comparisons",
          item: `${SEO_CONFIG.siteUrl}/compare/${competitorId}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `StarX-Flow vs ${data.competitor}`,
          item: getCanonicalUrl(`/compare/${competitorId}`),
        },
      ],
    });

    // 3. Product Schema for StarX-Flow
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "StarX-Flow AI Receptionist & Business Operating System",
      description: "Autonomous 24/7 AI receptionist for WhatsApp and Instagram that schedules appointments, syncs calendars, and handles client intake without booking commissions.",
      brand: {
        "@type": "Brand",
        name: SEO_CONFIG.siteName,
      },
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        url: getCanonicalUrl(`/compare/${competitorId}`),
      },
    });

    // 4. FAQPage Schema (if FAQs exist)
    if (data.faqs && data.faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      });
    }
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`compare-schema-${competitorId}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ComparisonPageClient />
    </>
  );
}
