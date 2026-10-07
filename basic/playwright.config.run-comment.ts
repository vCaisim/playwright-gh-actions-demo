import { defineConfig, devices } from "@playwright/test";
import shared from "./pw.config.shared";

// A run like a real suite's, for the run comment: failures with a browser and
// without one, an API test, a flaky test, and a test that fails on one
// project only. One retry, so a failure shows "attempt 2 of 2".
export default defineConfig({
  ...shared,
  retries: 1,
  workers: 2,
  reporter: [["list"], ["@currents/playwright"]],
  testMatch: [
    "0-failing.spec.ts",
    "1-getting-started.spec.ts",
    "3-assertions.spec.ts",
    "5-flaky.spec.ts",
    "6-networking.spec.ts",
    "9-run-comment.spec.ts",
  ],
  use: {
    ...shared.use,
    baseURL: "http://localhost:4346",
    // The reporter records the run; the Currents fixtures are not needed.
    currentsFixturesEnabled: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
