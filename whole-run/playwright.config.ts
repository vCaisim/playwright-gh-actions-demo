import { defineConfig } from "@playwright/test";

// One Currents run, three groups (one per Playwright project), each recorded
// by its own CI job. See .github/workflows/whole-run-status.yml.
export default defineConfig({
  testDir: ".",
  retries: 0,
  reporter: [
    ["list"],
    [
      "@currents/playwright",
      {
        projectId: process.env.CURRENTS_PROJECT_ID,
        recordKey: process.env.CURRENTS_RECORD_KEY,
        ciBuildId: process.env.CURRENTS_CI_BUILD_ID,
      },
    ],
  ],
  projects: [
    { name: "fast", testMatch: "fast.spec.ts" },
    { name: "slow", testMatch: "slow.spec.ts", timeout: 300_000 },
    { name: "late", testMatch: "late.spec.ts" },
  ],
});
