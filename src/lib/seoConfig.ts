/**
 * Centralized SEO Configuration for StarX-Flow
 * All metadata, site constants, and helper functions for SEO live here.
 */

const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
// In SEO contexts, canonical tags, sitemaps, and robots directives must never point to localhost
const rawSiteUrl =
  envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")
    ? envUrl
    : "https://starx-flow.runs-on.dev";
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
      "Never miss a booking again. StarX-Flow chats with clients on WhatsApp, answers FAQs, and syncs directly with your calendar in real time.",
  },
  "/product": {
    title: "Product",
    description:
      "Discover the AI-powered operating system that automates booking, WhatsApp customer care, calendar sync, and client management for local service businesses.",
  },
  "/features": {
    title: "Features",
    description:
      "24/7 WhatsApp AI assistant, multi-calendar sync, CRM, Google Review Booster, intake forms, strict tenant data isolation, and multi-staff rostering — all included.",
  },
  "/security": {
    title: "Security & Privacy Architecture",
    description:
      "Learn how StarX-Flow secures merchant and customer data with Supabase Row Level Security, TLS 1.3 encryption, database concurrency locks, and GDPR controls.",
  },
  "/integrations": {
    title: "Verified Integrations Directory",
    description:
      "Explore StarX-Flow integrations with Google Calendar, Microsoft Outlook, Meta WhatsApp Cloud API, Instagram Graph API, and Polar Payments (Merchant of Record).",
  },
  "/how-it-works": {
    title: "How It Works | Technical Architecture & Workflow",
    description:
      "Understand StarX-Flow's end-to-end booking architecture: multi-channel webhook ingestion, RAG knowledge retrieval, and real-time calendar locking.",
  },
  "/resources/articles/calendar-integration": {
    title: "Why Polling APIs Cause Double-Bookings | Calendar Architecture",
    description:
      "Technical deep dive on why polling interval APIs fail and how real-time webhook synchronization and database exclusion constraints prevent scheduling conflicts.",
    ogType: "article",
  },
  "/resources/articles/clinic-receptionist": {
    title: "Deploying AI Receptionists in Medical Practices | Clinical Guide",
    description:
      "How dental and wellness clinics safely deploy AI receptionists with administrative guardrails, symptom escalation protocols, and patient privacy boundaries.",
    ogType: "article",
  },
  "/resources/articles/google-reviews-seo": {
    title: "The Local SEO Review Engine | Automated WhatsApp Follow-Ups",
    description:
      "How local service businesses scale Google Map Pack prominence using automated post-appointment review requests during the golden two-hour window.",
    ogType: "article",
  },
  "/resources/articles/gym-onboarding": {
    title: "How Gyms Can Automate Member Onboarding & Retention",
    description:
      "Boutique gyms and wellness studios lose up to 40% of trial members in their first 30 days. Learn how automated WhatsApp check-ins and onboarding workflows double member retention.",
    ogType: "article",
  },
  "/resources/articles/spa-no-shows": {
    title: "Reducing Spa & Salon No-Shows via WhatsApp Chatbots",
    description:
      "For high-end spas and salons, empty treatment slots destroy unit margins. Discover how interactive WhatsApp confirmation prompts, prep waivers, and deposit reminders slash no-show rates below 3%.",
    ogType: "article",
  },
  "/resources/articles/scaling-failures": {
    title: "Why Local Service Businesses Fail to Scale (And How to Fix It)",
    description:
      "Boutique service businesses hit operational ceilings when founders spend hours manually answering repetitive inquiries. Learn how AI front-desk triage unblocks scalable multi-location growth.",
    ogType: "article",
  },
  "/demo": {
    title: "Book an Interactive Product Demonstration | StarX-Flow",
    description:
      "See how StarX-Flow automates customer inquiries, appointment bookings, and calendar synchronization 24/7. Request a live tailored walkthrough for your salon or clinic.",
    ogType: "website",
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
  "/ai-automation": {
    title: "AI Automation for Business | Autonomous Workflows",
    description:
      "Deploy AI business automation in minutes. StarX-Flow unifies 24/7 conversational AI, WhatsApp booking, Google Calendar sync, and operational workflows.",
  },
  "/whatsapp-ai-chatbot": {
    title: "WhatsApp AI Chatbot & Booking Assistant",
    description:
      "Turn your WhatsApp into an autonomous 24/7 front desk. Answer customer questions, check Google Calendar availability, and book appointments automatically.",
  },
  "/instagram-ai-automation": {
    title: "Instagram DM AI Automation & Chatbot",
    description:
      "Automate Instagram Direct Messages with conversational AI. StarX-Flow qualifies inbound leads, answers product questions, and schedules appointments directly in DMs.",
  },
  "/ai-customer-support": {
    title: "AI Customer Support Software & Chatbots",
    description:
      "Deliver instant 24/7 customer support across WhatsApp, Instagram, and Web. StarX-Flow resolves routine inquiries automatically with RAG knowledge retrieval.",
  },
  "/ai-agents": {
    title: "AI Agents for Business Automation | Autonomous Workforce",
    description:
      "Deploy autonomous AI agents that perform real business actions: scheduling appointments, updating CRM records, and orchestrating operational workflows.",
  },
  "/business-workflow-automation": {
    title: "Business Workflow Automation Platform",
    description:
      "Streamline operations with event-driven business workflow automation. Connect customer communications, calendar schedules, CRM records, and tasks in one dashboard.",
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

