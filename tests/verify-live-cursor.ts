import { chromium } from 'playwright';

async function verifyLiveCursor() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('Navigating to https://starx-flow.runs-on.dev...');
  await page.goto('https://starx-flow.runs-on.dev', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Move mouse across the page to activate custom cursor
  await page.mouse.move(400, 300);
  await page.waitForTimeout(500);
  await page.mouse.move(600, 400);
  await page.waitForTimeout(500);
  
  const cursorLayer = await page.$('[data-testid="starx-cursor-layer"]');
  const cursorRing = await page.$('[data-testid="starx-cursor-ring"]');
  const cursorDot = await page.$('[data-testid="starx-cursor-dot"]');
  
  console.log('Cursor Layer found:', !!cursorLayer);
  console.log('Cursor Ring found:', !!cursorRing);
  console.log('Cursor Dot found:', !!cursorDot);
  
  if (cursorRing && cursorDot) {
    const ringBox = await cursorRing.boundingBox();
    const dotBox = await cursorDot.boundingBox();
    console.log('Ring Bounding Box:', JSON.stringify(ringBox));
    console.log('Dot Bounding Box:', JSON.stringify(dotBox));
  }
  
  const screenshotPath = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/live-prod-custom-cursor.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot successfully saved to:', screenshotPath);
  
  await browser.close();
}

verifyLiveCursor().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
