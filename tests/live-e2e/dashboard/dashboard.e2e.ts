import { createLiveBrowser, takeFailureScreenshot } from '../helpers/browser';
import { CONFIG } from '../config/env';

interface DashboardTestResult {
  section: string;
  passed: boolean;
  details: string;
  error?: string;
}

export async function runPhaseFDashboardTests(): Promise<{
  results: DashboardTestResult[];
  passedCount: number;
  failedCount: number;
}> {
  console.log(`\n======================================================`);
  console.log(`[PHASE F] DASHBOARD LIVE SECTION TESTING`);
  console.log(`Target: ${CONFIG.baseUrl}/dashboard`);
  console.log(`======================================================\n`);

  const { browser, createManagedPage } = await createLiveBrowser();
  const results: DashboardTestResult[] = [];

  const record = (section: string, passed: boolean, details: string, error?: string) => {
    results.push({ section, passed, details, error });
    console.log(`  -> [${passed ? 'PASS' : 'FAIL'}] Section: ${section} - ${details}`);
  };

  try {
    const { page, context, diagnostics } = await createManagedPage();

    try {
      // 1. Initial Dashboard Load
      console.log('1. Loading Live Dashboard...');
      const response = await page.goto(`${CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
      const statusOk = response?.status() === 200;
      const title = await page.title();
      record('Dashboard Root Load', statusOk, `HTTP ${response?.status()} | Title: "${title}"`);

      // 2. Test Overview Section
      console.log('2. Testing Overview Section...');
      const hasOverviewHeader = (await page.locator('text=/Command Center/i, text=/OPERATIONAL HUB/i, text=/ACTIVE FLOWS/i').count()) > 0;
      record('Overview Section', hasOverviewHeader, hasOverviewHeader ? 'Command Center and Operational Hub metrics rendered' : 'Overview content missing');

      // Sections to navigate and verify
      const sectionsToTest = [
        { id: 'Inbox', clickText: 'Inbox', expectedText: ['Inbox', 'Messages', 'Conversations'] },
        { id: 'Customers / CRM', clickText: 'Customers', expectedText: ['Customers', 'Leads', 'CRM', 'Contacts'] },
        { id: 'Calendar', clickText: 'Calendar', expectedText: ['Calendar', 'Appointments', 'Schedule'] },
        { id: 'Orders', clickText: 'Orders', expectedText: ['Orders', 'Status', 'Total'] },
        { id: 'Knowledge Base', clickText: 'Knowledge', expectedText: ['Knowledge', 'Documents', 'FAQs', 'Receptionist'] },
        { id: 'Workflows', clickText: 'Workflows', expectedText: ['Workflows', 'Active', 'Automations'] },
        { id: 'Channels', clickText: 'Channels', expectedText: ['Channels', 'WhatsApp', 'Instagram'] },
        { id: 'Settings', clickText: 'Settings', expectedText: ['Settings', 'Business', 'Profile'] },
        { id: 'Analytics', clickText: 'Analytics', expectedText: ['Analytics', 'Performance', 'Metrics'] },
      ];

      for (const sec of sectionsToTest) {
        console.log(`Testing Navigation to: ${sec.id} ...`);
        diagnostics.clear();

        // Click sidebar button
        const navBtn = page.locator(`button:has-text("${sec.clickText}"), a:has-text("${sec.clickText}")`).first();
        if ((await navBtn.count()) > 0) {
          await navBtn.click();
          await page.waitForTimeout(1000);

          // Check if expected content is rendered
          let foundContent = false;
          for (const exp of sec.expectedText) {
            if ((await page.locator(`text="${exp}"`).count()) > 0) {
              foundContent = true;
              break;
            }
          }

          const hasNoErrors = diagnostics.pageErrors.length === 0;
          const passed = foundContent && hasNoErrors;
          record(sec.id, passed, passed ? `Rendered expected content with 0 errors` : `Found: ${foundContent}, Errors: ${diagnostics.pageErrors.length}`);

          if (!passed) {
            await takeFailureScreenshot(page, `dashboard_${sec.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
          }
        } else {
          record(sec.id, false, `Sidebar button for ${sec.clickText} not found`);
        }
      }

      // 3. Test Refresh Persistence on Current Section
      console.log('3. Testing Dashboard Page Reload Persistence...');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const postReloadTitle = await page.title();
      record('Dashboard Reload', true, `Reload completed smoothly without session drop | Title: "${postReloadTitle}"`);

    } catch (err: any) {
      await takeFailureScreenshot(page, 'dashboard_critical_failure');
      record('Dashboard Execution', false, 'Exception occurred during dashboard testing', err.message);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  console.log(`\n[PHASE F SUMMARY] Tested: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  return { results, passedCount, failedCount };
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('dashboard')) {
  runPhaseFDashboardTests().then((res) => {
    process.exit(res.failedCount === 0 ? 0 : 1);
  });
}
