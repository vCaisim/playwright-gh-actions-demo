import { test, expect } from "@playwright/test";

test("fast group passes", () => {
  expect(1 + 1).toBe(2);
});
