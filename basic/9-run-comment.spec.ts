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

test.describe("todos, more", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://demo.playwright.dev/todomvc");
    const input = page.locator("input.new-todo");
    for (const todo of ["Buy milk", "Walk the dog"]) {
      await input.fill(todo);
      await input.press("Enter");
    }
  });

  test("renames a todo", async ({ page }) => {
    await page.getByTestId("todo-title").first().dblclick();
    await page
      .getByTestId("text-input")
      .last()
      .fill("Buy oat milk", { timeout: 2000 });
    await page.getByTestId("text-input").last().press("Enter");
    await expect(page.getByTestId("todo-title").first()).toHaveText(
      "Buy almond milk",
      { timeout: 2000 },
    );
  });

  test("marks every todo as complete", async ({ page }) => {
    await page.getByLabel("Mark all as complete").check();
    await expect(page.getByTestId("todo-count")).toHaveText("1 item left", {
      timeout: 2000,
    });
  });

  test("shows only the active todos", async ({ page }) => {
    await page.locator(".todo-list li .toggle").first().check();
    await page.getByRole("link", { name: "Active" }).click();
    await expect(page.getByTestId("todo-item")).toHaveCount(3, {
      timeout: 2000,
    });
  });
});

test.describe("user profile, more", () => {
  test("shows the user's email", async ({ page }) => {
    await page.goto("/network.html");
    await page.click("text=Load user");
    await expect(page.locator("#user-email")).toBeVisible({ timeout: 2000 });
  });

  test("shows an error when the user cannot be loaded", async ({ page }) => {
    await page.route("/api/v1/users.json", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" }),
    );
    await page.goto("/network.html");
    await page.click("text=Load user");
    await expect(page.getByText("Could not load the user")).toBeVisible({
      timeout: 2000,
    });
  });
});

test.describe("users API, more", () => {
  test("lists the users", async ({ request }) => {
    const response = await request.get("/api/v1/users");
    expect(response.status()).toBe(200);
  });
});

test.describe("pricing, more", () => {
  test("adds tax to the total", () => {
    const total = 100 * 1.2;
    expect(total).toBe(119);
  });

  test("formats a price in euros", () => {
    const price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(19.99);
    expect(price).toBe("19,99 €");
  });
});
