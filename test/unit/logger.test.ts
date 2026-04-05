import { describe, it, expect, vi } from "vitest";
import { createCaptureLogger } from "../../src/logger.js";

describe("createCaptureLogger", () => {
  it("captures log/warn/error entries in order", () => {
    const logger = createCaptureLogger();
    logger.log("hello");
    logger.warn("careful");
    logger.error("boom");
    expect(logger.entries).toHaveLength(3);
    expect(logger.entries.map((e) => e.level)).toEqual(["log", "warn", "error"]);
    expect(logger.entries.map((e) => e.message)).toEqual(["hello", "careful", "boom"]);
    for (const e of logger.entries) {
      expect(e.at).toBeInstanceOf(Date);
    }
  });

  it("does not mirror to console by default", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const logger = createCaptureLogger();
    logger.log("x");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("mirrors to console when requested", () => {
    const spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createCaptureLogger({ mirrorToConsole: true });
    logger.log("a");
    logger.warn("b");
    logger.error("c");
    expect(spyLog).toHaveBeenCalledWith("a");
    expect(spyWarn).toHaveBeenCalledWith("b");
    expect(spyErr).toHaveBeenCalledWith("c");
    spyLog.mockRestore();
    spyWarn.mockRestore();
    spyErr.mockRestore();
  });
});
