import { test, expect } from "@playwright/test";

/**
 * One group, nothing to overlap with. The control: this run must produce
 * exactly one comment showing its final board, on both branches.
 *
 * It is not a race. An edit that arrives before the comment exists already
 * backs off with `RetriableError('Run comment not posted yet')`, and that guard
 * predates the lock, so a post and the first edit cannot collide.
 */
test("finishes immediately", async () => {
  expect(true).toBe(true);
});
