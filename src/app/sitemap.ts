import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString().split('T')[0];

  const baseRoutes = ['', '/product', '/features', '/pricing', '/about', '/resources', '/demo'].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const trustRoutes = ['/how-it-works', '/security', '/integrations'].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const pillarRoutes = [
    '/ai-automation',
    '/whatsapp-ai-chatbot',
    '/instagram-ai-automation',
    '/ai-customer-support',
    '/ai-agents',
    '/business-workflow-automation',
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const legalRoutes = ['/privacy', '/terms'].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  const industryRoutes = [
    '/industries/gyms-fitness',
    '/industries/beauty-salons',
    '/industries/dental-clinics',
    '/industries/wellness-therapy',
    '/industries/real-estate',
    '/industries/hospitality',
    '/industries/restaurants',
    '/industries/education',
    '/industries/personal-trainer',
    '/industries/barber',
    '/industries/dentist',
    '/industries/med-spa',
    '/industries/plumber',
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const comparisonRoutes = [
    '/compare/starx-flow-vs-manychat',
    '/compare/starx-flow-vs-wati',
    '/compare/starx-flow-vs-respond-io',
    '/compare/starx-flow-vs-mindbody',
    '/compare/starx-flow-vs-vagaro',
    '/compare/starx-flow-vs-calendly',
    '/compare/starx-flow-vs-acuity-scheduling',
    '/compare/starx-flow-vs-phorest',
    '/compare/starx-flow-vs-intercom',
    '/compare/starx-flow-vs-n8n',
    '/compare/starx-flow-vs-zapier',
    '/compare/starx-flow-vs-make',
    '/compare/starx-flow-vs-langflow',
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const scenarioRoutes = [
    '/scenarios/ai-agents',
    '/use-cases/whatsapp-automation',
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const articleRoutes = [
    '/resources/articles/calendar-integration',
    '/resources/articles/clinic-receptionist',
    '/resources/articles/google-reviews-seo',
    '/resources/articles/gym-onboarding',
    '/resources/articles/spa-no-shows',
    '/resources/articles/scaling-failures',
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...baseRoutes,
    ...trustRoutes,
    ...pillarRoutes,
    ...legalRoutes,
    ...industryRoutes,
    ...comparisonRoutes,
    ...scenarioRoutes,
    ...articleRoutes,
  ];
}
