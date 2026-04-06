# Changelog

## 0.1.0 (2026-04-05)

### Features

- CLI commands: `init`, `create`, `up`, `down`, `status`
- Programmatic API: `loadConfig`, `connect`, `up`, `down`, `status`, `create`, `init`
- Dry-run mode (`--dry-run` / `ctx.dryRun`)
- Migration logs stored inline in changelog entries (`ctx.logger`)
- File-hash drift detection (SHA-256, `--force-hash` override)
- Custom migration templates (`--template` flag, `sample-migration` auto-pickup)
- Configurable `dateFormat` (dayjs tokens)
- Configurable `changelogCollectionName`
- TypeScript source + `.d.ts` bundle
- ESM only, Node 24+, peer dep `mongodb ^6`
