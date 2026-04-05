import fs from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_CONFIG_TEMPLATE_JS,
  DEFAULT_CONFIG_TEMPLATE_TS,
} from "../templates/index.js";

export interface InitOptions {
  cwd?: string;
  flavor?: "ts" | "js";
}

export interface InitResult {
  configPath: string;
  migrationsDir: string;
}

export async function init(options: InitOptions = {}): Promise<InitResult> {
  const cwd = options.cwd ?? process.cwd();
  const flavor = options.flavor ?? "ts";
  const fileName =
    flavor === "ts" ? "mongo-migration.config.ts" : "mongo-migration.config.js";
  const configPath = path.join(cwd, fileName);

  let exists = false;
  try {
    await fs.access(configPath);
    exists = true;
  } catch {
    // not present, good
  }
  if (exists) {
    throw new Error(`Config file already exists: ${configPath}`);
  }

  const template =
    flavor === "ts" ? DEFAULT_CONFIG_TEMPLATE_TS : DEFAULT_CONFIG_TEMPLATE_JS;
  await fs.writeFile(configPath, template, "utf8");

  const migrationsDir = path.join(cwd, "migrations");
  await fs.mkdir(migrationsDir, { recursive: true });

  return { configPath, migrationsDir };
}
