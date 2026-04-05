import { MongoClient, type Db } from "mongodb";
import type { ResolvedConfig } from "./types.js";

export interface DatabaseHandle {
  client: MongoClient;
  db: Db;
  close: () => Promise<void>;
}

export async function connect(config: ResolvedConfig): Promise<DatabaseHandle> {
  const client = await MongoClient.connect(config.mongodb.url, config.mongodb.options);
  const db = client.db(config.mongodb.databaseName);
  return {
    client,
    db,
    close: () => client.close(),
  };
}
