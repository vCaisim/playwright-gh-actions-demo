import { expect } from "@playwright/test";
import { test } from "../base.ts";

// Fails its first attempt with a different error per group, then passes:
// a flaky entry gets no "Different error" line.
test("loads the recommendations", async ({}, testInfo) => {
  if (testInfo.retry === 0) {
    throw new Error(`recommendations failed in ${testInfo.project.name}`);
  }
  expect(true).toBe(true);
});
