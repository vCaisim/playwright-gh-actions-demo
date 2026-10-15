import { expect } from "@playwright/test";
import { test } from "../base.ts";

// Runs in every project, so it fails in five groups and its comments name
// three of them and count the rest.
test("parses the price", async () => {
  expect(Number.parseFloat("19,99")).toBe(19.99);
});
