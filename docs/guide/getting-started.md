# Getting started

Install mongoshift, scaffold a config file, and create your first migration in
under a minute. This page covers the one-time setup; head to
[quick-start](./quick-start.md) for a full end-to-end run.

## Requirements

- **Node.js 24+**
- **MongoDB** reachable via a connection string
- A project using **ESM** (`"type": "module"` in `package.json`, or `.ts`/`.mjs`
  entry points)

::: warning Node 24+
mongoshift is ESM only and relies on Node's native ESM loader to import `.ts`
config and migration files. It will not work under Node versions that require a
separate TypeScript runtime.
:::

## Install

Install alongside the official `mongodb` driver, which is a peer dependency:

```bash
npm  install mongoshift mongodb
pnpm add     mongoshift mongodb
yarn add     mongoshift mongodb
bun  add     mongoshift mongodb
```

## Scaffold a project

Run `init` at the root of your project:

```bash
npx mongoshift init
```

This creates two things:

- `mongoshift.config.ts` - your config file
- `migrations/` - empty directory for migration files

Pass `--js` if you prefer a JavaScript config:

```bash
npx mongoshift init --js
```

The generated config looks like this:

```ts
// mongoshift.config.ts
import type { Config } from "mongoshift";

const config: Config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "YOUR_DB_NAME",
  },
  migrationsDir: "migrations",
  migrationFileExtension: ".ts",
  dateFormat: "YYYYMMDDHHmmss",
  changelogCollectionName: "changelog",
  useFileHash: false,
};

export default config;
```

Edit `mongodb.url` and `mongodb.databaseName` before running any other command.

::: tip Secrets
Read the connection URL from an environment variable - the config file is a
regular module so you can do whatever you want:

```ts
mongodb: {
  url: process.env.MONGO_URL ?? "mongodb://localhost:27017",
  databaseName: process.env.MONGO_DB ?? "my_db",
}
```

:::

## Config options

All keys except `mongodb` have defaults:

| key                       | default            | description                                              |
| ------------------------- | ------------------ | -------------------------------------------------------- |
| `mongodb.url`             | -                  | MongoDB connection string (required)                     |
| `mongodb.databaseName`    | -                  | Database name (required)                                 |
| `mongodb.options`         | `undefined`        | `MongoClientOptions` passed to the driver                |
| `migrationsDir`           | `"migrations"`     | Directory (relative to config) for migration files       |
| `migrationFileExtension`  | `".ts"`            | `.ts`, `.js`, or `.mjs`                                  |
| `dateFormat`              | `"YYYYMMDDHHmmss"` | dayjs tokens - see [templates](./templates.md)           |
| `changelogCollectionName` | `"changelog"`      | Collection that stores applied migrations                |
| `useFileHash`             | `false`            | Enable drift detection - see [file-hash](./file-hash.md) |

`migrationsDir` is resolved relative to the **config file's directory**, not
the process cwd.

## Create your first migration

```bash
npx mongoshift create "add users collection"
```

This writes a timestamped file into `migrations/`, e.g.:

```
migrations/20260405090703-add_users_collection.ts
```

Open it and fill in `up` and `down`:

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  ctx.logger.log("creating users collection");
  await db.createCollection("users");
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  await db.collection("users").drop();
};
```

## Locating the config file

Every command (except `init`) looks for a config file in the cwd, trying these
names in order:

1. `mongoshift.config.ts`
2. `mongoshift.config.js`
3. `mongoshift.config.mjs`

Override the lookup with `-f / --file`:

```bash
npx mongoshift up --file ./configs/prod.config.ts
```

---

**Next:** [quick-start](./quick-start.md) - run `up`, inspect `status`, and
roll back with `down` in five minutes.
