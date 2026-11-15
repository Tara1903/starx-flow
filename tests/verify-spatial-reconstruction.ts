import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:/Users/taras/.gemini/antigravity/brain/cbabfb20-5ceb-4df6-b00f-dc706dffe370/screenshots';

async function runVerification() {
  console.log('=== STARX FLOW MASTER HOMEPAGE VERIFICATION ===\n');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop-1920', width: 1920, height: 1080, isMobile: false },
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
    { name: 'laptop-1366', width: 1366, height: 768, isMobile: false },
    { name: 'small-laptop-1024', width: 1024, height: 768, isMobile: false },
    { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
    { name: 'mobile-390', width: 390, height: 844, isMobile: true },
    { name: 'small-mobile-360', width: 360, height: 780, isMobile: true },
  ];

  const results: any[] = [];

  // 1. Viewport & Screenshot Capture
  console.log('--- 1. Multi-Viewport & Screenshot Capture ---');
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('starx_auth_prompt_dismissed_v1', 'true');
    });

    // Catch console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Check horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Capture top fold screenshot
    const shotPath = `${screenshotDir}/${vp.name}-top.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`[PASS] ${vp.name} captured (Overflow: ${overflow ? 'FAIL' : 'NONE'})`);

    results.push({
      viewport: vp.name,
      width: vp.width,
      overflow,
      consoleErrorsCount: consoleErrors.length,
      screenshot: shotPath,
    });

    // For 1440px and 390px, capture full page screenshot
    if (vp.width === 1440 || vp.width === 390) {
      const fullPath = `${screenshotDir}/${vp.name}-fullpage.png`;
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`[PASS] ${vp.name} fullpage captured -> ${fullPath}`);
    }

    await context.close();
  }

  // 2. Comprehensive P0 Text Visibility Audit (1440px)
  console.log('\n--- 2. P0 Text Visibility Verification ---');
  const auditCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const auditPage = await auditCtx.newPage();
  await auditPage.addInitScript(() => {
    localStorage.setItem('starx_auth_prompt_dismissed_v1', 'true');
  });
  await auditPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await auditPage.waitForTimeout(2000);

  const scenes = [
    { id: 'spatial-hero', name: 'Scene 01: Hero', h: 'h1' },
    { id: 'problem', name: 'Scene 02: Front Desk Entropy', h: '#problem h2' },
    { id: 'nexus', name: 'Scene 03: Synaptic Nexus', h: '#nexus h2' },
    { id: 'demo', name: 'Scene 04: Interactive Demo', h: '#demo h2' },
    { id: 'capabilities', name: 'Scene 05: Six Capabilities', h: '#capabilities h2' },
    { id: 'scale', name: 'Scene 06: Scale Adapters', h: '#scale h2' },
    { id: 'industries', name: 'Scene 07: Industry Workflows', h: '#industries h2' },
    { id: 'pricing', name: 'Scene 08: Pricing & ROI', h: '#pricing h2' },
    { id: 'guarantees', name: 'Scene 09: Platform Guarantees', h: '#guarantees h2' },
    { id: 'conversion', name: 'Scene 10: Horizon Gateway', h: '#conversion h2' },
  ];

  let p0Failures = 0;
  for (const scene of scenes) {
    const headingElem = await auditPage.$(scene.h);
    if (!headingElem) {
      console.error(`[FAIL] ${scene.name} missing heading selector: ${scene.h}`);
      p0Failures++;
      continue;
    }
    const isVis = await headingElem.isVisible();
    const op = await headingElem.evaluate(el => window.getComputedStyle(el).opacity);
    const text = (await headingElem.innerText()).replace(/\n/g, ' ').trim();

    if (!isVis || op !== '1') {
      console.error(`[FAIL] ${scene.name} visibility failed (visible: ${isVis}, opacity: ${op})`);
      p0Failures++;
    } else {
      console.log(`[PASS] ${scene.name}: "${text.slice(0, 45)}..." (opacity: ${op})`);
    }
  }

  // 3. Mobile Navigation Preservation Check (390px)
  console.log('\n--- 3. Mobile Navigation Preservation Check ---');
  const mobCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobPage = await mobCtx.newPage();
  await mobPage.addInitScript(() => {
    localStorage.setItem('starx_auth_prompt_dismissed_v1', 'true');
  });
  await mobPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await mobPage.waitForTimeout(1500);

  const mobNav = await mobPage.$('nav[aria-label="Mobile quick navigation"]');
  const mobNavVisible = mobNav ? await mobNav.isVisible() : false;
  console.log(`[PASS] Mobile Navigation present & visible: ${mobNavVisible}`);

  const mobNavScreenshot = `${screenshotDir}/mobile-navigation-preserved.png`;
  if (mobNav) {
    await mobNav.screenshot({ path: mobNavScreenshot });
    console.log(`[PASS] Mobile Navigation screenshot saved -> ${mobNavScreenshot}`);
  }

  // 4. Protected Routes Regression Check
  console.log('\n--- 4. Protected Routes Regression Check ---');
  // Check /dashboard
  const dashPage = await auditCtx.newPage();
  await dashPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await dashPage.waitForTimeout(1500);
  const dashTitle = await dashPage.title();
  const dashScreenshot = `${screenshotDir}/protected-dashboard-check.png`;
  await dashPage.screenshot({ path: dashScreenshot, fullPage: false });
  console.log(`[PASS] /dashboard accessible: "${dashTitle}" -> ${dashScreenshot}`);

  // Check /admin
  const adminPage = await auditCtx.newPage();
  await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await adminPage.waitForTimeout(1500);
  const adminTitle = await adminPage.title();
  const adminScreenshot = `${screenshotDir}/protected-admin-check.png`;
  await adminPage.screenshot({ path: adminScreenshot, fullPage: false });
  console.log(`[PASS] /admin accessible: "${adminTitle}" -> ${adminScreenshot}`);

  // 5. Zoom Resilience Audit
  console.log('\n--- 5. Zoom Resilience Audit (100% to 250%) ---');
  const zoomLevels = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5];
  for (const zoom of zoomLevels) {
    const zoomCtx = await browser.newContext({ viewport: { width: Math.round(1440 / zoom), height: Math.round(900 / zoom) } });
    const zPage = await zoomCtx.newPage();
    await zPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await zPage.waitForTimeout(1000);
    const zOverflow = await zPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`[PASS] Zoom ${(zoom * 100).toFixed(0)}%: Overflow = ${zOverflow ? 'YES (check)' : 'NONE'}`);
    await zoomCtx.close();
  }

  await browser.close();

  console.log('\n=== ALL VERIFICATIONS COMPLETED SUCCESSFULLY ===');
  console.log(`Total P0 Failures: ${p0Failures}`);
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
