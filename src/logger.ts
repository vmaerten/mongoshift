import type { CaptureLogger, LogEntry, LogLevel } from "./types.js";

export function createCaptureLogger(
  opts: { mirrorToConsole?: boolean } = {},
): CaptureLogger {
  const entries: LogEntry[] = [];
  const push = (level: LogLevel, message: string) => {
    entries.push({ level, message, at: new Date() });
    if (opts.mirrorToConsole) {
      const fn =
        level === "error"
          ? console.error
          : level === "warn"
            ? console.warn
            : console.log;
      fn(message);
    }
  };
  return {
    entries,
    log: (m) => push("log", m),
    warn: (m) => push("warn", m),
    error: (m) => push("error", m),
  };
}
