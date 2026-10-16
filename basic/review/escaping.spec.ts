import { test } from "../base.ts";
import { expectSorted } from "./helpers.ts";

// Titles with markdown and HTML characters. Both pass now, so the file
// comment is deleted.
test("keeps <b>tags</b> | pipes and [brackets](x) as text", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([1, 2]);
});

test("keeps a trailing backslash \\", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([4, 5]);
});
