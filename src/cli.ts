#!/usr/bin/env node
import { Command } from "commander";
import Table from "cli-table3";
import { loadConfig } from "./config.js";
import { connect } from "./database.js";
import { up } from "./actions/up.js";
import { down } from "./actions/down.js";
import { status } from "./actions/status.js";
import { create } from "./actions/create.js";
import { init } from "./actions/init.js";
import type { MigrationRunReport } from "./types.js";

const program = new Command();
program
  .name("mongoshift")
  .description("MongoDB migration tool with dry-run, file-hash detection, and stored logs")
  .version("0.1.0");

program
  .command("init")
  .description("Create a default config file and migrations/ directory")
  .option("--ts", "Create a TypeScript config (default)", true)
  .option("--js", "Create a JavaScript config")
  .action(async (opts: { ts?: boolean; js?: boolean }) => {
    const flavor = opts.js ? "js" : "ts";
    const result = await init({ flavor });
    console.log(`Created config at ${result.configPath}`);
    console.log(`Created migrations dir at ${result.migrationsDir}`);
  });

program
  .command("create <description>")
  .description("Create a new migration file")
  .option("-f, --file <path>", "Path to config file")
  .option("-t, --template <path>", "Path to a custom template file")
  .action(async (description: string, opts: { file?: string; template?: string }) => {
    const config = await loadConfig({ file: opts.file });
    const fileName = await create(config, description, {
      template: opts.template,
    });
    console.log(`Created migration: ${fileName}`);
  });

program
  .command("up")
  .description("Apply all pending migrations")
  .option("-f, --file <path>", "Path to config file")
  .option("--dry-run", "Run migrations without persisting to changelog")
  .option("--force-hash", "Continue even if file hash drift is detected")
  .action(async (opts: { file?: string; dryRun?: boolean; forceHash?: boolean }) => {
    const config = await loadConfig({ file: opts.file });
    const handle = await connect(config);
    try {
      const result = await up(handle.db, handle.client, config, {
        dryRun: opts.dryRun,
        forceHash: opts.forceHash,
      });
      printRunResult(result.migrations, result.dryRun ? "DRY-RUN UP" : "UP");
    } finally {
      await handle.close();
    }
  });

program
  .command("down")
  .description("Rollback the last migration (or last batch with --block)")
  .option("-f, --file <path>", "Path to config file")
  .option("--dry-run", "Rollback without persisting changes to changelog")
  .option("--block", "Rollback the entire last migration batch")
  .action(async (opts: { file?: string; dryRun?: boolean; block?: boolean }) => {
    const config = await loadConfig({ file: opts.file });
    const handle = await connect(config);
    try {
      const result = await down(handle.db, handle.client, config, {
        dryRun: opts.dryRun,
        block: opts.block,
      });
      printRunResult(result.migrations, result.dryRun ? "DRY-RUN DOWN" : "DOWN");
    } finally {
      await handle.close();
    }
  });

program
  .command("status")
  .description("Show status of all migrations")
  .option("-f, --file <path>", "Path to config file")
  .action(async (opts: { file?: string }) => {
    const config = await loadConfig({ file: opts.file });
    const handle = await connect(config);
    try {
      const items = await status(handle.db, config);
      const table = new Table({
        head: ["File", "Status", "Applied At"],
      });
      for (const i of items) {
        table.push([i.fileName, i.status, i.appliedAt ? i.appliedAt.toISOString() : "-"]);
      }
      console.log(table.toString());
    } finally {
      await handle.close();
    }
  });

function printRunResult(reports: MigrationRunReport[], label: string): void {
  console.log(`[${label}] ${reports.length} migration(s)`);
  for (const r of reports) {
    const tag = r.applied ? "OK" : "SKIP";
    console.log(`  [${tag}] ${r.fileName} (${r.durationMs}ms)`);
    for (const log of r.logs) {
      console.log(`      ${log.level}: ${log.message}`);
    }
  }
}

program.parseAsync(process.argv).catch((err: unknown) => {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
