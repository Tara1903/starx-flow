import fs from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { chromium, firefox, webkit, type Browser, type Page } from 'playwright';

const PORT = Number(process.env.CURSOR_QA_PORT || 3139);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${PORT}`;
const REPORT_SCREENSHOT_DIR = path.join(process.cwd(), 'tests', '__screenshots__', 'cursor2');

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

async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 307 || res.status === 308) return;
    } catch {
      // retry until ready
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for Next.js production server at ${url}`);
}

async function stopLocalServer(): Promise<void> {
  if (!serverProc) return;
  try {
    if (process.platform === 'win32' && serverProc.pid) {
      spawn('taskkill', ['/PID', String(serverProc.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      serverProc.kill('SIGTERM');
    }
  } catch {
    // ignore cleanup error
  }
  serverProc = null;
}

async function getBoxInView(locator: ReturnType<Page['getByTestId']>) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Target element boundingBox missing');
  return box;
}

async function getLayerCenters(page: Page) {
  return page.evaluate(() => {
    const dot = document.querySelector('[data-testid="starx-cursor-dot"]') as HTMLElement | null;
    const ring = document.querySelector('[data-testid="starx-cursor-ring"]') as HTMLElement | null;
    const layer = document.querySelector('[data-testid="starx-cursor-layer"]') as HTMLElement | null;
    const dotRect = dot?.getBoundingClientRect();
    const ringRect = ring?.getBoundingClientRect();

    return {
      dotCount: document.querySelectorAll('[data-testid="starx-cursor-dot"]').length,
      ringCount: document.querySelectorAll('[data-testid="starx-cursor-ring"]').length,
      layerVisible: layer?.getAttribute('data-visible'),
      layerNative: layer?.getAttribute('data-native'),
      layerMode: layer?.getAttribute('data-mode'),
      ringMode: ring?.getAttribute('data-mode'),
      ringPressed: ring?.getAttribute('data-pressed'),
      ringVariant: ring?.getAttribute('data-variant'),
      ringText: ring?.textContent?.trim() || '',
      dotX: dotRect ? dotRect.left + dotRect.width / 2 : -1,
      dotY: dotRect ? dotRect.top + dotRect.height / 2 : -1,
      ringX: ringRect ? ringRect.left + ringRect.width / 2 : -1,
      ringY: ringRect ? ringRect.top + ringRect.height / 2 : -1,
      ringWidth: ringRect ? ringRect.width : 0,
      ringTransform: ring ? window.getComputedStyle(ring).transform : '',
      bodyCursor: window.getComputedStyle(document.body).cursor,
      hasEnabledClass: document.documentElement.classList.contains('starx-cursor-enabled'),
      hasNativeClass: document.documentElement.classList.contains('starx-cursor-native'),
    };
  });
}

async function runCoreDesktopSuite(browser: Browser, labelPrefix: string, browserKind: 'chromium' | 'firefox' | 'webkit') {
  console.log(`\nRunning Dual-Layer Cursor 2.0 Suite on ${labelPrefix} (1440x900)...`);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  // Check production restriction without ?qa=verify before unlocking QA lab
  if (browserKind === 'chromium') {
    await page.goto(`${BASE_URL}/cursor-playground`, { waitUntil: 'load', timeout: 30000 });
    const restrictedVisible = await page.getByTestId('pg-production-restricted').isVisible().catch(() => false);
    assert(
      restrictedVisible,
      `${labelPrefix}: /cursor-playground enforces production access guard when ?qa=verify omitted`,
    );
  }

  // Navigate to QA Playground with authorized QA param
  await page.goto(`${BASE_URL}/cursor-playground?qa=verify`, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
    await page.goto(`${BASE_URL}/cursor-playground?qa=verify`, { waitUntil: 'load', timeout: 30000 });
  });
  await page.getByTestId('starx-cursor-layer').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(120);

  // 1. Activate cursor via initial move
  await page.mouse.move(180, 260);
  await page.waitForTimeout(180);

  const initial = await getLayerCenters(page);
  assert(
    initial.dotCount === 1 && initial.ringCount === 1,
    `${labelPrefix}: strictly 2 tracking elements (1 dot, 1 ring)`,
    `dots=${initial.dotCount}, rings=${initial.ringCount}`,
  );
  assert(
    initial.layerVisible === 'true' && initial.hasEnabledClass,
    `${labelPrefix}: cursor layer visible & root starx-cursor-enabled attached`,
  );
  assert(
    initial.bodyCursor === 'none',
    `${labelPrefix}: native body cursor cleanly hidden while active (${initial.bodyCursor})`,
  );

  // 2. Dual-layer physics test: immediate inner dot + delayed outer ring convergence
  const padBox = await getBoxInView(page.getByTestId('pg-tracking-pad'));

  const pStart = { x: padBox.x + 40, y: padBox.y + 40 };
  const pJump = { x: padBox.x + padBox.width - 50, y: padBox.y + padBox.height - 45 };

  await page.mouse.move(pStart.x, pStart.y);
  await page.waitForTimeout(480);

  // Execute instant large pointer displacement & sample immediately (dot must track 0ms, ring must lag behind)
  await page.mouse.move(pJump.x, pJump.y);
  await page.waitForTimeout(20);
  const midJump = await getLayerCenters(page);

  const dotDeltaJump = Math.hypot(midJump.dotX - pJump.x, midJump.dotY - pJump.y);
  const ringLagMid = Math.hypot(midJump.dotX - midJump.ringX, midJump.dotY - midJump.ringY);

  assert(
    dotDeltaJump <= 3.5,
    `${labelPrefix}: inner dot tracks target immediately (${dotDeltaJump.toFixed(2)}px delta)`,
  );
  assert(
    ringLagMid >= 8,
    `${labelPrefix}: outer circle smoothly trails behind dot rather than teleporting (lag=${ringLagMid.toFixed(2)}px)`,
  );

  // Wait for spring convergence at stopped point (poll up to ~1s across Chromium/Firefox/WebKit headless RAF)
  let ringLagSettled = 999;
  for (let i = 0; i < 24; i += 1) {
    await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
    await page.waitForTimeout(40);
    const settled = await getLayerCenters(page);
    ringLagSettled = Math.hypot(settled.dotX - settled.ringX, settled.dotY - settled.ringY);
    if (ringLagSettled <= 3.5) break;
  }
  assert(
    ringLagSettled <= 3.5,
    `${labelPrefix}: outer ring settles centered around inner dot when stopped (lag=${ringLagSettled.toFixed(2)}px)`,
  );

  // Direction reversal check: bounce left-top corner and confirm outer ring follows dot path & converges
  await page.mouse.move(pStart.x + 20, pStart.y + 30, { steps: 3 });
  await page.waitForTimeout(25);
  const reversed = await getLayerCenters(page);
  const dotReversedDelta = Math.hypot(reversed.dotX - (pStart.x + 20), reversed.dotY - (pStart.y + 30));
  assert(
    dotReversedDelta <= 4,
    `${labelPrefix}: inner dot follows sudden direction reversal immediately (${dotReversedDelta.toFixed(2)}px)`,
  );

  if (browserKind === 'chromium') {
    // 3. Cursor Modes & Contextual Labels
    const hoverBox = await page.getByTestId('pg-state-hover').boundingBox();
    if (!hoverBox) throw new Error('Missing pg-state-hover');
    await page.mouse.move(hoverBox.x + hoverBox.width / 2, hoverBox.y + hoverBox.height / 2);
    await page.waitForTimeout(280);
    const hoverState = await getLayerCenters(page);
    assert(
      hoverState.ringMode === 'hover' && hoverState.ringWidth > 42,
      `${labelPrefix}: hover tile sets mode="hover" & expands outer ring (width=${hoverState.ringWidth.toFixed(1)}px)`,
    );

    const viewBox = await page.getByTestId('pg-label-view').boundingBox();
    if (!viewBox) throw new Error('Missing pg-label-view');
    await page.mouse.move(viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2);
    await page.waitForTimeout(260);
    const labelState = await getLayerCenters(page);
    assert(
      labelState.ringMode === 'label' && labelState.ringText === 'VIEW',
      `${labelPrefix}: contextual label renders VIEW inside enlarged ring`,
    );

    // Anti-flicker across nested children of Primary button
    const primaryBtn = page.getByTestId('pg-btn-primary');
    const beforePrimaryStyle = await primaryBtn.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, bgImage: cs.backgroundImage };
    });

    const primaryBoxLeft = await getBoxInView(primaryBtn);
    await page.mouse.move(primaryBoxLeft.x + 28, primaryBoxLeft.y + primaryBoxLeft.height / 2);
    await page.waitForTimeout(160);
    const hoverPrimaryLeft = await getLayerCenters(page);

    const primaryBoxRight = await getBoxInView(primaryBtn);
    await page.mouse.move(
      primaryBoxRight.x + primaryBoxRight.width - 18,
      primaryBoxRight.y + primaryBoxRight.height / 2,
    );
    await page.waitForTimeout(180);
    const hoverPrimaryRight = await getLayerCenters(page);

    const afterPrimaryStyle = await primaryBtn.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, bgImage: cs.backgroundImage };
    });

    assert(
      hoverPrimaryLeft.ringMode === 'hover' && hoverPrimaryRight.ringMode === 'hover',
      `${labelPrefix}: zero hover flicker across nested child spans/icons`,
    );
    assert(
      afterPrimaryStyle.bg === 'rgb(255, 255, 255)' &&
        afterPrimaryStyle.bg !== beforePrimaryStyle.bg,
      `${labelPrefix}: primary CTA inverts smoothly to white fill (${afterPrimaryStyle.bg})`,
    );

    // Secondary button inversion + click compression + mouse exit restore
    const secBtn = page.getByTestId('pg-btn-secondary');
    const secBox = await getBoxInView(secBtn);
    const secBefore = await secBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    await page.mouse.move(secBox.x + secBox.width / 2, secBox.y + secBox.height / 2);
    await page.waitForTimeout(240);
    const secAfter = await secBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    assert(
      secAfter !== secBefore && !secAfter.startsWith('rgba(11, 20, 17'),
      `${labelPrefix}: secondary CTA inverts cleanly to emerald fill (${secAfter})`,
    );

    // Click compression check
    await page.mouse.down();
    await page.waitForTimeout(80);
    const pressedState = await getLayerCenters(page);
    assert(
      pressedState.ringPressed === 'true' && pressedState.ringMode === 'click',
      `${labelPrefix}: pointerdown triggers click compression state`,
    );
    await page.mouse.up();
    await page.waitForTimeout(100);
    const releasedState = await getLayerCenters(page);
    assert(
      releasedState.ringPressed === 'false',
      `${labelPrefix}: pointerup releases compression cleanly`,
    );

    // White & Outline & Danger inversion checks + keyboard focus-visible inversion
    for (const tid of ['pg-btn-outline', 'pg-btn-white', 'pg-btn-danger'] as const) {
      const el = page.getByTestId(tid);
      const b = await getBoxInView(el);
      const before = await el.evaluate((n) => window.getComputedStyle(n).backgroundColor);
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 2 });
      await page.waitForTimeout(360);
      const after = await el.evaluate((n) => window.getComputedStyle(n).backgroundColor);
      assert(after !== before, `${labelPrefix}: ${tid} background inverts cleanly (${before} -> ${after})`);
    }

    // Keyboard Tab focus-visible inversion check
    await page.mouse.move(10, 10);
    await page.getByTestId('pg-btn-primary').focus();
    await page.keyboard.press('Tab');
    await page.waitForTimeout(320);
    const focusedSecBg = await page
      .getByTestId('pg-btn-secondary')
      .evaluate((n) => window.getComputedStyle(n).backgroundColor);
    assert(
      !focusedSecBg.startsWith('rgba(11, 20, 17'),
      `${labelPrefix}: keyboard :focus-visible inverts secondary CTA (${focusedSecBg})`,
    );

    const disabledBtn = page.getByTestId('pg-btn-disabled');
    const disabledBox = await getBoxInView(disabledBtn);
    await page.mouse.move(disabledBox.x + disabledBox.width / 2, disabledBox.y + disabledBox.height / 2);
    await page.waitForTimeout(160);
    const disState = await getLayerCenters(page);
    assert(
      disState.ringMode === 'disabled',
      `${labelPrefix}: disabled button activates subdued disabled cursor state`,
    );

    // 4. Magnetic bounded pull check
    const magHigh = page.getByTestId('pg-mag-high');
    const magBox = await getBoxInView(magHigh);
    await page.mouse.move(magBox.x + magBox.width - 14, magBox.y + magBox.height - 6);
    await page.waitForTimeout(260);
    const magPull = await magHigh.evaluate((el) => {
      const tr = (el as HTMLElement).style.translate;
      const parts = tr ? tr.split(' ').map((p) => parseFloat(p)) : [0, 0];
      return { tr, dx: Math.abs(parts[0] || 0), dy: Math.abs(parts[1] || 0) };
    });
    assert(
      magPull.dx > 0.5 && magPull.dx <= 15 && magPull.dy <= 15,
      `${labelPrefix}: magnetic CTA pulls smoothly within <=14px clamp (${magPull.tr})`,
    );

    // Exit magnetic CTA -> resets cleanly
    await page.mouse.move(10, 10);
    let magReset = 'pending';
    for (let i = 0; i < 12; i += 1) {
      await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
      await page.waitForTimeout(35);
      magReset = await magHigh.evaluate((el) => (el as HTMLElement).style.translate || '');
      if (magReset === '' || magReset === '0px 0px') break;
    }
    assert(
      magReset === '' || magReset === '0px 0px',
      `${labelPrefix}: magnetic CTA returns cleanly to origin on leave (${magReset || '0'})`,
    );

    // 5. Spotlight card test
    const spotCard = page.getByTestId('pg-spotlight-dark');
    const glassSpot = page.getByTestId('pg-spotlight-glass');
    const spotBox = await getBoxInView(spotCard);
    await page.mouse.move(spotBox.x + 65, spotBox.y + 42);
    await page.waitForTimeout(100);
    const spotVars = await spotCard.evaluate((el) => ({
      op: (el as HTMLElement).style.getPropertyValue('--sx-spot-opacity'),
      x: (el as HTMLElement).style.getPropertyValue('--sx-spot-x'),
      y: (el as HTMLElement).style.getPropertyValue('--sx-spot-y'),
    }));
    const adjacentOp = await glassSpot.evaluate((el) =>
      (el as HTMLElement).style.getPropertyValue('--sx-spot-opacity'),
    );
    assert(
      spotVars.op === '1' && parseFloat(spotVars.x) > 40 && parseFloat(spotVars.y) > 20,
      `${labelPrefix}: CursorSpotlight updates local CSS vars (${spotVars.x}, ${spotVars.y})`,
    );
    assert(
      adjacentOp !== '1',
      `${labelPrefix}: adjacent card remains unaffected by active spotlight`,
    );

    // 6. Native cursor restoration inside text input + 8-char OTP input
    const textInput = page.getByTestId('pg-text-input');
    const textBox = await getBoxInView(textInput);
    await page.mouse.move(textBox.x + 40, textBox.y + textBox.height / 2);
    await page.waitForTimeout(160);
    const nativeState = await getLayerCenters(page);
    const inputCursor = await textInput.evaluate((el) => window.getComputedStyle(el).cursor);
    assert(
      nativeState.layerNative === 'true' && nativeState.hasNativeClass && inputCursor === 'text',
      `${labelPrefix}: text input restores native I-beam cursor and fades custom cursor layer`,
    );

    const otpInput0 = page.getByTestId('pg-otp-0');
    const otpBox = await getBoxInView(otpInput0);
    await page.mouse.move(otpBox.x + otpBox.width / 2, otpBox.y + otpBox.height / 2);
    await page.waitForTimeout(120);
    await otpInput0.click();
    await otpInput0.fill('A');
    const otpNative = await getLayerCenters(page);
    const otpVal = await otpInput0.inputValue();
    assert(
      otpNative.layerNative === 'true' && otpVal === 'A',
      `${labelPrefix}: 8-char OTP box preserves native cursor & clean typing`,
    );

    // 7. Capture QA screenshot on playground before verifying public home + excluded /collections
    fs.mkdirSync(REPORT_SCREENSHOT_DIR, { recursive: true });
    const shotBox = await getBoxInView(primaryBtn);
    await page.mouse.move(shotBox.x + shotBox.width / 2, shotBox.y + shotBox.height / 2);
    await page.waitForTimeout(240);
    await page.screenshot({
      path: path.join(REPORT_SCREENSHOT_DIR, 'playground-hover-invert.png'),
      fullPage: false,
    });

    // 8. Check `/` homepage & `/collections` exclusion
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 30000 });
    });
    await page.mouse.move(400, 350);
    await page.waitForTimeout(200);
    const homeState = await getLayerCenters(page);
    assert(
      homeState.hasEnabledClass && homeState.dotCount === 1,
      `${labelPrefix}: Custom Cursor 2.0 active cleanly on StarX Flow Home`,
    );

    await page.goto(`${BASE_URL}/collections`, { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
      await page.goto(`${BASE_URL}/collections`, { waitUntil: 'load', timeout: 30000 });
    });
    await page.mouse.move(360, 300);
    await page.waitForTimeout(220);
    const colState = await getLayerCenters(page);
    assert(
      !colState.hasEnabledClass && colState.dotCount === 0 && colState.ringCount === 0,
      `${labelPrefix}: StarX Alpha Labs (/collections) strictly excluded from Custom Cursor 2.0`,
    );
  }

  assert(
    pageErrors.length === 0,
    `${labelPrefix}: zero runtime page errors (${pageErrors.length})`,
  );

  await context.close();
}

async function runReducedMotionAndTouchSuite(browser: Browser) {
  console.log('\nRunning Reduced-Motion & Touch Device Matrix...');

  // Reduced motion verification
  const rmContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
    hasTouch: false,
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(`${BASE_URL}/cursor-playground?qa=verify`, { waitUntil: 'load' });
  await rmPage.waitForTimeout(250);
  await rmPage.mouse.move(150, 220);
  await rmPage.waitForTimeout(120);
  await rmPage.mouse.move(620, 410);
  await rmPage.waitForTimeout(20);
  const rmState = await getLayerCenters(rmPage);
  const rmLag = Math.hypot(rmState.dotX - rmState.ringX, rmState.dotY - rmState.ringY);
  assert(
    rmLag <= 2.5,
    `Reduced Motion: outer ring snaps immediately without trailing lag (${rmLag.toFixed(2)}px)`,
  );
  await rmContext.close();

  // Touch & multi-viewport matrix (mobile + tablet + compact phone)
  const viewports = [
    { name: '390x844 mobile touch', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: '360x800 android touch', width: 360, height: 800, isMobile: true, hasTouch: true },
    { name: '320x568 small phone', width: 320, height: 568, isMobile: true, hasTouch: true },
    { name: '768x1024 tablet touch', width: 768, height: 1024, isMobile: false, hasTouch: true },
  ];

  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const metrics = await page.evaluate(() => {
      const layer = document.querySelector('[data-testid="starx-cursor-layer"]') as HTMLElement | null;
      const overflowPx = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      return {
        layerMounted: Boolean(layer),
        overflowPx,
        hasEnabledClass: document.documentElement.classList.contains('starx-cursor-enabled'),
      };
    });
    assert(
      !metrics.hasEnabledClass && metrics.overflowPx <= 2,
      `Touch/Responsive ${vp.name}: custom cursor disabled & overflow=${metrics.overflowPx}px`,
    );
    await ctx.close();
  }
}

async function main() {
  console.log('================================================================');
  console.log(' STARX FLOW CUSTOM CURSOR 2.0 — PLAYWRIGHT VERIFICATION SUITE');
  console.log('================================================================');

  if (!process.env.PLAYWRIGHT_BASE_URL) {
    if (!fs.existsSync(path.join(process.cwd(), '.next', 'BUILD_ID'))) {
      throw new Error('Production build missing (.next/BUILD_ID). Run `npm run build` first.');
    }
    console.log(`Starting production Next.js server at ${BASE_URL}...`);
    serverProc = startLocalServer();
    await waitForServer(BASE_URL);
  }

  let chromiumBrowser: Browser | null = null;
  let firefoxBrowser: Browser | null = null;
  let webkitBrowser: Browser | null = null;

  try {
    chromiumBrowser = await chromium.launch({ headless: true });
    await runCoreDesktopSuite(chromiumBrowser, 'Chromium Desktop', 'chromium');
    await runReducedMotionAndTouchSuite(chromiumBrowser);

    firefoxBrowser = await firefox.launch({ headless: true });
    await runCoreDesktopSuite(firefoxBrowser, 'Firefox Desktop', 'firefox');

    webkitBrowser = await webkit.launch({ headless: true });
    await runCoreDesktopSuite(webkitBrowser, 'WebKit Desktop', 'webkit');
  } finally {
    await Promise.allSettled([
      chromiumBrowser?.close(),
      firefoxBrowser?.close(),
      webkitBrowser?.close(),
    ]);
    await stopLocalServer();
  }

  console.log(`\nSummary: ${passed} passed, ${failures} failed.`);
  if (failures > 0) {
    process.exit(1);
  }
}

main().catch(async (err) => {
  console.error(err);
  await stopLocalServer();
  process.exit(1);
});
