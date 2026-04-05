import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import type { MigrationModule, ResolvedConfig } from "./types.js";

const SAMPLE_BASENAME = "sample-migration";

export class MigrationsDirError extends Error {}

export async function ensureMigrationsDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Returns migration files (sorted by name) excluding the sample template.
 */
export async function listMigrationFiles(config: ResolvedConfig): Promise<string[]> {
  try {
    const entries = await fs.readdir(config.migrationsDir);
    return entries
      .filter((f) => {
        if (!f.endsWith(config.migrationFileExtension)) return false;
        const base = path.basename(f, config.migrationFileExtension);
        return base !== SAMPLE_BASENAME;
      })
      .sort();
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function computeFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function computeFileHashInDir(
  config: ResolvedConfig,
  fileName: string,
): Promise<string> {
  return computeFileHash(path.join(config.migrationsDir, fileName));
}

export async function loadMigration(
  config: ResolvedConfig,
  fileName: string,
): Promise<MigrationModule> {
  const fullPath = path.join(config.migrationsDir, fileName);
  const url = pathToFileURL(fullPath).href;
  const mod = await import(url);
  const candidate = mod.default ?? mod;
  if (typeof candidate.up !== "function" || typeof candidate.down !== "function") {
    throw new MigrationsDirError(
      `Migration ${fileName} must export "up" and "down" async functions`,
    );
  }
  return { up: candidate.up, down: candidate.down };
}

export async function resolveSampleMigrationPath(config: ResolvedConfig): Promise<string | null> {
  const candidate = path.join(
    config.migrationsDir,
    `${SAMPLE_BASENAME}${config.migrationFileExtension}`,
  );
  try {
    await fs.access(candidate);
    return candidate;
  } catch {
    return null;
  }
}
