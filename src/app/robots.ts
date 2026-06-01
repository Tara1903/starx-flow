import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/setup/'],
    },
    sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
  };
}
