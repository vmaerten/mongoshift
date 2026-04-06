---
description: "Programmatic API reference - loadConfig, connect, up, down, status, create, init, and all TypeScript types."
---

# Programmatic API

Everything in this page is re-exported from the package entry point:

```ts
import {
  loadConfig,
  connect,
  up,
  down,
  status,
  create,
  init,
  createCaptureLogger,
  HashDriftError,
  ConfigError,
} from "mongoshift";
```

The API is designed to be composable: `loadConfig` produces a frozen
`ResolvedConfig`, `connect` produces a `DatabaseHandle`, and the action
functions (`up`, `down`, `status`) take the `Db` / `MongoClient` directly so
callers can share a connection.

---

## `loadConfig`

```ts
function loadConfig(opts?: { cwd?: string; file?: string }): Promise<ResolvedConfig>;
```

Resolves, imports, validates and freezes a `mongoshift.config.*` file.

**Parameters**

| Name        | Type     | Default         | Description                                               |
| ----------- | -------- | --------------- | --------------------------------------------------------- |
| `opts.cwd`  | `string` | `process.cwd()` | Directory used for auto-discovery and relative `file`.    |
| `opts.file` | `string` | -               | Explicit config path; relative paths resolve against cwd. |

**Returns** a `ResolvedConfig` with an absolute `migrationsDir`.

**Throws** `ConfigError` if the file cannot be found or fails validation.

```ts
const config = await loadConfig();
const config = await loadConfig({ file: "./configs/prod.ts" });
```

---

## `connect`

```ts
interface DatabaseHandle {
  client: MongoClient;
  db: Db;
  close: () => Promise<void>;
}

function connect(config: ResolvedConfig): Promise<DatabaseHandle>;
```

Opens a `MongoClient` against `config.mongodb.url` with
`config.mongodb.options`, then selects `config.mongodb.databaseName`. Callers
must invoke `handle.close()` to release the connection.

```ts
const handle = await connect(config);
try {
  await up(handle.db, handle.client, config);
} finally {
  await handle.close();
}
```

---

## `up`

```ts
interface RunOptions {
  dryRun?: boolean;
  forceHash?: boolean;
}

interface MigrationRunReport {
  fileName: string;
  logs: LogEntry[];
  durationMs: number;
  applied: boolean;
}

interface UpResult {
  dryRun: boolean;
  migrations: MigrationRunReport[];
}

function up(
  db: Db,
  client: MongoClient,
  config: ResolvedConfig,
  options?: RunOptions,
): Promise<UpResult>;
```

Applies every `PENDING` migration in filename order, inserting a
`ChangelogEntry` per migration (unless `dryRun`). All entries written by one
`up()` invocation share the same `migrationBlock` timestamp.

**Options**

| Name        | Default | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| `dryRun`    | `false` | Runs `up()` functions but skips changelog writes. |
| `forceHash` | `false` | Skip the `useFileHash` drift check.               |

**Throws**

- `HashDriftError` if `config.useFileHash` is true, `forceHash` is false, and
  any applied migration has status `CHANGED`. The error carries
  `changedFiles: string[]`.
- Any error thrown by a migration's `up()` function. Previously applied
  reports are attached to the thrown error as `err.migrated`.

```ts
try {
  const result = await up(db, client, config, { forceHash: false });
  console.log(result.migrations.length, "applied");
} catch (err) {
  if (err instanceof HashDriftError) {
    console.error("Drift on:", err.changedFiles);
  }
  throw err;
}
```

---

## `down`

```ts
interface DownOptions {
  dryRun?: boolean; // default false
  block?: boolean; // default false
}

interface DownResult {
  dryRun: boolean;
  migrations: MigrationRunReport[];
}

function down(
  db: Db,
  client: MongoClient,
  config: ResolvedConfig,
  options?: DownOptions,
): Promise<DownResult>;
```

Rolls back the most recent changelog entry, or every entry sharing that
entry's `migrationBlock` when `block: true`. Entries are rolled back in
descending `fileName` order and removed from the changelog (unless `dryRun`).

On failure, partial reports are attached to the thrown error as
`err.rolledBack`.

```ts
await down(db, client, config, { block: true });
```

---

## `status`

```ts
type MigrationStatus = "PENDING" | "APPLIED" | "CHANGED";

interface StatusItem {
  fileName: string;
  status: MigrationStatus;
  appliedAt?: Date;
  fileHash?: string;
  storedHash?: string;
}

function status(db: Db, config: ResolvedConfig): Promise<StatusItem[]>;
```

Returns the union of files in `migrationsDir` and entries in the changelog,
sorted by `fileName`. When `config.useFileHash` is true, each item includes
the current `fileHash`; changed files also carry `storedHash`. Entries in the
changelog whose file is missing from disk are reported as `APPLIED` (orphans).

---

## `create`

```ts
interface CreateOptions {
  template?: string; // path to a custom template file
  now?: Date; // override timestamp (testing)
}

function create(
  config: ResolvedConfig,
  description: string,
  options?: CreateOptions,
): Promise<string>;
```

Creates a new migration file and returns its `fileName` (not the full path).
Ensures `migrationsDir` exists. The description is slugified: lowercased,
non-alphanumeric runs collapsed to `_`, trimmed. Throws if `description` is
empty after trimming.

```ts
const name = await create(config, "Add users index");
// name === "20260405120000-add_users_index.ts"
```

---

## `init`

```ts
interface InitOptions {
  cwd?: string; // default: process.cwd()
  flavor?: "ts" | "js"; // default: "ts"
}

interface InitResult {
  configPath: string;
  migrationsDir: string;
}

function init(options?: InitOptions): Promise<InitResult>;
```

Writes `mongoshift.config.{ts,js}` and creates a `migrations/` directory.
Throws if the target config file already exists.

---

## `createCaptureLogger`

```ts
interface CaptureLogger extends Logger {
  readonly entries: ReadonlyArray<LogEntry>;
}

function createCaptureLogger(opts?: { mirrorToConsole?: boolean }): CaptureLogger;
```

Creates an in-memory `Logger` that records every call as a `LogEntry`
(`{ level, message, at }`). `up` and `down` use this internally to persist
migration logs into the changelog. Pass `mirrorToConsole: true` to also write
each entry to `console.log`/`warn`/`error`.

```ts
const logger = createCaptureLogger({ mirrorToConsole: true });
logger.log("hello");
console.log(logger.entries);
```

---

## `HashDriftError`

```ts
class HashDriftError extends Error {
  readonly changedFiles: string[];
}
```

Thrown from `up()` when `config.useFileHash` is true and one or more
already-applied migrations have a new hash on disk. Pass `forceHash: true` on
the next call to bypass the check.

## `ConfigError`

Thrown by `loadConfig` / `resolveConfigPath` for missing files, invalid
modules, or missing `mongodb.url` / `mongodb.databaseName`.

---

## Exported types

All types below are exported from `mongoshift`:

| Type                       | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `Config`                   | Mutable config shape accepted by config files.           |
| `ResolvedConfig`           | `Readonly<Config>` returned by `loadConfig`.             |
| `MongoConfig`              | `{ url, databaseName, options? }`.                       |
| `MigrationModule`          | `{ up, down }` contract each migration file must export. |
| `MigrationFn`              | `(db, client, ctx) => Promise<void>`.                    |
| `MigrationContext`         | `{ dryRun, logger }` passed to each migration fn.        |
| `Logger` / `LogLevel`      | Simple logger abstraction used by migrations.            |
| `LogEntry`                 | `{ level, message, at }` captured log record.            |
| `CaptureLogger`            | Logger that exposes its entries.                         |
| `ChangelogEntry`           | Document stored in the changelog collection.             |
| `MigrationStatus`          | `"PENDING" \| "APPLIED" \| "CHANGED"`.                   |
| `StatusItem`               | One row returned by `status()`.                          |
| `RunOptions`               | Options for `up()`.                                      |
| `DownOptions`              | `{ dryRun?, block? }` for `down()`.                      |
| `UpResult`/`DownResult`    | `{ dryRun, migrations }` run summaries.                  |
| `MigrationRunReport`       | Per-file result object inside `UpResult`/`DownResult`.   |
| `DatabaseHandle`           | Return type of `connect()`.                              |
| `CreateOptions`            | Options for `create()`.                                  |
| `InitOptions`/`InitResult` | Options and return shape for `init()`.                   |

## Related guides

- [Writing migrations](../guide/migrations.md) - migration file anatomy
- [Dry-run mode](../guide/dry-run.md) - `RunOptions.dryRun` in practice
- [Stored logs](../guide/stored-logs.md) - reading `MigrationRunReport.logs`
- [File-hash drift](../guide/file-hash.md) - `HashDriftError` and `forceHash`
