import { Metadata } from 'next';
import { SEO_CONFIG, getCanonicalUrl } from '@/lib/seoConfig';
import { IndustryPageClient } from './IndustryPageClient';
import { industryData } from './industryData';
import Script from 'next/script';

type Props = {
  params: Promise<{ industryId: string }>;
};

export async function generateStaticParams() {
  return Object.keys(industryData).map((industryId) => ({
    industryId,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industryId } = await params;
  const data = industryData[industryId];

  if (!data) {
    const formatted = industryId
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      title: `AI Receptionist for ${formatted}`,
      description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp and Instagram with StarX-Flow.`,
      alternates: {
        canonical: getCanonicalUrl(`/industries/${industryId}`),
      },
      openGraph: {
        title: `AI Receptionist for ${formatted} | ${SEO_CONFIG.siteName}`,
        description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp and Instagram with StarX-Flow.`,
        url: getCanonicalUrl(`/industries/${industryId}`),
        images: [
          {
            url: SEO_CONFIG.defaultOgImage,
            width: 1200,
            height: 630,
            alt: `StarX-Flow for ${formatted}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `AI Receptionist for ${formatted} | ${SEO_CONFIG.siteName}`,
        description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp and Instagram with StarX-Flow.`,
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

  const schemas: Record<string, unknown>[] = [];

  if (data) {
    // 1. WebPage Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: data.heroTitle,
      description: data.heroSubtitle,
      url: getCanonicalUrl(`/industries/${industryId}`),
      isPartOf: {
        "@type": "WebSite",
        name: SEO_CONFIG.siteName,
        url: SEO_CONFIG.siteUrl,
      },
    });

    // 2. Service Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: data.heroTitle,
      serviceType: `${data.name} AI Automation & Receptionist`,
      description: data.keyTakeaway || data.heroSubtitle,
      provider: {
        "@type": "Organization",
        name: SEO_CONFIG.siteName,
        url: SEO_CONFIG.siteUrl,
        logo: `${SEO_CONFIG.siteUrl}/logo.svg`,
      },
      areaServed: "Global",
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: getCanonicalUrl(`/industries/${industryId}`),
        servicePhone: {
          "@type": "ContactPoint",
          contactType: "WhatsApp AI Customer Support",
        },
      },
    });

    // 3. BreadcrumbList Schema
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
          name: "Industries",
          item: `${SEO_CONFIG.siteUrl}/industries/${industryId}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: data.name,
          item: getCanonicalUrl(`/industries/${industryId}`),
        },
      ],
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
          id={`industry-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <IndustryPageClient />
    </>
  );
}
