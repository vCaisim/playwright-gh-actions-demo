import { expect } from "@playwright/test";
import { test } from "./base.ts";

test("basic test @basic", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});

test("basic test @basic 2", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});


test("basic test @basic 3", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});

test("basic test @basic 4", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});

test("basic test @basic 5", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});

test("basic test @basic 6", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});


test("basic test @basic 7", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});

test("basic test @basic 8", async ({ page }) => {
  await page.goto("https://demo.playwright.dev/todomvc");

  // Use locators to represent a selector and re-use them
  const inputBox = page.locator("input.new-todo");
  const todoList = page.locator(".todo-list");

  await inputBox.fill("Learn JavaScript");
  await inputBox.press("Enter");
  await expect(todoList).toHaveText("Learn Playwright");
});
