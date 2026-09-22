/**
 * Fixes one instant for the whole run and hands it to the workers through the
 * environment.
 *
 * It has to be decided in one place. Workers start a second or so apart on a
 * busy runner, and anything they each compute for themselves carries that spread
 * into the staircase `barrier.ts` builds on top of it.
 *
 * Playwright runs this in the main process before it forks the workers, so they
 * inherit the value.
 */
export default function globalSetup() {
  // Has to outlast worker startup and the run creation `pwc` does for each
  // project. If it runs out first the groups still finish three seconds apart,
  // but no longer aligned to each other, and worker start jitter can push two of
  // them into the same instant. The spec logs its finish so that is visible in
  // the job output.
  process.env.RACE_BARRIER_AT = String(Date.now() + 20_000);
}
