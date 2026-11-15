import { chromium } from 'playwright';
import path from 'path';

async function captureBaselines() {
  const browser = await chromium.launch({ headless: true });
  const baseDir = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-baselines';
  
  // 1. Desktop Homepage (1920x1080)
  const desktopCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: `${baseDir}/baseline-desktop-homepage.png`, fullPage: false });
  console.log('Saved baseline-desktop-homepage.png');

  // 2. Laptop Homepage (1366x768)
  const laptopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const laptopPage = await laptopCtx.newPage();
  await laptopPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await laptopPage.waitForTimeout(1500);
  await laptopPage.screenshot({ path: `${baseDir}/baseline-laptop-homepage.png`, fullPage: false });
  console.log('Saved baseline-laptop-homepage.png');

  // 3. Mobile Homepage (390x844 - iPhone 14)
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: `${baseDir}/baseline-mobile-homepage.png`, fullPage: false });
  console.log('Saved baseline-mobile-homepage.png');

  // 4. Desktop Navigation Baseline
  await desktopPage.mouse.move(960, 40);
  await desktopPage.waitForTimeout(500);
  const navElem = await desktopPage.$('header, nav, [data-testid="navbar"]');
  if (navElem) {
    await navElem.screenshot({ path: `${baseDir}/baseline-navigation.png` });
  } else {
    await desktopPage.screenshot({ path: `${baseDir}/baseline-navigation.png`, clip: { x: 0, y: 0, width: 1920, height: 120 } });
  }
  console.log('Saved baseline-navigation.png');

  // 5. Existing Dashboard Baseline (/dashboard)
  await desktopPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: `${baseDir}/baseline-dashboard.png`, fullPage: false });
  console.log('Saved baseline-dashboard.png');

  // 6. Existing Admin Centre Baseline (/admin)
  await desktopPage.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: `${baseDir}/baseline-admin-centre.png`, fullPage: false });
  console.log('Saved baseline-admin-centre.png');

  await browser.close();
  console.log('All Phase 0 baselines successfully captured.');
}

captureBaselines().catch(err => {
  console.error('Error capturing baselines:', err);
  process.exit(1);
});
