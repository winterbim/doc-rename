import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '');
const includeWebKit = process.env.PLAYWRIGHT_WEBKIT === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['list']] : [['list']],
  use: {
    baseURL: externalBaseUrl ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'npm run build && npm run start -- --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        // Reusing a `next start` process after rebuilding `.next` serves stale
        // asset hashes and leaves client-rendered pages stuck in their fallback.
        // Keep reuse available for deliberate local debugging only.
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
        timeout: 120_000,
      },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    {
      name: 'compact-mobile',
      use: { ...devices['Pixel 5'], viewport: { width: 320, height: 720 } },
    },
    {
      name: 'iphone',
      // iPhone viewport/touch emulation on Chromium. WebKit is exercised by
      // the optional project below because its binary may be unavailable or
      // unstable on the host running this audit.
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'wide-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    ...(includeWebKit
      ? [{ name: 'webkit', use: { ...devices['Desktop Safari'] } }]
      : []),
  ],
});
