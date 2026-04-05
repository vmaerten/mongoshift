import type { Collection, Db } from "mongodb";
import type { ChangelogEntry, ResolvedConfig } from "./types.js";

export function getChangelogCollection(db: Db, config: ResolvedConfig): Collection<ChangelogEntry> {
  return db.collection<ChangelogEntry>(config.changelogCollectionName);
}

export async function getAppliedEntries(db: Db, config: ResolvedConfig): Promise<ChangelogEntry[]> {
  const coll = getChangelogCollection(db, config);
  const docs = await coll.find({}, { sort: { fileName: 1 } }).toArray();
  return docs as ChangelogEntry[];
}

export async function insertEntry(
  db: Db,
  config: ResolvedConfig,
  entry: ChangelogEntry,
): Promise<void> {
  const coll = getChangelogCollection(db, config);
  const doc: ChangelogEntry = config.useFileHash ? entry : { ...entry, fileHash: undefined };
  // Strip undefined fileHash when not using file hash
  if (!config.useFileHash) delete (doc as Partial<ChangelogEntry>).fileHash;
  await coll.insertOne(doc);
}

export async function removeEntry(db: Db, config: ResolvedConfig, fileName: string): Promise<void> {
  const coll = getChangelogCollection(db, config);
  await coll.deleteOne({ fileName });
}

export async function getLastAppliedEntries(
  db: Db,
  config: ResolvedConfig,
  opts: { block?: boolean } = {},
): Promise<ChangelogEntry[]> {
  const coll = getChangelogCollection(db, config);
  const last = await coll.findOne({}, { sort: { fileName: -1 } });
  if (!last) return [];
  if (!opts.block) return [last as ChangelogEntry];
  const batch = await coll
    .find({ migrationBlock: last.migrationBlock }, { sort: { fileName: -1 } })
    .toArray();
  return batch as ChangelogEntry[];
}
