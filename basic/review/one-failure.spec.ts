import { expect } from "@playwright/test";
import { test } from "../base.ts";

// One failing test, on desktop only: the file comment and the line comment
// link to the same test-level share.
test("rounds the total to two decimals", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  const total = 0.1 + 0.2;
  expect(total).toBe(0.3);
});
