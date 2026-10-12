import { currentsReporter } from "@currents/playwright";
import { defineConfig } from "@playwright/test";

// High-volume run for the artifact copy: see generate.mjs.
export default defineConfig({
  testDir: "./specs",
  fullyParallel: true,
  workers: 8,
  retries: 0,
  reporter: [
    currentsReporter({
      projectId: process.env.CURRENTS_PROJECT_ID!,
      recordKey: process.env.CURRENTS_RECORD_KEY!,
    }),
  ],
});
