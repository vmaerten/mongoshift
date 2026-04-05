import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import type { Config, ResolvedConfig } from "./types.js";

export const DEFAULT_CONFIG_FILENAMES = [
  "mongo-migration.config.ts",
  "mongo-migration.config.js",
  "mongo-migration.config.mjs",
];

const DEFAULTS: Omit<Config, "mongodb"> = {
  migrationsDir: "migrations",
  migrationFileExtension: ".ts",
  dateFormat: "YYYYMMDDHHmmss",
  changelogCollectionName: "changelog",
  useFileHash: false,
  moduleSystem: "esm",
};

export class ConfigError extends Error {}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function resolveConfigPath(
  cwd: string = process.cwd(),
  explicit?: string,
): Promise<string> {
  if (explicit) {
    const abs = path.isAbsolute(explicit) ? explicit : path.join(cwd, explicit);
    if (!(await fileExists(abs))) {
      throw new ConfigError(`Config file not found: ${abs}`);
    }
    return abs;
  }
  for (const name of DEFAULT_CONFIG_FILENAMES) {
    const candidate = path.join(cwd, name);
    if (await fileExists(candidate)) return candidate;
  }
  throw new ConfigError(
    `No config file found. Expected one of: ${DEFAULT_CONFIG_FILENAMES.join(", ")} in ${cwd}`,
  );
}

function validate(raw: unknown, source: string): Config {
  if (typeof raw !== "object" || raw === null) {
    throw new ConfigError(`Config at ${source} must export an object`);
  }
  const obj = raw as Partial<Config>;
  if (
    !obj.mongodb ||
    typeof obj.mongodb.url !== "string" ||
    typeof obj.mongodb.databaseName !== "string"
  ) {
    throw new ConfigError(
      `Config at ${source} is missing required mongodb.url or mongodb.databaseName`,
    );
  }
  const merged: Config = {
    mongodb: obj.mongodb,
    migrationsDir: obj.migrationsDir ?? DEFAULTS.migrationsDir,
    migrationFileExtension: obj.migrationFileExtension ?? DEFAULTS.migrationFileExtension,
    dateFormat: obj.dateFormat ?? DEFAULTS.dateFormat,
    changelogCollectionName: obj.changelogCollectionName ?? DEFAULTS.changelogCollectionName,
    useFileHash: obj.useFileHash ?? DEFAULTS.useFileHash,
    moduleSystem: "esm",
  };
  return merged;
}

export async function loadConfig(
  opts: { cwd?: string; file?: string } = {},
): Promise<ResolvedConfig> {
  const cwd = opts.cwd ?? process.cwd();
  const configPath = await resolveConfigPath(cwd, opts.file);
  const url = pathToFileURL(configPath).href;
  const mod = await import(url);
  const exported = mod.default ?? mod;
  const config = validate(exported, configPath);
  // Resolve migrationsDir relative to config file dir.
  const configDir = path.dirname(configPath);
  const resolved: Config = {
    ...config,
    migrationsDir: path.isAbsolute(config.migrationsDir)
      ? config.migrationsDir
      : path.resolve(configDir, config.migrationsDir),
  };
  return Object.freeze(resolved);
}
