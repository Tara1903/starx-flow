import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to https://starx-flow.runs-on.dev/ ...");
  await page.goto("https://starx-flow.runs-on.dev/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Take initial screenshot of hero
  await page.screenshot({ path: "tests/screenshots/live-hero-initial.png" });

  // Hover on Solutions
  const solutionsBtn = page.getByRole("button", { name: "Solutions" });
  console.log("Found Solutions button:", await solutionsBtn.count());
  await solutionsBtn.hover();
  await page.waitForTimeout(600);

  const menu = page.locator('[role="menu"]');
  const box = await menu.boundingBox();
  console.log("Menu bounding box on live site:", box);

  await page.screenshot({ path: "tests/screenshots/live-solutions-menu.png" });

  await browser.close();
}

main().catch(console.error);
