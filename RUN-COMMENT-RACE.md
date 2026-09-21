# Run comment race scenarios

Three scenarios that make concurrent run comment deliveries happen on a real
pull request, so the fix in currents-dev/currents#3810 can be shown working and
not working.

## What the scenarios exploit

Currents keeps **one** comment per project and framework on the pull request —
that pair is what `getCommentIdMarker` writes into the body to find it again. A
run opens that comment at run start, takes ownership of it with a second marker,
and rewrites it on every later event. Each rewrite is one delivery, and
deliveries run in parallel (the local change-streams worker runs ten at a time).

Two runs of the same project therefore share one comment and have to agree on who
owns it. That is scenario B.

The webhook processor raises exactly three events, all of them **per group**
(`packages/webhooks/src/processor.ts`):

- `RUN_START` — once per group, deduplicated at the queue
- `RUN_FINISH` — per group, deliberately **not** deduplicated
- `RUN_TIMEOUT` — per group, on a timed-out finish

There is no per-spec event. `INSTANCE_FINISH` exists in the GraphQL enum but the
processor never dispatches it, so adding spec files changes nothing.

**Groups are the dial, and `@currents/playwright` makes one group per Playwright
project** — it sends `group: <project name>` when it creates the run. Eight
projects under one ci-build-id is one run with eight groups, and so eight
comment updates.

There is a second gate. The orchestrator drops an event whose rendered comment
is byte-identical to the stored one, and keys each queued edit on that render's
hash, so identical renders collapse into a single delivery. Groups finishing at
the same instant produce **one** delivery, not eight.

That is why scenario A releases its projects 250ms apart rather than together:
each finishes with a different number of tests done, so each renders a different
board. 250ms is well under the few hundred milliseconds a delivery spends on its
GitHub round trips, so the deliveries are still in flight together.

Each delivery reads the comment, decides whether its render is newer, then
writes. Without a lock the read and the write of two deliveries interleave, both
decide they are newer, and whichever writes last wins — which may be the one
carrying the older board.

| folder                       | what overlaps                                | shows the bug?        |
| ---------------------------- | -------------------------------------------- | --------------------- |
| `scenario-a-parallel-groups` | eight group finishes of one run, 250ms apart | yes                   |
| `scenario-b-two-runs`        | two runs sharing one pull request comment    | yes                   |
| `scenario-c-control`         | nothing — one group                          | no, it is the control |

Scenario C does not race. An edit that arrives before the comment exists already
backs off with `RetriableError('Run comment not posted yet')`, and that guard is
in the base branch, not this PR. C is there to prove the harness works and that
the lock does not change the simple path: if C differs between the two branches,
something else is wrong.

## Running one

Push a commit to your pull request, as you already do. The scenario is chosen by
a marker in the commit subject; no marker runs A.

```bash
git commit --allow-empty -m "test: parallel groups"      # scenario A
git commit --allow-empty -m "test: two runs [b]"         # scenario B
git commit --allow-empty -m "test: control [c]"          # scenario C
git push
```

Or run it by hand from the Actions tab — the workflow has a `scenario` input.

Run **one scenario per commit**. Every scenario reports to the same Currents
project, so they all write the same pull request comment; two at once tells you
nothing.

`rerun-shards-pwc.yml` was switched off its `pull_request` trigger for the same
reason. Re-enable it when you are finished with these scenarios.

## Showing before and after

**No changes to the currents code are needed.** The two branches already are the
before and the after:

```bash
git checkout feat/run-comment-status-board   # before: the comment, no lock
git checkout fix/lock-run-comment-delivery   # after: the lock
```

`feat/run-comment-status-board` carries ENG-1366, so the comment is opened at run
start and edited in place, but nothing serializes the deliveries. The lock only
arrives on the branch above it. Rebuild `@currents/notifications-service` and
restart `change-streams` after switching.

Everything below is optional, for when you want to iterate faster or make a
stubborn scenario fire every time.

**Skipping the rebuild.** If switching branches each time is tedious, add this at
the top of `withRunCommentLock` in
`packages/notifications-service/src/github/runCommentLock.ts`:

```ts
if (process.env.DISABLE_RUN_COMMENT_LOCK) return fn();
```

It is the same path the code already takes when Redis is unreachable, so it is
still a real code path. Set the variable on `change-streams`.

Do not disable the lock with a broken `REDIS_URI` instead — it works, but it
takes out every other Redis user in the stack at the same time.

**Widening the window.** The scenarios are built so the overlap happens on its
own, but the natural gap between a delivery's read and its write is only a few
hundred milliseconds, and the scenarios aim their finishes at roughly that same
margin. If a run comes back showing no difference between the branches, widen the
gap so the margin stops mattering: add this in
`packages/notifications-service/src/github/github.comment.ts`, right after
`findExistingComment` returns and before the write:

```ts
await new Promise((r) => setTimeout(r, 3000));
```

Any two deliveries starting within three seconds then overlap. Keep it at three:
the lock's lease is twenty seconds, and a longer delay trips lease expiry
instead, which is a different bug.

With the lock on this delay is harmless — deliveries serialize and each takes its
own three seconds. With the lock off they all sit in the window together.

## What you should see

Run each scenario twice: once on `feat/run-comment-status-board` (no lock) and
once on `fix/lock-run-comment-delivery` (lock). The comment on the pull request
is the evidence; the logs confirm why.

### Scenario A — eight groups of one run

|                             | without the fix                                                          | with the fix                                              |
| --------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| **the group table**         | one or more groups still say `🔄 In Progress` on a run that has finished | all eight say `✅ Passed`                                 |
| **does it correct itself?** | no: the run is over, so nothing comes along to fix it                    | n/a                                                       |
| **number of comments**      | one                                                                      | one                                                       |
| **logs**                    | all eight deliveries report success                                      | the losers log `Skipping PR comment: a newer run owns it` |

A finished run with groups stuck on `🔄 In Progress` is the thing to look for.
It is the whole bug in one line: the last write of the run carried an older
render, and that render was taken before those groups finished.

Before reading anything into the comment, check the staircase held. The job log
carries one line per group:

```
finished group-1 at 1789999601819
finished group-2 at 1789999602071
finished group-3 at 1789999602320
```

They should be about 250ms apart. If several share an instant, their boards were
identical, the content-hash gate collapsed them into one delivery, and the run
proved nothing either way — re-run it.

### Scenario B — two runs on one pull request

|                       | without the fix                                             | with the fix                                       |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| **the comment**       | can end up showing **b1**, the older run, and linking to it | b2, the newer run                                  |
| **which run owns it** | whichever wrote last, which is not always the newer one     | always b2                                          |
| **logs**              | both runs' deliveries report success                        | b1 logs `Skipping PR comment: a newer run owns it` |

Check the two `finished after ...` lines in the job log are close together
before reading the comment; if they are seconds apart the deliveries never
overlapped.

Both runs are two processes on one runner, so nothing about CI timing can pull
them apart. b1 starts first and works for six seconds; b2 starts three seconds
later and works for three. That gives b2 an unambiguously later `runStartedAt`
while both finish within a couple of hundred milliseconds of each other.

Both halves are needed. Ownership is decided by `runStartedAt` with a `>=`
comparison, so two runs starting in the same millisecond may each write over the
other and there is no correct owner to check the comment against. Finishing
together is what puts their deliveries in flight at the same time.

### Scenario C — control, one group

|                 | without the fix          | with the fix                                 |
| --------------- | ------------------------ | -------------------------------------------- |
| **the comment** | one comment, final board | one comment, final board                     |
| **logs**        | no skips, no retries     | no skips; at most a lock acquire and release |

Identical on both branches, by design. A difference here means the setup is
wrong, not that the lock is doing something.

### A note on combining the widener with scenario A

The widener adds three seconds inside the lock. With the lock on, eight groups
then serialize into roughly 24 seconds, which is longer than the lock's 20s
retry budget — so the last waiters give up and log
`Another delivery holds the run comment`, then come back on a retry. That is
correct behaviour, not a failure. If you would rather not see it, use the
widener with four groups instead of eight, or drop it to one second.

## Watching it happen

Lock keys come and go for each delivery:

```bash
docker exec currentsredis redis-cli --scan --pattern 'lock:github:run-comment:*'
```

Three log lines in `change-streams` tell the story:

- `Skipping PR comment: a newer run owns it` — a delivery correctly stood down
- `Another delivery holds the run comment` — a waiter backing off to retry
- `Run comment lock unavailable, proceeding without it` — Redis did not answer
  and the lock was skipped; this is the one that matters operationally

## Cleaning up

Re-enable the `pull_request` trigger in `.github/workflows/rerun-shards-pwc.yml`.

If you took either optional edit above, drop it too — the default route changes
no currents code, so on a clean run there is nothing else to undo:

```bash
git checkout packages/notifications-service/src/github/runCommentLock.ts \
             packages/notifications-service/src/github/github.comment.ts
```

## How the scenarios are built

- **A** — one spec, eight Playwright projects (so eight Currents groups), eight
  workers. `globalSetup.ts` fixes one instant for the whole run and `barrier.ts`
  releases the groups from it 250ms apart. The stagger is what defeats the
  content-hash dedup: identical boards collapse into one delivery, different
  boards do not. If orchestration overruns the barrier the staircase still
  holds — the step is added to whatever is left of the barrier, not to the
  barrier itself.
- **B** — one spec whose duration comes from `RUN_WORK_MS`, launched twice as
  concurrent processes in a single workflow step under two different
  `CURRENTS_CI_BUILD_ID` values. Different build ids is what makes them two runs
  rather than two machines of one; the offset start with matching finish is what
  makes one of them clearly newer while their deliveries still collide.
- **C** — one spec that does nothing, one group, so nothing overlaps.

None of them launch a browser. The scenarios are about delivery timing, and a
page load would only add jitter.
