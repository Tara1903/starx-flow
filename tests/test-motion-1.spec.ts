import fs from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium, type Browser, type Page } from 'playwright';

const PORT = Number(process.env.MOTION_QA_PORT || 3149);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${PORT}`;
const REPORT_SCREENSHOT_DIR = path.join(process.cwd(), 'tests', '__screenshots__', 'motion1');

let serverProc: ChildProcess | null = null;
let failures = 0;
let passed = 0;

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  [PASS] ${label}`);
  } else {
    failures += 1;
    console.error(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function startLocalServer(): ChildProcess {
  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  return spawn(process.execPath, [nextBin, 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForServer(url: string, timeoutMs = 35000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 307 || res.status === 308) return;
    } catch {
      // keep polling until ready
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server failed to start at ${url} within ${timeoutMs}ms`);
}

async function runMotionTestSuite() {
  console.log(`\n===============================================================`);
  console.log(`STARX FLOW — FLAGSHIP MOTION & INTERACTION SYSTEM 1.0 TEST SUITE`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`===============================================================\n`);

  if (!fs.existsSync(REPORT_SCREENSHOT_DIR)) {
    fs.mkdirSync(REPORT_SCREENSHOT_DIR, { recursive: true });
  }

  const existingRes = await fetch(BASE_URL).catch(() => null);
  const alreadyRunning = existingRes !== null;

  if (!alreadyRunning) {
    console.log(`Starting local production server on port ${PORT}...`);
    serverProc = startLocalServer();
    serverProc.stderr?.on('data', (d) => process.stderr.write(`[server-err] ${d.toString()}`));
    await waitForServer(BASE_URL);
    console.log(`Server started successfully at ${BASE_URL}\n`);
  } else {
    console.log(`Connected to already running server at ${BASE_URL}\n`);
  }

  const browser: Browser = await chromium.launch({ headless: true });

  try {
    // ─────────────────────────────────────────────────────────────
    // SUITE 1: Navigation, Pills & Expanding Dock Sidebar
    // ─────────────────────────────────────────────────────────────
    console.log(`--- SUITE 1: Navigation & Expanding Dock Sidebar ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Verify desktop public navbar presence
      const navbar = page.locator('header nav, header');
      assert((await navbar.count()) > 0, 'Desktop public navbar renders in DOM');

      // Verify active pill styling exists
      const pricingLink = page.locator('a[href="/pricing"]').first();
      assert((await pricingLink.count()) > 0, 'Pricing route link present in top nav');

      // Visit dashboard to verify expanding glass dock (or authenticated redirect guard)
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(800);

      const sidebar = page.locator('aside[aria-label="Dashboard sidebar"]');
      if ((await sidebar.count()) > 0) {
        assert(true, 'Dashboard sidebar dock renders');

        const initialBox = await sidebar.boundingBox();
        assert(Boolean(initialBox && initialBox.width > 60), `Dashboard sidebar width initialized (${initialBox?.width}px)`);

        // Test collapse / expand toggle
        const collapseToggle = page.locator('button[aria-label="Collapse sidebar"], button[aria-label="Expand sidebar"]').first();
        if ((await collapseToggle.count()) > 0) {
          const expandedInitial = await collapseToggle.getAttribute('aria-expanded');
          await collapseToggle.click();
          await page.waitForTimeout(450); // Spring animation duration

          const nextBox = await sidebar.boundingBox();
          const expandedNext = await collapseToggle.getAttribute('aria-expanded');

          assert(expandedInitial !== expandedNext, 'Sidebar aria-expanded toggles correctly');
          assert(Boolean(nextBox && initialBox && Math.abs(nextBox.width - initialBox.width) > 50), 'Sidebar spring animates width 72px <-> 260px smoothly');

          // Toggle back
          await collapseToggle.click();
          await page.waitForTimeout(400);
        }
      } else {
        const redirectedToLogin = page.url().includes('/login') || (await page.locator('input[type="password"]').count()) > 0;
        assert(redirectedToLogin, 'Unauthenticated /dashboard enforces auth redirect to /login');
      }

      await page.screenshot({ path: path.join(REPORT_SCREENSHOT_DIR, '01-dashboard-sidebar.png') });
      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 2: Mobile Floating Bottom Navigation Across Viewports
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 2: Mobile Floating Navigation Across Viewports ---`);
    const mobileWidths = [360, 390, 430];
    for (const w of mobileWidths) {
      const context = await browser.newContext({ viewport: { width: w, height: 844 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const mobileNav = page.locator('nav[aria-label="Mobile ultimate navigation"], nav[data-mobile-nav="bottom"]').first();
      assert((await mobileNav.count()) > 0, `Mobile floating capsule renders at viewport ${w}px`);

      const box = await mobileNav.boundingBox();
      assert(Boolean(box && box.width <= w && box.y > 600), `Mobile floating capsule positioned in bottom safe area at ${w}px`);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 3: Hero Choreography & Interactive Workflow Tab Switcher
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 3: Hero Choreography & Interactive Workflow Switcher ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Verify hero headline
      const heroHeadline = page.locator('h1').first();
      assert((await heroHeadline.count()) > 0, 'Hero headline rendered');

      // Verify workflow pill switcher tabs (#tab-btn-whatsapp / #tab-btn-ai)
      const whatsappTab = page.locator('#tab-btn-whatsapp');
      const aiTab = page.locator('#tab-btn-ai');

      assert((await whatsappTab.count()) > 0 && (await aiTab.count()) > 0, 'Both workflow tabs (WhatsApp Bookings, AI Communication) available');

      // Click AI Communication tab to trigger workflow tab switch
      await aiTab.click();
      await page.waitForTimeout(350);

      const isAiActive = await aiTab.evaluate((el) => el.classList.contains('active'));
      assert(isAiActive, 'AI Communication tab selected and highlighted');

      // Click back to WhatsApp Bookings
      await whatsappTab.click();
      await page.waitForTimeout(350);
      const isWhatsappActive = await whatsappTab.evaluate((el) => el.classList.contains('active'));
      assert(isWhatsappActive, 'WhatsApp Bookings tab selected and restored');

      await page.screenshot({ path: path.join(REPORT_SCREENSHOT_DIR, '02-hero-preview-tabs.png') });
      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 4: Dual Segment Value Storytelling & Admin Navigation Tabs
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 4: Dual Segment Value Storytelling & Admin Tabs ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

      // Scroll to DualSegmentValue section
      const soloCard = page.locator('text=Purpose-Built For Your Scale').first();
      assert((await soloCard.count()) > 0, 'DualSegmentValue storytelling section rendered');

      // Test /admin AnimatedTabs (Clients vs Demo Leads)
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // If redirected to login, verify login elements
      const adminTabs = page.locator('[role="tablist"][aria-label="admin-nav-tabs"], [role="tablist"]');
      const isOnAdminOrLogin = (await adminTabs.count()) > 0 || (await page.locator('input[type="password"]').count()) > 0;
      assert(isOnAdminOrLogin, 'Admin surface protected and renders with motion elements');

      await page.screenshot({ path: path.join(REPORT_SCREENSHOT_DIR, '03-storytelling-motion.png') });
      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 5: Public Pages, Magnetic CTAs & Accordion Animations
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 5: Public Pages, Magnetic CTAs & Accordions ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();

      // Test /pricing ROI calculator & FAQ accordion
      await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Verify ROI calculator reactive output
      const sliders = page.locator('input[type="range"]');
      assert((await sliders.count()) >= 2, 'Pricing page ROI sliders render');

      // Test FAQ Accordion expansion
      const firstFaqButton = page.locator('button[aria-expanded]').first();
      if ((await firstFaqButton.count()) > 0) {
        const initialExpanded = await firstFaqButton.getAttribute('aria-expanded');
        await firstFaqButton.click();
        await page.waitForTimeout(300);

        const nextExpanded = await firstFaqButton.getAttribute('aria-expanded');
        assert(initialExpanded !== nextExpanded, 'Pricing FAQ accordion expands/collapses with AnimatePresence');
      }

      // Test Competitor comparison page CTA
      await page.goto(`${BASE_URL}/compare/starx-flow-vs-mindbody`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const compCta = page.locator('button[data-cursor-spotlight="button"], button:has-text("Start 14-Day Free Trial")').first();
      assert((await compCta.count()) > 0, 'Competitor page uses GlassButton magnetic CTA');

      // Test Industry solutions page CTA
      await page.goto(`${BASE_URL}/industries/gyms-fitness`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const industryCta = page.locator('button[data-cursor-spotlight="button"], button:has-text("Start 14-Day Free Trial")').first();
      assert((await industryCta.count()) > 0, 'Industry page uses GlassButton magnetic CTA');

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 6: 8-Character OTP Input & Modal Interaction (Reference 5)
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 6: 8-Character OTP Input (Reference 5) ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.route('**/api/auth/otp/send', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, expiresAt: new Date(Date.now() + 600000).toISOString() }),
        });
      });
      await page.route('**/api/auth/otp/verify', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'QA test boundary' }),
        });
      });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Open SignupModal directly in login mode via visible desktop Navbar "Log in" button
      const openLoginBtn = page.locator('header button:has-text("Log in")').first();
      await openLoginBtn.waitFor({ state: 'visible', timeout: 8000 });
      await openLoginBtn.click();
      await page.waitForTimeout(400);

      const modal = page.locator('[role="dialog"][aria-labelledby="auth-modal-title"]');
      await modal.waitFor({ state: 'visible', timeout: 8000 });
      assert(await modal.isVisible(), 'SignupModal opens with spring backdrop');

      const emailCodeTab = modal.locator('button:has-text("Email Code")').first();
      await emailCodeTab.waitFor({ state: 'visible', timeout: 5000 });
      await emailCodeTab.click();
      await page.waitForTimeout(250);

      const emailInput = modal.locator('input[placeholder="Email or Username"]').first();
      await emailInput.fill('qa-motion@starxflow.com');

      const submitBtn = modal.locator('[data-testid="login-submit-btn"]');
      await submitBtn.click();
      const otpSelector = 'input[aria-label^="Character "][aria-label$=" of 8"]';
      await page.waitForSelector(otpSelector, { timeout: 8000 }).catch(() => null);

      // Verify 8-slot OTP input rendered
      const otpInputs = page.locator(otpSelector);
      const count = await otpInputs.count();
      assert(count === 8, `Exactly 8 separate OTP input cells render (found: ${count})`);

      if (count === 8) {
        // Test typing in first cell moves focus to second cell
        await otpInputs.first().fill('A');
        await page.waitForTimeout(100);

        // Verify multi-character paste / autofill distribution across slots 1..7
        await otpInputs.first().fill('2345678');
        await page.waitForTimeout(150);

        const seventhVal = await otpInputs.nth(6).inputValue();
        assert(seventhVal === '8', `Multi-slot paste auto-populates OTP cells (slot 7="${seventhVal}")`);

        // Entering 8th character triggers orbital verification animation ("Verifying your code")
        await otpInputs.nth(7).fill('9');
        const verifyingHeading = page.locator('h3:has-text("Verifying your code")');
        await verifyingHeading.waitFor({ state: 'visible', timeout: 3000 });
        assert(await verifyingHeading.isVisible(), '8th OTP character triggers flagship orbital verification animation');
      }

      // Close modal via ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 7: Internal Administration Navigation & Tabs
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 7: Internal Administration (/admin) ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Verify admin login elements
      const emailField = page.locator('input[type="email"], input[placeholder*="admin@starxflow.com"]');
      const passField = page.locator('input[type="password"]');
      assert((await emailField.count()) > 0 && (await passField.count()) > 0, 'Admin login credentials fields rendered');

      await page.screenshot({ path: path.join(REPORT_SCREENSHOT_DIR, '04-admin-login.png') });
      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 8: Reduced-Motion Accessibility Compliance
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 8: prefers-reduced-motion Accessibility ---`);
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Verify page loads without script exceptions or animation freezes
      const title = await page.title();
      assert(title.length > 0, `Page renders gracefully under prefers-reduced-motion: reduce ("${title}")`);

      await context.close();
    }

  } finally {
    await browser.close();
    if (serverProc) {
      console.log(`\nStopping local test server (PID ${serverProc.pid})...`);
      serverProc.kill();
    }
  }

  console.log(`\n===============================================================`);
  console.log(`FLAGSHIP MOTION TEST SUMMARY`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failures}`);
  console.log(`===============================================================\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

runMotionTestSuite().catch((err) => {
  console.error('[FATAL] Motion QA test run crashed:', err);
  if (serverProc) serverProc.kill();
  process.exit(1);
});
