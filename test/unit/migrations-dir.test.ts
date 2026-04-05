import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  listMigrationFiles,
  computeFileHash,
  loadMigration,
  resolveSampleMigrationPath,
  ensureMigrationsDir,
  MigrationsDirError,
} from "../../src/migrations-dir.js";
import type { ResolvedConfig } from "../../src/types.js";

function makeConfig(dir: string, ext: ".ts" | ".js" = ".js"): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: dir,
    migrationFileExtension: ext,
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash: false,
  });
}

describe("migrations-dir", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-migdir-"));
  });
  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("listMigrationFiles returns sorted .js files excluding sample", async () => {
    await fs.writeFile(path.join(tmp, "20260101000001-b.js"), "");
    await fs.writeFile(path.join(tmp, "20260101000000-a.js"), "");
    await fs.writeFile(path.join(tmp, "sample-migration.js"), "");
    await fs.writeFile(path.join(tmp, "README.md"), "");
    const files = await listMigrationFiles(makeConfig(tmp));
    expect(files).toEqual(["20260101000000-a.js", "20260101000001-b.js"]);
  });

  it("listMigrationFiles returns [] when dir missing", async () => {
    const files = await listMigrationFiles(makeConfig(path.join(tmp, "nope")));
    expect(files).toEqual([]);
  });

  it("filters by extension", async () => {
    await fs.writeFile(path.join(tmp, "a.js"), "");
    await fs.writeFile(path.join(tmp, "b.ts"), "");
    const files = await listMigrationFiles(makeConfig(tmp, ".ts"));
    expect(files).toEqual(["b.ts"]);
  });

  it("computeFileHash produces stable sha256", async () => {
    const f = path.join(tmp, "x.js");
    await fs.writeFile(f, "hello");
    const h = await computeFileHash(f);
    expect(h).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("loadMigration imports ESM module with up/down", async () => {
    const file = "20260101-mig.mjs";
    await fs.writeFile(
      path.join(tmp, file),
      `export const up = async () => {};
       export const down = async () => {};`,
    );
    const cfg = makeConfig(tmp, ".js"); // ext not used by loadMigration
    const mod = await loadMigration(cfg, file);
    expect(typeof mod.up).toBe("function");
    expect(typeof mod.down).toBe("function");
  });

  it("loadMigration throws if up/down missing", async () => {
    const file = "bad.mjs";
    await fs.writeFile(path.join(tmp, file), `export const up = async () => {};`);
    await expect(loadMigration(makeConfig(tmp), file)).rejects.toBeInstanceOf(MigrationsDirError);
  });

  it("resolveSampleMigrationPath returns path when exists, null otherwise", async () => {
    const cfg = makeConfig(tmp, ".js");
    expect(await resolveSampleMigrationPath(cfg)).toBeNull();
    await fs.writeFile(path.join(tmp, "sample-migration.js"), "");
    expect(await resolveSampleMigrationPath(cfg)).toBe(path.join(tmp, "sample-migration.js"));
  });

  it("ensureMigrationsDir creates directory recursively", async () => {
    const target = path.join(tmp, "a", "b", "c");
    await ensureMigrationsDir(target);
    const stat = await fs.stat(target);
    expect(stat.isDirectory()).toBe(true);
  });
});
