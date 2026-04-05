# CLI reference

The `mongoshift` binary is implemented with [commander](https://github.com/tj/commander.js).
Current version: `0.1.0`.

```bash
mongoshift --help
mongoshift --version   # 0.1.0
```

All commands except `init` load a config file via `loadConfig()`. Pass
`-f, --file <path>` to point at a non-default location; otherwise the defaults
documented in [Config reference](./config.md#config-file-resolution) apply.

On any thrown error the CLI prints `Error: <message>` to stderr and exits with
code `1`. Successful runs exit with code `0`.

---

## `mongoshift init`

```bash
mongoshift init [--ts] [--js]
```

Create a default config file and a `migrations/` directory in `cwd`.

| Flag   | Type    | Default | Description                                |
| ------ | ------- | ------- | ------------------------------------------ |
| `--ts` | boolean | `true`  | Emit `mongoshift.config.ts` (the default). |
| `--js` | boolean | `false` | Emit `mongoshift.config.js` instead.       |

When both flags are provided, `--js` wins (JavaScript is emitted). Fails with
exit code `1` if the target config file already exists.

### Example

```bash
mongoshift init --js
# Created config at /path/to/cwd/mongoshift.config.js
# Created migrations dir at /path/to/cwd/migrations
```

---

## `mongoshift create <description>`

```bash
mongoshift create <description> [-f <path>] [-t <path>]
```

Create a new migration file in `config.migrationsDir`. The file name is
`<timestamp>-<slug><extension>` where `<timestamp>` follows `config.dateFormat`
and `<slug>` is the lowercased description with non-alphanumerics replaced by
`_`.

| Flag                    | Type     | Default | Description                     |
| ----------------------- | -------- | ------- | ------------------------------- |
| `-f, --file <path>`     | `string` | -       | Path to config file.            |
| `-t, --template <path>` | `string` | -       | Path to a custom template file. |

Template resolution order:

1. Explicit `-t/--template` path.
2. `sample-migration<ext>` inside `migrationsDir`, if present.
3. Built-in default template matching `migrationFileExtension`.

Fails with exit code `1` when `<description>` is empty/whitespace.

### Example

```bash
mongoshift create "add users index"
# Created migration: 20260405120000-add_users_index.ts
```

---

## `mongoshift up`

```bash
mongoshift up [-f <path>] [--dry-run] [--force-hash]
```

Apply every `PENDING` migration in filename order. Each migration runs inside a
fresh capture logger; on success a changelog entry is inserted. All applied
migrations in a single invocation share the same `migrationBlock` value
(`Date.now()` at the start of the run).

| Flag           | Type    | Default | Description                                                           |
| -------------- | ------- | ------- | --------------------------------------------------------------------- |
| `-f, --file`   | string  | -       | Path to config file.                                                  |
| `--dry-run`    | boolean | `false` | Run `up()` functions with `ctx.dryRun = true`; skip changelog writes. |
| `--force-hash` | boolean | `false` | Continue even if `useFileHash` detects drift on applied migrations.   |

When `useFileHash` is `true` and any applied migration has `CHANGED` status,
`up` throws `HashDriftError` before running anything (unless `--force-hash` is
passed). If a migration throws mid-run, previously applied reports are attached
to the error as `err.migrated` and the CLI exits `1`.

Output example:

```
[UP] 2 migration(s)
  [OK] 20260101000000-init.ts (12ms)
      log: created indexes
  [OK] 20260102000000-seed.ts (45ms)
```

`[SKIP]` is printed instead of `[OK]` for dry-run entries.

---

## `mongoshift down`

```bash
mongoshift down [-f <path>] [--dry-run] [--block]
```

Roll back the most recent changelog entry (or the entire last batch with
`--block`).

| Flag         | Type    | Default | Description                                                          |
| ------------ | ------- | ------- | -------------------------------------------------------------------- |
| `-f, --file` | string  | -       | Path to config file.                                                 |
| `--dry-run`  | boolean | `false` | Run `down()` with `ctx.dryRun = true`; do not remove changelog rows. |
| `--block`    | boolean | `false` | Roll back every entry sharing the last entry's `migrationBlock`.     |

Targets are fetched with `sort: { fileName: -1 }`, so the block is rolled back
newest-first. On failure, partial `rolledBack` reports are attached to the
thrown error.

### Example

```bash
mongoshift down --block
# [DOWN] 3 migration(s)
#   [OK] 20260102000000-seed.ts (7ms)
#   [OK] 20260101000001-b.ts (3ms)
#   [OK] 20260101000000-a.ts (2ms)
```

---

## `mongoshift status`

```bash
mongoshift status [-f <path>]
```

Print a table of every migration known to the project (disk union changelog),
sorted by file name.

| Flag         | Type   | Default | Description          |
| ------------ | ------ | ------- | -------------------- |
| `-f, --file` | string | -       | Path to config file. |

Output columns: `File`, `Status` (`PENDING`, `APPLIED`, `CHANGED`), and
`Applied At` (ISO 8601 string, or `-` when pending).

```
┌──────────────────────────────┬─────────┬──────────────────────────┐
│ File                         │ Status  │ Applied At               │
├──────────────────────────────┼─────────┼──────────────────────────┤
│ 20260101000000-init.ts       │ APPLIED │ 2026-01-01T00:05:12.000Z │
│ 20260102000000-seed.ts       │ CHANGED │ 2026-01-02T00:10:00.000Z │
│ 20260301000000-reindex.ts    │ PENDING │ -                        │
└──────────────────────────────┴─────────┴──────────────────────────┘
```

---

## Exit codes

| Code | Meaning                                                                 |
| ---- | ----------------------------------------------------------------------- |
| `0`  | Command completed successfully.                                         |
| `1`  | Any thrown error (config error, hash drift, migration failure, I/O, …). |
