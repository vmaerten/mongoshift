import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { status } from "../../../src/actions/status.js";
import { insertEntry } from "../../../src/changelog.js";
import type {
  ChangelogEntry,
  ResolvedConfig,
} from "../../../src/types.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let tmp: string;

function cfg(useFileHash = false): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: tmp,
    migrationFileExtension: ".js",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash,
    moduleSystem: "esm",
  });
}

function appliedEntry(
  fileName: string,
  hash?: string,
): ChangelogEntry {
  return {
    fileName,
    appliedAt: new Date(),
    migrationBlock: 1,
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
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-status-"));
});

describe("status", () => {
  it("marks files not in changelog as PENDING", async () => {
    await fs.writeFile(path.join(tmp, "20260101-a.js"), "x");
    await fs.writeFile(path.join(tmp, "20260102-b.js"), "y");
    const s = await status(db, cfg());
    expect(s).toEqual([
      { fileName: "20260101-a.js", status: "PENDING" },
      { fileName: "20260102-b.js", status: "PENDING" },
    ]);
  });

  it("marks applied entries as APPLIED without hash when useFileHash=false", async () => {
    await fs.writeFile(path.join(tmp, "a.js"), "x");
    await insertEntry(db, cfg(false), appliedEntry("a.js"));
    const s = await status(db, cfg(false));
    expect(s[0]!.status).toBe("APPLIED");
    expect(s[0]!.appliedAt).toBeInstanceOf(Date);
    expect(s[0]!.fileHash).toBeUndefined();
  });

  it("detects CHANGED when file hash drifts", async () => {
    const file = path.join(tmp, "a.js");
    await fs.writeFile(file, "original");
    await insertEntry(
      db,
      cfg(true),
      appliedEntry("a.js", "stale-hash-abcdef"),
    );
    const s = await status(db, cfg(true));
    expect(s[0]!.status).toBe("CHANGED");
    expect(s[0]!.storedHash).toBe("stale-hash-abcdef");
    expect(s[0]!.fileHash).toBeDefined();
    expect(s[0]!.fileHash).not.toBe("stale-hash-abcdef");
  });

  it("marks APPLIED when hash matches", async () => {
    const file = path.join(tmp, "a.js");
    await fs.writeFile(file, "content");
    const crypto = await import("node:crypto");
    const hash = crypto
      .createHash("sha256")
      .update("content")
      .digest("hex");
    await insertEntry(db, cfg(true), appliedEntry("a.js", hash));
    const s = await status(db, cfg(true));
    expect(s[0]!.status).toBe("APPLIED");
    expect(s[0]!.fileHash).toBe(hash);
  });

  it("mixes PENDING + APPLIED sorted", async () => {
    await fs.writeFile(path.join(tmp, "20260103-c.js"), "");
    await fs.writeFile(path.join(tmp, "20260101-a.js"), "");
    await fs.writeFile(path.join(tmp, "20260102-b.js"), "");
    await insertEntry(db, cfg(), appliedEntry("20260101-a.js"));
    const s = await status(db, cfg());
    expect(s.map((x) => [x.fileName, x.status])).toEqual([
      ["20260101-a.js", "APPLIED"],
      ["20260102-b.js", "PENDING"],
      ["20260103-c.js", "PENDING"],
    ]);
  });

  it("lists orphaned entries (in changelog but not on disk)", async () => {
    await insertEntry(db, cfg(), appliedEntry("ghost.js"));
    const s = await status(db, cfg());
    expect(s).toHaveLength(1);
    expect(s[0]!.fileName).toBe("ghost.js");
    expect(s[0]!.status).toBe("APPLIED");
  });
});
