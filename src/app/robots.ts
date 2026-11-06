import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seoConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. Traditional Web Search Crawlers (Googlebot, Bingbot, Applebot, etc.)
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/setup/', '/api/'],
      },
      // 2. Commercial AI Search Retrieval & Answer Engines (Real-time citation indexers)
      {
        userAgent: [
          'OAI-SearchBot',
          'PerplexityBot',
          'Claude-SearchBot',
        ],
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard/', '/admin/', '/setup/', '/api/'],
      },
      // 3. User-Triggered Interactive Fetching (On-demand URL retrieval by end users)
      {
        userAgent: [
          'ChatGPT-User',
        ],
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard/', '/admin/', '/setup/', '/api/'],
      },
      // 4. Foundation Model Training & Data Mining (Authorized for StarX-Flow AI discovery)
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard/', '/admin/', '/setup/', '/api/'],
      },
      // 5. Aggressive Bulk Scrapers & Low-Attribution Harvesters
      {
        userAgent: [
          'Bytespider',
          'CCBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
  };
}
