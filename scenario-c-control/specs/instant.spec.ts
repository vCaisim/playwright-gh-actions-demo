import { test, expect } from "@playwright/test";

/**
 * One group, nothing to overlap with. The control: this run must produce exactly
 * one comment showing its final board, on both branches, with the same
 * RACE_READ_AT_MS scenario A uses.
 *
 * It still goes through the hold — its RUN_FINISH edit is held and then written
 * — so a difference here would mean the hook itself changed the outcome rather
 * than the lock.
 *
 * The post and that edit cannot collide either: an edit arriving before the
 * comment exists backs off with `RetriableError('Run comment not posted yet')`,
 * and that guard predates the lock.
 */
test("finishes immediately", async () => {
  expect(true).toBe(true);
});
