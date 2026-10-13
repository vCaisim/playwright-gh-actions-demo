import { defineConfig } from "@playwright/test";

// One retry, so a test that fails its first attempt and passes its second is
// flaky.
export default defineConfig({
  testDir: ".",
  retries: 1,
  workers: 1,
  reporter: [["list"], ["@currents/playwright"]],
  projects: [{ name: "post-when" }],
});
