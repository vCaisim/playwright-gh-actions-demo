import { expect } from "@playwright/test";
import { test } from "../base.ts";

// A `Received:` line over 500 characters, then `Timeout:`: the error summary
// keeps the `Timeout:` line after the long one. Kept to 600 characters so the
// whole message stays under the reporter's 2048-character cut.
test("shows the full order notes", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  await page.setContent(`<main>${"Leave the parcel at the door. ".repeat(20)}</main>`);
  await expect(page.locator("main")).toHaveText("Leave the parcel", { timeout: 1000 });
});

// A thrown string is recorded as the error's value, with no message.
test("reads the checkout token", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  throw "checkout token missing";
});
