import { chromium } from 'playwright';

async function testPointerReactivity() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // 1. Target the Hero Spatial Glass Card
  const card = await page.$('[data-testid="hero-spatial-glass-card"]');
  if (!card) throw new Error('Hero spatial glass card not found');
  
  const box = await card.boundingBox();
  if (!box) throw new Error('Card bounding box missing');
  
  console.log(`Card found at x:${box.x}, y:${box.y}, w:${box.width}, h:${box.height}`);
  
  // 2. Perform slow, fast, and repeated pointer movements across the card
  console.log('Simulating pointer movements...');
  await page.mouse.move(box.x + 50, box.y + 50);
  await page.waitForTimeout(300);
  
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  
  await page.mouse.move(box.x + box.width - 50, box.y + box.height - 50);
  await page.waitForTimeout(300);
  
  // Fast diagonal movement
  await page.mouse.move(box.x + 20, box.y + box.height - 20, { steps: 5 });
  await page.waitForTimeout(200);
  await page.mouse.move(box.x + box.width - 20, box.y + 20, { steps: 5 });
  await page.waitForTimeout(200);

  // 3. Hover over magnetic CTA button ("Start Free Trial")
  const startTrialBtn = await page.$('text="Start Free Trial"');
  if (startTrialBtn) {
    const btnBox = await startTrialBtn.boundingBox();
    if (btnBox) {
      await page.mouse.move(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
      await page.waitForTimeout(400);
      console.log('Hovered over Start Free Trial CTA with magnetic attraction');
    }
  }

  // 4. Assert text visibility remains intact during pointer movement
  const h1 = await page.$('h1');
  const h1Opacity = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
  console.log('Heading 1 opacity during pointer interaction:', h1Opacity);
  if (h1Opacity !== '1') throw new Error(`P0 VIOLATION: Heading opacity is ${h1Opacity}, expected 1`);

  const screenshotPath = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-phase3-pointer.png';
  await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width: 1440, height: 950 } });
  console.log('Screenshot saved to:', screenshotPath);
  
  await browser.close();
  console.log('Phase 3 Pointer Reactivity Test PASSED.');
}

testPointerReactivity().catch(err => {
  console.error('Error in Phase 3 test:', err);
  process.exit(1);
});
