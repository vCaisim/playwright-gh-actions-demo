import { test, expect } from "@playwright/test";

/**
 * The workflow starts five runs a second apart and gives each a different
 * RUN_WORK_MS, so they start at clearly different times and finish at the same
 * one.
 *
 * Both halves matter. Ownership is decided by `runStartedAt` with a `>=`
 * comparison, so runs starting in the same millisecond may each write over the
 * others and there is no correct owner to check against. Finishing together is
 * what puts every RUN_FINISH delivery in flight at once, so the order they
 * happen to write in says nothing about which run should win.
 */
// Not `Number(env ?? 3000)`: an empty or malformed RUN_WORK_MS would give 0 or
// NaN, setTimeout would fire straight away, and the run would finish at the
// wrong moment without anything saying so.
const workMs = Number(process.env.RUN_WORK_MS);
if (process.env.RUN_WORK_MS && !(workMs > 0)) {
  throw new Error(
    `RUN_WORK_MS is not a positive number: ${process.env.RUN_WORK_MS}`,
  );
}
const waitMs = workMs > 0 ? workMs : 3000;

test("run does a little work", async () => {
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  // Five runs share one stdout, so the line has to say which run it came from.
  // Read these back to confirm the finishes landed together: if they are spread
  // over more than a delivery's worth of time the deliveries never overlapped
  // and the run proves nothing.
  console.log(
    `finished ${process.env.CURRENTS_CI_BUILD_ID} after ${waitMs}ms at ${Date.now()}`,
  );

  expect(true).toBe(true);
});
