import { chromium } from 'playwright';

async function testHero() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Verify hero headline is present and visible
  const h1 = await page.$('h1');
  const h1Visible = h1 ? await h1.isVisible() : false;
  const h1Opacity = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : null;
  console.log('Hero H1 visible:', h1Visible, 'Computed opacity:', h1Opacity);
  
  // Verify hero spatial card
  const card = await page.$('[data-testid="hero-spatial-glass-card"]');
  console.log('Hero Spatial Glass Card found:', !!card);

  const screenshotPath = 'C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005/screenshots/spatial-phase2-hero.png';
  await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width: 1440, height: 950 } });
  console.log('Screenshot saved to:', screenshotPath);
  
  await browser.close();
}

testHero().catch(err => {
  console.error('Error during Hero test:', err);
  process.exit(1);
});
