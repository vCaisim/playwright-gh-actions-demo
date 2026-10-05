import { defineConfig } from "@playwright/test";

// Projects are Currents groups, and the run lists them in this order. Eleven
// groups join ahead of `sso-setup`, the only one that fails, so a groups table
// that keeps the first ten in join order leaves it out.
const passingGroups = Array.from(
  { length: 10 },
  (_, i) => `group-${String(i + 1).padStart(2, "0")}`
);

export default defineConfig({
  testDir: ".",
  // One worker: with several, the Currents reporter 1.21 reports some of
  // these millisecond tests as unfinished and records them as skipped, which
  // counts as failed and puts a passing group in the failed rows.
  workers: 1,
  retries: 0,
  reporter: [["list"], ["@currents/playwright"]],
  projects: [
    ...passingGroups.map((name) => ({ name, testMatch: /passing\.spec\.ts/ })),
    { name: "flaky-group", testMatch: /flaky\.spec\.ts/, retries: 1 },
    { name: "sso-setup", testMatch: /failing\.spec\.ts/ },
  ],
});
