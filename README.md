# mongo-migration

A MongoDB migration tool with dry-run, file-hash drift detection, stored logs,
and first-class TypeScript support.

**Highlights**

- **Dry-run** via `up({ dryRun: true })` and `--dry-run` CLI flag
- **Stored logs**: every migration's `ctx.logger` output is persisted inline
  in the changelog entry (level, message, timestamp, duration)
- **Optional file-hash drift detection** (`useFileHash: true`) — refuses to run
  if an applied migration's file has changed
- **Configurable** changelog collection name, timestamp `dateFormat`, custom
  migration templates (`--template` or `sample-migration.ts`)
- **TS-native** single package, compiled to ESM + `.d.ts`
- **Node 24+**, ESM only

## Install

```bash
pnpm add mongo-migration mongodb
# npm i mongo-migration mongodb
```

## Quick start

```bash
npx mongo-migration init                 # creates mongo-migration.config.ts + migrations/
npx mongo-migration create "add users"   # creates 20260405090703-add_users.ts
npx mongo-migration up                   # applies all pending
npx mongo-migration status               # shows PENDING / APPLIED / CHANGED
npx mongo-migration down                 # rolls back the last one
```

A migration file looks like this:

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongo-migration";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  ctx.logger.log("creating users collection");
  if (ctx.dryRun) return; // optional: skip side-effects when dry-running
  await db.createCollection("users");
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  await db.collection("users").drop();
};
```

## Programmatic API

```ts
import { loadConfig, connect, up, down, status } from "mongo-migration";

const config = await loadConfig();
const { db, client, close } = await connect(config);
try {
  const result = await up(db, client, config, { dryRun: true });
  // result.migrations: [{ fileName, logs, durationMs, applied }]
} finally {
  await close();
}
```

## Config reference (short)

```ts
// mongo-migration.config.ts
import type { Config } from "mongo-migration";

const config: Config = {
  mongodb: { url: "mongodb://localhost:27017", databaseName: "my_db" },
  migrationsDir: "migrations",
  migrationFileExtension: ".ts",
  dateFormat: "YYYYMMDDHHmmss",         // tokens: YYYY MM DD HH mm ss SSS
  changelogCollectionName: "changelog",
  useFileHash: false,
  moduleSystem: "esm",
};
export default config;
```

---

## Migrating from `migrate-mongo`

`mongo-migration` is API-compatible in spirit but has a few deliberate breaks.

### 1. Config file

| migrate-mongo                 | mongo-migration                   |
| ----------------------------- | --------------------------------- |
| `migrate-mongo-config.js`     | `mongo-migration.config.ts` (or `.js`) |
| CommonJS by default           | ESM only                          |
| `moduleSystem: "commonjs"`    | removed (ESM only)                |
| `lockCollectionName`, `lockTtl` | removed (for now)               |
| no `dateFormat`               | `dateFormat: "YYYYMMDDHHmmss"` (configurable) |

Everything else maps 1:1: `mongodb`, `migrationsDir`, `migrationFileExtension`,
`changelogCollectionName`, `useFileHash`.

### 2. Migration signature — **breaking change**

migrate-mongo:

```js
export const up = async (db, client) => { /* ... */ };
```

mongo-migration adds a **third `ctx` argument**:

```ts
export const up = async (db, client, ctx) => {
  ctx.logger.log("...");    // persisted in changelog
  if (ctx.dryRun) return;   // respect dry-run
};
```

Old migrations that ignore the 3rd parameter keep working unchanged — the
logger and dryRun flag are simply unused. You only need to touch your files if
you want to use those features.

### 3. CLI command mapping

| migrate-mongo         | mongo-migration                 |
| --------------------- | ------------------------------- |
| `migrate-mongo init`  | `mongo-migration init`          |
| `migrate-mongo create <name>` | `mongo-migration create <name> [-t template]` |
| `migrate-mongo up`    | `mongo-migration up [--dry-run] [--force-hash]` |
| `migrate-mongo down`  | `mongo-migration down [--dry-run] [--block]` |
| `migrate-mongo status` | `mongo-migration status`       |

### 4. Keeping existing changelog entries

The changelog schema is a **superset**: existing migrate-mongo documents
(`{ fileName, appliedAt, migrationBlock, fileHash? }`) are read correctly.
New fields (`logs: []`, `durationMs`) are added as new migrations run. You
can switch without dropping the collection.

If you want to **backfill** the new fields on old entries for consistency,
run once:

```ts
await db.collection("changelog").updateMany(
  { logs: { $exists: false } },
  { $set: { logs: [], durationMs: 0 } },
);
```

### 5. Dropped features (for now)

- **Locks** (`lockCollectionName` / `lockTtl`) — planned; use an external
  lock for now if you run concurrent deploys.
- **CJS support** — ESM only.

---

## Coming from other tools

- **[umzug](https://github.com/sequelize/umzug)** (generic, covers MongoDB):
  umzug's storage is storage-agnostic; here the storage is always the
  configured MongoDB `changelogCollectionName`. Replace your `up`/`down`
  signature with `(db, client, ctx)`.
- **[node-migrate](https://github.com/tj/node-migrate)**: state is stored in a
  `.json` file on disk; switch to a MongoDB collection via
  `changelogCollectionName`. Migration files become async ESM modules.
- **Custom scripts in `scripts/migrate.ts`**: port them 1-to-1, they just
  become the bodies of `up()` / `down()`.

---

## Roadmap

- Distributed lock (TTL-based, configurable)
- Website with full API docs, guides, recipes
- Transactions helper for multi-statement migrations

## License

MIT
