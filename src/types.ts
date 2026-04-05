import type { Db, MongoClient, MongoClientOptions } from "mongodb";

export interface MongoConfig {
  url: string;
  databaseName: string;
  options?: MongoClientOptions;
}

export interface Config {
  mongodb: MongoConfig;
  migrationsDir: string;
  migrationFileExtension: ".ts" | ".js" | ".mjs";
  dateFormat: string;
  changelogCollectionName: string;
  useFileHash: boolean;
  moduleSystem: "esm";
}

export type ResolvedConfig = Readonly<Config>;

export type LogLevel = "log" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  at: Date;
}

export interface Logger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface CaptureLogger extends Logger {
  readonly entries: ReadonlyArray<LogEntry>;
}

export interface MigrationContext {
  dryRun: boolean;
  logger: Logger;
}

export type MigrationFn = (db: Db, client: MongoClient, ctx: MigrationContext) => Promise<void>;

export interface MigrationModule {
  up: MigrationFn;
  down: MigrationFn;
}

export interface ChangelogEntry {
  fileName: string;
  appliedAt: Date;
  migrationBlock: number;
  fileHash?: string;
  logs: LogEntry[];
  durationMs: number;
}

export type MigrationStatus = "PENDING" | "APPLIED" | "CHANGED";

export interface StatusItem {
  fileName: string;
  status: MigrationStatus;
  appliedAt?: Date;
  fileHash?: string;
  storedHash?: string;
}

export interface RunOptions {
  dryRun?: boolean;
  forceHash?: boolean;
}

export interface DownOptions extends RunOptions {
  block?: boolean;
}

export interface MigrationRunReport {
  fileName: string;
  logs: LogEntry[];
  durationMs: number;
  applied: boolean;
}

export interface UpResult {
  dryRun: boolean;
  migrations: MigrationRunReport[];
}

export interface DownResult {
  dryRun: boolean;
  migrations: MigrationRunReport[];
}
