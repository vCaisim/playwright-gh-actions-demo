import { expect } from "@playwright/test";
import { test } from "../base.ts";

// The baseline is a blank 160x40 image for every group, and each browser
// renders the text with its own fonts, so each reports a different count of
// changed pixels.
test("renders the receipt header", async ({ page }) => {
  await page.setContent(`
    <style>body { margin: 0 } #header { width: 160px; height: 40px; background: #fff; font: 16px sans-serif }</style>
    <div id="header">Receipt #1042</div>`);
  await expect(page.locator("#header")).toHaveScreenshot("receipt.png", { timeout: 2000 });
});
