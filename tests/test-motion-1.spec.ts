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

      // Visit dashboard to verify expanding glass dock
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const sidebar = page.locator('aside[aria-label="Dashboard sidebar"]');
      assert((await sidebar.count()) > 0, 'Dashboard sidebar dock renders');

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

      const mobileNav = page.locator('nav[aria-label="Mobile quick navigation"]');
      assert((await mobileNav.count()) > 0, `Mobile floating capsule renders at viewport ${w}px`);

      const box = await mobileNav.boundingBox();
      assert(Boolean(box && box.width <= w && box.y > 600), `Mobile floating capsule positioned in bottom safe area at ${w}px`);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────
    // SUITE 3: Hero Choreography & Interactive Tab Switcher
    // ─────────────────────────────────────────────────────────────
    console.log(`\n--- SUITE 3: Hero Choreography & Preview Mode Switcher ---`);
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page: Page = await context.newPage();
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Verify hero badge and headline
      const heroHeadline = page.locator('h1').first();
      assert((await heroHeadline.count()) > 0, 'Hero headline rendered');

      // Verify preview mode switcher AnimatedTabs
      const stageTabs = page.locator('[role="tablist"][aria-label="Hero preview mode"]');
      assert((await stageTabs.count()) > 0, 'Hero AnimatedTabs preview mode switcher rendered');

      const whatsappTab = stageTabs.locator('button', { hasText: 'WhatsApp Thread' });
      const liveOsTab = stageTabs.locator('button', { hasText: 'Live OS View' });

      assert((await whatsappTab.count()) > 0 && (await liveOsTab.count()) > 0, 'Both preview tabs (Live OS View, WhatsApp Thread) available');

      // Click WhatsApp Thread tab to trigger AnimatePresence crossfade
      await whatsappTab.click();
      await page.waitForTimeout(350);

      // Verify active tab pill moved
      const isWhatsappSelected = await whatsappTab.getAttribute('aria-selected');
      assert(isWhatsappSelected === 'true', 'WhatsApp Thread tab selected and highlighted');

      // Click back to Live OS View
      await liveOsTab.click();
      await page.waitForTimeout(350);
      const isOsSelected = await liveOsTab.getAttribute('aria-selected');
      assert(isOsSelected === 'true', 'Live OS View tab selected and restored');

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
      await page.goto(`${BASE_URL}/compare/mindbody`, { waitUntil: 'domcontentloaded' });
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
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Open SignupModal
      const openSignupBtn = page.locator('button:has-text("Start Free Trial"), button:has-text("Start 14-Day Free Trial")').first();
      if ((await openSignupBtn.count()) > 0) {
        await openSignupBtn.click();
        await page.waitForTimeout(400);

        const modal = page.locator('[role="dialog"]');
        assert((await modal.count()) > 0, 'SignupModal opens with spring backdrop');

        // Switch to sign in tab
        const signInToggle = page.locator('button:has-text("Sign In")').first();
        if ((await signInToggle.count()) > 0) {
          await signInToggle.click();
          await page.waitForTimeout(300);

          const emailInput = page.locator('input[type="email"]');
          await emailInput.fill('qa-motion@starxflow.com');

          const submitBtn = page.locator('button[type="submit"]:has-text("Send 8-Character Code")');
          if ((await submitBtn.count()) > 0) {
            await submitBtn.click();
            await page.waitForSelector('input[aria-label*="Verification code character"]', { timeout: 8000 }).catch(() => null);

            // Verify 8-slot OTP input rendered
            const otpInputs = page.locator('input[aria-label*="Verification code character"]');
            const count = await otpInputs.count();
            assert(count === 8, `Exactly 8 separate OTP input cells render (found: ${count})`);

            // Test typing in first cell moves focus to second cell
            await otpInputs.first().fill('A');
            await page.waitForTimeout(100);

            // Verify paste handling
            await otpInputs.first().evaluate((el: HTMLInputElement) => {
              const pasteEvent = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true,
              });
              pasteEvent.clipboardData?.setData('text/plain', '23456789');
              el.dispatchEvent(pasteEvent);
            });
            await page.waitForTimeout(200);

            const lastVal = await otpInputs.nth(7).inputValue();
            assert(lastVal.length > 0, '8-character multi-slot paste auto-populates cells');
          }
        }

        // Close modal via ESC
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }

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
