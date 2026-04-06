---
description: "Go from zero to applied migration in five minutes with this step-by-step MongoDB migration walkthrough."
---

# Quick start

Go from zero to applied-migration in five minutes. Assumes Node 24+ and a
running MongoDB on `localhost:27017`.

## 1. Install

```bash
npm install mongoshift mongodb
```

## 2. Init

<PmCommand cmd="init" />

Expected output:

```
Created config at /your/project/mongoshift.config.ts
Created migrations dir at /your/project/migrations
```

Edit `mongoshift.config.ts` and set `databaseName`:

```ts
mongodb: {
  url: "mongodb://localhost:27017",
  databaseName: "mongoshift_demo",
},
```

## 3. Create a migration

<PmCommand cmd='create "create users"' />

Expected output:

```
Created migration: 20260405091122-create_users.ts
```

Open the file and fill in both hooks:

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  ctx.logger.log("creating users collection with unique email index");
  await db.createCollection("users");
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext) => {
  await db.collection("users").drop();
};
```

## 4. Run `up`

<PmCommand cmd="up" />

Expected output:

```
[UP] 1 migration(s)
  [OK] 20260405091122-create_users.ts (24ms)
      log: creating users collection with unique email index
```

The logger line is stored in the changelog document - see
[stored-logs](./stored-logs.md).

## 5. Check `status`

<PmCommand cmd="status" />

Expected output:

```
┌──────────────────────────────────────────┬─────────┬──────────────────────────┐
│ File                                     │ Status  │ Applied At               │
├──────────────────────────────────────────┼─────────┼──────────────────────────┤
│ 20260405091122-create_users.ts           │ APPLIED │ 2026-04-05T09:11:23.456Z │
└──────────────────────────────────────────┴─────────┴──────────────────────────┘
```

Statuses: `PENDING`, `APPLIED`, `CHANGED` (only when
[`useFileHash`](./file-hash.md) is on).

## 6. Roll back with `down`

<PmCommand cmd="down" />

Expected output:

```
[DOWN] 1 migration(s)
  [OK] 20260405091122-create_users.ts (8ms)
```

Running `status` again shows the migration back to `PENDING`.

## 7. Try `--dry-run`

<PmCommand cmd="up --dry-run" />

Expected output:

```
[DRY-RUN UP] 1 migration(s)
  [SKIP] 20260405091122-create_users.ts (22ms)
      log: creating users collection with unique email index
```

The migration body **did run**, but the changelog was not touched. See
[dry-run](./dry-run.md) to make your migrations dry-run-aware.

---

**Next:**

- [migrations](./migrations.md) - anatomy of a migration file
- [dry-run](./dry-run.md) - safe previews
- [file-hash](./file-hash.md) - detect edits to applied migrations
