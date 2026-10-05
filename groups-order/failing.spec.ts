import { expect, test } from "@playwright/test";

test("passes", () => {
  expect(1 + 1).toBe(2);
});

test("refuses a request over the hourly limit", () => {
  expect("429 Too Many Requests").toBe("200 OK");
});
