import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run the production build in a real browser, the same files
// GitHub Pages serves. Unit tests for the logic stay in src/ (Vitest).
const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  // A game with timers and animations is easier to debug one test at a time.
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}/spider-on/`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /touch\.spec/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      // A phone held sideways, the size the touch controls were tuned on in chapter 2.6.
      name: "phone",
      testMatch: /(start|touch|layout)\.spec/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/spider-on/`,
    // Locally a running preview is reused; in CI nothing runs yet, so it starts fresh.
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
