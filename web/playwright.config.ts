import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PRACTICE_SMOKE_PORT ?? 3011);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm exec next start -H 127.0.0.1 -p ${port}`,
    url: `http://127.0.0.1:${port}/practice`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      ENABLE_PRACTICE_LIBRARY: "true",
      NODE_ENV: "production",
      NEXT_PUBLIC_CMS_URL: process.env.NEXT_PUBLIC_CMS_URL ?? "https://example.invalid",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? `http://127.0.0.1:${port}`,
      PAYLOAD_PROXY_TARGET: process.env.PAYLOAD_PROXY_TARGET ?? "https://example.invalid",
    },
  },
});
