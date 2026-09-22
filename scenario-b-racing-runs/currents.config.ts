import { CurrentsConfig } from "@currents/playwright";

/**
 * Blocks until one instant shared by every run of the scenario.
 *
 * The whole scenario turns on how close together the runs are *created*. Each
 * `npx pwc` spends a second or more booting node and loading this file before it
 * creates its run, and four or six of them booting at once on a CI runner spread
 * over seconds. Once the runs are seconds apart the one that started last takes
 * the comment at its own RUN_START, and every older run's finish delivery then
 * correctly skips — so there is no race left to see.
 *
 * This file is the last thing that runs before the run is created (pwc loads it
 * to get the project id and record key), so it is where they can be brought
 * together. The Playwright workers load it again later, by which point the
 * instant has passed and the wait is a no-op.
 *
 * `Atomics.wait` rather than a spin loop: six processes busy-waiting on a
 * two-core runner would contend for the CPU they are about to need.
 */
const startAt = Number(process.env.RACE_START_AT);
if (startAt > 0) {
  const waitMs = startAt - Date.now();
  if (waitMs > 0) {
    console.log(
      `waiting ${waitMs}ms for RACE_START_AT before creating the run`,
    );
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
  }
}

/**
 * Deliberately without the Argos `onFinish` hook the repo root config carries —
 * these scenarios only exercise the GitHub run comment.
 */
const config: CurrentsConfig = {
  projectId: process.env.CURRENTS_PROJECT_ID || "mdXsz8",
  recordKey: process.env.CURRENTS_RECORD_KEY || "KPEvZL0LDYzcZH3U",
  ciBuildId: process.env.CURRENTS_CI_BUILD_ID || Date.now().toString(),
};

export default config;
