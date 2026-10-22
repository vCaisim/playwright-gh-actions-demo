import { expect } from "@playwright/test";
import { test } from "../base.ts";

// run-comment/review/same-name.spec.ts changes too, so "review/same-name.spec.ts"
// matches two changed files and gets no comment.
test("counts the words", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expect("one two three".split(" ")).toHaveLength(4);
});
