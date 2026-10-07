import { expect } from "@playwright/test";
import { test } from "./base.ts";

// Each test fails the way tests in a real suite do, so the run comment shows
// every kind of row.

test.describe("user profile", () => {
  test("shows the full name of the loaded user", async ({ page }) => {
    await page.goto("/network.html");
    await page.click("text=Load user");
    await expect(page.locator("#user-full-name")).toContainText("Jane Doe", {
      timeout: 2000,
    });
  });
});

test.describe("todos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://demo.playwright.dev/todomvc");
    const input = page.locator("input.new-todo");
    for (const todo of ["Buy milk", "Walk the dog"]) {
      await input.fill(todo);
      await input.press("Enter");
    }
  });

  test("counts the items left", async ({ page }) => {
    await expect(page.getByTestId("todo-count")).toHaveText("3 items left", {
      timeout: 2000,
    });
  });

  // Times out on a button the app does not have.
  test("archives the completed todos", async ({ page }) => {
    await page.locator(".todo-list li .toggle").first().check();
    await page
      .getByRole("button", { name: "Archive completed" })
      .click({ timeout: 3000 });
  });

  // The app is 550px wide, so this fails on the phone project only.
  test("keeps the new todo input inside the screen", async ({ page }) => {
    const box = await page.locator("input.new-todo").boundingBox();
    const screen = page.viewportSize();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      screen?.width ?? 0,
    );
  });
});

// The `request` fixture calls the API without a browser.
test.describe("users API", () => {
  test("returns the user by id", async ({ request }) => {
    const response = await request.get("/api/v1/users.json");
    expect(await response.json()).toMatchObject({ id: 2 });
  });
});

// No browser at all.
test.describe("pricing", () => {
  test("rounds a discounted price to cents", () => {
    const discounted = Math.round(19.99 * 0.85 * 100) / 100;
    expect(discounted).toBe(16.98);
  });
});
