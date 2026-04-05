# Writing migrations

A migration is an ESM module that exports two async functions: `up` and
`down`. mongoshift imports them at runtime using Node's native loader.

## File naming

`mongoshift create "<description>"` produces files like:

```
<timestamp>-<slug><ext>
20260405091122-add_users_collection.ts
```

- **timestamp** - formatted via `config.dateFormat` (dayjs tokens)
- **slug** - lowercased, non-alphanumeric characters replaced with `_`
- **ext** - `config.migrationFileExtension` (`.ts`, `.js`, or `.mjs`)

Ordering is **lexicographic by filename**. The default `YYYYMMDDHHmmss` format
sorts chronologically, which is what you want.

::: warning Don't rename applied files
The file name is the primary key in the changelog. Renaming an applied file
makes it look pending again, and a new row will be inserted on the next `up`.
:::

## Anatomy

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext): Promise<void> => {
  ctx.logger.log("backfilling user.createdAt");
  if (ctx.dryRun) return;
  await db
    .collection("users")
    .updateMany({ createdAt: { $exists: false } }, { $currentDate: { createdAt: true } });
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext): Promise<void> => {
  await db.collection("users").updateMany({}, { $unset: { createdAt: "" } });
};
```

### Arguments

| name     | type               | description                                           |
| -------- | ------------------ | ----------------------------------------------------- |
| `db`     | `Db`               | The connected database from the driver                |
| `client` | `MongoClient`      | The underlying client (for transactions, sessions...) |
| `ctx`    | `MigrationContext` | `{ dryRun: boolean, logger: Logger }`                 |

### The `ctx` object

```ts
interface MigrationContext {
  dryRun: boolean;
  logger: {
    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
}
```

- **`ctx.dryRun`** - `true` when the user passed `--dry-run` or
  `{ dryRun: true }`. Your migration should skip destructive operations.
  See [dry-run](./dry-run.md).
- **`ctx.logger`** - every call is captured with `{ level, message, at }` and
  persisted in the changelog entry alongside `durationMs`. See
  [stored-logs](./stored-logs.md).

Both fields are optional to use - old migrate-mongo migrations that ignore the
3rd argument keep working.

## The migration block

Every `up` run stamps all applied migrations with the **same** `migrationBlock`
number (`Date.now()` at the start of the run). This lets you roll back an
entire batch at once:

```bash
npx mongoshift up     # applies 003, 004, 005 in one block
npx mongoshift down              # rolls back just 005
npx mongoshift down --block      # rolls back 003, 004, 005 together
```

Without `--block`, `down` rolls back **only the most recent migration**.

## Ordering guarantees

- Files are sorted by `fileName.localeCompare`.
- Migrations run **sequentially** - never concurrently.
- If one migration throws, `up` stops immediately. Earlier migrations in the
  same batch stay applied (their changelog entries are written as each one
  completes). The thrown error is augmented with a `migrated` array listing
  what did run.

When calling `up()` programmatically, failed runs carry a `migrated` array on
the thrown error listing which files succeeded before the crash:

```ts
import { loadConfig, connect, up } from "mongoshift";

const cfg = await loadConfig();
const { db, client, close } = await connect(cfg);
try {
  await up(db, client, cfg);
} catch (err) {
  // err.migrated: MigrationRunReport[] - files that ran before the failure
  console.error(`Failed after ${(err as any).migrated?.length ?? 0} migration(s)`);
  throw err;
} finally {
  await close();
}
```

## Custom templates

If you have a file named `sample-migration.ts` (matching your extension) in
`migrationsDir`, `create` uses it as the template. See
[templates](./templates.md).

## Practices

::: tip DO

- Keep migrations **idempotent where possible** (`createIndex` is, `insertOne`
  is not).
- Log meaningful breadcrumbs (`ctx.logger.log("updated N docs")`).
- Make `up` and `down` mirror each other - you should be able to cycle
  `up` → `down` → `up` and land in the same state.
- Use **transactions** for multi-collection updates via `client.startSession()`.
  :::

::: danger DON'T

- **Don't import application code** that may change shape over time. Inline
  the field names, collection names, and transforms needed by the migration
  so it stays reproducible years later.
- **Don't mutate the changelog** from inside a migration.
- **Don't edit a migration after it has been applied** - enable
  [file-hash](./file-hash.md) to catch this.
- **Don't rely on ambient state** (Date.now, random IDs) without logging it.
  :::

## Programmatic run

You can run migrations from a script - useful for CI, deploy hooks, or tests:

```ts
import { loadConfig, connect, up } from "mongoshift";

const config = await loadConfig();
const { db, client, close } = await connect(config);
try {
  const result = await up(db, client, config, { dryRun: false });
  console.log(`applied ${result.migrations.length} migration(s)`);
} finally {
  await close();
}
```

See also [dry-run](./dry-run.md), [stored-logs](./stored-logs.md), and
[file-hash](./file-hash.md).
