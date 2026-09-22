import { CurrentsFixtures, CurrentsWorkerFixtures } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

/**
 * One spec that does nothing, and one group, so there is nothing for a second
 * delivery to overlap with. It must produce the same single comment with the
 * lock and without it.
 */
export default defineConfig<CurrentsFixtures, CurrentsWorkerFixtures>({
  testDir: "./specs",
  timeout: 30 * 1000,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
});
