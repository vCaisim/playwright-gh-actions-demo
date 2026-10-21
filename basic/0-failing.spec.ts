import { expect } from "@playwright/test";
import { test } from "./base.ts";

test("basic test @basic", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Locators represent a selector and can be re-used
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});
