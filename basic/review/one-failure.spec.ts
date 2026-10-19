import { expect } from "@playwright/test";
import { test } from "../base.ts";

// Shifted down three lines by a force push, so the line comment is
// deleted and posted again on the new line.
//
// One failing test, on desktop only, failing on a line of this spec: it gets
// a line comment and no file comment.
test("rounds the total to two decimals", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  // Floating point: 0.1 + 0.2 is not exactly 0.3, so the comparison fails and
  // the failing line moves down from where the previous commit had it.
  const total = 0.1 + 0.2;
  // The failing line is rewritten, so GitHub marks the old comment as
  // outdated and it is posted again on the new line.
  const expected = 0.31;
  expect(total, "order total in euros").toBeCloseTo(expected, 5);
});
