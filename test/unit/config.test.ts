import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { loadConfig, ConfigError, resolveConfigPath } from "../../src/config.js";

describe("loadConfig", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mm-config-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("loads a JS config with defaults filled in", async () => {
    const content = `export default {
      mongodb: { url: "mongodb://localhost:27017", databaseName: "test_db" }
    };`;
    await fs.writeFile(path.join(tmpDir, "mongo-migration.config.js"), content);

    const cfg = await loadConfig({ cwd: tmpDir });
    expect(cfg.mongodb.url).toBe("mongodb://localhost:27017");
    expect(cfg.mongodb.databaseName).toBe("test_db");
    expect(cfg.changelogCollectionName).toBe("changelog");
    expect(cfg.dateFormat).toBe("YYYYMMDDHHmmss");
    expect(cfg.useFileHash).toBe(false);
    expect(cfg.migrationFileExtension).toBe(".ts");
    // migrationsDir resolved to absolute relative to config dir
    expect(path.isAbsolute(cfg.migrationsDir)).toBe(true);
    expect(cfg.migrationsDir).toBe(path.join(tmpDir, "migrations"));
  });

  it("respects user overrides", async () => {
    const content = `export default {
      mongodb: { url: "mongodb://x", databaseName: "db" },
      changelogCollectionName: "my_changelog",
      dateFormat: "YYYY-MM-DD",
      useFileHash: true,
      migrationsDir: "my-migs",
      migrationFileExtension: ".js"
    };`;
    await fs.writeFile(path.join(tmpDir, "mongo-migration.config.js"), content);

    const cfg = await loadConfig({ cwd: tmpDir });
    expect(cfg.changelogCollectionName).toBe("my_changelog");
    expect(cfg.dateFormat).toBe("YYYY-MM-DD");
    expect(cfg.useFileHash).toBe(true);
    expect(cfg.migrationsDir).toBe(path.join(tmpDir, "my-migs"));
    expect(cfg.migrationFileExtension).toBe(".js");
  });

  it("throws if no config file present", async () => {
    await expect(loadConfig({ cwd: tmpDir })).rejects.toBeInstanceOf(ConfigError);
  });

  it("throws on missing mongodb fields", async () => {
    await fs.writeFile(
      path.join(tmpDir, "mongo-migration.config.js"),
      `export default { mongodb: { url: "x" } };`,
    );
    await expect(loadConfig({ cwd: tmpDir })).rejects.toBeInstanceOf(ConfigError);
  });

  it("supports explicit file path", async () => {
    const custom = path.join(tmpDir, "custom.config.js");
    await fs.writeFile(custom, `export default { mongodb: { url: "u", databaseName: "d" } };`);
    const cfg = await loadConfig({ cwd: tmpDir, file: custom });
    expect(cfg.mongodb.url).toBe("u");
  });

  it("resolveConfigPath throws if explicit path missing", async () => {
    await expect(resolveConfigPath(tmpDir, path.join(tmpDir, "nope.js"))).rejects.toBeInstanceOf(
      ConfigError,
    );
  });
});
