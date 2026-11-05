import path from 'path';

export const CONFIG = {
  baseUrl: process.env.LIVE_URL || 'https://starx-flow.vercel.app',
  viewports: {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
    tablet: { width: 768, height: 1024, hasTouch: true },
  },
  browser: {
    channel: 'chrome',
    headless: true,
  },
  timeout: 30000,
  reportsDir: path.resolve(process.cwd(), 'tests/live-e2e/reports'),
  screenshotsDir: path.resolve(process.cwd(), 'tests/live-e2e/reports/screenshots'),
  tracesDir: path.resolve(process.cwd(), 'tests/live-e2e/reports/traces'),
};
