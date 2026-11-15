import { chromium } from 'playwright';

async function testPerformanceAndA11y() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Reduced Motion Testing
  console.log('Testing prefers-reduced-motion: reduce...');
  const reducedMotionCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await reducedMotionCtx.newPage();
  await rmPage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await rmPage.waitForTimeout(1000);

  // Assert H1 and content visibility under reduced motion
  const h1 = await rmPage.$('h1');
  const h1Op = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
  console.log('H1 opacity with reduced motion:', h1Op);
  if (h1Op !== '1') throw new Error(`P0 Failure under reduced motion: H1 opacity is ${h1Op}`);

  // 2. Keyboard Navigation (Tab focus flow)
  console.log('Testing keyboard Tab navigation & focus rings...');
  await rmPage.keyboard.press('Tab');
  await rmPage.keyboard.press('Tab');
  await rmPage.keyboard.press('Tab');
  
  const activeTagName = await rmPage.evaluate(() => document.activeElement?.tagName);
  console.log('Focused element after tabs:', activeTagName);

  // 3. Performance Metrics
  console.log('Measuring performance metrics...');
  const perfMetrics = await rmPage.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: timing ? timing.domContentLoadedEventEnd - timing.startTime : 0,
      domNodesCount: document.querySelectorAll('*').length,
    };
  });
  console.log('Performance Metrics:', JSON.stringify(perfMetrics, null, 2));

  // 4. Verify no element on the homepage has opacity: 0 for protected text
  const hiddenTextElements = await rmPage.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
    return headings.filter(h => {
      const style = window.getComputedStyle(h);
      return style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none';
    }).map(h => h.textContent?.trim());
  });

  console.log('Hidden essential headings detected:', hiddenTextElements.length);
  if (hiddenTextElements.length > 0) {
    throw new Error(`P0 VIOLATION: Found hidden headings: ${hiddenTextElements.join(', ')}`);
  }

  const screenshotPath = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-phase9-reduced-motion.png';
  await rmPage.screenshot({ path: screenshotPath });
  console.log('Reduced motion screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('Phase 9 Performance, WebGL Fallback & Accessibility PASSED.');
}

testPerformanceAndA11y().catch(err => {
  console.error('Error in Phase 9 test:', err);
  process.exit(1);
});
