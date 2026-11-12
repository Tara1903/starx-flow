import { chromium, Page, CDPSession } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.PERF_BASE_URL || 'http://127.0.0.1:3099';
const LABEL = process.env.PERF_LABEL || 'baseline';
const ZOOM_STEPS = [1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 2.0, 1.5, 1.25, 1.0];
const BASE_WIDTH = 1440;
const BASE_HEIGHT = 900;

interface CdpSnapshot {
  LayoutCount: number;
  RecalcStyleCount: number;
  LayoutDuration: number;
  RecalcStyleDuration: number;
  ScriptDuration: number;
  TaskDuration: number;
  JSHeapUsedSize: number;
  Nodes: number;
  Documents: number;
}

function pickMetrics(raw: Array<{ name: string; value: number }>): CdpSnapshot {
  const map = new Map(raw.map((m) => [m.name, m.value]));
  return {
    LayoutCount: map.get('LayoutCount') ?? 0,
    RecalcStyleCount: map.get('RecalcStyleCount') ?? 0,
    LayoutDuration: Number(((map.get('LayoutDuration') ?? 0) * 1000).toFixed(2)),
    RecalcStyleDuration: Number(((map.get('RecalcStyleDuration') ?? 0) * 1000).toFixed(2)),
    ScriptDuration: Number(((map.get('ScriptDuration') ?? 0) * 1000).toFixed(2)),
    TaskDuration: Number(((map.get('TaskDuration') ?? 0) * 1000).toFixed(2)),
    JSHeapUsedSize: Number(((map.get('JSHeapUsedSize') ?? 0) / (1024 * 1024)).toFixed(2)),
    Nodes: map.get('Nodes') ?? 0,
    Documents: map.get('Documents') ?? 0,
  };
}

function diffMetrics(before: CdpSnapshot, after: CdpSnapshot) {
  return {
    layoutCountDelta: Math.round(after.LayoutCount - before.LayoutCount),
    recalcStyleCountDelta: Math.round(after.RecalcStyleCount - before.RecalcStyleCount),
    layoutDurationMs: Number((after.LayoutDuration - before.LayoutDuration).toFixed(2)),
    recalcStyleDurationMs: Number((after.RecalcStyleDuration - before.RecalcStyleDuration).toFixed(2)),
    scriptDurationMs: Number((after.ScriptDuration - before.ScriptDuration).toFixed(2)),
    taskDurationMs: Number((after.TaskDuration - before.TaskDuration).toFixed(2)),
    heapUsedMb: after.JSHeapUsedSize,
    heapDeltaMb: Number((after.JSHeapUsedSize - before.JSHeapUsedSize).toFixed(2)),
    nodes: after.Nodes,
  };
}

async function installPerfProbes(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __perfProbe?: {
        longTasks: Array<{ startTime: number; duration: number }>;
        rafFrames: number;
        maxFrameGapMs: number;
        droppedFramesOver33ms: number;
        droppedFramesOver50ms: number;
        lastRafMs: number;
        resizeCount: number;
        eventLoopMaxLagMs: number;
        running: boolean;
        stop: () => void;
      };
    };

    if (w.__perfProbe) {
      w.__perfProbe.stop();
    }

    const longTasks: Array<{ startTime: number; duration: number }> = [];
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasks.push({
            startTime: Number(entry.startTime.toFixed(1)),
            duration: Number(entry.duration.toFixed(1)),
          });
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // longtask observer unavailable
    }

    const probe = {
      longTasks,
      rafFrames: 0,
      maxFrameGapMs: 0,
      droppedFramesOver33ms: 0,
      droppedFramesOver50ms: 0,
      lastRafMs: performance.now(),
      resizeCount: 0,
      eventLoopMaxLagMs: 0,
      running: true,
      stop: () => {},
    };

    let rafId = 0;
    const onRaf = (now: number) => {
      if (!probe.running) return;
      const gap = now - probe.lastRafMs;
      probe.lastRafMs = now;
      probe.rafFrames += 1;
      if (probe.rafFrames > 2) {
        if (gap > probe.maxFrameGapMs) probe.maxFrameGapMs = Number(gap.toFixed(2));
        if (gap > 33.4) probe.droppedFramesOver33ms += 1;
        if (gap > 50) probe.droppedFramesOver50ms += 1;
      }
      rafId = window.requestAnimationFrame(onRaf);
    };
    rafId = window.requestAnimationFrame(onRaf);

    const onResize = () => {
      probe.resizeCount += 1;
    };
    window.addEventListener('resize', onResize, { passive: true });

    let lastTick = performance.now();
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const lag = Math.max(0, now - lastTick - 50);
      lastTick = now;
      if (lag > probe.eventLoopMaxLagMs) {
        probe.eventLoopMaxLagMs = Number(lag.toFixed(2));
      }
    }, 50);

    probe.stop = () => {
      probe.running = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.clearInterval(intervalId);
      observer?.disconnect();
    };

    w.__perfProbe = probe;
  });
}

async function readAndResetProbes(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as {
      __perfProbe?: {
        longTasks: Array<{ startTime: number; duration: number }>;
        rafFrames: number;
        maxFrameGapMs: number;
        droppedFramesOver33ms: number;
        droppedFramesOver50ms: number;
        resizeCount: number;
        eventLoopMaxLagMs: number;
        stop: () => void;
      };
    };
    const p = w.__perfProbe;
    if (!p) return null;
    const summary = {
      longTaskCount: p.longTasks.length,
      longTaskTotalMs: Number(p.longTasks.reduce((a, b) => a + b.duration, 0).toFixed(1)),
      longTaskMaxMs: p.longTasks.length
        ? Number(Math.max(...p.longTasks.map((t) => t.duration)).toFixed(1))
        : 0,
      rafFrames: p.rafFrames,
      maxFrameGapMs: p.maxFrameGapMs,
      droppedFramesOver33ms: p.droppedFramesOver33ms,
      droppedFramesOver50ms: p.droppedFramesOver50ms,
      resizeCount: p.resizeCount,
      eventLoopMaxLagMs: p.eventLoopMaxLagMs,
    };
    p.stop();
    return summary;
  });
}

async function applyBrowserZoom(client: CDPSession, page: Page, zoom: number) {
  const width = Math.round(BASE_WIDTH / zoom);
  const height = Math.round(BASE_HEIGHT / zoom);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: zoom,
    mobile: false,
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      }),
  );
}

async function measurePointerSweep(page: Page, client: CDPSession, route: string) {
  await installPerfProbes(page);
  const startWall = performance.now();
  const cdpBefore = pickMetrics((await client.send('Performance.getMetrics')).metrics);

  // Move across navbar, CTAs, interactive buttons & spotlight cards for ~1.5s
  const vp = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const points: Array<[number, number]> = [];
  for (let i = 0; i < 36; i++) {
    const t = i / 35;
    const x = Math.round(vp.w * (0.12 + 0.76 * Math.abs(Math.sin(t * Math.PI * 2))));
    const y = Math.round(vp.h * (0.15 + 0.65 * t));
    points.push([x, y]);
  }
  for (const [x, y] of points) {
    await page.mouse.move(x, y, { steps: 3 });
  }

  // Also test hover directly over visible primary buttons/cards if present
  const targets = await page.evaluate(() => {
    const els = Array.from(
      document.querySelectorAll('button, a[href], [data-cursor-spotlight="true"]'),
    ).slice(0, 8);
    return els
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 10 && r.height > 10 && r.top >= 0 && r.bottom <= window.innerHeight)
      .map((r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 }));
  });
  for (const pt of targets.slice(0, 4)) {
    await page.mouse.move(pt.x, pt.y, { steps: 5 });
    await page.waitForTimeout(80);
  }

  const cdpAfter = pickMetrics((await client.send('Performance.getMetrics')).metrics);
  const probe = await readAndResetProbes(page);
  const wallMs = Number((performance.now() - startWall).toFixed(1));

  return {
    route,
    phase: 'pointer-and-hover',
    wallMs,
    probe,
    cdp: diffMetrics(cdpBefore, cdpAfter),
  };
}

async function measureIdleCost(page: Page, client: CDPSession, route: string) {
  // Settle pointer at one fixed point and wait 1.5s to measure idle CPU/RAF cost
  await page.mouse.move(320, 260, { steps: 2 });
  await page.waitForTimeout(700);

  // Instrument getBoundingClientRect calls & style mutations via page probe during idle 1.5s
  await installPerfProbes(page);
  const idleCounters = await page.evaluate(async () => {
    const origGetBCR = Element.prototype.getBoundingClientRect;
    let bcrCalls = 0;
    Element.prototype.getBoundingClientRect = function (...args) {
      bcrCalls += 1;
      return origGetBCR.apply(this, args);
    };

    const dot = document.querySelector('[data-testid="starx-cursor-dot"]') as HTMLElement | null;
    const ring = document.querySelector('[data-testid="starx-cursor-ring"]') as HTMLElement | null;
    let styleMutations = 0;
    const mo = new MutationObserver((records) => {
      styleMutations += records.length;
    });
    if (dot) mo.observe(dot, { attributes: true, attributeFilter: ['style'] });
    if (ring) mo.observe(ring, { attributes: true, attributeFilter: ['style'] });

    await new Promise((r) => setTimeout(r, 1500));

    mo.disconnect();
    Element.prototype.getBoundingClientRect = origGetBCR;
    return { bcrCalls, styleMutations };
  });

  const cdpAfter = pickMetrics((await client.send('Performance.getMetrics')).metrics);
  const probe = await readAndResetProbes(page);
  return {
    route,
    phase: 'idle-1.5s',
    idleCounters,
    probe,
    nodes: cdpAfter.Nodes,
    heapUsedMb: cdpAfter.JSHeapUsedSize,
  };
}

async function measureScrollAndZoom(page: Page, client: CDPSession, route: string) {
  // 1. Scroll sweep down & up
  await installPerfProbes(page);
  const cdpScrollBefore = pickMetrics((await client.send('Performance.getMetrics')).metrics);
  const scrollStart = performance.now();

  const maxScroll = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
  );
  const scrollSteps = 10;
  for (let i = 1; i <= scrollSteps; i++) {
    const y = Math.round((maxScroll * i) / scrollSteps);
    await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'auto' }), y);
    await page.mouse.move(400 + i * 20, 300, { steps: 2 });
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await page.waitForTimeout(120);

  const cdpScrollAfter = pickMetrics((await client.send('Performance.getMetrics')).metrics);
  const scrollProbe = await readAndResetProbes(page);
  const scrollWallMs = Number((performance.now() - scrollStart).toFixed(1));

  // 2. Zoom sweep 100% -> 110% -> 125% -> 150% -> 175% -> 200% -> 250% -> 200% -> 150% -> 125% -> 100%
  const zoomResults: Array<Record<string, unknown>> = [];
  for (const z of ZOOM_STEPS) {
    await installPerfProbes(page);
    const cdpZoomBefore = pickMetrics((await client.send('Performance.getMetrics')).metrics);
    const zStart = performance.now();

    await applyBrowserZoom(client, page, z);
    // Simulate natural pointer & scroll interaction at this zoom level
    await page.mouse.move(Math.round((BASE_WIDTH / z) * 0.45), Math.round((BASE_HEIGHT / z) * 0.35), {
      steps: 4,
    });
    await page.evaluate(() => window.scrollBy(0, 180));
    await page.waitForTimeout(120);
    await page.evaluate(() => window.scrollBy(0, -180));

    const layoutCheck = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      dpr: window.devicePixelRatio,
      overflowPx: Math.max(0, Math.round(document.documentElement.scrollWidth - window.innerWidth)),
    }));

    const cdpZoomAfter = pickMetrics((await client.send('Performance.getMetrics')).metrics);
    const zProbe = await readAndResetProbes(page);
    const zWallMs = Number((performance.now() - zStart).toFixed(1));

    zoomResults.push({
      zoomPct: Math.round(z * 100),
      wallMs: zWallMs,
      ...layoutCheck,
      probe: zProbe,
      cdp: diffMetrics(cdpZoomBefore, cdpZoomAfter),
    });
  }

  return {
    route,
    scroll: {
      wallMs: scrollWallMs,
      probe: scrollProbe,
      cdp: diffMetrics(cdpScrollBefore, cdpScrollAfter),
    },
    zoomSweep: zoomResults,
  };
}

async function run() {
  const routes = ['/', '/pricing', '/product', '/dashboard', '/cursor-playground?qa=verify'];
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });

  const results: Record<string, unknown> = {
    label: LABEL,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: {},
  };

  try {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width: BASE_WIDTH, height: BASE_HEIGHT },
      });
      await context.addInitScript('window.__name = window.__name || ((t) => t);');
      const page = await context.newPage();
      const client = await context.newCDPSession(page);
      await client.send('Performance.enable');

      const navStart = performance.now();
      await installPerfProbes(page).catch(() => {});
      const resp = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: 'networkidle',
        timeout: 45000,
      });
      await page.waitForTimeout(450);
      const navMs = Number((performance.now() - navStart).toFixed(1));

      const loadMetrics = pickMetrics((await client.send('Performance.getMetrics')).metrics);
      const pointer = await measurePointerSweep(page, client, route);
      const idle = await measureIdleCost(page, client, route);
      const scrollZoom = await measureScrollAndZoom(page, client, route);

      (results.routes as Record<string, unknown>)[route] = {
        status: resp?.status() ?? 0,
        finalUrl: page.url(),
        navMs,
        loadMetrics,
        pointer,
        idle,
        scrollZoom,
      };

      console.log(
        `[${LABEL}] ${route} (${resp?.status()}): nav=${navMs}ms | ` +
          `idleStyleMut=${idle.idleCounters.styleMutations} idleBcr=${idle.idleCounters.bcrCalls} idleRaf=${idle.probe?.rafFrames} | ` +
          `ptrScript=${pointer.cdp.scriptDurationMs}ms ptrLayout=${pointer.cdp.layoutCountDelta} ptrRecalc=${pointer.cdp.recalcStyleCountDelta} maxGap=${pointer.probe?.maxFrameGapMs}ms | ` +
          `scrollScript=${scrollZoom.scroll.cdp.scriptDurationMs}ms maxGap=${scrollZoom.scroll.probe?.maxFrameGapMs}ms | ` +
          `zoom250Script=${(scrollZoom.zoomSweep.find((z) => z.zoomPct === 250)?.cdp as { scriptDurationMs?: number })?.scriptDurationMs}ms ` +
          `zoom250Recalc=${(scrollZoom.zoomSweep.find((z) => z.zoomPct === 250)?.cdp as { recalcStyleCountDelta?: number })?.recalcStyleCountDelta} ` +
          `zoom250Overflow=${scrollZoom.zoomSweep.find((z) => z.zoomPct === 250)?.overflowPx}px`,
      );

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const outDir = path.join(process.cwd(), 'test-results');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `perf-zoom-${LABEL}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Saved profile JSON: ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
