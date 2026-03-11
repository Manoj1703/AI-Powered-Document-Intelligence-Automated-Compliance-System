import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: 'cmd /c "set VITE_API_BASE_URL=http://127.0.0.1:4173&& set VITE_TURNSTILE_SITE_KEY=&& npm run dev -- --host 127.0.0.1 --port 4173"',
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
