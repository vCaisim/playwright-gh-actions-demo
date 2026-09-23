import { expect, test } from "@playwright/test";

// No browser work: the group finishes within a second or two of starting, so
// RUN_START and RUN_FINISH are queued close together, as in ENG-1356.
test("passes", async () => {
  expect(1 + 1).toBe(2);
});
