import { test, expect } from "@playwright/test";

/**
 * The workflow starts six runs of this config under different ci-build-ids, all
 * blocking in currents.config.ts until one instant, so they are six separate runs
 * created together and racing for one comment.
 *
 * Being created together is the point. Ownership between runs is decided by
 * `runStartedAt`, which the server assigns as each run is created, and any
 * stagger makes the runs start in a known order and their deliveries write in
 * that same order — so the newest writes last and `canWriteOverComment` simply
 * answers correctly. Equal work then makes them finish together, so every
 * RUN_FINISH delivery is in flight at once.
 *
 * That alone is not enough — in flight together still lets one finish its read
 * and its write before the next one reads. RACE_WRITE_HOLD_MS in the currents
 * repo is what holds each delivery between its read and its write, which is what
 * puts all four reads ahead of all four writes.
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

  // The runs share one stdout, so the line has to say which run it came from.
  // Read these back to confirm the finishes landed together: if they are spread
  // over more than a second the deliveries never overlapped and the run proves
  // nothing.
  console.log(
    `finished ${process.env.CURRENTS_CI_BUILD_ID} after ${waitMs}ms at ${Date.now()}`,
  );

  expect(true).toBe(true);
});
