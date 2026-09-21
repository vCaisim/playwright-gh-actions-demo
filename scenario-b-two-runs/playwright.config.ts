import { CurrentsFixtures, CurrentsWorkerFixtures } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

/**
 * One spec, one worker. Nothing inside a run of this config overlaps with
 * anything: the scenario comes from the workflow launching two runs of it under
 * different ci-build-ids, offset at the start and aligned at the finish.
 *
 * The timeout has to clear the longest `RUN_WORK_MS` the workflow passes, which
 * is six seconds for the run that starts first.
 */
export default defineConfig<CurrentsFixtures, CurrentsWorkerFixtures>({
  testDir: "./specs",
  timeout: 30 * 1000,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
});
