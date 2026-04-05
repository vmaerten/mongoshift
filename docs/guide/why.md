# Why mongoshift

If you're running MongoDB migrations today, you're probably using
[migrate-mongo](https://github.com/seppevs/migrate-mongo). It works. It's
battle-tested. So why does another tool exist?

mongoshift was built around four problems we kept running into.

## 1. You can't dry-run a migration

In migrate-mongo, the only way to find out what a migration does is to
**run it for real**. There's no preview. If the first statement drops an
index you forgot about, you find out in production.

mongoshift has dry-run built in:

<PmCommand cmd="up --dry-run" />

The migration body **executes**, but the changelog is never touched. Your
migration can check `ctx.dryRun` to skip destructive writes:

```ts
export const up = async (db, _client, ctx) => {
  ctx.logger.log(`will update ${await affectedCount(db)} documents`);
  if (ctx.dryRun) return;
  await db.collection("users").updateMany(/* ... */);
};
```

[→ Dry-run mode](./dry-run.md)

## 2. Logs disappear into the terminal

When a migration prints something with `console.log`, that line lives in
whoever ran the command's terminal history, then dies. Six months later,
when someone asks "did we update 3,000 rows or 30,000?", no one knows.

mongoshift persists **every log line** from every migration inline in its
changelog entry, along with the level and timestamp:

```json
{
  "fileName": "20260405091122-backfill_users.ts",
  "appliedAt": "2026-04-05T09:11:23.456Z",
  "durationMs": 847,
  "logs": [
    { "level": "log", "message": "scanned 12543 users", "at": "..." },
    { "level": "log", "message": "updated 3121 documents", "at": "..." }
  ]
}
```

Migrations become auditable records, not fire-and-forget scripts.

[→ Stored logs](./stored-logs.md)

## 3. Silently editing a migration is easy

In migrate-mongo, if you edit `20240101-fix_emails.ts` after it ran in
production, then re-run migrations in a new environment, you get
**different data** than production. Nothing warns you.

mongoshift tracks a SHA-256 hash of every applied migration. At `up` time
it refuses to proceed if any file's hash has drifted:

```
Error: Refusing to run: file hash changed for already-applied migration(s):
  20240101-fix_emails.ts
Re-run with forceHash: true to override.
```

The `status` command marks drifted migrations as `CHANGED` so you see the
problem before it becomes an incident.

[→ File-hash drift](./file-hash.md)

## 4. TypeScript migrations shouldn't need a tooling layer

migrate-mongo supports TypeScript migrations, but you bring your own
loader (`tsx`, `ts-node`, `@swc/register`…). Every team ends up wrestling
with runtime config for migrations they only run a few times.

mongoshift targets **Node 24+**, which strips TypeScript types natively.
Your `mongoshift.config.ts` and `.ts` migrations just run. The package
itself is written in TypeScript and ships `.d.ts` — the programmatic API
is fully typed.

## What you give up

mongoshift is **ESM only** and requires **Node 24+**. Locks, CommonJS,
and Node <24 support are not coming back.

## Coming from migrate-mongo?

The changelog schema is a superset — you can point mongoshift at an
existing migrate-mongo changelog and it reads cleanly. Your existing
migration files keep working if they ignore the new 3rd `ctx` parameter.

[→ Migrating from migrate-mongo](./from-migrate-mongo.md)

## Next step

<PmCommand install="mongoshift mongodb" />

Then the [getting started guide](./getting-started.md).
