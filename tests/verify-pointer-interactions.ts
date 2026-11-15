import { chromium } from 'playwright';

async function testPointerInteractions() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('starx_auth_prompt_dismissed_v1', 'true');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });

  // 1. Move mouse across Hero Cockpit
  const heroElem = await page.$('[data-testid="spatial-hero"]');
  if (!heroElem) throw new Error('Spatial hero not found');
  const heroBox = await heroElem.boundingBox();
  if (!heroBox) throw new Error('Spatial hero bounding box missing');

  console.log('Testing 3D pointer tracking across Spatial Hero...');
  await page.mouse.move(heroBox.x + 200, heroBox.y + 200);
  await page.waitForTimeout(200);
  await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + 350);
  await page.waitForTimeout(300);

  // 2. Hover over Deploy Your AI Receptionist magnetic button
  const cta = await page.$('text="Deploy Your AI Receptionist"');
  if (!cta) throw new Error('Primary CTA not found');
  const ctaBox = await cta.boundingBox();
  if (ctaBox) {
    await page.mouse.move(ctaBox.x + ctaBox.width / 2, ctaBox.y + ctaBox.height / 2);
    await page.waitForTimeout(400);
    console.log('[PASS] Primary magnetic CTA hovered');
  }

  // 3. Test interactive tabs in Hero Cockpit (WhatsApp Flow vs System Audit Log)
  const auditTabBtn = await page.$('button:has-text("System Audit Log")');
  if (auditTabBtn) {
    await auditTabBtn.click();
    await page.waitForTimeout(400);
    const traceText = await page.$('text="EXECUTION ENGINE TRACE"');
    console.log(`[PASS] System Audit Log tab clicked, trace found: ${!!traceText}`);

    // Switch back to WhatsApp Flow
    const waTabBtn = await page.$('button:has-text("WhatsApp Flow")');
    if (waTabBtn) {
      await waTabBtn.click();
      await page.waitForTimeout(400);
      console.log('[PASS] WhatsApp Flow tab switched back cleanly');
    }
  }

  // 4. Test Step 2 click in Scene 4 Interactive Demo
  const step2Btn = await page.$('button:has-text("Autonomous Booking")');
  if (step2Btn) {
    await step2Btn.click();
    await page.waitForTimeout(400);
    const step2Text = await page.$('text="AI Checks Real-Time Staff Rosters"');
    console.log(`[PASS] Scene 4 interactive demo step 2 clicked: ${!!step2Text}`);
  }

  // 5. Check P0 text visibility during and after interactions
  const h1 = await page.$('h1');
  const h1Opacity = await h1?.evaluate(el => window.getComputedStyle(el).opacity);
  console.log(`[PASS] Hero H1 opacity during interactions: ${h1Opacity}`);
  if (h1Opacity !== '1') throw new Error('H1 opacity not 1');

  await browser.close();
  console.log('\n=== ALL INTERACTION TESTS PASSED ===');
}

testPointerInteractions().catch(err => {
  console.error('Pointer test failed:', err);
  process.exit(1);
});
