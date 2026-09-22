import { test, expect } from "@playwright/test";
import { finishInSequence } from "../barrier";

/**
 * Runs once per Playwright project, and each project is one Currents group, so
 * this single spec produces one group finish per project.
 */
test("group reports its own board", async ({}, testInfo) => {
  await finishInSequence(testInfo.project.name);

  // The staircase is what makes the four boards differ, and a collapsed one
  // fails silently — the run passes and the comment simply never races. Read
  // these back in the job output: they should be about three seconds apart.
  console.log(`finished ${testInfo.project.name} at ${Date.now()}`);

  expect(true).toBe(true);
});
