import { expect } from "@playwright/test";
import { test } from "../base.ts";

// An action times out on WebKit and Firefox, an assertion fails on Chromium
// and mobile.
test("opens the saved cart", async ({ page, browserName }) => {
  await page.setContent(`<button id="open">Open cart</button><p id="count">0</p>`);
  if (browserName !== "chromium") {
    await page.click("#saved-cart", { timeout: 1000 });
  }
  await expect(page.locator("#count")).toHaveText("2", { timeout: 1000 });
});

// Hidden by a media query on the phone, wrong text everywhere else.
test("shows the account menu", async ({ page }) => {
  await page.setContent(`
    <style>@media (max-width: 600px) { #menu { display: none; } }</style>
    <nav id="menu">Sign in</nav>`);
  await expect(page.locator("#menu")).toBeVisible({ timeout: 1000 });
  await expect(page.locator("#menu")).toHaveText("My account", { timeout: 1000 });
});

// Each group formats the amount for its own locale, so only the received
// value differs.
test("formats the order total", async ({ page }, testInfo) => {
  const locale = { chromium: "en-US", firefox: "de-DE", webkit: "fr-FR", mobile: "ja-JP" }[testInfo.project.name];
  await page.setContent(`<p id="total"></p>`);
  await page.evaluate((locale) => {
    document.querySelector("#total")!.textContent = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    }).format(1234.5);
  }, locale);
  await expect(page.locator("#total")).toHaveText("€1,234.00", { timeout: 1000 });
});
