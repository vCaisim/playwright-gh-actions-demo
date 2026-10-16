import { expect, test } from "@playwright/test";

// Not run. Shares its path suffix with basic/review/same-name.spec.ts.
test("counts the words", () => {
  expect("one two three".split(" ")).toHaveLength(3);
});
