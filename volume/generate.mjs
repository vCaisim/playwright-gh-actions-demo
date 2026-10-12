// Writes SPECS spec files under specs/, each with one test that attaches
// ATTACHMENTS small files, so a run caches SPECS × ATTACHMENTS files without
// opening a browser. The first spec fails, so the run ends as a failed run.
//
// Usage: SPECS=500 ATTACHMENTS=8 node volume/generate.mjs
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const specs = Number(process.env.SPECS ?? 500);
const attachments = Number(process.env.ATTACHMENTS ?? 8);
const dir = join(dirname(fileURLToPath(import.meta.url)), "specs");

rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
for (let i = 0; i < specs; i++) {
  const id = String(i).padStart(4, "0");
  writeFileSync(
    join(dir, `volume-${id}.spec.ts`),
    `import { test, expect } from "@playwright/test";

test("volume ${id}", async ({}, testInfo) => {
  for (let i = 0; i < ${attachments}; i++) {
    await testInfo.attach(\`file-\${i}\`, {
      body: Buffer.from("x".repeat(100)),
      contentType: "text/plain",
    });
  }
  expect(${i === 0 ? "false" : "true"}).toBe(true);
});
`
  );
}
console.log(`Wrote ${specs} specs with ${attachments} attachments each to ${dir}`);
