---
description: "Customize migration file templates and configure the timestamp date format for generated filenames."
---

# Templates and date formatting

When you run `mongoshift create "<name>"`, a new file is written to
`migrationsDir`. Its **name** is driven by `dateFormat`, and its **contents**
come from a template (built-in, custom, or a `sample-migration` file you
commit to the repo).

## Default templates

The built-in TypeScript template:

```ts
import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongoshift";

export const up = async (db: Db, client: MongoClient, ctx: MigrationContext): Promise<void> => {
  // TODO: write your migration here
  // Use ctx.logger.log/warn/error to persist logs in the changelog.
  // Check ctx.dryRun to skip destructive operations when true.
};

export const down = async (db: Db, client: MongoClient, ctx: MigrationContext): Promise<void> => {
  // TODO: write the statements to rollback your migration
};
```

The built-in JavaScript template is the same shape with JSDoc types. It's
used whenever `migrationFileExtension` is `.js` or `.mjs`.

## Custom template via `--template`

Pass any file to `create` to use it as the source:

<PmCommand cmd='create "add products index" --template ./migrations/_template.ts' />

The file is read verbatim and written as the new migration's contents - no
placeholder substitution. Put whatever boilerplate your team needs (imports,
helpers, domain types).

## Auto-pickup: `sample-migration`

If a file named `sample-migration<ext>` exists in `migrationsDir`, `create`
uses it as the default template when `--template` isn't passed. The sample
file itself is **excluded** from migration listings - it won't show up in
`status` and won't be executed by `up`.

```
migrations/
├── sample-migration.ts     ← template, never run
├── 20260104120000-add_users.ts
└── 20260405091122-backfill_totals.ts
```

::: tip Team conventions
Commit `sample-migration.ts` with your team's conventions - common imports,
a standard logging prelude, a helper for `ctx.dryRun` - and every new
migration starts from the same foundation.
:::

### Template lookup order

`create` resolves the template in this order:

1. `--template <path>` (highest priority)
2. `<migrationsDir>/sample-migration<ext>`
3. Built-in template for the configured extension

## `dateFormat`

The timestamp prefix of a migration filename comes from `config.dateFormat`,
formatted via [dayjs](https://day.js.org/docs/en/display/format).

Default:

```ts
dateFormat: "YYYYMMDDHHmmss"; // 20260405091122
```

### Common dayjs tokens

| token  | example | meaning             |
| ------ | ------- | ------------------- |
| `YYYY` | `2026`  | 4-digit year        |
| `MM`   | `04`    | 2-digit month       |
| `DD`   | `05`    | 2-digit day         |
| `HH`   | `09`    | 2-digit hour (24h)  |
| `mm`   | `11`    | 2-digit minute      |
| `ss`   | `22`    | 2-digit second      |
| `SSS`  | `456`   | 3-digit millisecond |

### Literal brackets

Wrap literal text in `[...]` to prevent token substitution:

```ts
dateFormat: "YYYY-MM-DD[T]HH-mm-ss"; // 2026-04-05T09-11-22
dateFormat: "YYYYMMDD[_]HHmmss[_]SSS"; // 20260405_091122_456
dateFormat: "[v]YYYYMMDDHHmm"; // v202604050911
```

::: warning Filesystem safety
Avoid `:` and `/` in `dateFormat` - they are invalid or ambiguous in file
paths on many systems. Stick to digits, `-`, and `_`.
:::

### Ordering implication

Migrations are executed in **lexicographic order of filename**. Your
`dateFormat` must produce prefixes that sort chronologically. The default
`YYYYMMDDHHmmss` does; an ISO format like `YYYY-MM-DD[T]HH-mm-ss` does too.

A format like `DDMMYYYY` would **not** sort chronologically - avoid it.

### Millisecond precision

If you generate many migrations in tight loops (codegen, tests), add `SSS` to
prevent timestamp collisions:

```ts
dateFormat: "YYYYMMDDHHmmss[_]SSS"; // 20260405091122_456
```

## Examples

### ESM-with-CommonJS-repo team

```ts
migrationFileExtension: ".mjs",
dateFormat: "YYYYMMDDHHmmss",
```

### Human-readable filenames

```ts
dateFormat: "YYYY-MM-DD[_]HHmm",  // 2026-04-05_0911-backfill.ts
```

### Release-tagged prefix

```ts
dateFormat: "[r]YYYYMMDD[-]HHmm",  // r20260405-0911
```

## Related

- [migrations](./migrations.md) - what your template should contain
- [getting-started](./getting-started.md) - full config reference
