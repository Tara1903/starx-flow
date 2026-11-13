import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3099/ ...");
  await page.goto("http://localhost:3099/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Take hero screenshot
  await page.screenshot({ path: "tests/screenshots/local-01-hero.png" });

  // Hover Solutions
  const solutionsBtn = page.getByRole("button", { name: "Solutions" });
  if (await solutionsBtn.count() > 0) {
    await solutionsBtn.hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: "tests/screenshots/local-02-solutions-menu.png" });
    // Move away
    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);
  }

  // Scroll down
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "tests/screenshots/local-03-scroll-800.png" });

  await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "tests/screenshots/local-04-scroll-1800.png" });

  await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "tests/screenshots/local-05-scroll-3000.png" });

  await page.evaluate(() => window.scrollTo({ top: 4500, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "tests/screenshots/local-06-scroll-4500.png" });

  // Check all sections
  const check = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section, [class*='glass-']")).map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className.slice(0, 40),
        y: Math.round(rect.y),
        height: Math.round(rect.height),
        opacity: style.opacity,
        visibility: style.visibility,
        textLen: ((el as HTMLElement).innerText || "").trim().length,
      };
    });
    return sections;
  });

  console.log(`Audited ${check.length} glass/section elements.`);
  const invisible = check.filter(c => c.opacity === "0" || c.visibility === "hidden" || (c.height > 100 && c.textLen === 0));
  console.log("Potentially invisible or empty elements:", invisible);

  await browser.close();
}

main().catch(console.error);
