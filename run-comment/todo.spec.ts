import { expect, test } from "@playwright/test";

// Drives a real page for a few seconds before it fails, so the trace has
// screencast frames leading up to the failure for the run comment's strip.
test("completes a todo and clears it", async ({ page }) => {
  // The config's 3s suits the other tests here; this one types and clicks.
  test.setTimeout(30_000);

  await page.goto("https://demo.playwright.dev/todomvc");
  const newTodo = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Book the flight"]) {
    await newTodo.fill(title);
    await newTodo.press("Enter");
  }
  await page.getByTestId("todo-item").nth(1).getByRole("checkbox").check();
  await page.getByRole("link", { name: "Completed" }).click();
  await page.getByRole("link", { name: "All" }).click();
  await page.getByRole("button", { name: "Clear completed" }).click();

  // Wrong on purpose: two todos are left.
  await expect(page.getByTestId("todo-item")).toHaveCount(3, {
    timeout: 2_000,
  });
});
