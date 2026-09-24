import { test } from "@playwright/test";

// Keeps a shard busy long enough to cancel the workflow while the Currents
// reporter is mid-run. Skipped unless SLOW_SECONDS is set.
const seconds = Number(process.env.SLOW_SECONDS || 0);

test("waits so the workflow can be cancelled mid-run", async () => {
  test.skip(!seconds, "SLOW_SECONDS is not set");
  test.setTimeout((seconds + 30) * 1000);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
});
