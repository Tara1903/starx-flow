import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright';

const PORT = 3145;
const BASE_URL = `http://127.0.0.1:${PORT}`;
let serverProc: ChildProcess | null = null;

function startServer(): ChildProcess {
  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  return spawn(process.execPath, [nextBin, 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForServer(url: string) {
  const start = Date.now();
  while (Date.now() - start < 30000) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 307) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Timeout waiting for Next.js server');
}

async function sampleCursor(page: import('playwright').Page) {
  return page.evaluate(() => {
    const dot = document.querySelector('[data-testid="starx-cursor-dot"]') as HTMLElement | null;
    const ring = document.querySelector('[data-testid="starx-cursor-ring"]') as HTMLElement | null;
    const dR = dot?.getBoundingClientRect();
    const rR = ring?.getBoundingClientRect();
    const dX = dR ? dR.left + dR.width / 2 : 0;
    const dY = dR ? dR.top + dR.height / 2 : 0;
    const rX = rR ? rR.left + rR.width / 2 : 0;
    const rY = rR ? rR.top + rR.height / 2 : 0;
    return {
      dotX: dX,
      dotY: dY,
      ringX: rX,
      ringY: rY,
      ringSize: rR?.width ?? 0,
      sep: Math.hypot(dX - rX, dY - rY),
    };
  });
}

async function run() {
  serverProc = startServer();
  await waitForServer(BASE_URL);
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/cursor-playground?qa=verify`, { waitUntil: 'networkidle' });
    await page.getByTestId('starx-cursor-layer').waitFor({ state: 'attached' });

    const pad = page.getByTestId('pg-tracking-pad');
    await pad.scrollIntoViewIfNeeded();
    const box = await pad.boundingBox();
    if (!box) throw new Error('No pad bounding box');

    const cy = box.y + box.height / 2;
    await page.mouse.move(box.x + 40, cy);
    await page.waitForTimeout(550);

    const restSample = await sampleCursor(page);
    console.log('1) Resting state:', restSample);

    // 2. Slow movement (~120 px/s over 1.2s => 144px in 36 steps @ 33ms)
    const slowSeps: number[] = [];
    for (let i = 1; i <= 24; i += 1) {
      await page.mouse.move(box.x + 40 + i * 6, cy);
      await page.waitForTimeout(32);
      const s = await sampleCursor(page);
      slowSeps.push(s.sep);
    }
    const slowAvg = slowSeps.slice(8).reduce((a, b) => a + b, 0) / Math.max(1, slowSeps.slice(8).length);
    console.log(`2) Slow (~180 px/s) steady separation avg=${slowAvg.toFixed(2)}px, max=${Math.max(...slowSeps).toFixed(2)}px`);

    await page.waitForTimeout(550);

    // 3. Fast directional sweep (~800-1000 px/s: 360px in 20 steps @ 16ms)
    const fastSeps: number[] = [];
    await page.mouse.move(box.x + 40, cy);
    await page.waitForTimeout(550);
    for (let i = 1; i <= 20; i += 1) {
      await page.mouse.move(box.x + 40 + i * 18, cy);
      await page.waitForTimeout(16);
      const s = await sampleCursor(page);
      fastSeps.push(s.sep);
    }
    console.log(
      `3) Fast directional (~1100 px/s) separations: [${fastSeps.slice(4, 18).map((v) => v.toFixed(1)).join(', ')}], max=${Math.max(...fastSeps).toFixed(2)}px`,
    );

    // 4. Abrupt stop telemetry
    const stopCurve: Array<{ ms: number; sep: number; ringX: number; dotX: number }> = [];
    const t0 = Date.now();
    let maxOvershootPastDot = 0;
    const stopDotX = box.x + 40 + 20 * 18;
    for (let i = 0; i < 36; i += 1) {
      await page.waitForTimeout(24);
      const s = await sampleCursor(page);
      stopCurve.push({ ms: Date.now() - t0, sep: Number(s.sep.toFixed(2)), ringX: Number(s.ringX.toFixed(1)), dotX: Number(s.dotX.toFixed(1)) });
      if (s.ringX > stopDotX) {
        maxOvershootPastDot = Math.max(maxOvershootPastDot, s.ringX - stopDotX);
      }
      if (s.sep < 0.8 && i > 6) break;
    }
    console.log(`4) Abrupt stop curve (maxOvershoot=${maxOvershootPastDot.toFixed(2)}px):`, stopCurve.slice(0, 14));
    console.log(`   Settled at ms=${stopCurve[stopCurve.length - 1]?.ms} sep=${stopCurve[stopCurve.length - 1]?.sep}px`);

    // 5. Sudden 180deg direction reversal after fast right sweep (single 16ms frame check!)
    await page.mouse.move(box.x + 40, cy);
    await page.waitForTimeout(600);
    for (let i = 1; i <= 14; i += 1) {
      await page.mouse.move(box.x + 40 + i * 18, cy);
      await page.waitForTimeout(16);
    }
    const beforeReverse = await sampleCursor(page);
    // Reverse left immediately at fast sweep steps and capture next frame to confirm forward momentum
    await page.mouse.move(beforeReverse.dotX - 18, cy);
    await page.waitForTimeout(16);
    const rev1 = await sampleCursor(page);
    await page.mouse.move(beforeReverse.dotX - 54, cy);
    await page.waitForTimeout(16);
    const rev2 = await sampleCursor(page);
    console.log('5) 180deg Reversal momentum (before -> rev1 -> rev2 ringX):', {
      beforeDotX: beforeReverse.dotX,
      beforeRingX: Number(beforeReverse.ringX.toFixed(2)),
      rev1DotX: rev1.dotX,
      rev1RingX: Number(rev1.ringX.toFixed(2)),
      rev2DotX: rev2.dotX,
      rev2RingX: Number(rev2.ringX.toFixed(2)),
      carriedForwardInitially: rev1.ringX >= beforeReverse.ringX,
    });

    // 6. Circular sweep
    const circSeps: number[] = [];
    const radius = 85;
    const cx = box.x + box.width / 2;
    await page.mouse.move(cx + radius, cy);
    await page.waitForTimeout(550);
    for (let k = 1; k <= 32; k += 1) {
      const ang = (k / 32) * Math.PI * 2;
      await page.mouse.move(cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius);
      await page.waitForTimeout(18);
      const s = await sampleCursor(page);
      circSeps.push(s.sep);
    }
    console.log(`6) Circular orbit steady avg=${(circSeps.slice(8).reduce((a, b) => a + b, 0) / 24).toFixed(2)}px, max=${Math.max(...circSeps).toFixed(2)}px`);

    // 7. 60Hz vs 120Hz vs 144Hz frame-rate independence solver verification
    const rates = [60, 120, 144].map((hz) => {
      const dt = 1 / hz;
      const responsiveness = 0.50;
      const stiffness = 140;
      const damping = 20;
      const maxSep = 56;
      const softStart = maxSep * 0.65;
      const softBand = Math.max(8, maxSep - softStart);
      const substep = 1 / 240;

      let ringX = 0;
      let velX = 0;
      const targetSpeed = 900; // px/s for 0.25s, then abrupt stop for 0.25s
      const totalFrames = Math.round(0.5 * hz);
      let peakSweepLag = 0;

      for (let f = 1; f <= totalFrames; f += 1) {
        const t = f * dt;
        const dotX = Math.min(t, 0.25) * targetSpeed;
        let rem = dt * responsiveness;
        while (rem > 0) {
          const s = Math.min(rem, substep);
          const dx = dotX - ringX;
          const dist = Math.abs(dx);
          let kMult = 1;
          if (dist > softStart) {
            const ex = (dist - softStart) / softBand;
            kMult = Math.min(4.5, 1 + 2.5 * ex * ex);
          }
          const cMult = Math.sqrt(kMult);
          const ax = dx * (stiffness * kMult) - velX * (damping * cMult);
          velX += ax * s;
          ringX += velX * s;
          rem -= s;
        }
        if (t <= 0.25) {
          peakSweepLag = Math.max(peakSweepLag, Math.abs(dotX - ringX));
        }
      }
      return {
        hz,
        peakSweepLag: Number(peakSweepLag.toFixed(3)),
        endLagAt500ms: Number(Math.abs(225 - ringX).toFixed(3)),
      };
    });
    console.log('7) 60Hz vs 120Hz vs 144Hz invariance:', rates);
  } finally {
    await browser.close();
    if (process.platform === 'win32' && serverProc?.pid) {
      spawn('taskkill', ['/PID', String(serverProc.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      serverProc?.kill();
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
