import { test } from "../base.ts";

// A different error in each of the four groups: two lines, then a count of
// the rest.
test("syncs the wishlist", async ({}, testInfo) => {
  const errors: Record<string, string> = {
    chromium: "sync failed: 409 Conflict",
    firefox: "sync failed: 500 Internal Server Error",
    webkit: "sync failed: request timed out after 3000ms",
    mobile: "sync failed: offline",
  };
  throw new Error(errors[testInfo.project.name]);
});

// The same first lines everywhere; Chromium's message has one more line.
test("retries the payment", async ({}, testInfo) => {
  const lines = ["payment failed", "Code: 402"];
  if (testInfo.project.name === "chromium") lines.push("Retry-After: 30");
  throw new Error(lines.join("\n"));
});

// The groups' messages differ only after the first 200 characters of a line,
// which the summary cuts.
test("validates the address", async ({}, testInfo) => {
  const prefix = "address rejected: " + "street name too long; ".repeat(10);
  throw new Error(`${prefix}group ${testInfo.project.name}`);
});
