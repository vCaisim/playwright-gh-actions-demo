# Run comment race (ENG-1421)

## The problem

`postGithubPRComment` writes the GitHub run comment in three steps:

```
read the comment  ->  canWriteOverComment  ->  write it
```

The check only knows what the read returned. Another delivery can write in
between, and nothing looks again — so whichever delivery writes **last** wins,
even when it carries an older render.

```
A (old render)   read ───────────────────────── write A   <- comment ends here
B (new render)        read ──── write B
                      ^
                      A has already read, so A's check never sees B
```

`fix/lock-run-comment-delivery` puts the read and the write in one Redis mutex.
B cannot read until A has written, so B's check sees A's render and answers
correctly.

```
A   [ lock: read -> write A ]
B                            [ lock: read -> write B ]   B reads A's body
```

Reproducing this needs the two reads to land **before** either write. Spacing the
deliveries out does not do it: whichever goes second reads what the first wrote,
and every order is then correct.

## Where the collisions come from

One comment serves a `repo + issue + projectId + framework`, and
`updateOrPostGithubIssueComment` is the only thing that writes it. So there are
four ways two writers meet on it:

| collision                                           | ordered by                                                              | covered by                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| edits of one run, one per group                     | `snapshotAt`                                                            | **A**                                                                     |
| two runs on the same pull request                   | `runStartedAt`                                                          | **B**                                                                     |
| a run's post and its own first edit                 | `RetriableError('Run comment not posted yet')`, which predates the lock | **C**, as a control                                                       |
| a delivery and its own retry (BullMQ `attempts: 3`) | nothing — the retry re-reads the notification                           | no scenario: it writes the same render or a newer one, never an older one |

A and B are the two the lock is for, and they are the two comparisons
`canWriteOverComment` makes.

## Setup

| branch (currents repo)           | what it is                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| `test/run-comment-status-board`  | `feat/run-comment-status-board` + the hook, **no lock**       |
| `test/lock-run-comment-delivery` | `fix/lock-run-comment-delivery` + the hook, **with the lock** |

Both carry `packages/notifications-service/src/github/raceDelay.ts`, a test hook
that waits on each side of the read. It does nothing unless one of its variables
is set. Put them in `packages/change-streams/.env`:

```sh
RACE_READ_AT_MS=45000     # scenarios A and C
RACE_WRITE_HOLD_MS=4000   # scenario B
```

Set one at a time — with both, `RACE_READ_AT_MS` wins. Take them out again when
you are done, or every run comment on this stack goes out a minute late.

Then, for each branch you test:

```sh
git checkout test/run-comment-status-board   # or test/lock-run-comment-delivery
yarn workspace @currents/notifications-service build
# restart change-streams
```

Push a commit to the demo pull request to run a scenario. No marker in the commit
subject runs **A**; `[b]` and `[c]` run the others.

The job finishes well before the comment does: scenario A holds its deliveries
until 45 seconds after the run started, so give it a minute after the run turns
green.

## What each scenario shows

|       | what races          | compared by    | without the lock                             | with the lock                 |
| ----- | ------------------- | -------------- | -------------------------------------------- | ----------------------------- |
| **A** | 4 groups of one run | `snapshotAt`   | ends on an **earlier board**, always 4 edits | ends on **4 of 4**, 2–3 edits |
| **B** | 4 runs, one comment | `runStartedAt` | **not** the last-started run, 2–6 runs in 10 | always the last-started run   |
| **C** | nothing             | —              | one comment, final board                     | identical                     |

A is the one to use: it lands on a stale render on effectively every run. B
exercises the other comparison in `canWriteOverComment` but is a coin toss — see
below.

---

### A — four groups of one run

Four Playwright projects are four Currents groups, finishing three seconds apart,
so the run produces four different boards. All four edits are held until
`runStartedAt + RACE_READ_AT_MS`, read together, then write on an inverted
staircase: the oldest render waits longest.

```
run starts ──20s──┬── group 1 ──┬── group 2 ──┬── group 3 ──┬── group 4
                     3s            3s            3s

                              all four held to runStartedAt + 45s
                                            |
  group 4 (newest)  read ─┤2.1s├─ write     |   <- writes first
  group 3           read ─┤2.4s├──── write  |
  group 2           read ─┤2.7s├─────── write
  group 1 (oldest)  read ─┤3.0s├────────── write   <- writes last, and wins
```

**Without the lock** all four read the posted board, so all four pass the
ownership check and all four write. The comment settles on whichever wrote last,
which the staircase makes group 1. Four edits, every time.

Look at the **Groups** section of the comment — `getGroupsTable` draws it once a
run has more than one group, one row per group with its spec files complete:

```
| GroupId | Results | Spec Files Progress |
| group-1 | 🟢 1     | 1 / 1 |   <- stale comment stops here
| group-2 | ⚪️ 0     | 0 / 1 |
| group-3 | ⚪️ 0     | 0 / 1 |
| group-4 | ⚪️ 0     | 0 / 1 |
```

Currents will show all four complete. That mismatch is the bug.

**With the lock** the edits go one at a time, and whichever runs after another
reads that one's render — so the older ones skip. The comment settles on 4 of 4,
after two or three edits rather than four. The count depends on the order they
take the lock in; the final board does not.

Modelled over 5000 runs against the same decision rules, sweeping GitHub latency
from 300ms to 1.5s of jitter: without the lock the comment ends on a stale board
93–100% of the time, usually group 1. A slow GitHub call can eat the 300ms
between two writes and let group 2 or 3 win instead, which is still stale. With
the lock it ends on group 4 in every configuration.

Four groups and not more: with the lock the holds run one after another inside
the mutex's 20 second retry policy, and eight would not fit.

### B — four runs racing for one comment

Four runs start at the same instant with the same work, so they finish together.
`RACE_WRITE_HOLD_MS` holds every delivery between its read and its write, which
is what puts all four reads ahead of all four writes.

```
run 1   read ──┤4s├── write
run 2   read ──┤4s├── write     all four read before any of them writes
run 3   read ──┤4s├── write
run 4   read ──┤4s├── write
```

The run that should own the comment is whichever Currents stamped last — read the
start times in Currents, not the `b1..b4` suffix. Four and not more, for the same
reason scenario A uses four groups.

**Without the lock** which write lands last is chance, and the rate depends
almost entirely on how tightly the four `npx pwc` processes get their runs
created. Modelled over 5000 runs: about 6 in 10 when the four starts fall within
400ms of each other, 3 in 10 at 1.5s apart, under 2 in 10 at 3s apart. A run that
starts clearly last claims the comment at its own RUN_START, before the others'
finish deliveries read. Check the four start times in Currents, and run it
several times.
**With the lock** it names the last-started run every time, at every spread.

It cannot be made deterministic here: the runs share no clock to hold to.

### C — one run, one group

```
one run, one group -> one post, one edit, nothing to overlap
```

Run it with scenario A's `RACE_READ_AT_MS`, so the edit still goes through the
hold. One comment with the final board, identical on both branches. A difference
here would mean the hook changed the outcome rather than the lock.

## Reading the logs

`change-streams` logs one line per hold. In scenario A, on either branch, expect
four of each:

```
RACE_READ_AT_MS holding the delivery before it reads the comment
Holding the delivery between its read and its write
```

`holdMs` should descend by about 300ms across the four, and `age` should ascend
by about 3000ms.

| log line                                             | what it means                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| neither line appears                                 | the hook is not running — variable missing, or a stale build     |
| `no ownership marker`                                | the render carries no marker, so there is nothing to order it by |
| `older than its own run`                             | the marker is unusable, so this render won by accident           |
| `RACE_READ_AT_MS has already passed`                 | the run outlived the window — raise it                           |
| `shorter than the run, writes are no longer ordered` | same, and the staircase has collapsed                            |

Then count `Updating GitHub PR comment`: four without the lock, fewer with it,
where the ones that lost say `Skipping PR comment: a newer run owns it`.
