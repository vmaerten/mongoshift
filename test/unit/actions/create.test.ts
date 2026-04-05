import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { create } from "../../../src/actions/create.js";
import type { ResolvedConfig } from "../../../src/types.js";

let tmp: string;

function cfg(
  overrides: Partial<ResolvedConfig> = {},
): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: tmp,
    migrationFileExtension: ".ts",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash: false,
    moduleSystem: "esm",
    ...overrides,
  });
}

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-create-"));
});
afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

describe("create action", () => {
  it("creates migration file with default template and dateFormat", async () => {
    const now = new Date(2026, 3, 5, 9, 7, 3);
    const file = await create(cfg(), "add users", { now });
    expect(file).toBe("20260405090703-add_users.ts");
    const content = await fs.readFile(path.join(tmp, file), "utf8");
    expect(content).toContain("export const up");
    expect(content).toContain("export const down");
    expect(content).toContain("MigrationContext");
  });

  it("respects custom dateFormat", async () => {
    const now = new Date(2026, 0, 1, 0, 0, 0);
    const file = await create(
      cfg({ dateFormat: "YYYY-MM-DD" }),
      "add users",
      { now },
    );
    expect(file).toBe("2026-01-01-add_users.ts");
  });

  it("uses js template when extension is .js", async () => {
    const file = await create(
      cfg({ migrationFileExtension: ".js" }),
      "x",
      { now: new Date(2026, 0, 1, 0, 0, 0) },
    );
    expect(file.endsWith(".js")).toBe(true);
    const content = await fs.readFile(path.join(tmp, file), "utf8");
    expect(content).toContain("@param");
    expect(content).not.toContain("MigrationContext");
  });

  it("uses sample-migration when present", async () => {
    await fs.writeFile(
      path.join(tmp, "sample-migration.ts"),
      "// CUSTOM TEMPLATE\nexport const up = async () => {};\nexport const down = async () => {};\n",
    );
    const file = await create(cfg(), "x", { now: new Date(2026, 0, 1) });
    const content = await fs.readFile(path.join(tmp, file), "utf8");
    expect(content).toContain("CUSTOM TEMPLATE");
  });

  it("--template flag overrides sample-migration", async () => {
    await fs.writeFile(
      path.join(tmp, "sample-migration.ts"),
      "// SAMPLE\n",
    );
    const custom = path.join(tmp, "my-template.ts");
    await fs.writeFile(custom, "// CUSTOM FLAG\n");
    const file = await create(cfg(), "x", {
      template: custom,
      now: new Date(2026, 0, 1),
    });
    const content = await fs.readFile(path.join(tmp, file), "utf8");
    expect(content).toBe("// CUSTOM FLAG\n");
  });

  it("slugifies description", async () => {
    const file = await create(cfg(), "Add User: roles & perms!", {
      now: new Date(2026, 0, 1, 0, 0, 0),
    });
    expect(file).toBe("20260101000000-add_user_roles_perms.ts");
  });

  it("throws on empty description", async () => {
    await expect(create(cfg(), "   ")).rejects.toThrow(/empty/);
  });

  it("creates migrations dir if missing", async () => {
    const nested = path.join(tmp, "nested", "migs");
    await create(cfg({ migrationsDir: nested }), "x", {
      now: new Date(2026, 0, 1),
    });
    const files = await fs.readdir(nested);
    expect(files).toHaveLength(1);
  });
});
