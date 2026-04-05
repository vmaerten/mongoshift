import type { Db, MongoClient } from "mongodb";
import type {
  ChangelogEntry,
  MigrationRunReport,
  ResolvedConfig,
  RunOptions,
  UpResult,
} from "../types.js";
import { insertEntry } from "../changelog.js";
import { createCaptureLogger } from "../logger.js";
import { computeFileHashInDir, loadMigration } from "../migrations-dir.js";
import { status } from "./status.js";

export class HashDriftError extends Error {
  constructor(public readonly changedFiles: string[]) {
    super(
      `Refusing to run: file hash changed for already-applied migration(s): ${changedFiles.join(
        ", ",
      )}. Re-run with forceHash: true to override.`,
    );
    this.name = "HashDriftError";
  }
}

export async function up(
  db: Db,
  client: MongoClient,
  config: ResolvedConfig,
  options: RunOptions = {},
): Promise<UpResult> {
  const dryRun = options.dryRun ?? false;
  const forceHash = options.forceHash ?? false;
  const statusItems = await status(db, config);

  if (config.useFileHash && !forceHash) {
    const changed = statusItems.filter((s) => s.status === "CHANGED").map((s) => s.fileName);
    if (changed.length > 0) throw new HashDriftError(changed);
  }

  const pending = statusItems.filter((s) => s.status === "PENDING");
  const migrationBlock = Date.now();
  const reports: MigrationRunReport[] = [];

  for (const item of pending) {
    const logger = createCaptureLogger();
    const mod = await loadMigration(config, item.fileName);
    const start = Date.now();
    try {
      await mod.up(db, client, { dryRun, logger });
    } catch (err) {
      const durationMs = Date.now() - start;
      reports.push({
        fileName: item.fileName,
        logs: [...logger.entries],
        durationMs,
        applied: false,
      });
      const e = err instanceof Error ? err : new Error(String(err));
      (e as Error & { migrated?: MigrationRunReport[] }).migrated = reports;
      throw e;
    }
    const durationMs = Date.now() - start;
    const report: MigrationRunReport = {
      fileName: item.fileName,
      logs: [...logger.entries],
      durationMs,
      applied: !dryRun,
    };
    reports.push(report);

    if (!dryRun) {
      const entry: ChangelogEntry = {
        fileName: item.fileName,
        appliedAt: new Date(),
        migrationBlock,
        logs: report.logs,
        durationMs,
        ...(config.useFileHash
          ? { fileHash: await computeFileHashInDir(config, item.fileName) }
          : {}),
      };
      await insertEntry(db, config, entry);
    }
  }

  return { dryRun, migrations: reports };
}
