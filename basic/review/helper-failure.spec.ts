import { expect } from "@playwright/test";
import { test } from "../base.ts";
import { expectSorted } from "./helpers.ts";

// Passes, so the spec's only failure has a line comment and it gets no file
// comment.
test("sorts the prices", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([1, 2, 3]);
});

// Fails on a line of this spec, so it gets a line comment and the file comment
// counts it instead of listing it.
test("counts the cart items", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expect(["apple", "pear"]).toHaveLength(3);
});
