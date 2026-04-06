---
description: "Step-by-step guide to migrate from migrate-mongo to mongoshift - config, signature, CLI, and changelog."
---

# Migrating from migrate-mongo to mongoshift

`mongoshift` is designed as a drop-in successor to
[`migrate-mongo`](https://github.com/seppevs/migrate-mongo): the concepts are
identical, the changelog schema is a superset, and existing migrations keep
running. There are a handful of deliberate breaks - mostly around modernizing
to ESM and TypeScript-first ergonomics.

This guide walks through every difference and gives you a step-by-step
migration path.

## Summary of changes

| area                | migrate-mongo                   | mongoshift                               |
| ------------------- | ------------------------------- | ---------------------------------------- |
| Module system       | CJS (default) or ESM            | **ESM only**                             |
| Config file         | `migrate-mongo-config.js`       | `mongoshift.config.ts` / `.js` / `.mjs`  |
| Config option       | `moduleSystem`                  | removed                                  |
| Config option       | `lockCollectionName`, `lockTtl` | **removed** (planned)                    |
| Config option       | n/a                             | **`dateFormat`** (dayjs tokens)          |
| Migration signature | `(db, client) => {}`            | **`(db, client, ctx) => {}`**            |
| CLI binary          | `migrate-mongo`                 | `mongoshift`                             |
| Changelog schema    | baseline                        | **superset** (adds `logs`, `durationMs`) |
| Stored logs         | no                              | **yes** - inline in changelog            |
| File hash           | yes                             | yes                                      |
| TS-native configs   | via extra tooling               | built-in (Node 24+ loads `.ts` natively) |
| Node version        | 14+                             | **24+**                                  |

## 1. Config file

Rename `migrate-mongo-config.js` to `mongoshift.config.ts` (or `.js`), switch
to ESM, and drop the removed keys:

```ts
import type { Config } from "mongoshift"; // [!code ++]

const config: Config = { // [!code ++]
const config = { // [!code --]
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "my_db",
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  lockCollectionName: "changelog_lock", // [!code --]
  lockTtl: 0, // [!code --]
  migrationFileExtension: ".ts", // [!code ++]
  migrationFileExtension: ".js", // [!code --]
  dateFormat: "YYYYMMDDHHmmss", // [!code ++]
  useFileHash: false,
  moduleSystem: "commonjs", // [!code --]
};

export default config; // [!code ++]
module.exports = config; // [!code --]
```

Removed keys: `moduleSystem`, `lockCollectionName`, `lockTtl`. New key:
`dateFormat`. Everything else maps 1:1.

## 2. Migration signature - breaking change

Migrations get a third `ctx` parameter with `{ dryRun, logger }`. Named
exports replace `module.exports`:

**Before** (`migrate-mongo`):

```js
module.exports = {
  up: async (db, client) => {
    await db.createCollection("users");
  },
  down: async (db, client) => {
    await db.collection("users").drop();
  },
};
```

**After** (`mongoshift`):

```ts{5-6}
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  ctx.logger.log("creating users");
  if (ctx.dryRun) return;
  await db.createCollection("users");
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  if (ctx.dryRun) return;
  await db.collection("users").drop();
};
```

::: tip You may not need to change anything
Old migrate-mongo migrations that **ignore** the 3rd argument keep working.
Adding `ctx` is only required if you want to use `logger` or `dryRun`.
Exports must be named (`export const up`) - `module.exports = { up, down }`
does not work under ESM.
:::

## 3. CLI mapping

| migrate-mongo                 | mongoshift                                 |
| ----------------------------- | ------------------------------------------ |
| `migrate-mongo init`          | `mongoshift init [--ts\|--js]`             |
| `migrate-mongo create <name>` | `mongoshift create <name> [-t <path>]`     |
| `migrate-mongo up`            | `mongoshift up [--dry-run] [--force-hash]` |
| `migrate-mongo down`          | `mongoshift down [--dry-run] [--block]`    |
| `migrate-mongo status`        | `mongoshift status`                        |

New flags:

- **`--dry-run`** - run migrations without writing to changelog
  ([dry-run](./dry-run.md))
- **`--force-hash`** - bypass file-hash drift check
  ([file-hash](./file-hash.md))
- **`--block`** - roll back the entire last batch, not just the last file

## 4. Changelog schema - superset

migrate-mongo's changelog documents:

```json
{ "fileName": "...", "appliedAt": "...", "migrationBlock": 1234, "fileHash": "..." }
```

mongoshift reads those documents **unchanged** and adds two fields on new
writes:

```json
{
  "fileName": "...",
  "appliedAt": "...",
  "migrationBlock": 1234,
  "fileHash": "...",
  "logs": [{ "level": "log", "message": "...", "at": "..." }],
  "durationMs": 1842
}
```

### Backfill (optional)

If you want uniform shape across all entries:

```ts
await db
  .collection("changelog")
  .updateMany({ logs: { $exists: false } }, { $set: { logs: [], durationMs: 0 } });
```

## 5. Dropped features

### Locks

`lockCollectionName` / `lockTtl` are not implemented. If you run concurrent
deploys, use an external lock (Redis, Postgres advisory lock, a CI
concurrency group) until locks ship.

### CommonJS

ESM only. Your project's `package.json` should have `"type": "module"` (or
use `.mjs` / `.ts` files). Migration files must use `export const up/down`.

## 6. Step-by-step upgrade checklist

::: tip The happy path
If your project already uses ESM + migrate-mongo, the upgrade is usually
**~15 minutes**.
:::

1. **Bump Node**. Ensure CI and deploy targets run Node **24+**.
2. **Install**.
   ```bash
   npm rm migrate-mongo
   npm install mongoshift mongodb
   ```
3. **Rename the config file.**
   `migrate-mongo-config.js` → `mongoshift.config.ts` (or `.js`).
4. **Remove dropped config keys.** Delete `moduleSystem`, `lockCollectionName`,
   `lockTtl`.
5. **Add `dateFormat`.** Start with `"YYYYMMDDHHmmss"` unless you want
   something different.
6. **Convert migration exports to ESM named exports.**
   `module.exports = { up, down }` → `export const up = ...; export const down = ...;`.
7. **Keep existing migration bodies as-is.** They keep working.
8. **(optional) Add `ctx` usage** - logging or dry-run awareness - to new
   migrations.
9. **(optional) Switch to `.ts`.** Set `migrationFileExtension: ".ts"` for
   new migrations; old `.js` files still run if you leave both extensions on
   disk (the extension filter applies to new files only).
10. **Update CI commands.**
    `migrate-mongo up` → `mongoshift up`.
11. **Run `mongoshift status`.** You should see your existing applied
    migrations listed as `APPLIED` with their original `appliedAt`. Pending
    ones are `PENDING`.
12. **(optional) Enable `useFileHash: true`** in production to catch drift
    going forward. See [file-hash](./file-hash.md).
13. **(optional) Backfill `logs`/`durationMs`** with the script in §4.

## 7. What you get in return

- **TypeScript-first** - config and migrations are real `.ts` modules, typed
  end-to-end
- **Dry-run** - preview runs against real databases safely
  ([dry-run](./dry-run.md))
- **Stored logs** - every migration's log output is queryable forever
  ([stored-logs](./stored-logs.md))
- **`--block` rollback** - roll back an entire deployment batch
- **Modern runtime** - ESM-native, no build step for `.ts` configs/migrations

## 8. If something breaks

- `Config file not found` → rename to one of `mongoshift.config.{ts,js,mjs}`
  or pass `-f <path>`.
- `Migration X must export "up" and "down"` → convert `module.exports = {}`
  to named ESM exports.
- `HashDriftError` → you enabled `useFileHash` and a previously-applied file
  was edited. See [file-hash](./file-hash.md).
- **Node < 24** → upgrade Node; `.ts` config imports require the modern
  native loader.

## Related

- [getting-started](./getting-started.md)
- [migrations](./migrations.md)
- [file-hash](./file-hash.md)
