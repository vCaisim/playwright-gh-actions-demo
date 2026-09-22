import { CurrentsFixtures, CurrentsWorkerFixtures } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

/**
 * One spec, one worker. Nothing inside a single run of this config overlaps with
 * anything: the scenario comes from the workflow launching six runs of it at
 * once under different ci-build-ids.
 */
export default defineConfig<CurrentsFixtures, CurrentsWorkerFixtures>({
  testDir: "./specs",
  timeout: 30 * 1000,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
});
