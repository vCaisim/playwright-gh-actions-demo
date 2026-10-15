import { expect } from "@playwright/test";
import { test } from "../base.ts";

// One of several failing specs, so the run has more than 10 and only the 10
// with the most failures get review comments.
test("cap case 04", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expect(4).toBe(0);
});
