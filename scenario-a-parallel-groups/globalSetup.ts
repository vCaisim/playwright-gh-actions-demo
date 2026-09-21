/**
 * Fixes one instant for the whole run and hands it to the workers through the
 * environment.
 *
 * It has to be decided in one place. Workers start a second or so apart on a
 * busy runner, so anything they each compute for themselves carries that spread
 * into the result, and a spread wider than the 250ms step scrambles the
 * staircase the scenario depends on.
 *
 * Playwright runs this in the main process before it forks the workers, so they
 * inherit the value.
 */
export default function globalSetup() {
  // Has to outlast everything between here and the first test body: worker
  // startup, and the run creation and spec assignment that `pwc` does for each
  // of the eight projects. If it runs out first the groups still finish 250ms
  // apart, but they are no longer aligned to each other, and worker start jitter
  // can then push two of them into the same instant. The spec logs its finish so
  // a lost staircase is visible in the job output.
  process.env.RACE_BARRIER_AT = String(Date.now() + 30_000);
}
