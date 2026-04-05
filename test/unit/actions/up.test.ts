import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { up, HashDriftError } from "../../../src/actions/up.js";
import { getAppliedEntries } from "../../../src/changelog.js";
import type { ResolvedConfig } from "../../../src/types.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let tmp: string;

function cfg(useFileHash = false): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: tmp,
    migrationFileExtension: ".mjs",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash,
  });
}

async function writeMigration(
  name: string,
  body: { up?: string; down?: string; logInUp?: string } = {},
): Promise<void> {
  const upBody = body.up ?? "";
  const downBody = body.down ?? "";
  const logLine = body.logInUp ? `ctx.logger.log(${JSON.stringify(body.logInUp)});` : "";
  const content = `
    export const up = async (db, client, ctx) => {
      ${logLine}
      ${upBody}
    };
    export const down = async (db, client, ctx) => { ${downBody} };
  `;
  await fs.writeFile(path.join(tmp, name), content);
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongod.getUri());
  db = client.db("testdb");
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  await db.collection("changelog").deleteMany({});
  await db
    .collection("widgets")
    .drop()
    .catch(() => {});
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-up-"));
});

describe("up action", () => {
  it("applies pending migrations and stores them in changelog", async () => {
    await writeMigration("20260101-a.mjs", {
      up: `await db.collection("widgets").insertOne({ n: 1 });`,
    });
    await writeMigration("20260102-b.mjs", {
      up: `await db.collection("widgets").insertOne({ n: 2 });`,
    });

    const result = await up(db, client, cfg());
    expect(result.dryRun).toBe(false);
    expect(result.migrations.map((m) => m.fileName)).toEqual(["20260101-a.mjs", "20260102-b.mjs"]);
    expect(result.migrations.every((m) => m.applied)).toBe(true);
    const applied = await getAppliedEntries(db, cfg());
    expect(applied.map((e) => e.fileName)).toEqual(["20260101-a.mjs", "20260102-b.mjs"]);
    expect(applied[0]!.migrationBlock).toBe(applied[1]!.migrationBlock);
    const widgets = await db.collection("widgets").find().toArray();
    expect(widgets).toHaveLength(2);
  });

  it("stores logs inline in changelog entry", async () => {
    await writeMigration("20260101-a.mjs", { logInUp: "hello world" });
    await up(db, client, cfg());
    const applied = await getAppliedEntries(db, cfg());
    expect(applied[0]!.logs).toHaveLength(1);
    expect(applied[0]!.logs[0]!.message).toBe("hello world");
    expect(applied[0]!.logs[0]!.level).toBe("log");
  });

  it("skips already-applied migrations", async () => {
    await writeMigration("a.mjs");
    await up(db, client, cfg());
    const result = await up(db, client, cfg());
    expect(result.migrations).toHaveLength(0);
  });

  it("dry-run does NOT insert into changelog", async () => {
    await writeMigration("a.mjs", {
      up: `await db.collection("widgets").insertOne({ n: 99 });`,
    });
    const result = await up(db, client, cfg(), { dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(result.migrations[0]!.applied).toBe(false);
    const applied = await getAppliedEntries(db, cfg());
    expect(applied).toHaveLength(0);
    // However the user's migration DID execute (side effects are their responsibility)
    const w = await db.collection("widgets").countDocuments();
    expect(w).toBe(1);
  });

  it("migration can read dryRun flag from ctx", async () => {
    await writeMigration("a.mjs", {
      up: `if (!ctx.dryRun) { await db.collection("widgets").insertOne({ n: 1 }); }`,
    });
    await up(db, client, cfg(), { dryRun: true });
    expect(await db.collection("widgets").countDocuments()).toBe(0);
  });

  it("stops on error, does not persist failed migration, preserves earlier successes", async () => {
    await writeMigration("a.mjs", {
      up: `await db.collection("widgets").insertOne({ n: 1 });`,
    });
    await writeMigration("b.mjs", {
      up: `throw new Error("boom");`,
    });
    await expect(up(db, client, cfg())).rejects.toThrow("boom");
    const applied = await getAppliedEntries(db, cfg());
    expect(applied.map((e) => e.fileName)).toEqual(["a.mjs"]);
  });

  it("persists fileHash when useFileHash=true", async () => {
    await writeMigration("a.mjs");
    await up(db, client, cfg(true));
    const applied = await getAppliedEntries(db, cfg(true));
    expect(applied[0]!.fileHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("throws HashDriftError when fileHash drift detected", async () => {
    await writeMigration("a.mjs");
    await up(db, client, cfg(true));
    // Modify the file
    await fs.writeFile(
      path.join(tmp, "a.mjs"),
      `export const up = async () => {}; export const down = async () => {};`,
    );
    // Add another pending one so there's something to do
    await writeMigration("b.mjs");
    await expect(up(db, client, cfg(true))).rejects.toBeInstanceOf(HashDriftError);
  });

  it("forceHash overrides drift refusal", async () => {
    await writeMigration("a.mjs");
    await up(db, client, cfg(true));
    await fs.writeFile(
      path.join(tmp, "a.mjs"),
      `export const up = async () => {}; export const down = async () => {};`,
    );
    await writeMigration("b.mjs");
    const result = await up(db, client, cfg(true), { forceHash: true });
    expect(result.migrations.map((m) => m.fileName)).toEqual(["b.mjs"]);
  });
});
