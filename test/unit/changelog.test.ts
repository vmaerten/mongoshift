import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import {
  getAppliedEntries,
  insertEntry,
  removeEntry,
  getLastAppliedEntries,
  getChangelogCollection,
} from "../../src/changelog.js";
import type { ChangelogEntry, ResolvedConfig } from "../../src/types.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

function cfg(useFileHash = false): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: "/tmp/x",
    migrationFileExtension: ".js",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash,
    moduleSystem: "esm",
  });
}

function entry(fileName: string, block: number, hash?: string): ChangelogEntry {
  return {
    fileName,
    appliedAt: new Date(),
    migrationBlock: block,
    logs: [],
    durationMs: 1,
    ...(hash ? { fileHash: hash } : {}),
  };
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
});

describe("changelog", () => {
  it("inserts and retrieves entries sorted by fileName", async () => {
    await insertEntry(db, cfg(), entry("20260101-b.js", 1));
    await insertEntry(db, cfg(), entry("20260101-a.js", 1));
    const all = await getAppliedEntries(db, cfg());
    expect(all.map((e) => e.fileName)).toEqual(["20260101-a.js", "20260101-b.js"]);
  });

  it("strips fileHash when useFileHash is false", async () => {
    await insertEntry(db, cfg(false), entry("x.js", 1, "abc"));
    const doc = await getChangelogCollection(db, cfg()).findOne({
      fileName: "x.js",
    });
    expect(doc?.fileHash).toBeUndefined();
  });

  it("persists fileHash when useFileHash is true", async () => {
    await insertEntry(db, cfg(true), entry("x.js", 1, "abc"));
    const doc = await getChangelogCollection(db, cfg()).findOne({
      fileName: "x.js",
    });
    expect(doc?.fileHash).toBe("abc");
  });

  it("removeEntry deletes by fileName", async () => {
    await insertEntry(db, cfg(), entry("a.js", 1));
    await insertEntry(db, cfg(), entry("b.js", 1));
    await removeEntry(db, cfg(), "a.js");
    const all = await getAppliedEntries(db, cfg());
    expect(all.map((e) => e.fileName)).toEqual(["b.js"]);
  });

  it("getLastAppliedEntries returns last one by default", async () => {
    await insertEntry(db, cfg(), entry("a.js", 1));
    await insertEntry(db, cfg(), entry("b.js", 2));
    const last = await getLastAppliedEntries(db, cfg());
    expect(last.map((e) => e.fileName)).toEqual(["b.js"]);
  });

  it("getLastAppliedEntries with block returns whole last block", async () => {
    await insertEntry(db, cfg(), entry("a.js", 1));
    await insertEntry(db, cfg(), entry("b.js", 2));
    await insertEntry(db, cfg(), entry("c.js", 2));
    const batch = await getLastAppliedEntries(db, cfg(), { block: true });
    expect(batch.map((e) => e.fileName).sort()).toEqual(["b.js", "c.js"]);
  });

  it("getLastAppliedEntries returns [] when empty", async () => {
    expect(await getLastAppliedEntries(db, cfg())).toEqual([]);
  });
});
