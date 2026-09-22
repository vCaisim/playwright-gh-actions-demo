import { CurrentsFixtures, CurrentsWorkerFixtures } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

/**
 * Four Playwright projects, which @currents/playwright turns into four Currents
 * groups under one ci-build-id. Each group raises its own RUN_FINISH, and each
 * of those rewrites the run comment, so this run produces four comment edits on
 * top of the post.
 *
 * Four and not more. The deliveries are held between their read and their write
 * (raceDelay.ts), and with the lock those holds run one after another, so the
 * last group has to outwait the other three inside the mutex's 20 second retry
 * policy. Four fit with room; eight do not, and the last ones come back as
 * retries instead of racing.
 *
 * No browser and no web server: the scenario is about delivery timing, and a
 * page load would only add jitter.
 */
export default defineConfig<CurrentsFixtures, CurrentsWorkerFixtures>({
  testDir: "./specs",
  globalSetup: "./globalSetup.ts",
  // Longer than the 20s barrier plus the 9s staircase.
  timeout: 60 * 1000,
  fullyParallel: true,
  workers: 4,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  projects: [1, 2, 3, 4].map((n) => ({ name: `group-${n}` })),
});
