---
description: "Complete reference for the mongoshift Config object - every option, default, and resolution behavior."
---

# Config reference

The `Config` object fully describes a mongoshift project. It is exported as the
default export of a `mongoshift.config.{ts,js,mjs}` file and consumed by the CLI
and the programmatic API.

## `Config` type

```ts
import type { MongoClientOptions } from "mongodb";

interface MongoConfig {
  url: string;
  databaseName: string;
  options?: MongoClientOptions;
}

interface Config {
  mongodb: MongoConfig;
  migrationsDir: string;
  migrationFileExtension: ".ts" | ".js" | ".mjs";
  dateFormat: string;
  changelogCollectionName: string;
  useFileHash: boolean;
}

type ResolvedConfig = Readonly<Config>;
```

`loadConfig()` returns a frozen `ResolvedConfig` where `migrationsDir` has been
resolved to an absolute path (relative paths are resolved against the directory
that contains the config file, not the process cwd).

## Fields

### `mongodb` (required)

| Field                  | Type                 | Required | Description                                           |
| ---------------------- | -------------------- | -------- | ----------------------------------------------------- |
| `mongodb.url`          | `string`             | yes      | MongoDB connection string passed to `MongoClient`.    |
| `mongodb.databaseName` | `string`             | yes      | Database name selected via `client.db(databaseName)`. |
| `mongodb.options`      | `MongoClientOptions` | no       | Forwarded verbatim to `MongoClient.connect()`.        |

`mongodb.url` and `mongodb.databaseName` are the only required keys; all other
top-level fields fall back to defaults.

### `migrationsDir`

- **Type:** `string`
- **Default:** `"migrations"`
- **Description:** Directory containing migration files. When the value is
  relative it is resolved against the config file's directory, then frozen on
  the returned `ResolvedConfig` as an absolute path.

### `migrationFileExtension`

- **Type:** `".ts" | ".js" | ".mjs"`
- **Default:** `".ts"`
- **Description:** File extension used when listing and creating migrations.
  `listMigrationFiles()` filters the directory to this suffix; `create()` uses
  it when emitting new files.

### `dateFormat`

- **Type:** `string`
- **Default:** `"YYYYMMDDHHmmss"`
- **Description:** Token format used to prefix generated migration file names.
  All [dayjs format tokens](https://day.js.org/docs/en/display/format) are
  supported. Wrap literal text in brackets: `YYYY-[build]-SSS`.

### `changelogCollectionName`

- **Type:** `string`
- **Default:** `"changelog"`
- **Description:** MongoDB collection that stores applied-migration records.
  See the [changelog schema](./changelog-schema.md) page.

### `useFileHash`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** When `true`, mongoshift records a SHA-256 hash of each
  migration file in the changelog. At `up` and `status` time the current hash
  is compared against the stored one; a mismatch produces a `CHANGED` status
  item and causes `up` to throw `HashDriftError` unless `forceHash: true` is
  passed.

## Config file resolution

`loadConfig({ file, cwd })` (and the CLI `-f, --file <path>` flag) resolves the
config file as follows:

1. If `file` is provided, it is resolved relative to `cwd` (or used as-is when
   absolute). A missing file throws `ConfigError`.
2. Otherwise, the following filenames are tried in order inside `cwd`:

```ts
const DEFAULT_CONFIG_FILENAMES = [
  "mongoshift.config.ts",
  "mongoshift.config.js",
  "mongoshift.config.mjs",
];
```

3. If none exist, `ConfigError` is thrown. mongoshift does not walk parent
   directories; the config file must live in `cwd`.

The file is imported via `import(pathToFileURL(...))`. The default export is
used if present, otherwise the module namespace object itself.

::: tip
mongoshift requires **Node 24+**, which strips TypeScript types natively.
Your `mongoshift.config.ts` runs without any extra loader.
:::

## Example config

```ts
// mongoshift.config.ts
import type { Config } from "mongoshift";

const config: Config = {
  mongodb: {
    url: process.env.MONGO_URL ?? "mongodb://localhost:27017",
    databaseName: "my_app",
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    },
  },
  migrationsDir: "migrations",
  migrationFileExtension: ".ts",
  dateFormat: "YYYYMMDDHHmmss",
  changelogCollectionName: "changelog",
  useFileHash: true,
};

export default config;
```

## `ConfigError`

Thrown by `resolveConfigPath()` and `loadConfig()` when:

- an explicit `file` path does not exist;
- no default config file can be found in `cwd`;
- the resolved module does not export an object;
- `mongodb.url` or `mongodb.databaseName` are missing or not strings.

## Related guides

- [Getting started](../guide/getting-started.md) - create your first config
- [File-hash drift](../guide/file-hash.md) - when to enable `useFileHash`
- [Custom templates](../guide/templates.md) - `dateFormat` and template resolution
