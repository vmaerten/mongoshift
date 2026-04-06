---
layout: home
title: mongoshift - MongoDB Migration Tool
titleTemplate: "MongoDB migrations with receipts"
description: Dry-run before you commit. Persist every log line in the changelog. Detect edited migrations before they rewrite history.
---

<Hero />

<div class="home-seo-text">

## A MongoDB migration tool built for teams that ship

mongoshift is an open-source MongoDB migration tool for Node.js and TypeScript.
It gives you everything migrate-mongo doesn't: **dry-run mode** to preview
migrations before they touch your changelog, **stored logs** that persist every
`ctx.logger` call inline in the changelog entry, and **file-hash drift detection**
that catches when someone edits an already-applied migration.

### Why mongoshift?

- **Dry-run built in** - preview migrations against a real database without
  persisting to the changelog. Your migration reads `ctx.dryRun` to skip
  destructive writes.
- **Stored logs** - every log line, warning, and error is captured with
  timestamps and stored in the changelog entry. Six months later, you know
  exactly what happened.
- **File-hash drift detection** - SHA-256 hash of every applied migration
  file. If someone edits a migration after it ran, `status` shows `CHANGED`
  and `up` refuses to proceed.
- **TypeScript-native** - written in TypeScript, ships `.d.ts`, runs `.ts`
  migrations natively on Node 24+. No tsx, no ts-node, no loaders.
- **Custom templates** - enforce team conventions with a `sample-migration.ts`
  or `--template` flag. Configurable `dateFormat` for filenames.
- **ESM-only** - modern Node.js, no CommonJS baggage.

### Getting started

Install mongoshift alongside the MongoDB driver:

```bash
pnpm add mongoshift mongodb
```

Then initialize, create your first migration, and apply it:

```bash
mongoshift init
mongoshift create "add users"
mongoshift up
```

Read the [full getting started guide](/guide/getting-started) or learn
[why mongoshift](/guide/why) exists.

</div>

<style>
.home-seo-text {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 64px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}
.home-seo-text h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 48px 0 16px;
  letter-spacing: -0.01em;
}
.home-seo-text h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 32px 0 12px;
}
.home-seo-text a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.home-seo-text code {
  font-size: 0.9em;
  background: var(--vp-c-bg-soft);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}
</style>
