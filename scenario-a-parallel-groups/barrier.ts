/**
 * Releases each group of the run in a tight staircase, so their comment
 * deliveries overlap without rendering the same board.
 *
 * Currents raises RUN_FINISH per group, and @currents/playwright makes one group
 * per Playwright project, so the project count is what decides how many comment
 * updates a run produces. Spec files do not: there is no INSTANCE_FINISH in the
 * webhook processor.
 *
 * The stagger is what keeps the renders apart. The orchestrator drops an event
 * whose rendered comment is byte-identical to the stored one, and keys each
 * queued edit on that render's hash, so groups finishing at the same instant
 * collapse into a single delivery and no race happens. Finishing 250ms apart
 * gives each group a different board, while staying well under the few hundred
 * milliseconds a delivery spends on its GitHub round trips.
 */
export async function finishInSequence(projectName: string, stepMs = 250) {
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
  // difference would give every group a non-positive wait, all eight would
  // finish in the same instant, and the identical boards would collapse into one
  // delivery. This way a stale barrier costs alignment, not the staircase.
  const untilBarrier = Math.max(0, barrierAt - Date.now());
  await new Promise((resolve) =>
    setTimeout(resolve, untilBarrier + index * stepMs),
  );
}
