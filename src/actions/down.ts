import type { Db, MongoClient } from "mongodb";
import type {
  DownOptions,
  DownResult,
  MigrationRunReport,
  ResolvedConfig,
} from "../types.js";
import { getLastAppliedEntries, removeEntry } from "../changelog.js";
import { createCaptureLogger } from "../logger.js";
import { loadMigration } from "../migrations-dir.js";

export async function down(
  db: Db,
  client: MongoClient,
  config: ResolvedConfig,
  options: DownOptions = {},
): Promise<DownResult> {
  const dryRun = options.dryRun ?? false;
  const block = options.block ?? false;

  const targets = await getLastAppliedEntries(db, config, { block });
  // Rollback in reverse order (most recent first -> targets already sorted desc).
  const reports: MigrationRunReport[] = [];

  for (const entry of targets) {
    const logger = createCaptureLogger();
    const mod = await loadMigration(config, entry.fileName);
    const start = Date.now();
    try {
      await mod.down(db, client, { dryRun, logger });
    } catch (err) {
      const durationMs = Date.now() - start;
      reports.push({
        fileName: entry.fileName,
        logs: [...logger.entries],
        durationMs,
        applied: false,
      });
      const e = err instanceof Error ? err : new Error(String(err));
      (e as Error & { rolledBack?: MigrationRunReport[] }).rolledBack = reports;
      throw e;
    }
    const durationMs = Date.now() - start;
    reports.push({
      fileName: entry.fileName,
      logs: [...logger.entries],
      durationMs,
      applied: !dryRun,
    });
    if (!dryRun) {
      await removeEntry(db, config, entry.fileName);
    }
  }

  return { dryRun, migrations: reports };
}
