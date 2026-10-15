import { test } from "../base.ts";
import { expectSorted } from "./helpers.ts";

// Fails inside a helper, so the error line is not in this spec: the spec gets
// a file comment only.
test("sorts the prices", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([3, 1, 2]);
});
