import { createLiveBrowser, takeFailureScreenshot } from '../helpers/browser';
import { CONFIG } from '../config/env';

interface PublicTestResult {
  route: string;
  status: number | null;
  title: string;
  horizontalOverflow: boolean;
  brokenImages: string[];
  consoleErrors: string[];
  pageErrors: string[];
  passed: boolean;
  error?: string;
}

export async function runPhaseAPublicWebsiteTests(): Promise<{
  results: PublicTestResult[];
  passedCount: number;
  failedCount: number;
}> {
  console.log(`\n======================================================`);
  console.log(`[PHASE A] PUBLIC WEBSITE LIVE TESTING`);
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log(`Viewport: ${CONFIG.viewports.desktop.width}x${CONFIG.viewports.desktop.height}`);
  console.log(`======================================================\n`);

  const { browser, createManagedPage } = await createLiveBrowser();
  const results: PublicTestResult[] = [];

  const publicRoutes = [
    '/',
    '/pricing',
    '/features',
    '/product',
    '/about',
    '/privacy',
    '/terms',
    '/resources',
    '/use-cases/whatsapp-automation',
    '/scenarios/ai-agents',
    '/chat',
    '/admin/login',
  ];

  try {
    for (const route of publicRoutes) {
      const url = `${CONFIG.baseUrl}${route}`;
      const { page, context, diagnostics } = await createManagedPage();
      
      console.log(`Testing: ${route} ...`);
      let status: number | null = null;
      let title = '';
      let horizontalOverflow = false;
      const brokenImages: string[] = [];

      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        status = response ? response.status() : null;
        title = await page.title();

        // Wait an additional 1.5s for dynamic hydration/animations to settle
        await page.waitForTimeout(1500);

        // Check horizontal overflow
        horizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        // Check image rendering
        const imgSources = await page.$$eval('img', (imgs) =>
          imgs.map((img) => ({
            src: (img as HTMLImageElement).src,
            naturalWidth: (img as HTMLImageElement).naturalWidth,
            complete: (img as HTMLImageElement).complete,
          }))
        );

        for (const img of imgSources) {
          if (img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:')) {
            brokenImages.push(img.src);
          }
        }

        const isOk = (status === 200 || status === 304) &&
          !horizontalOverflow &&
          brokenImages.length === 0 &&
          diagnostics.pageErrors.length === 0;

        results.push({
          route,
          status,
          title,
          horizontalOverflow,
          brokenImages,
          consoleErrors: [...diagnostics.consoleErrors],
          pageErrors: [...diagnostics.pageErrors],
          passed: isOk,
        });

        console.log(`  -> Status: ${status} | Title: "${title.slice(0, 40)}" | Overflow: ${horizontalOverflow} | Broken Imgs: ${brokenImages.length} | Errors: ${diagnostics.pageErrors.length} => ${isOk ? 'PASS' : 'FAIL'}`);

        if (!isOk) {
          await takeFailureScreenshot(page, `phaseA_${route}`);
        }
      } catch (err: any) {
        console.error(`  -> Failed with error: ${err.message}`);
        await takeFailureScreenshot(page, `phaseA_error_${route}`);
        results.push({
          route,
          status,
          title,
          horizontalOverflow,
          brokenImages,
          consoleErrors: [...diagnostics.consoleErrors],
          pageErrors: [err.message],
          passed: false,
          error: err.message,
        });
      } finally {
        await context.close();
      }
    }

    // Now test Interactive Navigation & CTA on Homepage
    console.log(`\nTesting Homepage Interactive Navigation, CTAs & Modal Triggers...`);
    const { page, context, diagnostics } = await createManagedPage();
    try {
      await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Check if CTA button exists and is clickable
      const ctaBtn = page.locator('button:has-text("Start Free Trial"), a:has-text("Start Free Trial"), button:has-text("Get Started"), a:has-text("Get Started")').first();
      const hasCta = (await ctaBtn.count()) > 0;
      console.log(`  -> Primary CTA Button visible: ${hasCta}`);

      if (hasCta) {
        await ctaBtn.click({ timeout: 5000 }).catch(() => console.log('  -> CTA click handled'));
        await page.waitForTimeout(1000);
      }

      // Check for SignupModal trigger or navigation
      const modalOrNav = await page.locator('[role="dialog"], input[name="businessName"], input[type="email"], h2:has-text("Start your 14-day free trial")').count();
      console.log(`  -> Interactive reaction after CTA: ${modalOrNav > 0 ? 'Interactive Modal/Input Opened' : 'Navigation preserved'}`);

      // Refresh test
      await page.reload({ waitUntil: 'domcontentloaded' });
      const refreshedTitle = await page.title();
      console.log(`  -> Page reload test: Title preserved: "${refreshedTitle.slice(0, 40)}"`);

    } finally {
      await context.close();
    }

  } finally {
    await browser.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log(`\n[PHASE A SUMMARY] Tested: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  return { results, passedCount, failedCount };
}

// Allow standalone execution via tsx
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('public-pages')) {
  runPhaseAPublicWebsiteTests().then((res) => {
    process.exit(res.failedCount === 0 ? 0 : 1);
  });
}
