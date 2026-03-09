import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for LexCard.
 *
 * Uses the Next.js dev server on port 3001.
 * The webServer block auto-starts the dev server when tests run.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Maximum time one test can run */
  timeout: 60_000,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests sequentially in CI, parallel locally */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: "html",

  use: {
    /* Base URL for page.goto('/') etc. */
    baseURL: "http://localhost:3001",
    /* Collect trace on first retry */
    trace: "on-first-retry",
    /* Navigation timeout */
    navigationTimeout: 30_000,
    /* Action timeout */
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Start the dev server before running tests */
  webServer: {
    command: "npm run dev",
    port: 3001,
    /* Wait up to 60s for the dev server to be ready */
    timeout: 60_000,
    /* Reuse an already-running dev server if available */
    reuseExistingServer: !process.env.CI,
  },
});
