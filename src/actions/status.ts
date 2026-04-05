import type { Db } from "mongodb";
import type { ResolvedConfig, StatusItem } from "../types.js";
import { getAppliedEntries } from "../changelog.js";
import {
  computeFileHashInDir,
  listMigrationFiles,
} from "../migrations-dir.js";

/**
 * Returns status for every migration file (disk + changelog union), sorted by fileName.
 * - PENDING: on disk, not in changelog
 * - APPLIED: on disk and in changelog (hash matches when useFileHash)
 * - CHANGED: on disk and in changelog but file hash differs (only when useFileHash)
 *
 * Entries in changelog but missing from disk are listed as PENDING with no file hash
 * (they are effectively orphaned but we expose them so the user sees them).
 */
export async function status(
  db: Db,
  config: ResolvedConfig,
): Promise<StatusItem[]> {
  const files = await listMigrationFiles(config);
  const applied = await getAppliedEntries(db, config);
  const appliedByName = new Map(applied.map((e) => [e.fileName, e]));
  const seen = new Set<string>();

  const items: StatusItem[] = [];

  for (const fileName of files) {
    seen.add(fileName);
    const entry = appliedByName.get(fileName);
    if (!entry) {
      const item: StatusItem = { fileName, status: "PENDING" };
      if (config.useFileHash) {
        item.fileHash = await computeFileHashInDir(config, fileName);
      }
      items.push(item);
      continue;
    }
    if (config.useFileHash) {
      const currentHash = await computeFileHashInDir(config, fileName);
      const storedHash = entry.fileHash;
      if (storedHash && storedHash !== currentHash) {
        items.push({
          fileName,
          status: "CHANGED",
          appliedAt: entry.appliedAt,
          fileHash: currentHash,
          storedHash,
        });
        continue;
      }
      items.push({
        fileName,
        status: "APPLIED",
        appliedAt: entry.appliedAt,
        fileHash: currentHash,
        ...(storedHash ? { storedHash } : {}),
      });
    } else {
      items.push({
        fileName,
        status: "APPLIED",
        appliedAt: entry.appliedAt,
      });
    }
  }

  // Orphaned entries (in changelog but missing from disk): expose as APPLIED with a note.
  for (const entry of applied) {
    if (!seen.has(entry.fileName)) {
      items.push({
        fileName: entry.fileName,
        status: "APPLIED",
        appliedAt: entry.appliedAt,
        ...(entry.fileHash ? { storedHash: entry.fileHash } : {}),
      });
    }
  }

  items.sort((a, b) => a.fileName.localeCompare(b.fileName));
  return items;
}
