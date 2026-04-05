import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { up } from "../../../src/actions/up.js";
import { down } from "../../../src/actions/down.js";
import { getAppliedEntries } from "../../../src/changelog.js";
import type { ResolvedConfig } from "../../../src/types.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let tmp: string;

function cfg(): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: tmp,
    migrationFileExtension: ".mjs",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash: false,
    moduleSystem: "esm",
  });
}

async function writeUpDown(
  name: string,
  upBody: string,
  downBody: string,
): Promise<void> {
  const content = `
    export const up = async (db, client, ctx) => { ${upBody} };
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
  await db.collection("widgets").drop().catch(() => {});
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-down-"));
});

describe("down action", () => {
  it("rolls back the most recent migration by default", async () => {
    await writeUpDown(
      "a.mjs",
      `await db.collection("widgets").insertOne({ n: 1 });`,
      `await db.collection("widgets").deleteOne({ n: 1 });`,
    );
    await writeUpDown(
      "b.mjs",
      `await db.collection("widgets").insertOne({ n: 2 });`,
      `await db.collection("widgets").deleteOne({ n: 2 });`,
    );
    await up(db, client, cfg());
    const result = await down(db, client, cfg());
    expect(result.migrations.map((m) => m.fileName)).toEqual(["b.mjs"]);
    const applied = await getAppliedEntries(db, cfg());
    expect(applied.map((e) => e.fileName)).toEqual(["a.mjs"]);
    const widgets = await db
      .collection("widgets")
      .find()
      .toArray();
    expect(widgets.map((w) => w.n)).toEqual([1]);
  });

  it("with block=true rolls back the whole last batch", async () => {
    await writeUpDown(
      "a.mjs",
      `await db.collection("widgets").insertOne({ n: 1 });`,
      `await db.collection("widgets").deleteOne({ n: 1 });`,
    );
    await writeUpDown(
      "b.mjs",
      `await db.collection("widgets").insertOne({ n: 2 });`,
      `await db.collection("widgets").deleteOne({ n: 2 });`,
    );
    await up(db, client, cfg()); // single batch
    const result = await down(db, client, cfg(), { block: true });
    expect(result.migrations.map((m) => m.fileName).sort()).toEqual([
      "a.mjs",
      "b.mjs",
    ]);
    const applied = await getAppliedEntries(db, cfg());
    expect(applied).toHaveLength(0);
  });

  it("dry-run does NOT remove from changelog", async () => {
    await writeUpDown("a.mjs", "", `if (!ctx.dryRun) throw new Error("x");`);
    await up(db, client, cfg());
    const result = await down(db, client, cfg(), { dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(result.migrations[0]!.applied).toBe(false);
    const applied = await getAppliedEntries(db, cfg());
    expect(applied).toHaveLength(1);
  });

  it("no-op when nothing applied", async () => {
    const result = await down(db, client, cfg());
    expect(result.migrations).toHaveLength(0);
  });

  it("stops on error and does not remove failing entry", async () => {
    await writeUpDown("a.mjs", "", `throw new Error("boom");`);
    await up(db, client, cfg());
    await expect(down(db, client, cfg())).rejects.toThrow("boom");
    const applied = await getAppliedEntries(db, cfg());
    expect(applied).toHaveLength(1);
  });
});
