import { test, expect } from "@playwright/test";

// Registers the "slow" group right away, then passes after 90 s, so the run
// has a group in progress while "fast" and "late" finish.
test("slow group passes after 90 s", async () => {
  await new Promise((resolve) => setTimeout(resolve, 90_000));
  expect(1 + 1).toBe(2);
});
