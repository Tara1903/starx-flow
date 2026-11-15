import { chromium } from 'playwright';

async function testScrollAndSurfaces() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Check Hero Heading Visibility
  const h1 = await page.$('h1');
  const h1Opacity = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
  console.log('H1 opacity at top:', h1Opacity);
  if (h1Opacity !== '1') throw new Error(`P0 Failure: H1 opacity is ${h1Opacity}`);

  // 2. Scroll forward through each major section
  const sections = [
    { name: 'Social Proof & Problem', testId: 'spatial-section-socialproof' },
    { name: 'How It Works & Capabilities', testId: 'spatial-section-capabilities' },
    { name: 'Dual Segment Value', testId: 'spatial-section-dualsegment' },
    { name: 'Platform Guarantees', testId: 'spatial-section-guarantees' },
  ];

  for (const sec of sections) {
    console.log(`Scrolling to ${sec.name}...`);
    const elem = await page.$(`[data-testid="${sec.testId}"]`);
    if (!elem) throw new Error(`Section ${sec.name} (${sec.testId}) not found!`);
    
    await elem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    
    // Assert all headings inside this section are 100% visible
    const headings = await elem.$$('h2, h3');
    for (const h of headings) {
      const text = await h.textContent();
      const op = await h.evaluate(el => window.getComputedStyle(el).opacity);
      const vis = await h.evaluate(el => window.getComputedStyle(el).visibility);
      const box = await h.boundingBox();
      
      if (op !== '1' || vis !== 'visible' || !box || box.width === 0 || box.height === 0) {
        throw new Error(`P0 Failure on heading "${text?.trim()}": opacity=${op}, visibility=${vis}`);
      }
    }
    console.log(`Verified ${headings.length} headings inside ${sec.name} have opacity=1 and visibility=visible`);
  }

  // 3. Scroll to CTA at the bottom
  console.log('Scrolling to CTA...');
  const ctaHeading = await page.$('text="Stop losing clients to"');
  if (ctaHeading) {
    await ctaHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const ctaOp = await ctaHeading.evaluate(el => window.getComputedStyle(el).opacity);
    console.log('CTA Heading opacity:', ctaOp);
    if (ctaOp !== '1') throw new Error(`P0 Failure on CTA heading: opacity=${ctaOp}`);
  }

  // 4. Reverse scrolling test: rapid scroll back to top
  console.log('Testing reverse scrolling back to top...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);
  
  const h1PostReverse = await h1?.evaluate(el => window.getComputedStyle(el).opacity);
  console.log('H1 opacity after reverse scroll:', h1PostReverse);
  if (h1PostReverse !== '1') throw new Error(`P0 Failure: H1 opacity after reverse scroll is ${h1PostReverse}`);

  // 5. Capture full page spatial storytelling screenshot
  const screenshotPath = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-phase4-scroll-story.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Full-page screenshot successfully saved to:', screenshotPath);

  await browser.close();
  console.log('Phase 4, 5, 6, 7 Verification PASSED.');
}

testScrollAndSurfaces().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});
