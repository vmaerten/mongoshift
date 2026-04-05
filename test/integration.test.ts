import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Db } from "mongodb";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { up, down, status, create, type ResolvedConfig } from "../src/index.js";

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let tmp: string;

function cfg(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return Object.freeze({
    mongodb: { url: "x", databaseName: "d" },
    migrationsDir: tmp,
    migrationFileExtension: ".mjs",
    dateFormat: "YYYYMMDDHHmmss",
    changelogCollectionName: "changelog",
    useFileHash: false,
    moduleSystem: "esm",
    ...overrides,
  });
}

async function writeMig(name: string, upBody: string, downBody: string): Promise<void> {
  const content = `
    export const up = async (db, client, ctx) => {
      ctx.logger.log("running up of ${name}");
      ${upBody}
    };
    export const down = async (db, client, ctx) => {
      ctx.logger.log("running down of ${name}");
      ${downBody}
    };
  `;
  await fs.writeFile(path.join(tmp, name), content);
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongod.getUri());
  db = client.db("integration_db");
});
afterAll(async () => {
  await client.close();
  await mongod.stop();
});
beforeEach(async () => {
  await db.collection("changelog").deleteMany({});
  await db.collection("my_changelog").deleteMany({});
  await db
    .collection("widgets")
    .drop()
    .catch(() => {});
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mm-integ-"));
});

describe("integration: create → up → status → down", () => {
  it("runs a full lifecycle with stored logs", async () => {
    await writeMig(
      "20260101-insert.mjs",
      `await db.collection("widgets").insertOne({ n: 1 });`,
      `await db.collection("widgets").deleteOne({ n: 1 });`,
    );

    // status: PENDING
    let s = await status(db, cfg());
    expect(s[0]!.status).toBe("PENDING");

    // up
    const upResult = await up(db, client, cfg());
    expect(upResult.migrations).toHaveLength(1);
    expect(upResult.migrations[0]!.applied).toBe(true);
    expect(upResult.migrations[0]!.logs[0]!.message).toContain("running up");

    // status: APPLIED
    s = await status(db, cfg());
    expect(s[0]!.status).toBe("APPLIED");

    // logs were persisted
    const ch = await db.collection("changelog").findOne({ fileName: "20260101-insert.mjs" });
    expect(ch!.logs).toHaveLength(1);
    expect(ch!.logs[0].message).toContain("running up");
    expect(typeof ch!.durationMs).toBe("number");

    // data inserted
    expect(await db.collection("widgets").countDocuments()).toBe(1);

    // down
    const downResult = await down(db, client, cfg());
    expect(downResult.migrations).toHaveLength(1);
    expect(await db.collection("widgets").countDocuments()).toBe(0);

    // status: PENDING again
    s = await status(db, cfg());
    expect(s[0]!.status).toBe("PENDING");
  });

  it("dry-run does not persist changelog but calls migration", async () => {
    await writeMig(
      "a.mjs",
      `if (!ctx.dryRun) await db.collection("widgets").insertOne({ n: 1 });`,
      ``,
    );
    const r = await up(db, client, cfg(), { dryRun: true });
    expect(r.dryRun).toBe(true);
    expect(r.migrations[0]!.applied).toBe(false);
    expect(await db.collection("changelog").countDocuments()).toBe(0);
    expect(await db.collection("widgets").countDocuments()).toBe(0);
  });

  it("fileHash drift: status=CHANGED and up refuses without forceHash", async () => {
    await writeMig("a.mjs", ``, ``);
    await up(db, client, cfg({ useFileHash: true }));
    // tamper
    await fs.writeFile(
      path.join(tmp, "a.mjs"),
      `export const up = async () => {}; export const down = async () => {};`,
    );
    const s = await status(db, cfg({ useFileHash: true }));
    expect(s[0]!.status).toBe("CHANGED");

    await writeMig("b.mjs", ``, ``);
    await expect(up(db, client, cfg({ useFileHash: true }))).rejects.toThrow(/hash changed/);

    const r = await up(db, client, cfg({ useFileHash: true }), {
      forceHash: true,
    });
    expect(r.migrations.map((m) => m.fileName)).toEqual(["b.mjs"]);
  });

  it("custom changelogCollectionName", async () => {
    await writeMig("a.mjs", ``, ``);
    await up(db, client, cfg({ changelogCollectionName: "my_changelog" }));
    expect(await db.collection("my_changelog").countDocuments()).toBe(1);
    expect(await db.collection("changelog").countDocuments()).toBe(0);
  });

  it("create uses custom dateFormat and sample template", async () => {
    await fs.writeFile(
      path.join(tmp, "sample-migration.mjs"),
      `// SAMPLE TPL\nexport const up = async () => {};\nexport const down = async () => {};\n`,
    );
    const fileName = await create(cfg({ dateFormat: "YYYY_MM_DD" }), "my test", {
      now: new Date(2026, 3, 5),
    });
    expect(fileName).toBe("2026_04_05-my_test.mjs");
    const content = await fs.readFile(path.join(tmp, fileName), "utf8");
    expect(content).toContain("SAMPLE TPL");
  });

  it("down --block rolls back the whole last batch", async () => {
    await writeMig(
      "a.mjs",
      `await db.collection("widgets").insertOne({ n: 1 });`,
      `await db.collection("widgets").deleteOne({ n: 1 });`,
    );
    await writeMig(
      "b.mjs",
      `await db.collection("widgets").insertOne({ n: 2 });`,
      `await db.collection("widgets").deleteOne({ n: 2 });`,
    );
    await up(db, client, cfg()); // one batch
    await down(db, client, cfg(), { block: true });
    expect(await db.collection("widgets").countDocuments()).toBe(0);
    expect(await db.collection("changelog").countDocuments()).toBe(0);
  });

  it("stores warn/error logs in changelog", async () => {
    await writeMig("a.mjs", `ctx.logger.warn("hmm"); ctx.logger.error("oops");`, ``);
    await up(db, client, cfg());
    const e = await db.collection("changelog").findOne({ fileName: "a.mjs" });
    const levels = e!.logs.map((l: { level: string }) => l.level);
    expect(levels).toContain("warn");
    expect(levels).toContain("error");
  });
});
