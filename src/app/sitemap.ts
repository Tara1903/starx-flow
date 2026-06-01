import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes = ['', '/product', '/features', '/pricing', '/about', '/resources'].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const clusterRoutes = [
    '/compare/starx-flow-vs-zapier',
    '/compare/starx-flow-vs-make',
    '/compare/starx-flow-vs-n8n',
    '/compare/starx-flow-vs-langflow',
    '/compare/starx-flow-vs-mindbody',
    '/compare/starx-flow-vs-vagaro',
    '/compare/starx-flow-vs-calendly',
    '/scenarios/ai-agents',
    '/use-cases/whatsapp-automation',
    '/industries/plumber',
    '/industries/barber',
    '/industries/dentist',
    '/industries/med-spa',
    '/industries/personal-trainer'
  ].map((route) => ({
    url: `${SEO_CONFIG.siteUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...baseRoutes, ...clusterRoutes];
}

