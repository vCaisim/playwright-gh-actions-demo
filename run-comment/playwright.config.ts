import { defineConfig } from "@playwright/test";

// Three tests that fail in the three ways the run-level AI context tells apart.
// A short timeout keeps the run to seconds; no retries, so each test is one
// attempt.
export default defineConfig({
  testDir: ".",
  timeout: 3_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["@currents/playwright"]],

  // Screenshot and video add their own steps under "After Hooks", which is
  // the teardown the "Last Steps" section has to keep from crowding out the
  // step where the test hung.
  use: {
    trace: "on",
    video: "on",
    screenshot: "on",
  },

  projects: [{ name: "run-comment" }],
});
