import { expect, test } from "@playwright/test";

// Never settles, like a poll of a job that never finishes. Playwright gives
// the timeout error to an action it was running, but not to a `test.step`
// waiting on the test's own code, so in the first two tests no step records an
// error.
const neverSettles = () => new Promise<void>(() => {});

// Long enough to be cut at MAX_RUN_STEP_TEXT_LENGTH (300) in the run report.
const exportJobId = `export-${"0".repeat(320)}`;

// At `detail=compact`, "Last Steps" includes step 2, this one, with its title
// truncated.
test("hangs without a browser", async () => {
  await test.step(`wait for job ${exportJobId}`, neverSettles);
});

// Fixture teardown under "After Hooks" and "Worker Cleanup" follows the step
// where this test hung. At `detail=compact`, "Last Steps" still includes step
// 10, "wait for the export to finish".
test("hangs after using the page", async ({ page }) => {
  await page.setContent("<button>Export</button>");
  await page.getByRole("button", { name: "Export" }).click();
  await test.step("wait for the export to finish", neverSettles);
});

// A step records the error, so the report has "Failure Context" and no "Last
// Steps".
test("fails on an assertion", async ({ page }) => {
  await page.setContent("<button>Export</button>");
  await expect(page.getByRole("button")).toHaveText("Exported", {
    timeout: 500,
  });
});
