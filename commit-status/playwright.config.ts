import { defineConfig } from "@playwright/test";

// Two Currents groups, so two commit status contexts: one ending in `success`,
// one in `failure`. Neither should ever be left on `pending`.
export default defineConfig({
  timeout: 10 * 1000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["@currents/playwright"]],
  projects: [
    { name: "Status Pass", testMatch: /pass\.spec\.ts/ },
    { name: "Status Fail", testMatch: /fail\.spec\.ts/ },
  ],
});
