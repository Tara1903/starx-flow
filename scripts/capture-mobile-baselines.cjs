const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../screenshots/mobile-redesign-baselines');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false },
  { name: 'desktop_1440x900', width: 1440, height: 900, isMobile: false },
  { name: 'laptop_1366x768', width: 1366, height: 768, isMobile: false },
  { name: 'tablet_768x1024', width: 768, height: 1024, isMobile: false },
  { name: 'mobile_430x932', width: 430, height: 932, isMobile: true },
  { name: 'mobile_390x844', width: 390, height: 844, isMobile: true },
  { name: 'mobile_360x800', width: 360, height: 800, isMobile: true },
];

async function capture() {
  console.log('Launching browser to capture Phase 0 baselines...');
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`Capturing ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Viewport screenshot (hero/upper section)
    await page.screenshot({ path: path.join(OUT_DIR, `baseline-${vp.name}-viewport.png`) });

    // Full page screenshot
    await page.screenshot({ path: path.join(OUT_DIR, `baseline-${vp.name}-fullpage.png`), fullPage: true });

    // If standard mobile (390x844), capture top nav & bottom nav close-ups
    if (vp.name === 'mobile_390x844') {
      const topNav = await page.locator('header, nav').first();
      if (await topNav.count() > 0) {
        await topNav.screenshot({ path: path.join(OUT_DIR, 'baseline-mobile-top-nav.png') });
      }
      const bottomNav = await page.locator('#mobile-floating-nav, [data-testid="mobile-bottom-nav"], nav.fixed.bottom-0, nav.fixed.bottom-4, nav.fixed.bottom-6').first();
      if (await bottomNav.count() > 0) {
        await bottomNav.screenshot({ path: path.join(OUT_DIR, 'baseline-mobile-bottom-nav.png') });
      }
    }

    if (vp.name === 'desktop_1440x900') {
      const desktopNav = await page.locator('header, nav').first();
      if (await desktopNav.count() > 0) {
        await desktopNav.screenshot({ path: path.join(OUT_DIR, 'baseline-desktop-nav.png') });
      }
    }

    await context.close();
  }

  // Also capture protected routes: /dashboard and /admin
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskCtx.newPage();

  console.log('Capturing protected routes...');
  try {
    await deskPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await deskPage.waitForTimeout(1000);
    await deskPage.screenshot({ path: path.join(OUT_DIR, 'baseline-route-dashboard.png') });
  } catch (e) {
    console.warn('Dashboard route capture warning:', e.message);
  }

  try {
    await deskPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
    await deskPage.waitForTimeout(1000);
    await deskPage.screenshot({ path: path.join(OUT_DIR, 'baseline-route-admin.png') });
  } catch (e) {
    console.warn('Admin route capture warning:', e.message);
  }

  await browser.close();
  console.log('Finished capturing all Phase 0 baselines!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
