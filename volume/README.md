# High-volume run

Generates many spec files whose tests attach small files without opening a
browser, so one run caches thousands of artifacts. The first spec fails, so the
run ends as a failed run.

```bash
SPECS=500 ATTACHMENTS=8 node volume/generate.mjs
CURRENTS_API_URL=<api url> CURRENTS_PROJECT_ID=<project id> CURRENTS_RECORD_KEY=<record key> \
  npx playwright test --config volume/playwright.config.ts
```

`SPECS` is the number of spec files (default 500), `ATTACHMENTS` the files each
test attaches (default 8). Each file is 100 bytes.
