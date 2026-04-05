export { up, HashDriftError } from "./actions/up.js";
export { down } from "./actions/down.js";
export { status } from "./actions/status.js";
export { create } from "./actions/create.js";
export { init } from "./actions/init.js";
export { connect } from "./database.js";
export { loadConfig, ConfigError } from "./config.js";
export { createCaptureLogger } from "./logger.js";

export type {
  Config,
  ResolvedConfig,
  MongoConfig,
  MigrationModule,
  MigrationFn,
  MigrationContext,
  Logger,
  CaptureLogger,
  LogEntry,
  LogLevel,
  ChangelogEntry,
  MigrationStatus,
  StatusItem,
  RunOptions,
  DownOptions,
  UpResult,
  DownResult,
  MigrationRunReport,
} from "./types.js";

export type { DatabaseHandle } from "./database.js";
export type { CreateOptions } from "./actions/create.js";
export type { InitOptions, InitResult } from "./actions/init.js";
