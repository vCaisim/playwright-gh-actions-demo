import { test, expect } from "@playwright/test";

/**
 * The workflow starts the two runs a few seconds apart and gives each a
 * different RUN_WORK_MS, so they start at clearly different times and finish at
 * the same one.
 *
 * Both halves matter. Ownership is decided by `runStartedAt` with a `>=`
 * comparison, so two runs that start in the same millisecond may each write over
 * the other and there is no correct owner to check against. Finishing together
 * is what puts their RUN_FINISH deliveries in flight at the same time.
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
  console.log(`finished after ${waitMs}ms at ${Date.now()}`);
  expect(true).toBe(true);
});
