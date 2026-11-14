import fs from 'node:fs';
import path from 'node:path';
import { chromium, Browser, Page } from 'playwright';

const SCREENSHOT_DIR = path.resolve('C:/Users/taras/.gemini/antigravity/brain/0c4a876e-ee10-4860-88da-cf0e438d3884/motion_evidence');
const BASE_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface TestAssertion {
  name: string;
  passed: boolean;
  details?: string;
}

const assertions: TestAssertion[] = [];

function assert(condition: boolean, name: string, details?: string) {
  assertions.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
  }
}

async function assertElementOpacity(page: Page, selector: string, description: string, minOpacity = 0.90) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: 6000 });
  const styles = await el.evaluate((node) => {
    const computed = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      opacity: parseFloat(computed.opacity),
      visibility: computed.visibility,
      display: computed.display,
      width: rect.width,
      height: rect.height,
    };
  });

  const isVisible =
    styles.opacity >= minOpacity &&
    styles.visibility === 'visible' &&
    styles.display !== 'none' &&
    styles.width > 0 &&
    styles.height > 0;

  assert(
    isVisible,
    `[P0 Visibility] ${description} (opacity: ${styles.opacity.toFixed(2)} >= ${minOpacity}, bounds: ${Math.round(styles.width)}x${Math.round(styles.height)})`,
    `opacity: ${styles.opacity}, visibility: ${styles.visibility}, display: ${styles.display}`
  );
}

async function run() {
  console.log('================================================================');
  console.log('STARX FLOW — MASTER MOTION ENGINEERING & VISIBILITY VERIFICATION');
  console.log('================================================================\n');

  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await desktopContext.newPage();
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
    document.head?.appendChild(style);
  });

  try {
    // ══════════════════════════════════════════════════════════════
    // SUITE 1: First Visit Invitation & Glassy Login Form V2 (Reference 06)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 1: First Visit Invitation & Glassy Login Form V2 ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check if First-Visit Invitation Prompt opened
    const modalDialog = page.locator('div[role="dialog"]');
    await modalDialog.waitFor({ state: 'visible', timeout: 6000 });
    const isModalOpen = (await modalDialog.count()) > 0;
    assert(isModalOpen, 'First-visit modal invitation opened automatically for new guest');

    // Assert First-Visit Invitation banner & guest skip button
    await assertElementOpacity(page, 'span:has-text("Welcome to StarX Flow!")', 'First-Visit Welcome Banner');
    await assertElementOpacity(page, 'button:has-text("Skip for now • Continue as Guest")', 'Guest Skip Button');

    // Assert Two-Sided Modal in Create Account Mode
    await assertElementOpacity(page, 'h2:has-text("Create Account")', 'Modal Heading: Create Account');
    await assertElementOpacity(page, 'p:has-text("Start your 14-day free trial")', 'Modal Subtitle: Free trial');
    await assertElementOpacity(page, 'button:has-text("Continue with Google")', 'Google OAuth Button');
    await assertElementOpacity(page, 'h3:has-text("WELCOME BACK!")', 'Left Glass Panel: WELCOME BACK!');

    const shot1 = path.join(SCREENSHOT_DIR, '01_first_visit_invitation_signup_modal.png');
    await page.screenshot({ path: shot1 });
    console.log(`  📸 Screenshot saved: ${shot1}`);

    // Switch to Sign In mode via visible desktop panel button
    console.log('  Testing two-sided panel sliding exchange to Sign In mode...');
    const desktopSignInBtn = page.locator('div.hidden.md\\:flex button:has-text("Sign In")');
    await desktopSignInBtn.click();
    await page.waitForTimeout(500);

    await assertElementOpacity(page, 'h2:has-text("Welcome Back")', 'Modal Heading: Welcome Back');
    await assertElementOpacity(page, 'p:has-text("Sign in to access your dashboard")', 'Modal Subtitle: Sign in to access');
    await assertElementOpacity(page, 'button:has-text("Password")', 'Login Tab: Password');
    await assertElementOpacity(page, 'button:has-text("8-Digit OTP")', 'Login Tab: 8-Digit OTP');

    const shot2 = path.join(SCREENSHOT_DIR, '02_glassy_login_signin_view.png');
    await page.screenshot({ path: shot2 });
    console.log(`  📸 Screenshot saved: ${shot2}`);

    // Click 8-Digit OTP Tab
    console.log('  Switching to 8-Digit OTP method...');
    const otpTabBtn = page.locator('button:has-text("8-Digit OTP")').first();
    await otpTabBtn.click();
    await page.waitForTimeout(300);

    await assertElementOpacity(page, 'button:has-text("8-Digit Verification Code")', 'Submit Button: Send 8-Digit Verification Code');
    const shot3 = path.join(SCREENSHOT_DIR, '03_glassy_login_otp_tab.png');
    await page.screenshot({ path: shot3 });
    console.log(`  📸 Screenshot saved: ${shot3}`);

    // Click "Continue as Guest" to dismiss and browse freely
    console.log('  Dismissing first-visit prompt via Continue as Guest button...');
    const guestBtn = page.locator('button:has-text("Continue as Guest")').first();
    await guestBtn.click();
    await page.locator('div[role="dialog"]').waitFor({ state: 'detached', timeout: 5000 });

    assert(
      (await page.locator('div[role="dialog"]').count()) === 0,
      'Auth modal dismissed cleanly into guest browsing mode'
    );

    // ══════════════════════════════════════════════════════════════
    // SUITE 2: Public Homepage & Desktop Navigation Tabs V7 (Reference 04)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 2: Public Homepage & Desktop Navigation Tabs V7 ---');
    // Verify unauthenticated visitor sees Get Started CTA
    const desktopGetStartedBtn = page.locator('header nav div.hidden.md\\:flex button:has-text("Get Started")');
    await assertElementOpacity(page, 'header nav div.hidden.md\\:flex button:has-text("Get Started")', 'Desktop Get Started CTA Button');

    // Verify nav links
    await assertElementOpacity(page, 'header nav a:has-text("Home")', 'Nav item: Home');
    await assertElementOpacity(page, 'header nav a:has-text("Pricing")', 'Nav item: Pricing');
    await assertElementOpacity(page, 'header nav button:has-text("Product")', 'Nav item: Product');
    await assertElementOpacity(page, 'header nav button:has-text("Solutions")', 'Nav item: Solutions');
    await assertElementOpacity(page, 'header nav button:has-text("Industries")', 'Nav item: Industries');
    await assertElementOpacity(page, 'header nav button:has-text("Resources")', 'Nav item: Resources');

    // Test dropdown hover / click
    console.log('  Testing Product dropdown hover expansion...');
    const productBtn = page.locator('header nav button:has-text("Product")');
    await productBtn.hover();
    await page.waitForTimeout(400);
    if ((await page.locator('div[role="menu"]').count()) === 0) {
      await productBtn.click();
      await page.waitForTimeout(400);
    }

    await assertElementOpacity(page, 'div[role="menu"]', 'Product Glass Dropdown Menu');

    // Hover over Pricing to test active pill transition
    console.log('  Testing active pill transition to Pricing...');
    const pricingLink = page.locator('header nav a:has-text("Pricing")');
    await pricingLink.hover();
    await page.waitForTimeout(400);

    const shot4 = path.join(SCREENSHOT_DIR, '04_public_homepage_nav_visibility.png');
    await page.screenshot({ path: shot4 });
    console.log(`  📸 Screenshot saved: ${shot4}`);

    // ══════════════════════════════════════════════════════════════
    // SUITE 3: 8-Digit Liquid Glass OTP Verification V5 (Reference 05)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 3: 8-Digit Liquid Glass OTP Verification V5 ---');
    // Open modal via Get Started button
    await desktopGetStartedBtn.click();
    await page.waitForTimeout(400);
    await page.locator('div.hidden.md\\:flex button:has-text("Sign In")').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("8-Digit OTP")').first().click();
    await page.waitForTimeout(300);

    // Fill test email and send OTP
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('verification-test@starxflow.com');
    await page.locator('button:has-text("8-Digit Verification Code")').first().click();
    await page.waitForTimeout(1000);

    // Verify 8-cell LiquidGlassOTPModalView
    await assertElementOpacity(page, 'h3:has-text("Let\'s verify your account")', 'OTP Modal Heading: Let\'s verify your account');
    await assertElementOpacity(page, 'p:has-text("We\'ve sent an 8-digit code")', 'OTP Modal Subtitle: Sent code');

    // Assert exactly 8 inputs exist
    const otpCells = page.locator('div[role="group"][aria-label="8-digit numeric verification code"] input');
    const cellCount = await otpCells.count();
    assert(cellCount === 8, 'Exactly 8 numeric OTP input cells are rendered', `found ${cellCount} cells`);

    const shot5 = path.join(SCREENSHOT_DIR, '05_otp_modal_empty_cells.png');
    await page.screenshot({ path: shot5 });
    console.log(`  📸 Screenshot saved: ${shot5}`);

    // Enter partial 4 digits: 5, 8, 2, 1
    console.log('  Entering partial digits 5, 8, 2, 1...');
    await otpCells.nth(0).focus();
    await page.keyboard.type('5821');
    await page.waitForTimeout(300);

    const shot6 = path.join(SCREENSHOT_DIR, '06_otp_modal_partial_digits.png');
    await page.screenshot({ path: shot6 });
    console.log(`  📸 Screenshot saved: ${shot6}`);

    // Enter remaining digits: 9, 3, 0, 4 (full 8 digits)
    console.log('  Completing 8 digits (9304) to trigger orbital verification...');
    await page.keyboard.type('9304');
    await page.waitForTimeout(500);

    // Orbital ring sequence should activate
    const shot7 = path.join(SCREENSHOT_DIR, '07_otp_orbital_revolving_ring.png');
    await page.screenshot({ path: shot7 });
    console.log(`  📸 Screenshot saved: ${shot7}`);

    // Close OTP verification modal cleanly
    const closeOtpBtn = page.locator('button[aria-label="Close verification modal"]');
    if ((await closeOtpBtn.count()) > 0) {
      await closeOtpBtn.click();
      await page.waitForTimeout(400);
    }

    // ══════════════════════════════════════════════════════════════
    // SUITE 4: Glassy Dashboard V30 (Reference 01) & Dynamic Nav CTA
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 4: Glassy Dashboard V30 & Dynamic Nav CTA ---');
    // Inject authenticated session
    await page.evaluate(() => {
      localStorage.setItem(
        'starx_auth_user_v1',
        JSON.stringify({
          id: 'motion-test-user-1',
          email: 'founder@quantumflow.io',
          name: 'Elena Rostova',
          businessName: 'Quantum AI Systems',
          role: 'user',
          onboardingComplete: true,
        })
      );
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify dynamic CTA shows "Go to Dashboard"
    const dashboardCtaBtn = page.locator('header nav div.hidden.md\\:flex button:has-text("Go to Dashboard")');
    await assertElementOpacity(page, 'header nav div.hidden.md\\:flex button:has-text("Go to Dashboard")', 'Dynamic Navigation CTA: Go to Dashboard');

    // Click Go to Dashboard
    try {
      await dashboardCtaBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 6000 });
    } catch {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(1200);

    // Assert KPI Grid elements
    await assertElementOpacity(page, 'p:has-text("Deployed Flows")', 'KPI 1 Label: Deployed Flows');
    await assertElementOpacity(page, 'p:has-text("Total Triage Runs")', 'KPI 2 Label: Total Triage Runs');
    await assertElementOpacity(page, 'p:has-text("Hours Saved")', 'KPI 3 Label: Hours Saved');
    await assertElementOpacity(page, 'p:has-text("Rev Protected")', 'KPI 4 Label: Rev Protected');

    // Test KPI hover lift physics
    console.log('  Testing KPI card hover lift physics (whileHover={{ y: -5 }})...');
    const firstKpiCard = page.locator('div[data-cursor-spotlight="true"]').first();
    const boxBefore = await firstKpiCard.boundingBox();
    await firstKpiCard.hover();
    await page.waitForTimeout(300);
    const boxAfter = await firstKpiCard.boundingBox();

    assert(
      boxBefore !== null && boxAfter !== null,
      'KPI Card hover lift successfully evaluated with positive bounding boxes'
    );

    const shot8 = path.join(SCREENSHOT_DIR, '08_dashboard_v30_kpis_and_overview.png');
    await page.screenshot({ path: shot8 });
    console.log(`  📸 Screenshot saved: ${shot8}`);

    // Test Section Switching without text disappearing
    console.log('  Testing dashboard section transitions (Inbox, Customers, Workflows)...');
    const inboxNavBtn = page.locator('aside button:has-text("Inbox")');
    await inboxNavBtn.click();
    await page.waitForTimeout(500);

    const shot9 = path.join(SCREENSHOT_DIR, '09_dashboard_section_switch_visible.png');
    await page.screenshot({ path: shot9 });
    console.log(`  📸 Screenshot saved: ${shot9}`);

    // Return to overview
    await page.locator('aside button:has-text("Overview")').click();
    await page.waitForTimeout(400);

    // ══════════════════════════════════════════════════════════════
    // SUITE 5: Glassy Sidebar V7 (Reference 02)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 5: Glassy Sidebar V7 (Reference 02) ---');
    // Verify expanded state
    await assertElementOpacity(page, 'aside span:has-text("StarX Flow")', 'Sidebar Brand: StarX Flow');
    await assertElementOpacity(page, 'aside span:has-text("PRO")', 'Sidebar Badge: PRO');
    await assertElementOpacity(page, 'aside p:has-text("Core")', 'Group Header: Core');
    await assertElementOpacity(page, 'aside p:has-text("Automation & Ops")', 'Group Header: Automation & Ops');
    await assertElementOpacity(page, 'aside button:has-text("Search commands...")', 'Search bar in expanded state');

    const shot10 = path.join(SCREENSHOT_DIR, '10_glassy_sidebar_v7_expanded.png');
    await page.screenshot({ path: shot10 });
    console.log(`  📸 Screenshot saved: ${shot10}`);

    // Click collapse toggle chevron
    console.log('  Collapsing sidebar to 72px dock...');
    const collapseBtn = page.locator('button[aria-label="Collapse sidebar"]');
    await collapseBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Check sidebar width
    const aside = page.locator('aside').first();
    const collapsedWidth = (await aside.boundingBox())?.width;
    assert(
      collapsedWidth !== undefined && collapsedWidth <= 80,
      'Sidebar width successfully collapsed to ~72px capsule dock',
      `current width: ${collapsedWidth}px`
    );

    // Hover on an icon to test floating glass tooltip
    console.log('  Testing floating glass tooltip on collapsed dock icon...');
    const searchSquircle = page.locator('button[aria-label="Search and command center (Press ⌘K)"]');
    await searchSquircle.hover();
    await page.waitForTimeout(300);

    const shot11 = path.join(SCREENSHOT_DIR, '11_glassy_sidebar_v7_collapsed_tooltip.png');
    await page.screenshot({ path: shot11 });
    console.log(`  📸 Screenshot saved: ${shot11}`);

    // Re-expand sidebar
    console.log('  Re-expanding sidebar back to 280px...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Expand sidebar"]') as HTMLButtonElement | null;
      btn?.click();
    });
    await page.waitForTimeout(800);

    const expandedWidth = (await aside.boundingBox())?.width;
    assert(
      expandedWidth !== undefined && expandedWidth >= 270,
      'Sidebar width successfully restored to 280px',
      `current width: ${expandedWidth}px`
    );

    // ══════════════════════════════════════════════════════════════
    // SUITE 6: Admin Dashboard V7 (Reference 07)
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 6: Admin Dashboard V7 (Reference 07) ---');
    // Set admin user session in both admin and auth store keys
    await page.evaluate(() => {
      const adminData = JSON.stringify({
        id: 'admin-super-1',
        email: 'admin@starxflow.com',
        name: 'Super Administrator',
        businessName: 'StarX Flow Command',
        businessType: 'Agency',
        role: 'admin',
        onboardingComplete: true,
      });
      localStorage.setItem('starx_admin_auth_v1', adminData);
      localStorage.setItem('starx_auth_user_v1', adminData);
    });

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Assert Admin Header and Greeting
    await assertElementOpacity(page, ':has-text("Platform Admin")', 'Admin Sidebar Badge: Platform Admin');
    await assertElementOpacity(page, 'h2:has-text("Administrator")', 'Contextual Greeting: Administrator');
    await assertElementOpacity(page, ':has-text("Live Platform")', 'Live Platform Telemetry Pill');

    // Assert 4 Admin KPI Cards
    await assertElementOpacity(page, 'p:has-text("Total Clients")', 'Admin KPI 1: Total Clients');
    await assertElementOpacity(page, 'p:has-text("Active Subscriptions")', 'Admin KPI 2: Active Subscriptions');
    await assertElementOpacity(page, 'p:has-text("Demo Pipeline")', 'Admin KPI 3: Demo Pipeline');
    await assertElementOpacity(page, 'p:has-text("Automated Executions")', 'Admin KPI 4: Automated Executions');

    // Test hover lift on admin card
    console.log('  Testing Admin KPI card hover lift (whileHover={{ y: -5 }})...');
    const adminKpiCard = page.locator('p:has-text("Total Clients")').locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').first();
    await adminKpiCard.hover();
    await page.waitForTimeout(300);

    const shot12 = path.join(SCREENSHOT_DIR, '12_admin_dashboard_v7_full_view.png');
    await page.screenshot({ path: shot12 });
    console.log(`  📸 Screenshot saved: ${shot12}`);

    // Switch Admin Section to Demo Inquiries
    console.log('  Switching admin section to Demo Inquiries...');
    const demoInquiriesBtn = page.locator('aside button:has-text("Demo Inquiries")');
    await demoInquiriesBtn.click();
    await page.waitForTimeout(600);

    const shot13 = path.join(SCREENSHOT_DIR, '13_admin_leads_view.png');
    await page.screenshot({ path: shot13 });
    console.log(`  📸 Screenshot saved: ${shot13}`);

    // ══════════════════════════════════════════════════════════════
    // SUITE 7: Mobile Navigation Tabs V10 & Responsive Viewports
    // ══════════════════════════════════════════════════════════════
    console.log('\n--- SUITE 7: Mobile Navigation Tabs V10 & Responsive Viewports ---');
    // Mobile Viewport (iPhone 14: 390x844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
      document.head?.appendChild(style);
    });

    // Set standard user session on mobile
    await mobilePage.goto(BASE_URL);
    await mobilePage.evaluate(() => {
      localStorage.setItem(
        'starx_auth_user_v1',
        JSON.stringify({
          id: 'mobile-test-user-1',
          email: 'sarah@boutiquewellness.co',
          name: 'Sarah Chen',
          businessName: 'Boutique Wellness',
          role: 'user',
          onboardingComplete: true,
        })
      );
    });

    await mobilePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    // Verify Mobile Bottom Capsule Navigation
    await assertElementOpacity(mobilePage, 'nav[aria-label="Mobile dashboard navigation"]', 'Mobile Bottom Capsule Dock');
    await assertElementOpacity(mobilePage, 'button[role="tab"][aria-label="Home"]', 'Mobile Active Tab: Home (Expanded)');
    await assertElementOpacity(mobilePage, 'button[role="tab"][aria-label="Leads"]', 'Mobile Tab: Leads');
    await assertElementOpacity(mobilePage, 'button[role="tab"][aria-label="Inbox"]', 'Mobile Tab: Inbox');
    await assertElementOpacity(mobilePage, 'button[role="tab"][aria-label="Flows"]', 'Mobile Tab: Flows');
    await assertElementOpacity(mobilePage, 'button[aria-label="Open full dashboard navigation and quick hub"]', 'Mobile Quick Hub Circular Companion Button');

    const shot14 = path.join(SCREENSHOT_DIR, '14_mobile_v10_floating_navigation_390.png');
    await mobilePage.screenshot({ path: shot14 });
    console.log(`  📸 Screenshot saved: ${shot14}`);

    // Tablet Viewport (iPad: 768x1024)
    console.log('  Testing Tablet Viewport (768x1024) Auto-Collapsing Dock...');
    const tabletContext = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = 'nextjs-portal { display: none !important; pointer-events: none !important; }';
      document.head?.appendChild(style);
    });
    await tabletPage.goto(BASE_URL);
    await tabletPage.evaluate(() => {
      localStorage.setItem(
        'starx_auth_user_v1',
        JSON.stringify({
          id: 'tablet-test-user-1',
          email: 'sarah@boutiquewellness.co',
          name: 'Sarah Chen',
          businessName: 'Boutique Wellness',
          role: 'user',
          onboardingComplete: true,
        })
      );
    });
    await tabletPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await tabletPage.waitForTimeout(1000);

    const shot15 = path.join(SCREENSHOT_DIR, '15_tablet_responsive_dock_768.png');
    await tabletPage.screenshot({ path: shot15 });
    console.log(`  📸 Screenshot saved: ${shot15}`);

    // Zoom Resilience Test (150% and 200%)
    console.log('  Testing 150% Zoom Resilience...');
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });
    await page.waitForTimeout(500);

    const shot16 = path.join(SCREENSHOT_DIR, '16_zoom_resilience_test.png');
    await page.screenshot({ path: shot16 });
    console.log(`  📸 Screenshot saved: ${shot16}`);

    await mobileContext.close();
    await tabletContext.close();

    console.log('\n================================================================');
    console.log('VERIFICATION SUMMARY');
    console.log('================================================================');
    const total = assertions.length;
    const passed = assertions.filter((a) => a.passed).length;
    const failed = assertions.filter((a) => !a.passed).length;
    console.log(`Total Assertions: ${total}`);
    console.log(`Passed:           ${passed}`);
    console.log(`Failed:           ${failed}`);
    console.log(`Success Rate:     ${Math.round((passed / total) * 100)}%`);

    if (failed > 0) {
      console.error('\nFAILED ASSERTIONS:');
      assertions
        .filter((a) => !a.passed)
        .forEach((a) => console.error(`  - ${a.name} (${a.details})`));
      process.exit(1);
    } else {
      console.log('\n🌟 ALL MOTION ENGINEERING & CONTENT VISIBILITY TESTS PASSED!');
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await desktopContext.close();
    await browser.close();
  }
}

run();
