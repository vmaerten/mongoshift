---
description: "MongoDB document schema for changelog entries - fileName, appliedAt, logs, fileHash, durationMs, migrationBlock."
---

# Changelog schema

mongoshift persists a document per applied migration into MongoDB. The
collection name is configurable (`config.changelogCollectionName`, default
`"changelog"`). The document type is exported as `ChangelogEntry`.

## TypeScript type

```ts
type LogLevel = "log" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  at: Date;
}

interface ChangelogEntry {
  fileName: string;
  appliedAt: Date;
  migrationBlock: number;
  fileHash?: string;
  logs: LogEntry[];
  durationMs: number;
}
```

## Fields

| Field            | Type         | Required | Description                                                                                       |
| ---------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------- |
| `fileName`       | `string`     | yes      | Migration file name (not a full path), e.g. `20260101000000-init.ts`. Unique key in practice.     |
| `appliedAt`      | `Date`       | yes      | Wall-clock time when the migration's `up()` resolved successfully.                                |
| `migrationBlock` | `number`     | yes      | `Date.now()` captured at the start of the `up()` call that applied this row. Shared by the batch. |
| `fileHash`       | `string`     | no       | SHA-256 hex digest of the file's contents. Present only when `config.useFileHash` is `true`.      |
| `logs`           | `LogEntry[]` | yes      | Captured logs from the migration (via `ctx.logger`). Empty array if the migration logged nothing. |
| `durationMs`     | `number`     | yes      | Elapsed time of the `up()` function in milliseconds.                                              |

`fileHash` is omitted (deleted before insert) when `useFileHash` is `false`, so
documents written by a non-hashing project contain no `fileHash` key at all.

## Sort & query conventions

- Pending/applied ordering uses `{ fileName: 1 }` (lexicographic).
- `down` selects the rollback target with `{ sort: { fileName: -1 } }`.
- Batch rollback (`down --block`) queries `{ migrationBlock: <last.migrationBlock> }`
  and sorts `{ fileName: -1 }` so the newest file in the batch is rolled back
  first.

There is no unique index created by mongoshift; a unique index on `fileName`
is recommended if you run the tool concurrently.

## `migrationBlock` semantics

Every invocation of `up()` computes one `migrationBlock = Date.now()` at the
start and stamps every entry it writes with that value. This lets
`down --block` roll back the entire last batch as a unit, matching the
"applied together, rolled back together" convention used by other tools.

Two separate `up()` invocations always receive two different `migrationBlock`
values (even if they happen ms apart), because the timestamp is captured
once per call.

## Example document

A document produced by an `up()` run with `useFileHash: true`, two log
entries, and a 53 ms runtime:

```json
{
  "_id": { "$oid": "6600a1b2c3d4e5f601020304" },
  "fileName": "20260101000000-create_users_index.ts",
  "appliedAt": { "$date": "2026-01-01T00:05:12.413Z" },
  "migrationBlock": 1767225912000,
  "fileHash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "logs": [
    {
      "level": "log",
      "message": "creating users.email unique index",
      "at": { "$date": "2026-01-01T00:05:12.420Z" }
    },
    {
      "level": "warn",
      "message": "skipped 3 duplicate rows",
      "at": { "$date": "2026-01-01T00:05:12.460Z" }
    }
  ],
  "durationMs": 53
}
```

A minimal document (no file hashing, no logs):

```json
{
  "_id": { "$oid": "6600a1b2c3d4e5f601020305" },
  "fileName": "20260102000000-seed.ts",
  "appliedAt": { "$date": "2026-01-02T00:10:00.000Z" },
  "migrationBlock": 1767312600000,
  "logs": [],
  "durationMs": 12
}
```

## Compatibility with migrate-mongo

The schema is a **superset** of the `{ fileName, appliedAt }` format used by
[migrate-mongo](https://github.com/seppevs/migrate-mongo): the two required
fields are identical and carry identical semantics. mongoshift adds
`migrationBlock`, `fileHash`, `logs`, and `durationMs`. Reading a collection
populated by migrate-mongo is safe - the extra fields default sensibly when
missing - but the reverse is not: migrate-mongo will ignore the extras and
will not be able to drive `down --block` or the hash-drift check.

## Related guides

- [Stored logs](../guide/stored-logs.md) - how `logs` and `durationMs` are used
- [File-hash drift](../guide/file-hash.md) - enabling and reading `fileHash`
- [From migrate-mongo](../guide/from-migrate-mongo.md) - migrating the collection
