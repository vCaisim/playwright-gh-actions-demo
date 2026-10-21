import { test } from "../base.ts";
import { expectSorted } from "./helpers.ts";

// Titles with markdown and HTML characters, failing in a helper so they are
// listed in the file comment's table and must show as written.
test("keeps <b>tags</b> | pipes and [brackets](x) as text", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([2, 1]);
});

test("keeps a trailing backslash \\", async ({}, testInfo) => {
  if (testInfo.project.name !== "desktop") return;
  expectSorted([5, 4]);
});
