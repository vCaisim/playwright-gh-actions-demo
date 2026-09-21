import { CurrentsFixtures, CurrentsWorkerFixtures } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

/**
 * Eight Playwright projects, which @currents/playwright turns into eight
 * Currents groups under one ci-build-id. Each group raises its own RUN_FINISH,
 * and each of those rewrites the run comment — so this run produces eight
 * comment deliveries.
 *
 * Eight workers so the projects run at once, and `barrier.ts` releases them
 * 250ms apart so their boards differ.
 *
 * No browser and no web server: the scenario is about delivery timing, and a
 * page load would only add jitter.
 */
export default defineConfig<CurrentsFixtures, CurrentsWorkerFixtures>({
  testDir: "./specs",
  globalSetup: "./globalSetup.ts",
  // Longer than the barrier wait plus the whole staircase.
  timeout: 60 * 1000,
  fullyParallel: true,
  workers: 8,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  projects: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ name: `group-${n}` })),
});
