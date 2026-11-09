import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    // Optional locally provisioned Chromium for restricted development sandboxes.
    // CI uses Playwright's pinned browser by default.
    ...(process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"]
      ? {
          launchOptions: {
            executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"],
            args: ["--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"],
          },
        }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --host 0.0.0.0 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env["CI"],
    timeout: 120000,
  },
});
