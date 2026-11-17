const { chromium } = require('playwright');
const path = require('path');

const viewports = [
  { name: '1920-desktop', width: 1920, height: 1080 },
  { name: '1536-desktop', width: 1536, height: 864 },
  { name: '1366-laptop', width: 1366, height: 768 },
  { name: '1024-laptop', width: 1024, height: 768 },
  { name: '768-tablet', width: 768, height: 1024 },
];

const artifactsDir = 'C:\\Users\\taras\\.gemini\\antigravity\\brain\\32133052-3c69-445b-87f6-80b9dce5f005';

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
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

    await page.screenshot({ path: path.join(artifactsDir, `post-${vp.name}.png`), fullPage: false });
    console.log(`Captured post-${vp.name}.png`);
    await context.close();
  }

  // Also capture Admin view and Expanded Sidebar view
  {
    const context = await browser.newContext({ viewport: { width: 1536, height: 864 } });
    const page = await context.newPage();
    await page.goto('http://localhost:3001/admin/login');
    await page.evaluate(() => {
      localStorage.setItem('starx_admin_auth_v1', JSON.stringify({
        role: 'admin',
        email: 'admin@starxflow.com'
      }));
    });
    await page.goto('http://localhost:3001/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactsDir, 'post-admin-1536.png'), fullPage: false });
    console.log('Captured post-admin-1536.png');
    await context.close();
  }

  await browser.close();
  console.log('All post-optimisation screenshots captured successfully.');
})();
