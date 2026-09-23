# Commit status order (ENG-1356)

Manual check for currents-dev/currents#3883: a RUN_START `pending` delivered
after its group's RUN_FINISH must not overwrite it.

The race needs a delayed delivery, which a normal run rarely produces. So the
workflow creates real notifications through the local stack, and
`scripts/commit-status-order.mjs` re-delivers them through the real
`handleNotification` in the order that broke production.

## Setup

1. In `currents`, check out `fix/racing-github-status` and build:
   `npx turbo run build --filter=@currents/notifications-service... --filter=@currents/webhooks...`
2. Start the local stack the way you do for the PR comment tests, so that
   `CURRENTS_API_URL` for this repo reaches it.
3. Open a PR from `test/commit-status-order` to `main`. `commit-status-order.yml`
   runs two groups: `Status Pass` and `Status Fail`.

## Checks

All commands run from the repo root and take an optional sha or runId.

1. The writer records the context.
   `node scripts/commit-status-order.mjs status`
   Expect one RUN_START and one RUN_FINISH per group, and no
   `(no metadata.commitStatusContext)` note.
2. GitHub shows the terminal states.
   `node scripts/commit-status-order.mjs github`
   Expect `success` for `Status Pass` and `failure` for `Status Fail`.
3. A late RUN_START is dropped (the fix).
   `node scripts/commit-status-order.mjs replay`
   Expect `delivery=skipped` for each RUN_START and GitHub unchanged.
4. Without the context, a late RUN_START wins (the bug).
   `node scripts/commit-status-order.mjs legacy`
   Expect `delivery=success` and both contexts on `pending`.
5. Put the statuses back.
   `node scripts/commit-status-order.mjs restore`
