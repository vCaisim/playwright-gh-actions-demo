import { test, expect } from "@playwright/test";

// Registers the "slow" group right away, then fails after 3 minutes, so the
// run has a group in progress while "fast" and "late" finish clean.
test("slow group fails after 3 minutes", async () => {
  await new Promise((resolve) => setTimeout(resolve, 180_000));
  expect(1 + 1).toBe(3);
});
