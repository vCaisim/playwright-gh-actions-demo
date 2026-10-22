import { expect } from "@playwright/test";
import { test } from "../base.ts";

test.describe("checkout", () => {
  // Fails in Firefox's setup only; the other groups fail in the test body.
  test.beforeEach(async ({}, testInfo) => {
    if (testInfo.project.name === "firefox") {
      throw new Error("could not seed the test user: 503 Service Unavailable");
    }
  });

  test("charges the saved card", async ({ page }) => {
    await page.setContent(`<p id="status">declined</p>`);
    await expect(page.locator("#status")).toHaveText("paid", { timeout: 1000 });
  });
});
