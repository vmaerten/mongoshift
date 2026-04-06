---
description: "Detect when applied migration files have been edited using SHA-256 file-hash drift detection."
---

# MongoDB Migration Drift Detection

When `useFileHash: true`, mongoshift records a SHA-256 hash of every migration
file it applies. On subsequent runs it compares the stored hash against the
current file and **refuses to run** if an applied migration has been edited.

## Why

Once a migration is applied to a database, its file should be **immutable
history**. Editing it is a form of rewriting history - other environments that
already applied the old version will silently drift out of sync.

File-hash turns that silent footgun into a loud error.

## Enable it

```ts
// mongoshift.config.ts
const config: Config = {
  mongodb: { url: "...", databaseName: "..." },
  useFileHash: true,
};
```

::: tip Recommended policy
Enable `useFileHash` in **staging and production**. Disable it in **local
dev** so you can iterate on an in-progress migration without tripping the
check.

A common pattern:

```ts
useFileHash: process.env.NODE_ENV === "production",
```

:::

## How it works

### On `up`

For each already-applied migration, mongoshift:

1. Reads the file from disk
2. Computes `sha256(contents)`
3. Compares against `fileHash` stored in the changelog entry

If **any** stored hash differs, `up` throws `HashDriftError` **before
running any migration**:

```
Error: Refusing to run: file hash changed for already-applied migration(s):
20260104120000-add_users.ts. Re-run with forceHash: true to override.
```

When `up` inserts a new changelog entry, it also writes the current file's
hash, so future runs can check against it.

### On `status`

Applied migrations whose file has changed show up as **`CHANGED`**:

```
┌────────────────────────────────────┬─────────┬──────────────────────────┐
│ File                               │ Status  │ Applied At               │
├────────────────────────────────────┼─────────┼──────────────────────────┤
│ 20260104120000-add_users.ts        │ CHANGED │ 2026-01-04T12:00:03.100Z │
│ 20260405091122-backfill.ts         │ APPLIED │ 2026-04-05T09:11:23.456Z │
└────────────────────────────────────┴─────────┴──────────────────────────┘
```

Use `status` to identify the offending files before deciding how to respond.

## Overriding - `forceHash`

When you **legitimately** need to edit an applied migration (fix a typo in a
log message, add a comment), override the check explicitly:

<PmCommand cmd="up --force-hash" />

Programmatically:

```ts
await up(db, client, config, { forceHash: true });
```

With `forceHash`:

- The drift check is skipped
- Pending migrations run normally
- Changed entries' `fileHash` is **not automatically re-synced**; their next
  logical refresh happens if you ever rerun them

::: warning Use sparingly
`--force-hash` bypasses the safety net. Prefer writing a _new_ migration that
corrects the state, instead of editing an applied one.
:::

## Adopting file-hash on an existing project

Existing changelog entries don't have a `fileHash` field yet. mongoshift
treats entries with no stored hash as **not-drifted** - so flipping
`useFileHash` to `true` on an existing project is safe.

New migrations applied after you enable `useFileHash` will be stored with
their hash. **Existing entries are never updated retroactively** - their
`fileHash` field stays missing unless you backfill it yourself.

::: details One-off backfill script

```ts
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig, connect } from "mongoshift";

const config = await loadConfig();
const { db, close } = await connect(config);
try {
  const entries = await db
    .collection(config.changelogCollectionName)
    .find({ fileHash: { $exists: false } })
    .toArray();
  for (const e of entries) {
    const filePath = path.join(config.migrationsDir, e.fileName);
    const content = await fs.readFile(filePath);
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    await db
      .collection(config.changelogCollectionName)
      .updateOne({ _id: e._id }, { $set: { fileHash: hash } });
  }
} finally {
  await close();
}
```

:::

## `StatusItem` shape with hashing

```ts
interface StatusItem {
  fileName: string;
  status: "PENDING" | "APPLIED" | "CHANGED";
  appliedAt?: Date;
  fileHash?: string; // current hash on disk
  storedHash?: string; // hash stored in changelog (if any)
}
```

For `CHANGED` rows, compare `fileHash` vs `storedHash` to know exactly what
drifted.

## Related

- [migrations](./migrations.md) - why applied migrations are immutable
- [from-migrate-mongo](./from-migrate-mongo.md) - `useFileHash` behavior
  matches migrate-mongo's
