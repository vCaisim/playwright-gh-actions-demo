import { expect } from "@playwright/test";
import { test } from "../base.ts";
import { expectSorted } from "./helpers.ts";

// Fails inside a helper, so the error line is not in this spec: the file
// comment lists it.
test("sorts the prices", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([3, 1, 2]);
});

// Fails on a line of this spec, so it gets a line comment and the file comment
// counts it instead of listing it.
test("counts the cart items", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expect(["apple", "pear"]).toHaveLength(3);
});
