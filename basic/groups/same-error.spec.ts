import { expect } from "@playwright/test";
import { test } from "../base.ts";

// The same error in every group: no "Different error" line.
test("applies the coupon", async ({ page }) => {
  await page.setContent(`<p id="total">$40.00</p>`);
  await expect(page.locator("#total")).toHaveText("$36.00", { timeout: 1000 });
});

// The same assertion and value everywhere, but each browser retries a
// different number of times, so the call logs differ: still no line.
test("shows the shipping estimate", async ({ page }) => {
  await page.setContent(`<p id="eta">3-5 days</p>`);
  await expect(page.locator("#eta")).toHaveText("2 days", { timeout: 1500 });
});
