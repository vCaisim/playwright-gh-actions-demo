import { devices, PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 10 * 1000,

  expect: {
    timeout: 5000,
  },

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  webServer: {
    command: "node ./server",
    port: 4346,
    cwd: __dirname,
    reuseExistingServer: true,
  },

  use: {
    actionTimeout: 0,
    trace: "on",
    video: "on",
    screenshot: "on",
  },

  projects: [
    {
      name: "a",
      retries: 2,
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: [
        "1-getting-started.spec.ts",
        "3-assertions.spec.ts",
        "5-flaky.spec.ts",
      ],
    },
    {
      name: "b",
      retries: 2,
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: [
        "1-getting-started.spec.ts",
        "3-assertions.spec.ts",
        "5-flaky.spec.ts",
      ],
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: "test-results/",
};

export default config;
