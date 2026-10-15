import { expect } from "@playwright/test";
import { test } from "../base.ts";

// One failing test, on desktop only: the file comment and the line comment
// link to the same test-level share.
test("rounds the total to two decimals", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  // Floating point: 0.1 + 0.2 is not exactly 0.3, so the comparison fails and
  // the failing line moves down from where the previous commit had it.
  const total = 0.1 + 0.2;
  expect(total).toBeCloseTo(0.31, 5);
});
