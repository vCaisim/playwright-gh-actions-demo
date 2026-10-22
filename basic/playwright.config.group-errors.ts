import { defineConfig, devices } from "@playwright/test";
import shared from "./pw.config.shared";

// One test per way a test can fail across groups, for the run comment's
// "Different error in …" lines. Real browsers, so the errors differ the way
// they do in a cross-browser suite. Ten failures at most, so the run comment
// lists every one.
export default defineConfig({
  ...shared,
  retries: 1,
  workers: 4,
  reporter: [["list"], ["@currents/playwright"]],
  testMatch: ["groups/*.spec.ts"],
  use: {
    ...shared.use,
    baseURL: "http://localhost:4346",
    currentsFixturesEnabled: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
