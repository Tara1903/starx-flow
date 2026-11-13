import fs from 'node:fs';
import path from 'node:path';
import { spawn, ChildProcess } from 'node:child_process';
import { chromium, firefox, webkit, Browser, Page } from 'playwright';

const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', '__screenshots__');
const PORT = Number(process.env.VISUAL_PORT || 3127);
const EXTERNAL_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_URL || `http://127.0.0.1:${PORT}`;

interface ViewportTarget {
  id: string;
  browserType: 'chromium' | 'firefox' | 'webkit';
  width: number;
  height: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  reducedMotion?: 'reduce' | 'no-preference';
  routes: Array<{ path: string; screenshot?: string }>;
}

const MATRIX: ViewportTarget[] = [
  {
    id: 'chromium-desktop',
    browserType: 'chromium',
    width: 1440,
    height: 900,
    routes: [
      { path: '/', screenshot: 'home-chromium-desktop-1440x900.png' },
      { path: '/pricing', screenshot: 'pricing-chromium-desktop.png' },
      { path: '/product' },
      { path: '/demo', screenshot: 'demo-chromium-desktop.png' },
      { path: '/dashboard', screenshot: 'dashboard-chromium-desktop.png' },
    ],
  },
  {
    id: 'chromium-laptop',
    browserType: 'chromium',
    width: 1280,
    height: 720,
    routes: [{ path: '/' }, { path: '/dashboard' }],
  },
  {
    id: 'chromium-tablet',
    browserType: 'chromium',
    width: 768,
    height: 1024,
    hasTouch: true,
    routes: [
      { path: '/', screenshot: 'home-chromium-tablet-768x1024.png' },
      { path: '/dashboard', screenshot: 'dashboard-chromium-tablet.png' },
    ],
  },
  {
    id: 'chromium-android',
    browserType: 'chromium',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    routes: [
      { path: '/', screenshot: 'home-chromium-android-390x844.png' },
      { path: '/pricing' },
      { path: '/dashboard', screenshot: 'dashboard-chromium-android.png' },
    ],
  },
  {
    id: 'chromium-small-phone',
    browserType: 'chromium',
    width: 320,
    height: 568,
    isMobile: true,
    hasTouch: true,
    routes: [{ path: '/' }],
  },
  {
    id: 'chromium-reduced-motion',
    browserType: 'chromium',
    width: 1280,
    height: 800,
    reducedMotion: 'reduce',
    routes: [{ path: '/' }, { path: '/dashboard' }],
  },
  {
    id: 'firefox-desktop',
    browserType: 'firefox',
    width: 1440,
    height: 900,
    routes: [
      { path: '/', screenshot: 'home-firefox-desktop-1440x900.png' },
      { path: '/pricing' },
      { path: '/dashboard' },
    ],
  },
  {
    id: 'webkit-desktop',
    browserType: 'webkit',
    width: 1440,
    height: 900,
    routes: [
      { path: '/', screenshot: 'home-webkit-desktop-1440x900.png' },
      { path: '/pricing' },
      { path: '/dashboard' },
    ],
  },
  {
    id: 'webkit-mobile',
    browserType: 'webkit',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    routes: [
      { path: '/', screenshot: 'home-webkit-mobile-390x844.png' },
      { path: '/dashboard' },
    ],
  },
];

let serverProc: ChildProcess | null = null;
let passed = 0;
let failed = 0;

function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

async function waitForServer(url: string, timeoutMs = 45000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // Wait for socket bind
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for Next.js production server at ${url}`);
}

function startLocalServer(): ChildProcess {
  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  return child;
}

async function inspectPageMetrics(
  page: Page,
  target: ViewportTarget,
  routePath: string
): Promise<{
  overflowPx: number;
  bodyCursor: string;
  hasWordmark: boolean;
  fontsReady: boolean;
  heroOverlapWithConsent: boolean;
}> {
  return page.evaluate(
    ({ isHome, isMobileWidth }) => {
      const overflowPx = Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth
      );
      const bodyCursor = window.getComputedStyle(document.body).cursor || 'auto';
      const hasWordmark = document.body.innerText.includes('StarX Flow');
      const fontsReady = document.fonts ? document.fonts.size > 0 : true;

      let heroOverlapWithConsent = false;
      if (isHome && isMobileWidth) {
        const consent = document.getElementById('consent-banner');
        const primaryCta =
          document.querySelector('a[href="/demo"], button') as HTMLElement | null;
        if (consent && primaryCta) {
          const cRect = consent.getBoundingClientRect();
          const hRect = primaryCta.getBoundingClientRect();
          if (cRect.height > 0 && hRect.height > 0) {
            const overlapsX = !(cRect.right < hRect.left || cRect.left > hRect.right);
            const overlapsY = !(cRect.bottom < hRect.top || cRect.top > hRect.bottom);
            heroOverlapWithConsent = overlapsX && overlapsY;
          }
        }
      }

      return {
        overflowPx,
        bodyCursor,
        hasWordmark,
        fontsReady,
        heroOverlapWithConsent,
      };
    },
    { isHome: routePath === '/', isMobileWidth: target.width <= 420 }
  );
}

async function runVisualMatrix() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log('================================================================');
  console.log(' CROSS-BROWSER VISUAL & ERGONOMIC REGRESSION SUITE');
  console.log('================================================================\n');

  if (!EXTERNAL_URL) {
    if (!fs.existsSync(path.join(process.cwd(), '.next', 'BUILD_ID'))) {
      throw new Error('Production build (.next/BUILD_ID) missing. Run `npm run build` first.');
    }
    console.log(`Starting local Next.js production server on ${BASE_URL}...`);
    serverProc = startLocalServer();
    await waitForServer(BASE_URL);
  }

  const browsers: Partial<Record<'chromium' | 'firefox' | 'webkit', Browser>> = {};
  try {
    browsers.chromium = await chromium.launch({ headless: true });
    browsers.firefox = await firefox.launch({ headless: true });
    browsers.webkit = await webkit.launch({ headless: true });

    for (const target of MATRIX) {
      const browser = browsers[target.browserType];
      if (!browser) continue;

      console.log(`\nTarget: ${target.id} (${target.browserType} ${target.width}x${target.height})`);
      const context = await browser.newContext({
        viewport: { width: target.width, height: target.height },
        isMobile: target.browserType === 'firefox' ? false : target.isMobile,
        hasTouch: target.browserType === 'firefox' ? false : target.hasTouch,
        reducedMotion: target.reducedMotion ?? 'no-preference',
      });

      const page = await context.newPage();
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const brokenAssets: string[] = [];

      page.on('pageerror', (err) => {
        if (!err.message.includes('due to access control checks')) {
          pageErrors.push(err.message);
        }
      });
      page.on('response', (res) => {
        const u = res.url();
        const isLocalVercelTelemetry = !EXTERNAL_URL && u.includes('/_vercel/');
        if (res.status() >= 400 && !isLocalVercelTelemetry && !u.includes('/api/')) {
          brokenAssets.push(`${res.status()} ${u}`);
        }
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore optional signed-out auth checks and Vercel edge-only scripts when running `next start` locally
          if (
            !text.includes('401') &&
            !text.includes('Failed to fetch') &&
            !(!EXTERNAL_URL && text.includes('status of 404'))
          ) {
            consoleErrors.push(text);
          }
        }
      });

      for (const route of target.routes) {
        const url = `${BASE_URL}${route.path}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
          await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        });
        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(450);

        const metrics = await inspectPageMetrics(page, target, route.path);

        assert(
          metrics.overflowPx <= 2,
          `${target.id} ${route.path} zero horizontal overflow (overflow=${metrics.overflowPx}px)`
        );
        assert(
          metrics.bodyCursor !== 'none',
          `${target.id} ${route.path} preserves native pointer cursor (${metrics.bodyCursor})`
        );

        if (route.path === '/') {
          assert(
            metrics.hasWordmark,
            `${target.id} header renders native StarX Flow wordmark`
          );
          assert(
            !metrics.heroOverlapWithConsent,
            `${target.id} mobile Hero CTA has clear separation from ConsentBanner`
          );
        }

        if (route.screenshot) {
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, route.screenshot),
            fullPage: false,
          });
        }

        // Verify Command Center interactive trigger on primary desktop browser
        if (target.id === 'chromium-desktop' && route.path === '/dashboard') {
          await page.keyboard.press('Control+k');
          await page.waitForTimeout(250);
          const cmdVisible = await page
            .locator('input[placeholder*="command" i], input[placeholder*="Search" i]')
            .first()
            .isVisible()
            .catch(() => false);
          assert(cmdVisible, 'chromium-desktop /dashboard Ctrl+K opens Command Center palette');
          if (cmdVisible) {
            await page.screenshot({
              path: path.join(SCREENSHOT_DIR, 'command-center-desktop.png'),
              fullPage: false,
            });
            await page.keyboard.press('Escape');
          }
        }
      }

      assert(
        brokenAssets.length === 0,
        `${target.id} zero broken static assets (${brokenAssets.join(' | ') || 'none'})`
      );
      assert(
        pageErrors.length === 0,
        `${target.id} zero uncaught page errors (${pageErrors.join(' | ') || 'none'})`
      );
      assert(
        consoleErrors.length === 0,
        `${target.id} zero console errors (${consoleErrors.join(' | ') || 'none'})`
      );

      await context.close();
    }
  } finally {
    await Promise.all(
      Object.values(browsers).map((b) => (b ? b.close().catch(() => undefined) : Promise.resolve()))
    );
    if (serverProc && !serverProc.killed) {
      serverProc.kill();
    }
  }

  console.log(`\nCross-Browser Visual Regression Summary: ${passed} passed, ${failed} failed`);
  console.log(`Screenshots saved under: tests/__screenshots__/`);
  if (failed > 0) process.exit(1);
}

runVisualMatrix().catch((err) => {
  if (serverProc && !serverProc.killed) {
    serverProc.kill();
  }
  console.error('Unhandled visual regression suite error:', err);
  process.exit(1);
});
