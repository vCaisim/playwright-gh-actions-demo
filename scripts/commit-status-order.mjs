// Drives ENG-1356 (currents-dev/currents#3883) by hand against the local Currents
// stack: reads the commit status notifications a real run wrote, and re-delivers
// them through the real handleNotification in the order that broke production.
//
//   node scripts/commit-status-order.mjs status  [sha|runId]
//   node scripts/commit-status-order.mjs replay  [sha|runId]  # late RUN_START, with the guard
//   node scripts/commit-status-order.mjs legacy  [sha|runId]  # late RUN_START, as before the PR
//   node scripts/commit-status-order.mjs restore [sha|runId]  # re-post RUN_FINISH
//   node scripts/commit-status-order.mjs github  [sha|runId]  # what GitHub shows now
//
// With no sha or runId, the most recent run that wrote a commit status is used.
// Needs the Currents packages built (`turbo run build --filter=@currents/notifications-service...`).
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const CURRENTS = process.env.CURRENTS_REPO ?? "/Users/slavic/Projects/currents";
const CHANGE_STREAMS = path.join(CURRENTS, "packages/change-streams");
const requireFromCurrents = createRequire(path.join(CHANGE_STREAMS, "package.json"));

// Same env as the local change-streams worker, which is what delivers notifications
// locally, and loaded before the packages because some read process.env at import.
requireFromCurrents("dotenv").config({
  path: [path.join(CHANGE_STREAMS, ".env"), path.join(CHANGE_STREAMS, ".env.default")],
  quiet: true,
});
const mongo = requireFromCurrents(path.join(CURRENTS, "packages/mongo/dist/index.js"));
const { handleNotification } = requireFromCurrents(
  path.join(CURRENTS, "packages/notifications-service/dist/index.js")
);

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/?readPreference=primary&directConnection=true&ssl=false";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "currents";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "vCaisim/playwright-gh-actions-demo";

const [command = "status", target] = process.argv.slice(2);
const notifications = () => mongo.Collection.notifications();
const eventOf = (doc) => doc.key.split(":").at(-3);

async function findRun() {
  const filter = { "destination.type": "commit_status" };
  if (target) filter.$or = [{ "destination.context.sha": target }, { runId: target }];
  const latest = await notifications().findOne(filter, { sort: { createdAt: -1 } });
  if (!latest) throw new Error(`No commit status notifications for ${target ?? "any run"}`);
  const docs = await notifications()
    .find({ runId: latest.runId, "destination.type": "commit_status" })
    .sort({ createdAt: 1 })
    .toArray();
  return { runId: latest.runId, sha: latest.destination.context.sha, docs };
}

function printDocs({ runId, sha, docs }) {
  console.log(`run ${runId}  sha ${sha}`);
  for (const d of docs) {
    const context = d.metadata?.commitStatusContext ?? JSON.parse(d.payload).context;
    const recorded = d.metadata?.commitStatusContext ? "" : "  (no metadata.commitStatusContext)";
    console.log(
      `  ${eventOf(d).padEnd(12)} ${JSON.parse(d.payload).state.padEnd(8)} ` +
        `delivery=${String(d.delivery).padEnd(8)} ${d.createdAt.toISOString()}  ${context}${recorded}`
    );
  }
}

async function deliver(docs) {
  for (const d of docs) {
    await handleNotification({ id: d._id.toString() });
    const after = await notifications().findOne({ _id: d._id });
    console.log(`  delivered ${eventOf(d)} ${d.key} -> delivery=${after.delivery}`);
  }
}

function printGithub(sha) {
  // The combined status holds the newest status per context, which is what a
  // required check reads.
  const out = execFileSync("gh", [
    "api",
    `repos/${GITHUB_REPO}/commits/${sha}/status`,
    "--jq",
    '.statuses[] | [.state, .updated_at, .context] | @tsv',
  ]).toString();
  console.log(`GitHub, newest status per context on ${sha}:`);
  console.log(out.replace(/^/gm, "  ").trimEnd());
}

async function main() {
  await mongo.initMongoNoIndexes(MONGODB_URI, MONGODB_DATABASE, { name: "commit-status-order" });
  const run = await findRun();
  const starts = run.docs.filter((d) => eventOf(d) === "RUN_START");
  const finishes = run.docs.filter((d) => eventOf(d) !== "RUN_START");

  switch (command) {
    case "status":
      printDocs(run);
      break;
    case "replay":
      // The notification RUN_FINISH superseded is still there, newer, so the guard
      // should record `skipped` and GitHub should not change.
      console.log("Re-delivering RUN_START after RUN_FINISH (with the guard):");
      await deliver(starts);
      break;
    case "legacy": {
      // A copy without the context is what a notification queued before the PR
      // looks like: the guard has nothing to compare and posts, as production did.
      console.log("Re-delivering RUN_START after RUN_FINISH as a pre-PR document:");
      const copies = starts.map(({ _id, metadata, ...d }) => ({
        ...d,
        key: d.key.replace(/:commit_status:.*$/, `:commit_status:legacy${Date.now()}`),
        delivery: "pending",
        history: [],
      }));
      const { insertedIds } = await notifications().insertMany(copies);
      await deliver(copies.map((c, i) => ({ ...c, _id: insertedIds[i] })));
      console.log("GitHub should now show `pending`. Run `restore` to put the terminal state back.");
      break;
    }
    case "restore":
      console.log("Re-posting RUN_FINISH:");
      await deliver(finishes);
      break;
    case "github":
      printGithub(run.sha);
      break;
    default:
      throw new Error(`Unknown command ${command}`);
  }
  if (command !== "status" && command !== "github") printGithub(run.sha);
  await mongo.disconnectMongo();
}

main().catch(async (e) => {
  console.error(e);
  await mongo.disconnectMongo().catch(() => {});
  process.exit(1);
});
