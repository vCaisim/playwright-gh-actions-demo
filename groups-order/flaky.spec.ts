import { expect, test } from "@playwright/test";

test("fails on the first attempt and passes on the retry", ({}, testInfo) => {
  expect(testInfo.retry).toBe(1);
});
