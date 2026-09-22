/**
 * Releases each group of the run three seconds after the last, so the run
 * produces one distinct comment render per group.
 *
 * Currents raises RUN_FINISH per group, and @currents/playwright makes one group
 * per Playwright project, so the project count decides how many comment updates
 * a run produces. Spec files do not: there is no INSTANCE_FINISH in the webhook
 * processor.
 *
 * The step has to clear the webhook pipeline. `reportWebhook` reads the run
 * document fresh when it processes an event and renders the board from that, so
 * two groups finishing inside one pipeline turnaround both render the run as of
 * the later one. The orchestrator hashes the body with the ownership marker
 * stripped, so those identical boards collapse into a single delivery and there
 * is nothing left to race. Three seconds is well past a local change-stream
 * turnaround.
 *
 * The step also sets how far apart the deliveries write, through INVERT_SCALE in
 * raceDelay.ts. Changing it here changes that spacing too.
 */
export async function finishInSequence(projectName: string, stepMs = 3000) {
  const barrierAt = Number(process.env.RACE_BARRIER_AT);
  if (!barrierAt) {
    throw new Error(
      "RACE_BARRIER_AT is unset — globalSetup did not run, so the groups would finish in no particular order",
    );
  }

  const index = Number(projectName.replace(/\D/g, "")) - 1;
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`project name ${projectName} carries no step number`);
  }

  // The step is added to whatever is left of the barrier rather than to the
  // barrier itself. Orchestration can spend longer setting the run up than the
  // barrier allows for, and then the barrier is already in the past: taking the
  // difference would give every group a non-positive wait, all four would finish
  // in the same instant, and the identical boards would collapse into one
  // delivery. This way a stale barrier costs alignment, not the staircase.
  const untilBarrier = Math.max(0, barrierAt - Date.now());
  await new Promise((resolve) =>
    setTimeout(resolve, untilBarrier + index * stepMs),
  );
}
