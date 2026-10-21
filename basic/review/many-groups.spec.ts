import { expect } from "@playwright/test";
import { test } from "../base.ts";

// Runs in every project, so it fails in five groups and its comments name
// three of them and count the rest. On tablet and kiosk it fails with another
// error first, so the run comment lists that error for those groups.
test("parses the price", async ({}, testInfo) => {
  if (["tablet", "kiosk"].includes(testInfo.project.name)) {
    expect(Number.parseInt("19.99", 10), "rounds the price down").toBe(20);
  }
  expect(Number.parseFloat("19,99")).toBe(19.99);
});
