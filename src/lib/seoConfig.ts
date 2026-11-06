/**
 * Centralized SEO Configuration for StarX-Flow
 * All metadata, site constants, and helper functions for SEO live here.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://starx-flow.runs-on.dev";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const SEO_CONFIG = {
  siteName: "StarX-Flow",
  siteUrl,
  defaultTitle: "StarX-Flow | AI Receptionist for WhatsApp",
  defaultDescription:
    "The easiest way to turn your WhatsApp into a 24/7 booking engine. Never miss a booking again with the autonomous front desk for local service businesses.",
  defaultOgImage: `${siteUrl}/og-image.png`,
  twitterHandle: "@starxflow",
  locale: "en_US",
  themeColor: "#10b981",
} as const;

export interface PageMeta {
  title: string;
  description: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Per-route metadata map.
 * Every public route must have a unique title and description.
 */
export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "StarX-Flow | AI Receptionist for WhatsApp",
    description:
      "Never miss a booking again. StarX-Flow chats with clients on WhatsApp, answers FAQs, and syncs directly with your calendar in under 2 seconds.",
  },
  "/product": {
    title: "Product",
    description:
      "Discover the AI-powered operating system that automates booking, WhatsApp customer care, calendar sync, and client management for local service businesses.",
  },
  "/features": {
    title: "Features",
    description:
      "24/7 WhatsApp AI assistant, multi-calendar sync, CRM, Google Review Booster, intake forms, HIPAA-compliant security, and multi-staff rostering — all included.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Simple flat-rate plans with zero booking commissions. Start with a 14-day free trial. Plans from $29/mo for solo practitioners to $99/mo for multi-location businesses.",
    ogType: "product",
  },
  "/resources": {
    title: "Resources",
    description:
      "Guides, playbooks, templates, and articles to help you automate your local service business with AI-powered WhatsApp booking and scheduling.",
  },
  "/about": {
    title: "About",
    description:
      "Built by local service business owners who faced the same challenges you do. Learn how StarX-Flow was born from the need to automate front-desk operations.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "StarX-Flow privacy policy. Learn how we collect, use, protect, and handle your personal data and business information.",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "StarX-Flow terms of service. Read the legal agreement governing your use of the StarX-Flow platform and services.",
  },
};

/**
 * Generate a canonical URL from a pathname.
 * - Strips query parameters
 * - Removes trailing slashes (except root)
 * - Prepends site URL
 */
export function getCanonicalUrl(pathname: string): string {
  // Remove query string and hash
  let clean = pathname.split("?")[0].split("#")[0];
  // Remove trailing slash (except for root "/")
  if (clean.length > 1 && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }
  return `${SEO_CONFIG.siteUrl}${clean}`;
}

/**
 * Get metadata for a given pathname.
 * Falls back to default metadata for unknown routes.
 */
export function getPageMeta(pathname: string): PageMeta {
  // Exact match first
  if (PAGE_META[pathname]) {
    return PAGE_META[pathname];
  }

  // Dynamic route matching
  if (pathname.startsWith("/resources/articles/")) {
    return {
      title: "Article",
      description: "Read this guide on StarX-Flow — the AI automation platform for local service businesses.",
      ogType: "article",
    };
  }

  if (pathname.startsWith("/resources/")) {
    return {
      title: "Presentation",
      description: "View this StarX-Flow resource presentation on AI-powered business automation.",
    };
  }

  if (pathname.startsWith("/compare/")) {
    const slug = pathname.replace("/compare/", "").replace(/^starx-flow-vs-/i, "");
    const formatted = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `StarX-Flow vs ${formatted}`,
      description: `Compare StarX-Flow with ${formatted}. See how StarX-Flow stacks up in features, pricing, and automation capabilities.`,
    };
  }

  if (pathname.startsWith("/industries/")) {
    const slug = pathname.replace("/industries/", "");
    const formatted = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `AI Receptionist for ${formatted}s`,
      description: `Automate your ${formatted} bookings and client intake 24/7 on WhatsApp with StarX-Flow.`,
    };
  }

  // Noindex for private routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/admin")
  ) {
    return {
      title: "Dashboard",
      description: "StarX-Flow dashboard",
      noindex: true,
    };
  }

  // Fallback
  return {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  };
}

/**
 * Generate breadcrumb items from a pathname.
 */
export function getBreadcrumbs(pathname: string): Array<{ name: string; url: string }> {
  const crumbs: Array<{ name: string; url: string }> = [
    { name: "Home", url: SEO_CONFIG.siteUrl },
  ];

  if (pathname === "/") return crumbs;

  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  const labelMap: Record<string, string> = {
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    resources: "Resources",
    about: "About",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    compare: "Comparisons",
    articles: "Articles",
  };

  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push({
      name: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      url: `${SEO_CONFIG.siteUrl}${currentPath}`,
    });
  }

  return crumbs;
}

