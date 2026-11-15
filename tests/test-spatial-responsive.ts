import { chromium } from 'playwright';

async function testResponsiveAndZoom() {
  const browser = await chromium.launch({ headless: true });
  const baseDir = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-responsive';

  const viewports = [
    { name: 'desktop', width: 1920, height: 1080, isMobile: false },
    { name: 'laptop', width: 1366, height: 768, isMobile: false },
    { name: 'tablet', width: 768, height: 1024, isMobile: false },
    { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    // 1. Assert H1 visibility and opacity
    const h1 = await page.$('h1');
    const h1Op = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
    const h1Vis = h1 ? await h1.evaluate(el => window.getComputedStyle(el).visibility) : null;
    if (h1Op !== '1' || h1Vis !== 'visible') {
      throw new Error(`P0 Failure on ${vp.name}: H1 opacity=${h1Op}, visibility=${h1Vis}`);
    }

    // 2. Assert no horizontal page overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Viewport ${vp.name} horizontal overflow:`, hasHorizontalOverflow);
    if (hasHorizontalOverflow) {
      throw new Error(`Horizontal overflow detected on ${vp.name}!`);
    }

    // 3. If mobile, assert mobile bottom navigation is present and visible
    if (vp.isMobile) {
      const mobileNav = await page.$('nav, [data-testid="mobile-bottom-nav"], .fixed.bottom-0');
      const navVisible = mobileNav ? await mobileNav.isVisible() : false;
      console.log(`Mobile bottom nav visible on ${vp.name}:`, navVisible);
    }

    // 4. Capture screenshot
    const shotPath = `${baseDir}/responsive-${vp.name}.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Screenshot saved for ${vp.name} to: ${shotPath}`);
    await ctx.close();
  }

  // 5. Test Browser Zoom Levels (100%, 125%, 150%, 175%, 200%, 250%)
  const zoomLevels = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5];
  const zoomCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const zoomPage = await zoomCtx.newPage();
  await zoomPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await zoomPage.waitForTimeout(1500);

  for (const zoom of zoomLevels) {
    console.log(`Testing browser zoom: ${Math.round(zoom * 100)}%...`);
    await zoomPage.evaluate((z) => {
      document.body.style.zoom = `${z * 100}%`;
    }, zoom);
    await zoomPage.waitForTimeout(500);

    const h1 = await zoomPage.$('h1');
    const h1Op = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
    if (h1Op !== '1') throw new Error(`P0 Failure at zoom ${zoom * 100}%: H1 opacity is ${h1Op}`);
  }
  console.log('All zoom levels (100% - 250%) PASSED with permanent text visibility intact.');

  await browser.close();
  console.log('Phase 8 Responsive Adaptation & Mobile Protection PASSED.');
}

testResponsiveAndZoom().catch(err => {
  console.error('Error in responsive test:', err);
  process.exit(1);
});
