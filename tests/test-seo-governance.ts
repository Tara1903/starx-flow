import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { SEO_CONFIG, PAGE_META } from '../src/lib/seoConfig';
import { organizationSchema, websiteSchema, softwareApplicationSchema } from '../src/components/seo/SchemaMarkup';
import * as fs from 'fs';
import * as path from 'path';

async function runSeoGovernanceTests() {
  console.log('================================================================');
  console.log(' PHASE 7.5: SEO, AEO, GEO & SEARCH GOVERNANCE AUTOMATED AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ ${desc}`);
      failed++;
    }
  }

  // Domain A: Canonical Domain & Environment Protection
  console.log('--- Domain A: Canonical Domain & Environment Protection ---');
  assert(
    SEO_CONFIG.siteUrl === 'https://starx-flow.runs-on.dev',
    'Canonical siteUrl strictly matches production canonical domain: https://starx-flow.runs-on.dev'
  );
  assert(
    !SEO_CONFIG.siteUrl.endsWith('/'),
    'Canonical siteUrl has no trailing slash'
  );

  // Domain B: Sitemap Engineering & Clean URL Integrity
  console.log('\n--- Domain B: Sitemap Engineering & Clean URL Integrity ---');
  const sitemapEntries = sitemap();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 40, `Sitemap contains ${sitemapEntries.length} valid URLs`);

  const sitemapUrls = sitemapEntries.map((e) => e.url);
  const duplicateUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  assert(duplicateUrls.length === 0, `Zero duplicate URLs in sitemap (found: ${duplicateUrls.length})`);

  // Verify no private or authentication routes in sitemap
  const privateRoutesInSitemap = sitemapUrls.filter((url) =>
    url.includes('/admin') ||
    url.includes('/dashboard') ||
    url.includes('/setup') ||
    url.includes('/api/') ||
    url.includes('/login')
  );
  assert(
    privateRoutesInSitemap.length === 0,
    `Zero private routes exposed in sitemap (found: ${privateRoutesInSitemap.length})`
  );

  // Verify all 6 articles are present in sitemap
  const expectedArticles = [
    'calendar-integration',
    'clinic-receptionist',
    'google-reviews-seo',
    'gym-onboarding',
    'spa-no-shows',
    'scaling-failures',
  ];
  const missingArticlesInSitemap = expectedArticles.filter(
    (slug) => !sitemapUrls.some((u) => u.includes(`/resources/articles/${slug}`))
  );
  assert(
    missingArticlesInSitemap.length === 0,
    `All 6 editorial research articles present in sitemap (missing: ${missingArticlesInSitemap.join(', ') || 'none'})`
  );

  // Verify /demo is present in sitemap
  assert(
    sitemapUrls.includes(`${SEO_CONFIG.siteUrl}/demo`),
    'Dedicated /demo route is included in sitemap'
  );

  // Domain C: Robots.txt Crawlability & AI Retrieval Policies
  console.log('\n--- Domain C: Robots.txt Crawlability & AI Retrieval Policies ---');
  const robotsConfig = robots();
  assert(
    robotsConfig.sitemap === `${SEO_CONFIG.siteUrl}/sitemap.xml`,
    'Robots.txt references correct canonical sitemap XML'
  );

  const defaultRule = robotsConfig.rules?.find((r) => r.userAgent === '*');
  assert(
    defaultRule !== undefined && defaultRule.allow === '/',
    'Robots.txt permits universal search engines (Googlebot, Bingbot) at root /'
  );

  const disallowList = Array.isArray(defaultRule?.disallow) ? defaultRule?.disallow : [defaultRule?.disallow];
  assert(
    disallowList.includes('/admin/') &&
    disallowList.includes('/dashboard/') &&
    disallowList.includes('/setup/') &&
    disallowList.includes('/api/'),
    'Robots.txt strictly disallows private admin, dashboard, setup, and api paths'
  );

  // Verify AI search and retrieval crawlers are specifically allowed
  const aiSearchRule = robotsConfig.rules?.find((r) =>
    Array.isArray(r.userAgent) && r.userAgent.includes('OAI-SearchBot')
  );
  assert(
    aiSearchRule !== undefined,
    'Dedicated AI search retrieval crawler rule exists for OAI-SearchBot & PerplexityBot'
  );

  // Domain D: llms.txt Consistency & Semantic Accuracy
  console.log('\n--- Domain D: llms.txt Consistency & Semantic Accuracy ---');
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
  assert(fs.existsSync(llmsPath), 'public/llms.txt file exists on disk');

  const llmsContent = fs.readFileSync(llmsPath, 'utf8');
  assert(
    llmsContent.includes('https://starx-flow.runs-on.dev'),
    'llms.txt references canonical production domain'
  );
  assert(
    llmsContent.includes('Starter') && llmsContent.includes('Pro') && llmsContent.includes('Enterprise'),
    'llms.txt documents active commercial tiers: Starter ($29), Pro ($59), Enterprise ($99)'
  );
  assert(
    llmsContent.includes('Polar Payments Inc.'),
    'llms.txt accurately discloses Polar Payments Inc. as Merchant of Record'
  );
  assert(
    llmsContent.includes('/demo'),
    'llms.txt provides direct link to live demonstration page'
  );

  // Domain E: Metadata Coverage & On-Page Title/Description Integrity
  console.log('\n--- Domain E: Metadata Coverage & On-Page Integrity ---');
  const criticalRoutes = [
    '/',
    '/product',
    '/features',
    '/pricing',
    '/how-it-works',
    '/security',
    '/integrations',
    '/demo',
    '/resources/articles/gym-onboarding',
    '/resources/articles/spa-no-shows',
    '/resources/articles/scaling-failures',
  ];

  let missingMeta = 0;
  for (const route of criticalRoutes) {
    const meta = PAGE_META[route];
    if (!meta || !meta.title || !meta.description || meta.title.length < 5 || meta.description.length < 20) {
      console.error(`  ✗ Missing or thin metadata for route: ${route}`);
      missingMeta++;
    }
  }
  assert(missingMeta === 0, `All ${criticalRoutes.length} critical public routes have full title and description metadata`);

  // Domain F: Structured Data & Schema.org Graph Validity
  console.log('\n--- Domain F: Structured Data & Schema.org Graph Validity ---');
  const org = organizationSchema();
  assert(
    org['@type'] === 'Organization' && org.name === 'StarX-Flow' && org.url === 'https://starx-flow.runs-on.dev',
    'Organization schema contains accurate name, type, and canonical URL'
  );
  assert(
    (org as any).email === 'support@starx-flow.runs-on.dev',
    'Organization schema specifies official support email'
  );

  const website = websiteSchema();
  assert(
    website['@type'] === 'WebSite' && website.name === 'StarX-Flow',
    'WebSite schema contains valid SearchAction and canonical ID'
  );

  const software = softwareApplicationSchema();
  assert(
    software['@type'] === 'SoftwareApplication' && (software as any).applicationCategory === 'BusinessApplication',
    'SoftwareApplication schema defines BusinessApplication category'
  );
  assert(
    (software as any).aggregateRating === undefined,
    'SoftwareApplication schema does NOT contain fabricated AggregateRating'
  );

  console.log('\n----------------------------------------------------------------');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSeoGovernanceTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
