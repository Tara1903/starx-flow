const { chromium } = require('playwright');
const path = require('path');

async function verifyDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Seed localStorage with test user profile
  await page.addInitScript(() => {
    localStorage.setItem(
      'starx_auth_user_v1',
      JSON.stringify({
        id: 'test-user-id',
        email: 'user@example.com',
        name: 'User',
        businessName: 'My Business',
        businessType: 'Other',
        tier: 'growth',
        role: 'owner',
      })
    );
  });

  console.log('Navigating to http://localhost:3009/dashboard ...');
  await page.goto('http://localhost:3009/dashboard', { waitUntil: 'networkidle' });

  // Wait for dashboard content to appear
  await page.waitForSelector('text=Operational Hub', { timeout: 10000 });
  await page.waitForTimeout(1000); // Wait for framer-motion animations

  const viewports = [
    { width: 1920, height: 1080, name: '1920px' },
    { width: 1440, height: 900, name: '1440px' },
    { width: 1280, height: 800, name: '1280px' },
    { width: 1024, height: 768, name: '1024px' },
    { width: 768, height: 1024, name: '768px-tablet' },
    { width: 390, height: 844, name: '390px-mobile' },
  ];

  const artifactDir = path.resolve('C:/Users/taras/.gemini/antigravity/brain/32133052-3c69-445b-87f6-80b9dce5f005');

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    // Find the 4 notification cards
    const cards = await page.$$('.liquid-glass:has-text("AI Agent Shield"), .liquid-glass:has-text("Onboarding"), .liquid-glass:has-text("Instagram DM"), .liquid-glass:has-text("AI Model")');
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    console.log(`Found ${cards.length} notification cards`);

    if (cards.length >= 4) {
      const boxes = [];
      for (let i = 0; i < cards.length; i++) {
        const box = await cards[i].boundingBox();
        boxes.push(box);
      }

      for (let i = 0; i < boxes.length; i++) {
        console.log(`  Card ${i + 1}: x=${Math.round(boxes[i].x)}, y=${Math.round(boxes[i].y)}, w=${Math.round(boxes[i].width)}, h=${Math.round(boxes[i].height)}`);
      }

      // Check if on single horizontal line on desktop (width >= 1024)
      if (vp.width >= 1024) {
        const y0 = Math.round(boxes[0].y);
        const allSameY = boxes.every((b) => Math.abs(Math.round(b.y) - y0) <= 2);
        console.log(`  Desktop Single Line Check: ${allSameY ? 'PASSED (All on same Y: ' + y0 + 'px)' : 'FAILED (Different Y values)'}`);
      }
    }

    if (vp.name === '1440px') {
      const screenshotPath = path.join(artifactDir, 'dashboard-notifications-horizontal-1440px.png');
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot to: ${screenshotPath}`);
    }
  }

  await browser.close();
  console.log('\nVerification complete!');
}

verifyDashboard().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
