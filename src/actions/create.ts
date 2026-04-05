import fs from "node:fs/promises";
import path from "node:path";
import type { ResolvedConfig } from "../types.js";
import { ensureMigrationsDir, resolveSampleMigrationPath } from "../migrations-dir.js";
import { formatDate } from "../utils/date-format.js";
import { defaultMigrationTemplate } from "../templates/index.js";

export interface CreateOptions {
  /** Path to a custom template file. Takes precedence over sample-migration. */
  template?: string;
  /** Override date (for deterministic tests). */
  now?: Date;
}

function slugify(description: string): string {
  return description
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function readTemplate(config: ResolvedConfig, options: CreateOptions): Promise<string> {
  if (options.template) {
    return fs.readFile(options.template, "utf8");
  }
  const sample = await resolveSampleMigrationPath(config);
  if (sample) {
    return fs.readFile(sample, "utf8");
  }
  return defaultMigrationTemplate(config.migrationFileExtension);
}

export async function create(
  config: ResolvedConfig,
  description: string,
  options: CreateOptions = {},
): Promise<string> {
  if (!description.trim()) {
    throw new Error("Migration description cannot be empty");
  }
  await ensureMigrationsDir(config.migrationsDir);
  const timestamp = formatDate(options.now ?? new Date(), config.dateFormat);
  const slug = slugify(description);
  const fileName = `${timestamp}-${slug}${config.migrationFileExtension}`;
  const fullPath = path.join(config.migrationsDir, fileName);
  const content = await readTemplate(config, options);
  await fs.writeFile(fullPath, content, "utf8");
  return fileName;
}
