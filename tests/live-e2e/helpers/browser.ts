import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { CONFIG } from '../config/env';
import path from 'path';
import fs from 'fs';

export interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: { url: string; errorText?: string; method: string }[];
  clear: () => void;
}

export async function createLiveBrowser(): Promise<{
  browser: Browser;
  createManagedPage: (options?: {
    viewport?: { width: number; height: number; isMobile?: boolean; hasTouch?: boolean };
    storageState?: string;
  }) => Promise<{ page: Page; context: BrowserContext; diagnostics: PageDiagnostics }>;
}> {
  const browser = await chromium.launch({
    channel: CONFIG.browser.channel,
    headless: CONFIG.browser.headless,
  });

  const createManagedPage = async (options?: {
    viewport?: { width: number; height: number; isMobile?: boolean; hasTouch?: boolean };
    storageState?: string;
  }) => {
    const context = await browser.newContext({
      viewport: options?.viewport || CONFIG.viewports.desktop,
      isMobile: options?.viewport?.isMobile ?? false,
      hasTouch: options?.viewport?.hasTouch ?? false,
      storageState: options?.storageState,
      bypassCSP: true,
      userAgent: options?.viewport?.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    const diagnostics: PageDiagnostics = {
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      clear: () => {
        diagnostics.consoleErrors = [];
        diagnostics.pageErrors = [];
        diagnostics.failedRequests = [];
      },
    };

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known harmless third-party notices or extensions
        if (!text.includes('favicon.ico') && !text.includes('Failed to load resource: the server responded with a status of 404')) {
          diagnostics.consoleErrors.push(text);
        }
      }
    });

    page.on('pageerror', (err) => {
      diagnostics.pageErrors.push(err.message || String(err));
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      // Filter out non-critical optional pings like analytics if blocked
      if (!url.includes('google-analytics') && !url.includes('favicon.ico')) {
        diagnostics.failedRequests.push({
          url,
          method: req.method(),
          errorText: req.failure()?.errorText,
        });
      }
    });

    return { page, context, diagnostics };
  };

  return { browser, createManagedPage };
}

export async function takeFailureScreenshot(page: Page, testName: string): Promise<string> {
  const sanitized = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitized}_${Date.now()}.png`;
  const filePath = path.join(CONFIG.screenshotsDir, filename);
  try {
    if (!fs.existsSync(CONFIG.screenshotsDir)) {
      fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
    }
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  } catch (e) {
    return '';
  }
}
