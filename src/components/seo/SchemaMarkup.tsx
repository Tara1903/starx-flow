import { SEO_CONFIG } from "../../lib/seoConfig";

/**
 * Pre-built JSON-LD schema generators for StarX-Flow.
 * Use these with the SEO component's `jsonLd` prop.
 *
 * Usage:
 * ```tsx
 * 
 * ```
 */

/** Organization schema — use on homepage or globally */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/logo.svg`,
    description: SEO_CONFIG.defaultDescription,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

/** WebSite schema with search action — use globally */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.siteUrl}/resources?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** SoftwareApplication schema — use on homepage/product page */
export function softwareApplicationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO_CONFIG.siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI-powered operating system that automates WhatsApp booking, customer care, calendar sync, and client management for local service businesses.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "29",
      highPrice: "99",
      offerCount: "3",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "850",
      bestRating: "5",
    },
    featureList: [
      "24/7 WhatsApp AI Receptionist",
      "Multi-Calendar Sync (Google, Outlook, Square, Clover)",
      "CRM & Customer Ownership",
      "Google Review Booster",
      "WhatsApp Intake Forms",
      "Multi-Staff Rostering",
      "HIPAA-Compliant Security",
    ],
  };
}

/** FAQ Page schema — pass array of { question, answer } */
export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Product/Pricing schema for individual plan */
export function productSchema(plan: {
  name: string;
  price: string;
  description: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SEO_CONFIG.siteName} ${plan.name} Plan`,
    description: plan.description,
    brand: {
      "@type": "Brand",
      name: SEO_CONFIG.siteName,
    },
    offers: {
      "@type": "Offer",
      price: plan.price.replace("$", ""),
      priceCurrency: "USD",
      priceValidUntil: new Date(
        new Date().getFullYear() + 1,
        0,
        1
      ).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SEO_CONFIG.siteName,
      },
    },
  };
}

/** Article schema for blog/resource articles */
export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  modifiedDate?: string;
  authorName?: string;
  imageUrl?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      "@type": "Person",
      name: article.authorName || "StarX-Flow Team",
    },
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${SEO_CONFIG.siteUrl}/logo.svg`,
      },
    },
    image: article.imageUrl || SEO_CONFIG.defaultOgImage,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

/** HowTo schema — for the "How It Works" section */
export function howToSchema(steps: Array<{ name: string; text: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Automate Your Business with StarX-Flow",
    description:
      "Set up your AI-powered WhatsApp receptionist and booking automation in minutes.",
    step: steps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
