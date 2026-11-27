import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:3243';
const output = 'test-results/user-behavior';
await mkdir(output, { recursive: true });
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
const paths = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname))];
assert(paths.length >= 50, 'Expected the application sitemap');
paths.push('/chat', '/login', '/signup', '/auth/verify-demo', '/cursor-playground','/resources/ai-receptionist','/resources/whatsapp-playbook');
const browser = await chromium.launch();
const rows = [];
async function worker(queue) {
  const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const page = await context.newPage();
  let errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    for (const path of queue) {
      errors = [];
      try {
        const response = await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 120000 });
        assert.equal(response?.status(), 200, 'Expected a fresh document response');
        await page.waitForFunction(() => document.querySelector('main')?.innerText.trim().length > 20);
        for (const width of [1440, 390, 768, 320]) {
          await page.setViewportSize({width, height: width < 500 ? 844 : 900});
          const state = await page.evaluate(async () => {
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            const main = document.querySelector('main');
            const text = main.innerText.trim();
            const end = window.scrollY;
            window.scrollTo({top: document.body.scrollHeight, behavior: 'instant'});
            const scrollable = document.documentElement.scrollHeight > innerHeight;
            const scrolled = window.scrollY > 0;
            window.scrollTo({top: end, behavior: 'instant'});
            return { bodyWidth: document.documentElement.scrollWidth, width: innerWidth,
              scrollable, scrolled, text: text.slice(0, 100), usable: text.length > 20 && !/application error:|this page could not be found/i.test(text) };
          });
          const pass = state.usable && state.bodyWidth <= width + 1 && !errors.length;
          rows.push({path, width, pass, ...state, errors: [...errors]});
        }
      } catch (e) { rows.push({path, pass: false, error: e.message.slice(0, 220)}); }
      console.log(path, rows.at(-1).pass);
    }
  } finally { await context.close(); }
}
try {
  await Promise.all([worker(paths.filter((_,i) => i%2 === 0)),worker(paths.filter((_,i) => i%2 === 1))]);
} finally {
  await browser.close();
  await writeFile(output + '/public.json', JSON.stringify(rows, null, 2));
}
console.log('Public viewport checks:', rows.length, 'failures:', rows.filter(r => !r.pass).length);
process.exitCode = rows.every(r => r.pass) ? 0 : 1;
