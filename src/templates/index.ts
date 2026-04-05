export const TS_MIGRATION_TEMPLATE = `import type { Db, MongoClient } from "mongodb";
import type { MigrationContext } from "mongo-migration";

export const up = async (
  db: Db,
  client: MongoClient,
  ctx: MigrationContext,
): Promise<void> => {
  // TODO: write your migration here
  // Use ctx.logger.log/warn/error to persist logs in the changelog.
  // Check ctx.dryRun to skip destructive operations when true.
};

export const down = async (
  db: Db,
  client: MongoClient,
  ctx: MigrationContext,
): Promise<void> => {
  // TODO: write the statements to rollback your migration
};
`;

export const JS_MIGRATION_TEMPLATE = `/**
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').MongoClient} client
 * @param {{ dryRun: boolean, logger: { log(m:string):void, warn(m:string):void, error(m:string):void } }} ctx
 * @returns {Promise<void>}
 */
export const up = async (db, client, ctx) => {
  // TODO: write your migration here
  // Use ctx.logger.log/warn/error to persist logs in the changelog.
  // Check ctx.dryRun to skip destructive operations when true.
};

/** @type {typeof up} */
export const down = async (db, client, ctx) => {
  // TODO: write the statements to rollback your migration
};
`;

export const DEFAULT_CONFIG_TEMPLATE_TS = `import type { Config } from "mongo-migration";

const config: Config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "YOUR_DB_NAME",
  },
  migrationsDir: "migrations",
  migrationFileExtension: ".ts",
  dateFormat: "YYYYMMDDHHmmss",
  changelogCollectionName: "changelog",
  useFileHash: false,
  moduleSystem: "esm",
};

export default config;
`;

export const DEFAULT_CONFIG_TEMPLATE_JS = `/** @type {import('mongo-migration').Config} */
const config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "YOUR_DB_NAME",
  },
  migrationsDir: "migrations",
  migrationFileExtension: ".js",
  dateFormat: "YYYYMMDDHHmmss",
  changelogCollectionName: "changelog",
  useFileHash: false,
  moduleSystem: "esm",
};

export default config;
`;

export function defaultMigrationTemplate(
  extension: ".ts" | ".js" | ".mjs",
): string {
  return extension === ".ts" ? TS_MIGRATION_TEMPLATE : JS_MIGRATION_TEMPLATE;
}
