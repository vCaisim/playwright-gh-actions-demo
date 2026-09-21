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

Runs of the same project therefore share one comment and have to agree on who
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

Each delivery reads the comment, decides whether it may write, then writes.
`canWriteOverComment` makes that decision from the ownership marker: within one
run it compares `snapshotAt`, and between runs it compares `runStartedAt`, so the
run that started later owns the comment. GitHub has no conditional comment
update, so that check cannot be part of the write — between deciding and writing,
another delivery decides the same thing, and whichever writes last wins.

**That only hurts when the last write carries the older render**, which is the
part that decides whether a scenario reproduces anything:

- Within one run, events are spaced out and the deliveries start in render
  order, so they finish in render order too. The newest render writing last is
  the correct answer, and nothing goes wrong. That is scenario A, and it is why
  it does not show the bug.
- Between runs that finish at the same instant, nothing about the order the
  deliveries write in reflects which run should own the comment. The ownership
  check is the only thing that can pick the winner, and without the lock it is
  bypassed. That is scenario B.

| folder                       | what overlaps                                | shows the bug?               |
| ---------------------------- | -------------------------------------------- | ---------------------------- |
| `scenario-b-racing-runs`     | five runs finishing at one instant           | yes — the one to use         |
| `scenario-a-parallel-groups` | eight group finishes of one run, 250ms apart | no — see What you should see |
| `scenario-c-control`         | nothing — one group                          | no, it is the control        |

Scenario C does not race. An edit that arrives before the comment exists already
backs off with `RetriableError('Run comment not posted yet')`, and that guard is
in the base branch, not this PR. C is there to prove the harness works and that
the lock does not change the simple path: if C differs between the two branches,
something else is wrong.

## Running one

Push a commit to your pull request, as you already do. The scenario is chosen by
a marker in the commit subject; no marker runs B, the one that shows the bug.

```bash
git commit --allow-empty -m "test: racing runs"           # scenario B
git commit --allow-empty -m "test: parallel groups [a]"   # scenario A
git commit --allow-empty -m "test: control [c]"           # scenario C
git push
```

Or run it by hand from the Actions tab — the workflow has a `scenario` input,
which also defaults to B.

Either way the branch needs an **open pull request**. The run comment is found
from the commit's pull request, so a run on a branch without one produces no
comment at all and the delivery logs `Skipping PR comment: No PR found` — which
looks like a broken setup rather than a missing pull request.

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

Run each scenario on `feat/run-comment-status-board` (no lock) and again on
`fix/lock-run-comment-delivery` (lock). The comment on the pull request is the
evidence; the logs confirm why.

**Start with scenario B.** It is the only one that reproduces the stale comment.
Scenario A shows the lock suppressing superseded writes but always ends on the
correct board, and C is the control.

### Scenario B — five runs finishing at one instant

**This is the scenario that shows the bug.** Five runs start one second apart, so
each has a distinct `runStartedAt` and exactly one of them — b5, the last to
start — is the correct owner. Every run then aims at the same finish, so their
deliveries reach the comment together and nothing about their order reflects
which run should win.

The ownership check is then the only thing that can pick the winner. Without the
lock the last write wins instead, and that is b5 only one time in five.

|                                | without the fix                                      | with the fix                                                   |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------- |
| **which run owns the comment** | whichever wrote last — b5 only about 1 run in 5      | always b5                                                      |
| **the comment**                | usually shows an earlier run's board and links to it | b5's board                                                     |
| **logs**                       | all five deliveries report success                   | the four losers log `Skipping PR comment: a newer run owns it` |

The job log ends with the answer key:

```
expected owner: race-1234-1-b5 (started last)
```

Open the comment, follow its run link, and compare. If it lands on b1 through b4,
the older run won — that is the bug.

First check the finishes actually landed together. Each run prints its own line:

```
finished race-1234-1-b1 after 5000ms at 1790001629341
finished race-1234-1-b5 after 1000ms at 1790001629464
```

Five Node processes on a two-core runner contend, so expect more spread than the
~120ms this gets on a developer machine. Anything inside a few hundred
milliseconds still overlaps a delivery. If they are seconds apart the runs never
raced and the result means nothing either way.

One run without the lock has about a four in five chance of showing the bug. Two
runs put you at 96%. With the lock it should be b5 every time, and a single
counter-example is a real finding.

### Scenario A — eight groups of one run

**On its own this one does not reproduce the stale comment, by construction.** The groups
finish 250ms apart, so the deliveries start in render order and each takes about
the same time, which means they also finish in render order — and the newest
render writing last is the correct outcome. The staircase that defeats the
content-hash dedup also guarantees the right answer.

For the older render to land last, delivery order has to invert against render
age. In production that comes from independent Lambda cold starts and variable
GitHub latency; locally it would need one delivery to run 250ms slower than the
next, which is uncommon.

What it does show is the lock suppressing superseded writes:

|                          | without the fix                      | with the fix                                                       |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| **edits to the comment** | one per group, around seven or eight | far fewer, around three                                            |
| **final board**          | correct                              | correct                                                            |
| **logs**                 | every delivery reports success       | the superseded ones log `Skipping PR comment: a newer run owns it` |

A delivery that waited for the lock finds a newer render already on the comment
and correctly stands down, so the edit never happens. That is worth seeing, but
it is not the bug — for that, use scenario B.

Before reading anything into a scenario A run, check the staircase held. The job
log carries one line per group:

```
finished group-1 at 1789999601819
finished group-2 at 1789999602071
finished group-3 at 1789999602320
```

They should be about 250ms apart. If several share an instant, their boards were
identical and the content-hash gate collapsed them into one delivery.

#### Making scenario A reproduce it

The reason A is safe is that its deliveries keep their order. Remove the order
and it races like B does, within one run instead of between runs — which is worth
having, because it exercises the other branch of `canWriteOverComment`: B covers
the `runStartedAt` comparison between runs, A-with-the-hook covers the
`snapshotAt` comparison inside one.

Add `packages/notifications-service/src/github/raceDelay.ts` (it is in this
repo's PR description, or ask for it again) and call it once, before anything
reads the comment:

```ts
// on feat/run-comment-status-board, just above `const lastComment = await findExistingComment(`
await waitForRaceWindow(commentBody);

// on fix/lock-run-comment-delivery, just above `return await withRunCommentLock(`
await waitForRaceWindow(params.commentBody);
```

On the lock branch it has to go **before** the lock is taken, not inside it. A
delivery that sleeps while holding the lock burns the 20s lease and lets a second
one in, which is a different bug and would muddy the result.

The hook holds every delivery of a run until `runStartedAt + RACE_CONVERGE_MS`.
That anchor is the same value in every delivery's own marker, so they converge
without coordinating; anything derived from `snapshotAt` differs per delivery and
would preserve the spacing. Verified: eight deliveries that would step 250ms
apart write within 2ms of each other.

```bash
RACE_CONVERGE_MS=60000   # on the change-streams process
```

Set it longer than the run takes to reach its last group, or the early deliveries
have nothing left to wait for — the hook warns
`RACE_CONVERGE_MS window already passed, delivery not held` when that happens,
which means the run proved nothing.

|                 | without the lock                              | with the lock                                                      |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| **final board** | often stale — groups left on `🔄 In Progress` | correct, all eight `✅ Passed`                                     |
| **logs**        | every delivery reports success                | the superseded ones log `Skipping PR comment: a newer run owns it` |

Remove the hook and its call when you are done; neither belongs in the branch.

### Scenario C — control, one group

|                 | without the fix          | with the fix                                 |
| --------------- | ------------------------ | -------------------------------------------- |
| **the comment** | one comment, final board | one comment, final board                     |
| **logs**        | no skips, no retries     | no skips; at most a lock acquire and release |

Identical on both branches, by design. A difference here means the setup is
wrong, not that the lock is doing something.

### A note on combining the widener with these scenarios

The widener adds three seconds inside the lock, so with the lock on the
deliveries serialize at three seconds each.

Scenario B is fine: five runs is fifteen seconds, inside the lock's 20s retry
budget.

Scenario A is not: eight groups is roughly twenty-four seconds, past that budget,
so the last waiters give up and log `Another delivery holds the run comment`
before coming back on a retry. That is correct behaviour rather than a failure,
but if you would rather not see it, run A with four groups instead of eight, or
drop the widener to one second.

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

- **B** — one spec whose duration comes from `RUN_WORK_MS`, launched five times
  as concurrent processes in a single workflow step. Run `i` starts at second
  `i-1` and works for `RUNS-i+1` seconds, so the starts are a second apart and
  the finishes land together. Distinct `CURRENTS_CI_BUILD_ID` values are what
  make them five runs rather than five machines of one.
- **A** — one spec, eight Playwright projects (so eight Currents groups), eight
  workers. `globalSetup.ts` fixes one instant for the whole run and `barrier.ts`
  releases the groups from it 250ms apart. The stagger is what defeats the
  content-hash dedup: identical boards collapse into one delivery, different
  boards do not. If orchestration overruns the barrier the staircase still
  holds — the step is added to whatever is left of the barrier, not to the
  barrier itself.
- **C** — one spec that does nothing, one group, so nothing overlaps.

None of them launch a browser. The scenarios are about delivery timing, and a
page load would only add jitter.
