import { createLiveBrowser, takeFailureScreenshot } from '../helpers/browser';
import { CONFIG } from '../config/env';
import { generateQATestUser } from '../fixtures/testUser';

interface OnboardingResult {
  step: string;
  passed: boolean;
  details: string;
  error?: string;
}

export async function runPhaseEOnboardingTests(): Promise<{
  results: OnboardingResult[];
  passedCount: number;
  failedCount: number;
}> {
  console.log(`\n======================================================`);
  console.log(`[PHASE E] ONBOARDING FLOW LIVE TESTING`);
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log(`======================================================\n`);

  const { browser, createManagedPage } = await createLiveBrowser();
  const results: OnboardingResult[] = [];
  const testUser = generateQATestUser('onboard');

  const record = (step: string, passed: boolean, details: string, error?: string) => {
    results.push({ step, passed, details, error });
    console.log(`  -> [${passed ? 'PASS' : 'FAIL'}] ${step}: ${details}`);
  };

  try {
    const { page, context, diagnostics } = await createManagedPage();

    try {
      // 1. Visit /setup/welcome
      console.log('1. Testing Welcome Screen (/setup/welcome)...');
      const welcomeRes = await page.goto(`${CONFIG.baseUrl}/setup/welcome`, { waitUntil: 'networkidle', timeout: 30000 });
      const welcomeOk = welcomeRes?.status() === 200 && (await page.getByText(/Welcome to|StarX Flow/i).count()) > 0;
      record('Welcome Screen Load', welcomeOk, welcomeOk ? 'Welcome header rendered with benefits' : 'Failed to load welcome screen');

      // Check benefits items
      const benefitsCount = await page.getByText(/Train Your Custom AI|Unified Messaging|Automate Workflows/i).count();
      record('Onboarding Value Proposition', benefitsCount >= 2, `Rendered ${benefitsCount} core value proposition blocks`);

      // 2. Start Setup Journey -> /setup/account
      console.log('2. Starting Guided Setup Journey...');
      const startBtn = page.locator('button:has-text("Begin Guided Setup"), button:has-text("Get Started"), button:has-text("Start Setup"), button:has-text("Start")').first();
      await startBtn.click();
      await page.waitForTimeout(1500);

      const isAccountStep = page.url().includes('/setup/account') || (await page.locator('text=Business Profile').count()) > 0;
      record('Navigate to Account Step', isAccountStep, isAccountStep ? 'Navigated to /setup/account' : `Current URL: ${page.url()}`);

      if (isAccountStep) {
        // 3. Test Empty Submission Validation on /setup/account
        console.log('3. Testing Empty Form Validation on /setup/account...');
        const ownerInput = page.locator('input[placeholder*="Alex Johnson"]').first();
        const bizInput = page.locator('input[placeholder*="Glow Aesthetics"], input[placeholder*="Lumina Hair"]').first();

        await ownerInput.fill('');
        await bizInput.fill('');
        const saveBtn = page.locator('button:has-text("Save and Continue"), button:has-text("Save & Continue"), button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForTimeout(500);

        const isBlockedByHtmlValidation = await ownerInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
        const hasValidation = isBlockedByHtmlValidation || (await page.getByText(/fill in all required fields|required/i).first().isVisible().catch(() => false));
        record('Account Step Required Validation', hasValidation, hasValidation ? 'Empty submission blocked with validation' : 'Form submitted without required fields');

        // 4. Fill Valid Business Profile Information
        console.log('4. Submitting Valid Business Profile Information...');
        await ownerInput.fill(testUser.ownerName);
        await bizInput.fill(testUser.businessName);

        const industrySelect = page.locator('select').first();
        if ((await industrySelect.count()) > 0) {
          await industrySelect.selectOption({ index: 1 });
        }

        await saveBtn.click();
        await page.waitForTimeout(2000);

        // Verify progression to channels / AI setup
        const nextUrl = page.url();
        const progressed = nextUrl.includes('/setup/') && !nextUrl.includes('/setup/account');
        record('Business Profile Progression', progressed, `Progressed after profile save to: ${nextUrl}`);

        // 5. Browser Refresh State Persistence during Onboarding
        console.log('5. Testing Refresh Persistence during Onboarding...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        const urlAfterRefresh = page.url();
        const statePreserved = urlAfterRefresh.includes('/setup/');
        record('Onboarding Refresh Persistence', statePreserved, `Step preserved on reload: ${urlAfterRefresh}`);
      }

      // 6. Test Direct Dashboard Access & Onboarding Guarding
      console.log('6. Testing Dashboard Route Access...');
      await page.goto(`${CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      const dashUrl = page.url();
      const dashLoaded = dashUrl.includes('/dashboard') && (await page.getByText(/Overview|Inbox|Command Center|Receptionist/i).count()) > 0;
      record('Dashboard Routing', dashLoaded, dashLoaded ? 'Dashboard layout and navigation rendered' : `Redirected or unhandled: ${dashUrl}`);

    } catch (err: any) {
      await takeFailureScreenshot(page, 'onboarding_failure');
      record('Onboarding Execution', false, 'Exception occurred during onboarding testing', err.message);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log(`\n[PHASE E SUMMARY] Tested: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  return { results, passedCount, failedCount };
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('onboarding')) {
  runPhaseEOnboardingTests().then((res) => {
    process.exit(res.failedCount === 0 ? 0 : 1);
  });
}
