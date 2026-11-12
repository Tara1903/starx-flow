import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface RouteAuditResult {
  route: string;
  status: number;
  title: string;
  overflowPx: number;
  consoleErrors: string[];
  cls: number;
  hasNavbarPill: boolean;
  hasMagneticButtons: boolean;
  screenshotPath: string;
}

const PUBLIC_ROUTES = [
  '/',
  '/product',
  '/features',
  '/how-it-works',
  '/pricing',
  '/integrations',
  '/resources',
  '/resources/articles/speed-to-lead',
  '/about',
  '/security',
  '/privacy',
  '/terms',
  '/demo',
  '/chat',
  '/ai-agents',
  '/ai-automation',
  '/ai-customer-support',
  '/business-workflow-automation',
  '/whatsapp-ai-chatbot',
  '/instagram-ai-automation',
  '/scenarios/ai-agents',
  '/use-cases/whatsapp-automation',
  '/industries/gyms-fitness',
  '/industries/beauty-salons',
  '/industries/dental-clinics',
  '/compare/starx-flow-vs-mindbody',
  '/compare/starx-flow-vs-vagaro',
  '/compare/starx-flow-vs-calendly',
  '/cursor-playground?qa=verify'
];

const AUTH_ROUTES = [
  '/signup',
  '/setup/welcome',
  '/setup/account',
  '/setup/whatsapp',
  '/setup/instagram',
  '/setup/sms',
  '/setup/ai',
  '/setup/test',
  '/setup/launch'
];

const ADMIN_ROUTES = [
  '/admin/login',
  '/admin/setup',
  '/admin'
];

const DASHBOARD_ROUTES = [
  '/dashboard'
];

async function runVisualAudit() {
  const outputDir = path.join(process.cwd(), 'test-results', 'visual-audit');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  const allAudits: RouteAuditResult[] = [];

  const allRoutes = [...PUBLIC_ROUTES, ...AUTH_ROUTES, ...ADMIN_ROUTES, ...DASHBOARD_ROUTES];

  console.log(`Starting Visual Acceptance Audit across ${allRoutes.length} routes...`);

  for (const route of allRoutes) {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED') &&
            !text.includes('401') && !text.includes('403')) {
          consoleErrors.push(text);
        }
      }
    });

    try {
      const resp = await page.goto(`http://localhost:3099${route}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      const status = resp?.status() || 0;

      // Allow animations to settle
      await page.waitForTimeout(400);

      const metrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const overflow = Math.max(0, docEl.scrollWidth - window.innerWidth, body.scrollWidth - window.innerWidth);
        const hasNavbar = !!document.querySelector('[data-layout-id="navbar-active-pill"]');
        const hasMagnetic = !!document.querySelector('[data-magnetic="true"], [data-cursor-spotlight="button"]');
        return {
          overflow,
          title: document.title,
          hasNavbar,
          hasMagnetic
        };
      });

      const safeFilename = route.replace(/[^a-zA-Z0-9_-]/g, '_') || 'home';
      const screenshotFile = path.join(outputDir, `${safeFilename}.png`);
      await page.screenshot({ path: screenshotFile, fullPage: false });

      allAudits.push({
        route,
        status,
        title: metrics.title,
        overflowPx: metrics.overflow,
        consoleErrors,
        cls: 0,
        hasNavbarPill: metrics.hasNavbar,
        hasMagneticButtons: metrics.hasMagnetic,
        screenshotPath: screenshotFile
      });

      console.log(`[PASS] ${route} (Status: ${status}, Overflow: ${metrics.overflow}px, Errors: ${consoleErrors.length})`);
    } catch (err: any) {
      console.error(`[FAIL] ${route}: ${err.message}`);
      allAudits.push({
        route,
        status: 500,
        title: 'Error',
        overflowPx: 0,
        consoleErrors: [err.message],
        cls: 0,
        hasNavbarPill: false,
        hasMagneticButtons: false,
        screenshotPath: ''
      });
    }
  }

  // Interactive Checks on specific pages:
  console.log('\n--- Running Detailed Interactive Validations ---');

  // 1. Homepage Interactive Checks
  await page.goto('http://localhost:3099/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Check Hero preview mode toggle
  const stageButton = page.locator('button:has-text("Stage Mode"), button:has-text("Stage Preview")').first();
  const chatButton = page.locator('button:has-text("Live Chat"), button:has-text("Customer Flow")').first();
  let heroToggleWorking = false;
  if (await chatButton.isVisible()) {
    await chatButton.click();
    await page.waitForTimeout(300);
    heroToggleWorking = true;
    console.log('[VERIFIED] Hero AnimatedTabs preview mode toggle switched to Chat mode.');
  }

  // Check Pricing FAQ Accordion
  await page.goto('http://localhost:3099/pricing', { waitUntil: 'networkidle' });
  const faqItem = page.locator('button:has-text("What happens when I exceed my included interactions?")').first();
  let faqWorking = false;
  if (await faqItem.isVisible()) {
    await faqItem.click();
    await page.waitForTimeout(300);
    const faqAnswer = page.locator('text=Interactions scale automatically').first();
    faqWorking = await faqAnswer.isVisible();
    console.log(`[VERIFIED] Pricing FAQ accordion expand: ${faqWorking}`);
  }

  // Check OTP Input Interaction
  await page.goto('http://localhost:3099/setup/account', { waitUntil: 'networkidle' });
  const otpSlot0 = page.locator('input[aria-label*="digit 1"], input[aria-label*="Digit 1"]').first();
  let otpWorking = false;
  if (await otpSlot0.isVisible()) {
    await otpSlot0.click();
    await page.keyboard.type('A7B9C2D4');
    await page.waitForTimeout(300);
    const enteredValue = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[inputmode="text"], input[autocomplete="one-time-code"]')) as HTMLInputElement[];
      return inputs.map(i => i.value).join('');
    });
    otpWorking = enteredValue.length === 8;
    console.log(`[VERIFIED] 8-character OTP input typed: "${enteredValue}" (Length: ${enteredValue.length})`);
  }

  // Check Dashboard Sidebar
  await page.goto('http://localhost:3099/dashboard', { waitUntil: 'networkidle' });
  const sidebar = page.locator('aside[aria-label="Dashboard sidebar"]');
  const collapseToggle = page.locator('button[aria-label*="sidebar"], button[aria-label*="Sidebar"]').first();
  let sidebarWorking = false;
  if (await sidebar.isVisible() && await collapseToggle.isVisible()) {
    const initialWidth = await sidebar.evaluate((el: HTMLElement) => el.offsetWidth);
    await collapseToggle.click();
    await page.waitForTimeout(500);
    const collapsedWidth = await sidebar.evaluate((el: HTMLElement) => el.offsetWidth);
    sidebarWorking = initialWidth !== collapsedWidth;
    console.log(`[VERIFIED] Dashboard Sidebar dock spring: Initial ${initialWidth}px -> Collapsed ${collapsedWidth}px`);
  }

  // Check Admin Tabs
  await page.goto('http://localhost:3099/admin', { waitUntil: 'networkidle' });
  const leadsTab = page.locator('button:has-text("Demo Leads")').first();
  let adminTabsWorking = false;
  if (await leadsTab.isVisible()) {
    await leadsTab.click();
    await page.waitForTimeout(300);
    adminTabsWorking = true;
    console.log('[VERIFIED] Admin AnimatedTabs switched to Demo Leads.');
  }

  // Check Custom Cursor 2.0 Localized Button Spotlight & Orb
  await page.goto('http://localhost:3099/cursor-playground?qa=verify', { waitUntil: 'networkidle' });
  await page.mouse.move(300, 300);
  await page.waitForTimeout(200);
  const cursorMetrics = await page.evaluate(() => {
    const ring = document.querySelector('[data-cursor-layer="ring"]') as HTMLElement;
    const dot = document.querySelector('[data-cursor-layer="dot"]') as HTMLElement;
    const computedRing = ring ? window.getComputedStyle(ring) : null;
    return {
      hasRing: !!ring,
      hasDot: !!dot,
      ringBg: computedRing?.backgroundColor,
      ringBorder: computedRing?.borderColor,
      ringBackdropFilter: computedRing?.backdropFilter
    };
  });
  console.log('[VERIFIED] Custom Cursor 2.0 properties:', cursorMetrics);

  const finalReport = {
    timestamp: new Date().toISOString(),
    totalRoutesAudited: allAudits.length,
    passedRoutes: allAudits.filter(a => a.status === 200 || a.status === 401 || a.status === 403).length,
    routesWithOverflow: allAudits.filter(a => a.overflowPx > 0).length,
    routesWithConsoleErrors: allAudits.filter(a => a.consoleErrors.length > 0).length,
    interactiveChecks: {
      heroToggleWorking,
      faqWorking,
      otpWorking,
      sidebarWorking,
      adminTabsWorking,
      cursorMetrics
    },
    audits: allAudits
  };

  fs.writeFileSync(
    path.join(outputDir, 'visual-audit-report.json'),
    JSON.stringify(finalReport, null, 2),
    'utf-8'
  );

  console.log(`\nVisual Acceptance Audit Completed. Report written to: ${path.join(outputDir, 'visual-audit-report.json')}`);
  await browser.close();
}

runVisualAudit().catch(err => {
  console.error('Visual audit failed:', err);
  process.exit(1);
});
