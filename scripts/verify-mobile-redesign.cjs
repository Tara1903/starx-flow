const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../screenshots/mobile-redesign-results');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'small_mobile_360x800', width: 360, height: 800, isMobile: true },
  { name: 'standard_mobile_390x844', width: 390, height: 844, isMobile: true },
  { name: 'large_mobile_430x932', width: 430, height: 932, isMobile: true },
  { name: 'tablet_768x1024', width: 768, height: 1024, isMobile: false },
  { name: 'laptop_1366x768', width: 1366, height: 768, isMobile: false },
  { name: 'desktop_1440x900', width: 1440, height: 900, isMobile: false },
  { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false },
];

async function run() {
  console.log(`\n======================================================`);
  console.log(`STARX FLOW — MOBILE REDESIGN VERIFICATION SUITE`);
  console.log(`Testing: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const vp of VIEWPORTS) {
    console.log(`Checking ${vp.name} (${vp.width}x${vp.height})...`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 1. Check Horizontal Overflow
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return docW > winW + 1;
    });

    // 2. Check Hero Visibility
    const heroH1 = page.locator("h1:visible").first();
    const heroVisible = await heroH1.isVisible();
    const h1Box = heroVisible ? await heroH1.boundingBox() : null;

    // 3. Check Top Navbar Bounding Box vs Hero Bounding Box (Overlap check)
    const topNav = await page.locator('header, nav').first();
    const topNavBox = await topNav.boundingBox();
    const hasNavOverlap = (topNavBox && h1Box) ? (topNavBox.y + topNavBox.height > h1Box.y) : false;

    // 4. Viewport screenshot (hero view)
    const vpShot = path.join(OUT_DIR, `verify-${vp.name}-viewport.png`);
    await page.screenshot({ path: vpShot });

    // 5. Full-page screenshot
    const fullShot = path.join(OUT_DIR, `verify-${vp.name}-fullpage.png`);
    await page.screenshot({ path: fullShot, fullPage: true });

    // 6. Test Mobile-specific interactive elements if mobile
    let interactiveResult = true;
    if (vp.isMobile) {
      // Test slot click on mobile stage
      const slot2pm = page.locator(".starx-mobile-stage button:has-text('Tue, 2:00 PM')").first();
      if (await slot2pm.count() > 0) {
        await slot2pm.click();
        await page.waitForTimeout(300);
      }
      // Test tab switch on mobile stage
      const tabScheduling = page.locator(".starx-mobile-stage button:has-text('Scheduling')").first();
      if (await tabScheduling.count() > 0) {
        await tabScheduling.click();
        await page.waitForTimeout(300);
      }
      // Capture interactive state
      await page.screenshot({ path: path.join(OUT_DIR, `verify-${vp.name}-interactive.png`) });
    }

    report.push({
      viewport: vp.name,
      width: vp.width,
      height: vp.height,
      overflow: overflow ? 'FAIL (HAS OVERFLOW)' : 'PASS (NO OVERFLOW)',
      heroVisible: heroVisible ? 'PASS' : 'FAIL',
      navOverlap: hasNavOverlap ? 'FAIL (NAV OVERLAPS H1)' : 'PASS (CLEAN CLEARANCE)',
      h1Y: h1Box ? Math.round(h1Box.y) : 'N/A',
      navBottom: topNavBox ? Math.round(topNavBox.y + topNavBox.height) : 'N/A',
    });

    await ctx.close();
  }

  // Also verify protected desktop routes are untouched
  console.log('\nChecking protected routes (/dashboard and /admin)...');
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskCtx.newPage();

  await deskPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.screenshot({ path: path.join(OUT_DIR, 'verify-route-dashboard.png') });

  await deskPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
  await deskPage.screenshot({ path: path.join(OUT_DIR, 'verify-route-admin.png') });

  await browser.close();

  console.log('\n======================================================');
  console.log('VERIFICATION RESULTS TABLE:');
  console.table(report);
  console.log('======================================================\n');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
