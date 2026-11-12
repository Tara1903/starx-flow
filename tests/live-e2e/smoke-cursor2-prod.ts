import { chromium, Page } from 'playwright';

const BASE_URL = process.env.PROD_BASE_URL || 'https://starx-flow.runs-on.dev';

interface RouteCheckResult {
  route: string;
  viewport: 'desktop' | 'mobile';
  finalUrl: string;
  httpStatus: number;
  cursorEnabled: boolean;
  cursorActive: boolean;
  layerCount: number;
  dotCount: number;
  ringCount: number;
  horizontalOverflowPx: number;
  consoleErrors: string[];
  pageErrors: string[];
  failedAssetUrls: string[];
  notes: string[];
}

function attachListeners(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedAssetUrls: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (
      res.status() >= 400 &&
      url.startsWith(BASE_URL) &&
      (url.includes('/_next/') || url.endsWith('.js') || url.endsWith('.css'))
    ) {
      failedAssetUrls.push(`${res.status()} ${url}`);
    }
  });

  return { consoleErrors, pageErrors, failedAssetUrls };
}

async function getCursorDomMetrics(page: Page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const layer = document.querySelector('[data-testid="starx-cursor-layer"], .starx-cursor-layer');
    const dot = document.querySelector('[data-testid="starx-cursor-dot"], .starx-cursor-dot');
    const ring = document.querySelector('[data-testid="starx-cursor-ring"], .starx-cursor-ring');
    const dotRect = dot?.getBoundingClientRect();
    const ringRect = ring?.getBoundingClientRect();
    return {
      cursorEnabled: html.classList.contains('starx-cursor-enabled'),
      cursorActive: html.classList.contains('starx-cursor-active'),
      cursorNative: html.classList.contains('starx-cursor-native'),
      cursorMode: layer?.getAttribute('data-mode') || null,
      cursorVariant: ring?.getAttribute('data-variant') || null,
      cursorLabel: ring?.textContent?.trim() || null,
      layerCount: document.querySelectorAll('[data-testid="starx-cursor-layer"], .starx-cursor-layer').length,
      dotCount: document.querySelectorAll('[data-testid="starx-cursor-dot"], .starx-cursor-dot').length,
      ringCount: document.querySelectorAll('[data-testid="starx-cursor-ring"], .starx-cursor-ring').length,
      dotCenter: dotRect
        ? { x: dotRect.left + dotRect.width / 2, y: dotRect.top + dotRect.height / 2 }
        : null,
      ringCenter: ringRect
        ? { x: ringRect.left + ringRect.width / 2, y: ringRect.top + ringRect.height / 2, w: ringRect.width }
        : null,
      overflowPx: Math.max(0, Math.round(document.documentElement.scrollWidth - window.innerWidth)),
    };
  });
}

async function inspectRoute(
  browser: import('playwright').Browser,
  route: string,
  viewport: 'desktop' | 'mobile',
  extraCheck?: (page: Page, notes: string[]) => Promise<void>
): Promise<RouteCheckResult> {
  const context = await browser.newContext(
    viewport === 'desktop'
      ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
      : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  );
  const page = await context.newPage();
  const { consoleErrors, pageErrors, failedAssetUrls } = attachListeners(page);
  const notes: string[] = [];

  try {
    const resp = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);

    if (viewport === 'desktop') {
      await page.mouse.move(400, 300);
      await page.waitForTimeout(150);
    }

    if (extraCheck) {
      await extraCheck(page, notes);
    }

    const metrics = await getCursorDomMetrics(page);

    return {
      route,
      viewport,
      finalUrl: page.url(),
      httpStatus: resp?.status() ?? 0,
      cursorEnabled: metrics.cursorEnabled,
      cursorActive: metrics.cursorActive,
      layerCount: metrics.layerCount,
      dotCount: metrics.dotCount,
      ringCount: metrics.ringCount,
      horizontalOverflowPx: metrics.overflowPx,
      consoleErrors,
      pageErrors,
      failedAssetUrls,
      notes,
    };
  } finally {
    await context.close();
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results: RouteCheckResult[] = [];
  let hardFailures = 0;

  try {
    // 1. Desktop `/` with physics + hover inversion + spotlight check
    results.push(
      await inspectRoute(browser, '/', 'desktop', async (page, notes) => {
        await page.mouse.move(160, 160);
        await page.waitForTimeout(250);
        await page.mouse.move(760, 420);
        await page.waitForTimeout(20);
        const immediate = await getCursorDomMetrics(page);
        if (immediate.dotCenter && immediate.ringCenter) {
          const dotErr = Math.hypot(immediate.dotCenter.x - 760, immediate.dotCenter.y - 420);
          const ringLag = Math.hypot(immediate.ringCenter.x - 760, immediate.ringCenter.y - 420);
          notes.push(`physics_immediate(dotErr=${dotErr.toFixed(2)}px, ringLag=${ringLag.toFixed(2)}px)`);
          if (dotErr > 4) throw new Error(`Dot lag too high on prod: ${dotErr.toFixed(2)}px`);
        }

        let settledDiff = 999;
        let settledW = 0;
        for (let i = 0; i < 24; i += 1) {
          await page.waitForTimeout(50);
          const settled = await getCursorDomMetrics(page);
          if (settled.dotCenter && settled.ringCenter) {
            settledDiff = Math.hypot(
              settled.dotCenter.x - settled.ringCenter.x,
              settled.dotCenter.y - settled.ringCenter.y
            );
            settledW = settled.ringCenter.w;
            if (settledDiff <= 3.5) break;
          }
        }
        notes.push(`physics_settled(diff=${settledDiff.toFixed(2)}px, ringW=${settledW.toFixed(1)}px)`);
        if (settledDiff > 4) throw new Error(`Ring did not settle near dot: ${settledDiff.toFixed(2)}px`);

        const primaryCta = page.locator('a[href="/setup/welcome"] button, button:has-text("Start")').first();
        if ((await primaryCta.count()) > 0) {
          await primaryCta.scrollIntoViewIfNeeded();
          const box = await primaryCta.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(250);
            const hoverM = await getCursorDomMetrics(page);
            notes.push(`hero_cta_hover(variant=${hoverM.cursorVariant}, ringW=${hoverM.ringCenter?.w?.toFixed(1) ?? 'n/a'})`);
          }
        }

        const spotlightCard = page.locator('[data-cursor-spotlight="true"]').first();
        if ((await spotlightCard.count()) > 0) {
          await spotlightCard.scrollIntoViewIfNeeded();
          const box = await spotlightCard.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45);
            await page.waitForTimeout(180);
            const vars = await spotlightCard.evaluate((el) => ({
              x: getComputedStyle(el).getPropertyValue('--spotlight-x').trim(),
              y: getComputedStyle(el).getPropertyValue('--spotlight-y').trim(),
            }));
            notes.push(`spotlight(${vars.x || 'unset'}, ${vars.y || 'unset'})`);
          }
        }
      })
    );

    // 2. Desktop `/pricing`
    results.push(await inspectRoute(browser, '/pricing', 'desktop'));

    // 3. Desktop `/product`
    results.push(await inspectRoute(browser, '/product', 'desktop'));

    // 4. Desktop `/signup` (redirects to `/setup/welcome`, native I-beam on inputs)
    results.push(
      await inspectRoute(browser, '/signup', 'desktop', async (page, notes) => {
        const input = page.locator('input[type="email"], input[type="text"], input:not([type="hidden"])').first();
        if ((await input.count()) > 0) {
          await input.scrollIntoViewIfNeeded();
          const box = await input.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(150);
            const m = await getCursorDomMetrics(page);
            notes.push(`signup_input_native=${m.cursorNative}`);
          }
        }
      })
    );

    // 5. Desktop `/login` and `/admin/login` check
    results.push(await inspectRoute(browser, '/login', 'desktop'));
    results.push(await inspectRoute(browser, '/admin/login', 'desktop'));

    // 6. Desktop `/dashboard`
    results.push(
      await inspectRoute(browser, '/dashboard', 'desktop', async (page, notes) => {
        await page.waitForTimeout(1000);
        const bodyLen = await page.evaluate(() => document.body.innerText.trim().length);
        notes.push(`dashboard_text_len=${bodyLen}`);
      })
    );

    // 7. Desktop `/cursor-playground` (production restricted) & `?qa=verify` (QA unlocked)
    results.push(
      await inspectRoute(browser, '/cursor-playground', 'desktop', async (page, notes) => {
        const restricted = await page.locator('[data-testid="pg-production-restricted"]').count();
        const unlocked = await page.locator('[data-testid="pg-btn-primary"]').count();
        notes.push(`restricted=${restricted}, unlocked=${unlocked}`);
        if (restricted !== 1 || unlocked !== 0) {
          throw new Error(`/cursor-playground production gate failed (restricted=${restricted}, unlocked=${unlocked})`);
        }
      })
    );

    results.push(
      await inspectRoute(browser, '/cursor-playground?qa=verify', 'desktop', async (page, notes) => {
        const primary = page.locator('[data-testid="pg-btn-primary"]');
        const pCount = await primary.count();
        if (pCount !== 1) throw new Error('?qa=verify did not unlock playground');
        await primary.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        const box = await primary.boundingBox();
        if (box) {
          const beforeBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(300);
          const afterBg = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
          const m = await getCursorDomMetrics(page);
          notes.push(`pg_primary_bg(${beforeBg} -> ${afterBg}, variant=${m.cursorVariant}, mode=${m.cursorMode})`);
          if (beforeBg === afterBg) throw new Error(`Primary button did not invert on live hover (${beforeBg} -> ${afterBg})`);
        }
      })
    );

    // 8. Desktop `/collections` exclusion
    results.push(
      await inspectRoute(browser, '/collections', 'desktop', async (page, notes) => {
        const m = await getCursorDomMetrics(page);
        notes.push(`collections_excluded(enabled=${m.cursorEnabled}, layers=${m.layerCount})`);
        if (m.cursorEnabled || m.layerCount !== 0) {
          throw new Error('/collections must exclude custom cursor');
        }
      })
    );

    // 9. Mobile touch `/` `/pricing` `/product`
    for (const r of ['/', '/pricing', '/product']) {
      results.push(
        await inspectRoute(browser, r, 'mobile', async (page, notes) => {
          const m = await getCursorDomMetrics(page);
          notes.push(`mobile_touch(enabled=${m.cursorEnabled}, layers=${m.layerCount}, overflow=${m.overflowPx}px)`);
          if (m.cursorEnabled || m.layerCount !== 0) {
            throw new Error(`Mobile route ${r} must disable custom cursor`);
          }
          if (m.overflowPx > 0) {
            throw new Error(`Mobile route ${r} overflow=${m.overflowPx}px`);
          }
        })
      );
    }

    for (const r of results) {
      const okStatus =
        r.route === '/login'
          ? r.httpStatus >= 200
          : r.httpStatus >= 200 && r.httpStatus < 400;
      const okErrors =
        r.route === '/login'
          ? r.pageErrors.length === 0 && r.failedAssetUrls.length === 0
          : r.consoleErrors.length === 0 && r.pageErrors.length === 0 && r.failedAssetUrls.length === 0;
      if (!okStatus || !okErrors || r.horizontalOverflowPx > 0) {
        hardFailures++;
      }
    }

    console.log(JSON.stringify({ baseUrl: BASE_URL, hardFailures, results }, null, 2));
    if (hardFailures > 0) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('LIVE SMOKE TEST FAILED:', err);
  process.exit(1);
});
