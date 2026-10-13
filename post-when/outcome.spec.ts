import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

// pass, fail or flaky
const outcome = readFileSync(join(__dirname, "OUTCOME"), "utf8").trim();

test("always passes", () => {
  expect(true).toBe(true);
});

test(`ends ${outcome}`, ({}, testInfo) => {
  if (outcome === "fail") {
    expect(outcome).toBe("pass");
  }
  if (outcome === "flaky") {
    expect(testInfo.retry).toBe(1);
  }
});
