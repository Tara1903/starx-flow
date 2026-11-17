const { chromium } = require('playwright');
const path = require('path');

const artifactsDir = 'C:\\Users\\taras\\.gemini\\antigravity\\brain\\32133052-3c69-445b-87f6-80b9dce5f005';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();

  await page.goto('http://localhost:3001/login');
  await page.evaluate(() => {
    localStorage.setItem('starx_auth_user_v1', JSON.stringify({
      id: 'test-user-1',
      email: 'noah@crema.studio',
      name: 'Noah Carter',
      businessName: 'Crema Studio',
      onboardingComplete: true
    }));
  });

  await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(artifactsDir, 'post-390-mobile.png'), fullPage: false });
  console.log('Captured post-390-mobile.png');

  await browser.close();
})();
