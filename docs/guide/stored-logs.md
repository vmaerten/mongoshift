# Stored logs

Every log emitted via `ctx.logger` is captured and **persisted inline in the
changelog entry**. No separate log store, no grep through CI output - the
history of every applied migration travels with the migration record itself.

## The logger

```ts
interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}
```

Usage inside a migration:

```ts
export const up = async (db, client, ctx) => {
  ctx.logger.log("starting backfill");
  const cursor = db.collection("orders").find({ total: { $exists: false } });
  let n = 0;
  for await (const doc of cursor) {
    await db
      .collection("orders")
      .updateOne({ _id: doc._id }, { $set: { total: (doc.subtotal ?? 0) + (doc.tax ?? 0) } });
    n++;
  }
  ctx.logger.log(`backfilled ${n} orders`);
  if (n === 0) ctx.logger.warn("no orders matched - migration was a no-op");
};
```

## Changelog entry shape

After a successful `up`, a document is inserted into
`config.changelogCollectionName` (default `"changelog"`):

```json
{
  "_id": "...",
  "fileName": "20260405091122-backfill_totals.ts",
  "appliedAt": { "$date": "2026-04-05T09:11:23.456Z" },
  "migrationBlock": 1743847883111,
  "durationMs": 1842,
  "logs": [
    { "level": "log", "message": "starting backfill", "at": { "$date": "..." } },
    { "level": "log", "message": "backfilled 3127 orders", "at": { "$date": "..." } }
  ],
  "fileHash": "b1d2..."
}
```

Fields:

| field            | type         | when                               |
| ---------------- | ------------ | ---------------------------------- |
| `fileName`       | `string`     | always                             |
| `appliedAt`      | `Date`       | always                             |
| `migrationBlock` | `number`     | always (batch stamp)               |
| `durationMs`     | `number`     | always - wall-clock time of `up()` |
| `logs`           | `LogEntry[]` | always (may be empty)              |
| `fileHash`       | `string?`    | only when `useFileHash: true`      |

::: info Why inline?
Storing logs inside the changelog doc means a migration and its audit trail
are **atomic to read**. You can answer "what did migration X print the day
it ran?" with a single `findOne`.
:::

## Querying the audit trail

### From mongosh

```js
use my_db

// Latest 5 migrations with their logs
db.changelog.find({}, {
  fileName: 1, appliedAt: 1, durationMs: 1, logs: 1,
}).sort({ appliedAt: -1 }).limit(5);

// Any migration that emitted a warning or error
db.changelog.find({ "logs.level": { $in: ["warn", "error"] } },
                  { fileName: 1, logs: 1 });

// Slowest migrations
db.changelog.find({}, { fileName: 1, durationMs: 1 })
            .sort({ durationMs: -1 }).limit(10);

// Search log messages (regex)
db.changelog.find({ "logs.message": /timeout/i },
                  { fileName: 1, "logs.$": 1 });
```

### Programmatically

```ts
import { loadConfig, connect } from "mongoshift";

const config = await loadConfig();
const { db, close } = await connect(config);
try {
  const failed = await db
    .collection(config.changelogCollectionName)
    .find({ "logs.level": "error" })
    .toArray();
  console.table(failed.map((d) => ({ file: d.fileName, when: d.appliedAt })));
} finally {
  await close();
}
```

## `durationMs`

`durationMs` is set for **every** run - successful or not, dry-run or not.
For dry-runs it is reported in the `MigrationRunReport` but **not persisted**,
because dry-run skips the changelog write.

Use it to:

- Track migration performance over time in CI
- Alert when a migration takes longer than expected
- Build a dashboard of historical migration durations

## CLI mirror

The CLI also prints each log entry to stdout after the migration finishes:

```
[UP] 1 migration(s)
  [OK] 20260405091122-backfill_totals.ts (1842ms)
      log: starting backfill
      log: backfilled 3127 orders
```

The mirror is for immediate feedback; the authoritative record lives in the
changelog.

## Programmatic capture logger

If you want the same capture behavior outside a migration run, import the
helper:

```ts
import { createCaptureLogger } from "mongoshift";

const logger = createCaptureLogger({ mirrorToConsole: true });
logger.log("hi");
logger.warn("careful");
console.log(logger.entries);
// [{ level: "log", message: "hi", at: Date }, { level: "warn", ... }]
```

## Related

- [migrations](./migrations.md) - the `ctx` object
- [dry-run](./dry-run.md) - logs are still captured, just not persisted
