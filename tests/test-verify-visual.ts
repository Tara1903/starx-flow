import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Loading http://localhost:3099/ ...");
  await page.goto("http://localhost:3099/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // 1. Initial Hero
  await page.screenshot({ path: "tests/screenshots/refined-01-hero-initial.png" });
  console.log("Captured initial hero");

  // 2. Wait for AI typing and message 2
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "tests/screenshots/refined-02-hero-chatting.png" });
  console.log("Captured chatting hero");

  // 3. Wait for completed booking message
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "tests/screenshots/refined-03-hero-booked.png" });
  console.log("Captured booked hero");

  // 4. Hover Solutions Dropdown
  const solutionsBtn = page.getByRole("button", { name: "Solutions" });
  await solutionsBtn.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "tests/screenshots/refined-04-dropdown-open.png" });
  console.log("Captured dropdown open");

  // Move cursor away
  await page.mouse.move(50, 50);
  await page.waitForTimeout(300);

  // 5. Switch tab to Operations Radar
  const radarTab = page.getByRole("tab", { name: "Operations Radar" });
  if (await radarTab.count() > 0) {
    await radarTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: "tests/screenshots/refined-05-hero-radar.png" });
    console.log("Captured radar tab");
  }

  // 6. Scroll down through page sections
  await page.evaluate(() => window.scrollTo({ top: 750, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/refined-06-social-problem.png" });

  await page.evaluate(() => window.scrollTo({ top: 1650, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/refined-07-how-it-works.png" });

  await page.evaluate(() => window.scrollTo({ top: 2500, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/refined-08-benefits-bento.png" });

  await page.evaluate(() => window.scrollTo({ top: 3500, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/refined-09-dual-segment.png" });

  await page.evaluate(() => window.scrollTo({ top: 4500, behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "tests/screenshots/refined-10-testimonials-cta.png" });

  // 7. Test zoom levels
  for (const zoom of [1.25, 1.5, 2.0]) {
    const zoomContext = await browser.newContext({
      viewport: { width: Math.round(1440 / zoom), height: Math.round(900 / zoom) },
      deviceScaleFactor: zoom,
    });
    const zoomPage = await zoomContext.newPage();
    await zoomPage.goto("http://localhost:3099/", { waitUntil: "networkidle" });
    await zoomPage.waitForTimeout(1000);
    await zoomPage.screenshot({ path: `tests/screenshots/refined-zoom-${Math.round(zoom * 100)}.png` });
    await zoomContext.close();
    console.log(`Captured zoom ${Math.round(zoom * 100)}%`);
  }

  await browser.close();
  console.log("Visual acceptance suite finished!");
}

run().catch(console.error);
