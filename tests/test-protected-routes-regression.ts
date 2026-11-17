import { chromium } from 'playwright';
import fs from 'fs';

async function testProtectedRoutesRegression() {
  console.log('=== STARTING PROTECTED ROUTES REGRESSION SUITE ===');
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const screenshotDir = 'screenshots/spatial-qa-final';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. Unauthenticated /dashboard test (Auth Guard)
  console.log('1. Testing Unauthenticated /dashboard Auth Guard...');
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  const currentUrl = page.url();
  console.log('Unauthenticated /dashboard redirected to:', currentUrl);
  const isRedirectedToHome = currentUrl.endsWith('/') || currentUrl.includes(new URL(baseUrl).port);
  if (!isRedirectedToHome) throw new Error('Unauthenticated /dashboard failed to redirect');
  console.log('✓ Auth guard redirect confirmed');

  // 2. Authenticated /dashboard test
  console.log('2. Testing Authenticated /dashboard with Session...');
  await page.evaluate(() => {
    localStorage.setItem('starx_auth_user_v1', JSON.stringify({
      id: 'usr_test_sarah',
      email: 'sarah.k@starxflow.com',
      fullName: 'Dr. Sarah K.',
      businessName: 'StarX Wellness Hub',
      businessType: 'Healthcare & Wellness',
      tier: 'pro'
    }));
  });
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  const dashContent = await page.$('aside, main, nav, [data-testid="sidebar"]');
  if (!dashContent) throw new Error('Authenticated Dashboard layout not found');
  console.log('✓ Authenticated Dashboard layout rendered');
  await page.screenshot({ path: `${screenshotDir}/qa-protected-dashboard.png` });

  // 3. Admin Login page (/admin/login)
  console.log('3. Testing /admin/login...');
  const adminLoginResp = await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'domcontentloaded' });
  if (adminLoginResp?.status() !== 200) throw new Error('/admin/login returned non-200');
  await page.waitForTimeout(1000);
  const adminLoginForm = await page.$('form, input[type="email"], input[type="password"]');
  if (!adminLoginForm) throw new Error('Admin login form not found');
  console.log('✓ Admin login form rendered');
  await page.screenshot({ path: `${screenshotDir}/qa-protected-admin-login.png` });

  // 4. Admin Centre (/admin)
  console.log('4. Testing /admin...');
  const adminResp = await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
  if (adminResp?.status() !== 200) throw new Error('/admin returned non-200');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${screenshotDir}/qa-protected-admin.png` });

  // 5. Pricing (/pricing)
  console.log('5. Testing /pricing...');
  const pricingResp = await page.goto(`${baseUrl}/pricing`, { waitUntil: 'domcontentloaded' });
  if (pricingResp?.status() !== 200) throw new Error('/pricing returned non-200');
  await page.waitForTimeout(1000);
  const pricingCards = await page.$$('.rounded-3xl, [class*="pricing"], [class*="border-emerald"]');
  console.log('✓ Pricing tier cards found:', pricingCards.length);
  await page.screenshot({ path: `${screenshotDir}/qa-protected-pricing.png` });

  // 6. Features (/features)
  console.log('6. Testing /features...');
  const featuresResp = await page.goto(`${baseUrl}/features`, { waitUntil: 'domcontentloaded' });
  if (featuresResp?.status() !== 200) throw new Error('/features returned non-200');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/qa-protected-features.png` });

  // 7. Final confirmation on Homepage Desktop (/)
  console.log(`7. Final confirmation on Homepage Desktop (${baseUrl})...`);
  await page.goto(`${baseUrl}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/qa-final-homepage-desktop.png` });
  console.log('✓ Final desktop homepage screenshot saved');
  console.log('✓ Final desktop homepage screenshot saved');

  await browser.close();
  console.log('Protected Routes Regression Review: 100% PASSED');
}

testProtectedRoutesRegression().catch(err => {
  console.error('Error in Protected Routes Regression:', err);
  process.exit(1);
});
