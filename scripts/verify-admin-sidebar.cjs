const { chromium } = require('playwright');
const path = require('path');

async function verifyAdminSidebar() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Set admin authentication in localStorage
  await page.addInitScript(() => {
    localStorage.setItem(
      'starx_admin_auth_v1',
      JSON.stringify({
        role: 'admin',
        email: 'admin@starxflow.com',
        name: 'Platform Admin',
      })
    );
  });

  console.log('Navigating to http://localhost:3009/admin ...');
  await page.goto('http://localhost:3009/admin', { waitUntil: 'networkidle' });
  await page.waitForSelector('aside[aria-label="Admin Navigation"]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const testViewports = [
    { name: '1440x900 (Standard Laptop)', width: 1440, height: 900 },
    { name: '1280x800 (Compact Laptop)', width: 1280, height: 800 },
    { name: '1024x768 (Small Desktop)', width: 1024, height: 768 },
    { name: '1366x680 (Short Screen)', width: 1366, height: 680 },
  ];

  const artifactDir = path.resolve('C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005');

  for (const vp of testViewports) {
    console.log(`\n========================================`);
    console.log(`Testing Admin Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(600);

    // --- TEST EXTENDED VIEW ---
    console.log('--- ADMIN EXTENDED VIEW ---');
    const sidebar = page.locator('aside[aria-label="Admin Navigation"]');
    const sidebarBox = await sidebar.boundingBox();
    console.log(`Admin Sidebar Box: x=${Math.round(sidebarBox.x)}, y=${Math.round(sidebarBox.y)}, w=${Math.round(sidebarBox.width)}, h=${Math.round(sidebarBox.height)}`);
    console.log(`Reaches Bottom of Screen: ${Math.round(sidebarBox.height) === vp.height ? 'PASSED (exact match: ' + vp.height + 'px)' : 'FAILED'}`);

    const scrollMetrics = await page.evaluate(() => {
      const aside = document.querySelector('aside[aria-label="Admin Navigation"]');
      const inner = aside ? aside.firstElementChild : null;
      const nav = aside ? aside.querySelector('nav') : null;

      return {
        asideScrollHeight: aside ? aside.scrollHeight : 0,
        asideClientHeight: aside ? aside.clientHeight : 0,
        innerScrollHeight: inner ? inner.scrollHeight : 0,
        innerClientHeight: inner ? inner.clientHeight : 0,
        navScrollHeight: nav ? nav.scrollHeight : 0,
        navClientHeight: nav ? nav.clientHeight : 0,
        asideOverflow: aside ? window.getComputedStyle(aside).overflow : '',
        innerOverflow: inner ? window.getComputedStyle(inner).overflow : '',
        navOverflow: nav ? window.getComputedStyle(nav).overflow : '',
      };
    });

    console.log(`Scroll Metrics (Extended):`, scrollMetrics);
    const isNonScrollable =
      scrollMetrics.asideScrollHeight <= scrollMetrics.asideClientHeight &&
      scrollMetrics.innerScrollHeight <= scrollMetrics.innerClientHeight &&
      scrollMetrics.navScrollHeight <= scrollMetrics.navClientHeight;
    console.log(`Extended View Non-Scrollable Check: ${isNonScrollable ? 'PASSED' : 'FAILED'}`);

    if (vp.width === 1440) {
      const extPic = path.join(artifactDir, 'admin-sidebar-extended-bottom-docked.png');
      await page.screenshot({ path: extPic, fullPage: false });
      console.log(`Saved screenshot to: ${extPic}`);
    }

    // --- TEST COLLAPSED VIEW ---
    console.log('\n--- ADMIN COLLAPSED VIEW ---');
    const collapseBtn = page.locator('button[aria-label="Collapse admin sidebar"]');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(600);
    }

    const collapsedBox = await sidebar.boundingBox();
    console.log(`Collapsed Sidebar Box: x=${Math.round(collapsedBox.x)}, y=${Math.round(collapsedBox.y)}, w=${Math.round(collapsedBox.width)}, h=${Math.round(collapsedBox.height)}`);
    console.log(`Collapsed Reaches Bottom: ${Math.round(collapsedBox.height) === vp.height ? 'PASSED' : 'FAILED'}`);

    const collapsedMetrics = await page.evaluate(() => {
      const aside = document.querySelector('aside[aria-label="Admin Navigation"]');
      const inner = aside ? aside.firstElementChild : null;
      const nav = aside ? aside.querySelector('nav') : null;

      return {
        asideScrollHeight: aside ? aside.scrollHeight : 0,
        asideClientHeight: aside ? aside.clientHeight : 0,
        innerScrollHeight: inner ? inner.scrollHeight : 0,
        innerClientHeight: inner ? inner.clientHeight : 0,
        navScrollHeight: nav ? nav.scrollHeight : 0,
        navClientHeight: nav ? nav.clientHeight : 0,
      };
    });

    console.log(`Scroll Metrics (Collapsed):`, collapsedMetrics);
    const isCollapsedNonScrollable =
      collapsedMetrics.asideScrollHeight <= collapsedMetrics.asideClientHeight &&
      collapsedMetrics.innerScrollHeight <= collapsedMetrics.innerClientHeight &&
      collapsedMetrics.navScrollHeight <= collapsedMetrics.navClientHeight;
    console.log(`Collapsed View Non-Scrollable Check: ${isCollapsedNonScrollable ? 'PASSED' : 'FAILED'}`);

    if (vp.width === 1440) {
      const colPic = path.join(artifactDir, 'admin-sidebar-collapsed-bottom-docked.png');
      await page.screenshot({ path: colPic, fullPage: false });
      console.log(`Saved screenshot to: ${colPic}`);
    }

    // Re-expand for next iteration
    const expandBtn = page.locator('button[aria-label="Expand admin sidebar"]');
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(600);
    }
  }

  await browser.close();
  console.log('\nAll admin sidebar checks completed successfully!');
}

verifyAdminSidebar().catch((err) => {
  console.error('Error verifying admin sidebar:', err);
  process.exit(1);
});
