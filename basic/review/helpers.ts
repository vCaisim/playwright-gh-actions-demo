import { expect } from "@playwright/test";

export function expectSorted(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  expect(values).toEqual(sorted);
}
