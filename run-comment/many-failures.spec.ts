import { expect, test } from "@playwright/test";

// More failing tests than the run comment lists (10), so it has to pick which
// ones to show. No browser, so the run takes about a second.
for (let i = 1; i <= 13; i++) {
  test(`fails ${String(i).padStart(2, "0")}`, () => {
    expect(i).toBe(0);
  });
}
