# Dry-run

Dry-run lets you **preview a migration against a real database** without
committing it to history. The migration body still executes; the changelog
write is skipped.

## What dry-run does (and doesn't do)

| behavior                             | dry-run | normal |
| ------------------------------------ | :-----: | :----: |
| Loads migration modules              |   yes   |  yes   |
| Calls your `up` / `down` function    |   yes   |  yes   |
| Runs `ctx.logger` captures           |   yes   |  yes   |
| Inserts into `changelog` collection  | **no**  |  yes   |
| Deletes from `changelog` (on `down`) | **no**  |  yes   |
| Rolls back DB writes automatically   | **no**  |   no   |

::: warning Dry-run executes your code
mongoshift does **not** wrap your migration in a sandbox or a transaction. If
your `up` calls `db.dropCollection("users")`, dry-run will drop the collection.
Your migration must opt in to dry-run-safety via `ctx.dryRun`.
:::

## Making a migration dry-run-aware

Check `ctx.dryRun` and skip (or preview) destructive operations:

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  const users = db.collection("users");
  const toUpdate = await users.countDocuments({ legacyFlag: true });
  ctx.logger.log(`found ${toUpdate} legacy users`);

  if (ctx.dryRun) {
    ctx.logger.log(`would set legacyFlag=false on ${toUpdate} users`);
    return;
  }

  await users.updateMany({ legacyFlag: true }, { $set: { legacyFlag: false } });
};
```

A read-only `countDocuments` is safe to run in dry-run - so do it, log the
number, and short-circuit before the `updateMany`.

## Pattern: preview, then commit

```ts
// Reusable wrapper for the "preview-only" pattern.
const apply = async (ctx: MigrationContext, label: string, fn: () => Promise<number>) => {
  if (ctx.dryRun) {
    ctx.logger.log(`[dry-run] ${label}`);
    return 0;
  }
  const n = await fn();
  ctx.logger.log(`${label}: ${n} doc(s)`);
  return n;
};

export const up = async (db, client, ctx) => {
  await apply(ctx, "drop stale sessions", async () => {
    const res = await db.collection("sessions").deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return res.deletedCount;
  });
};
```

## Running dry-run

### CLI

```bash
npx mongoshift up --dry-run
npx mongoshift down --dry-run
npx mongoshift down --dry-run --block
```

Output looks like normal output, labelled `DRY-RUN UP` / `DRY-RUN DOWN`, with
each migration tagged `[SKIP]` instead of `[OK]`:

```
[DRY-RUN UP] 2 migration(s)
  [SKIP] 20260404101010-add_indexes.ts (3ms)
      log: would create index { email: 1 }
  [SKIP] 20260405091122-backfill_flags.ts (18ms)
      log: found 412 legacy users
      log: would set legacyFlag=false on 412 users
```

### Programmatic

```ts
import { loadConfig, connect, up } from "mongoshift";

const config = await loadConfig();
const { db, client, close } = await connect(config);
try {
  const preview = await up(db, client, config, { dryRun: true });
  for (const m of preview.migrations) {
    console.log(m.fileName, m.logs);
  }
} finally {
  await close();
}
```

`preview.dryRun` is `true` and every report has `applied: false`.

## Typical workflows

::: tip CI previews
Run `mongoshift up --dry-run` in CI before a production deploy. Fail the
pipeline if the output contains anything unexpected.
:::

::: tip Local verification
Dry-run against a restored prod snapshot to validate long backfills before
they run for real.
:::

## Related

- [migrations](./migrations.md) - the `ctx` object in full
- [stored-logs](./stored-logs.md) - your dry-run logs are captured too,
  even though the changelog is not written
