import { expect } from "@playwright/test";
import { test } from "./base.ts";

// Flaky tests for the run comment: each fails its first attempt and passes the
// retry. Six, one more than the comment lists, so it links out to the rest.
// Three use a browser and three do not, so both kinds of entry show.

test.describe("flaky, with a browser", () => {
  test("loads the user after a slow response", async ({ page }, testInfo) => {
    await page.goto("/network.html");
    await page.click("text=Load user");
    await expect(page.locator("#user-full-name")).toContainText(
      testInfo.retry === 0 ? "Loading…" : "John Doe",
      { timeout: 2000 },
    );
  });

  test("adds a todo on the first try", async ({ page }, testInfo) => {
    await page.goto("https://demo.playwright.dev/todomvc");
    await page.locator("input.new-todo").fill("Buy milk");
    await page.locator("input.new-todo").press("Enter");
    await expect(page.getByTestId("todo-count")).toHaveText(
      testInfo.retry === 0 ? "2 items left" : "1 item left",
      { timeout: 2000 },
    );
  });

  test("clears the completed todos", async ({ page }, testInfo) => {
    await page.goto("https://demo.playwright.dev/todomvc");
    await page.locator("input.new-todo").fill("Walk the dog");
    await page.locator("input.new-todo").press("Enter");
    await page.locator(".todo-list li .toggle").first().check();
    await page
      .getByRole("button", {
        name: testInfo.retry === 0 ? "Clear done" : "Clear completed",
      })
      .click({ timeout: 2000 });
    await expect(page.locator(".todo-list li")).toHaveCount(0);
  });
});

// The `request` fixture calls the API without a browser.
test.describe("flaky, API", () => {
  test("returns the user list", async ({ request }, testInfo) => {
    const response = await request.get("/api/v1/users.json");
    expect(response.status()).toBe(testInfo.retry === 0 ? 503 : 200);
  });

  test("returns the user's name", async ({ request }, testInfo) => {
    const response = await request.get("/api/v1/users.json");
    expect(await response.json()).toMatchObject({
      fullName: testInfo.retry === 0 ? "J. Doe" : "John Doe",
    });
  });
});

// No browser at all.
test.describe("flaky, no browser", () => {
  test("rounds the total to cents", async ({}, testInfo) => {
    const total = 0.1 + 0.2;
    expect(testInfo.retry === 0 ? total : Math.round(total * 100) / 100).toBe(
      0.3,
    );
  });
});
